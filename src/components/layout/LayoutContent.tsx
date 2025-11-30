"use client";

import { useAuth } from "@/lib/store/AuthContextSupabase";
import { usePathname, useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function LayoutContent({ children }: { children: React.ReactNode }) {
    const { currentUser, isLoading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const isAuthPage = pathname === "/login" || pathname === "/register";

    useEffect(() => {
        // Only redirect after loading is complete
        if (isLoading) {
            return;
        }

        // Redirect if needed
        if (!currentUser && !isAuthPage) {
            router.push("/login");
        } else if (currentUser && isAuthPage) {
            router.push("/");
        }
    }, [currentUser, isAuthPage, router, isLoading]);

    // Show loading only while auth is initializing
    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    // Show auth pages without TopNav
    if (isAuthPage) {
        return <div className="min-h-screen bg-black text-white">{children}</div>;
    }

    // Show main app with TopNav
    return (
        <div className="min-h-screen flex flex-col bg-black text-white">
            <TopNav />
            <main className="flex-1 container mx-auto max-w-md p-4 pb-24">
                {children}
            </main>
        </div>
    );
}
