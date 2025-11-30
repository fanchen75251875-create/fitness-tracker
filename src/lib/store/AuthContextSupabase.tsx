"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser, SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export type User = {
    id: string;
    username: string;
    email?: string;
    avatar?: string;
    createdAt: number;
};

type AuthContextType = {
    currentUser: User | null;
    supabaseUser: SupabaseUser | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    updateAvatar: (avatar: string) => Promise<void>;
    updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
    updateProfile: (username: string) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [clientError, setClientError] = useState<Error | null>(null);
    const router = useRouter();
    
    // Create supabase client with error handling
    let supabase: ReturnType<typeof createClient> | null = null;
    try {
        supabase = createClient();
    } catch (error) {
        console.error("Failed to create Supabase client:", error);
        setClientError(error as Error);
    }

    // Load current user on mount
    useEffect(() => {
        // If client creation failed, stop loading immediately
        if (clientError || !supabase) {
            setIsLoading(false);
            return;
        }

        let mounted = true;
        let isInitialized = false;

        // Timeout to prevent infinite loading - reduced to 2 seconds for faster response
        const timeoutId = setTimeout(() => {
            if (mounted && !isInitialized) {
                console.warn("Auth initialization timeout, setting loading to false");
                setIsLoading(false);
                isInitialized = true;
                // Ensure currentUser is null if no session
                if (!supabaseUser) {
                    setCurrentUser(null);
                }
            }
        }, 2000); // 2 second timeout

        // Get initial session
        const initializeAuth = async () => {
            if (!supabase) {
                setIsLoading(false);
                return;
            }
            
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (!mounted) return;

                if (error) {
                    console.error("Error getting session:", error);
                    setIsLoading(false);
                    isInitialized = true;
                    clearTimeout(timeoutId);
                    return;
                }

                if (session?.user) {
                    setSupabaseUser(session.user);
                    await loadUserProfile(session.user.id);
                } else {
                    // No session, clear user state and stop loading
                    setSupabaseUser(null);
                    setCurrentUser(null);
                    setIsLoading(false);
                }
                isInitialized = true;
                clearTimeout(timeoutId);
            } catch (error) {
                console.error("Error initializing auth:", error);
                if (mounted) {
                    setIsLoading(false);
                    isInitialized = true;
                    clearTimeout(timeoutId);
                }
            }
        };

        // Start initialization immediately
        initializeAuth();

        // Listen for auth changes (this may fire immediately or later)
        if (!supabase) {
            return;
        }
        
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            
            // Clear timeout since we got an auth state change
            clearTimeout(timeoutId);
            
            if (session?.user) {
                setSupabaseUser(session.user);
                await loadUserProfile(session.user.id);
            } else {
                setSupabaseUser(null);
                setCurrentUser(null);
                setIsLoading(false);
            }
            
            if (!isInitialized) {
                isInitialized = true;
            }
        });

        // Ensure we always set loading to false if onAuthStateChange doesn't fire
        // This is a safety net in case the event doesn't fire
        const safetyTimeoutId = setTimeout(() => {
            if (mounted && !isInitialized) {
                console.warn("Auth state change not received, forcing loading to false");
                setIsLoading(false);
                isInitialized = true;
            }
        }, 3000); // 3 second safety timeout

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            clearTimeout(safetyTimeoutId);
            subscription.unsubscribe();
        };
    }, []);

    const loadUserProfile = async (userId: string) => {
        if (!supabase) {
            setIsLoading(false);
            return;
        }
        
        try {
            // Load user profile from user_profiles table
            const { data: profile, error: profileError } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (profileError && profileError.code !== "PGRST116") {
                // PGRST116 = no rows returned, which is OK for new users
                console.error("Error loading profile:", profileError);
            }

            // Get email from auth.users
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError) {
                console.error("Error getting user:", userError);
                setIsLoading(false);
                return;
            }

            if (user) {
                setCurrentUser({
                    id: userId,
                    username: profile?.username || user?.email?.split("@")[0] || "用户",
                    email: user?.email,
                    avatar: profile?.avatar_url || undefined,
                    createdAt: user?.created_at ? new Date(user.created_at).getTime() : Date.now(),
                });
            } else {
                // User not found, clear state
                setCurrentUser(null);
            }
        } catch (error) {
            console.error("Error loading user profile:", error);
        } finally {
            // Always set loading to false, regardless of success or failure
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        if (!supabase) {
            return { success: false, error: "Supabase client not available" };
        }
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            if (data.user) {
                await loadUserProfile(data.user.id);
                router.push("/");
                return { success: true };
            }

            return { success: false, error: "登录失败" };
        } catch (error: any) {
            return { success: false, error: error.message || "登录失败" };
        }
    };

    const register = async (
        email: string,
        password: string,
        username: string
    ): Promise<{ success: boolean; error?: string }> => {
        if (!supabase) {
            return { success: false, error: "Supabase client not available" };
        }
        
        try {
            // Register user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/`,
                },
            });

            if (authError) {
                return { success: false, error: authError.message };
            }

            if (!authData.user) {
                return { success: false, error: "注册失败" };
            }

            // Create user profile
            const { error: profileError } = await supabase.from("user_profiles").insert({
                id: authData.user.id,
                username: username || email.split("@")[0],
            });

            if (profileError) {
                console.error("Error creating profile:", profileError);
                // Continue anyway, profile can be created later
            }

            // Check if email confirmation is required
            // If session exists, user can login immediately
            if (authData.session) {
                // User is automatically logged in (email confirmation disabled)
                setSupabaseUser(authData.user);
                await loadUserProfile(authData.user.id);
                router.push("/");
                return { success: true };
            } else {
                // Email confirmation is required
                // Still set the user state so they can see a message
                setSupabaseUser(authData.user);
                await loadUserProfile(authData.user.id);
                router.push("/");
                return { 
                    success: true,
                    error: "请检查你的邮箱并点击确认链接以完成注册" 
                };
            }
        } catch (error: any) {
            return { success: false, error: error.message || "注册失败" };
        }
    };

    const logout = async (): Promise<void> => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        setCurrentUser(null);
        setSupabaseUser(null);
        router.push("/login");
    };

    const updateAvatar = async (avatar: string): Promise<void> => {
        if (!supabaseUser || !supabase) return;

        const { error } = await supabase
            .from("user_profiles")
            .upsert({
                id: supabaseUser.id,
                avatar_url: avatar,
            });

        if (!error) {
            setCurrentUser((prev) => (prev ? { ...prev, avatar } : null));
        }
    };

    const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
        if (!supabase) {
            return { success: false, error: "Supabase client not available" };
        }
        
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message || "密码更新失败" };
        }
    };

    const updateProfile = async (username: string): Promise<{ success: boolean; error?: string }> => {
        if (!supabaseUser || !supabase) {
            return { success: false, error: "未登录或 Supabase 客户端不可用" };
        }

        try {
            const { error } = await supabase
                .from("user_profiles")
                .upsert({
                    id: supabaseUser.id,
                    username,
                });

            if (error) {
                return { success: false, error: error.message };
            }

            setCurrentUser((prev) => (prev ? { ...prev, username } : null));
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message || "更新失败" };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                supabaseUser,
                isLoading,
                login,
                register,
                logout,
                updateAvatar,
                updatePassword,
                updateProfile,
            }}
        >
            {isLoading ? (
                <div className="min-h-screen bg-black text-white flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-zinc-500">加载中...</p>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

