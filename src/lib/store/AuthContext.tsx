"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type User = {
    id: string;
    username: string;
    password: string;
    avatar?: string;
    createdAt: number;
};

type AuthContextType = {
    currentUser: User | null;
    login: (username: string, password: string) => boolean;
    register: (username: string, password: string) => boolean;
    logout: () => void;
    updateAvatar: (avatar: string) => void;
    updatePassword: (oldPassword: string, newPassword: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = "fitness_tracker_users";
const CURRENT_USER_KEY = "fitness_tracker_current_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load current user on mount
    useEffect(() => {
        const savedUserId = localStorage.getItem(CURRENT_USER_KEY);
        if (savedUserId) {
            const users = getUsers();
            const user = users.find((u) => u.id === savedUserId);
            if (user) {
                setCurrentUser(user);
            } else {
                localStorage.removeItem(CURRENT_USER_KEY);
            }
        }
        setIsLoaded(true);
    }, []);

    const getUsers = (): User[] => {
        const data = localStorage.getItem(USERS_KEY);
        return data ? JSON.parse(data) : [];
    };

    const saveUsers = (users: User[]) => {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    };

    const login = (username: string, password: string): boolean => {
        const users = getUsers();
        const user = users.find((u) => u.username === username && u.password === password);

        if (user) {
            setCurrentUser(user);
            localStorage.setItem(CURRENT_USER_KEY, user.id);
            return true;
        }
        return false;
    };

    const register = (username: string, password: string): boolean => {
        const users = getUsers();

        // Check if username already exists
        if (users.some((u) => u.username === username)) {
            return false;
        }

        const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            username,
            password,
            createdAt: Date.now(),
        };

        users.push(newUser);
        saveUsers(users);

        // Auto login after registration
        setCurrentUser(newUser);
        localStorage.setItem(CURRENT_USER_KEY, newUser.id);
        return true;
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem(CURRENT_USER_KEY);
    };

    const updateAvatar = (avatar: string) => {
        if (!currentUser) return;

        const users = getUsers();
        const index = users.findIndex((u) => u.id === currentUser.id);

        if (index !== -1) {
            users[index].avatar = avatar;
            saveUsers(users);
            setCurrentUser({ ...currentUser, avatar });
        }
    };

    const updatePassword = (oldPassword: string, newPassword: string): boolean => {
        if (!currentUser) return false;

        if (currentUser.password !== oldPassword) {
            return false;
        }

        const users = getUsers();
        const index = users.findIndex((u) => u.id === currentUser.id);

        if (index !== -1) {
            users[index].password = newPassword;
            saveUsers(users);
            setCurrentUser({ ...currentUser, password: newPassword });
            return true;
        }
        return false;
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-zinc-500">加载中...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ currentUser, login, register, logout, updateAvatar, updatePassword }}>
            {children}
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
