"use client";

import { useAuth } from "@/lib/store/AuthContextSupabase";
import { usePathname, useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function LayoutContent({ children }: { children: React.ReactNode }) {
    const { currentUser } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const isAuthPage = pathname === "/login" || pathname === "/register";

    useEffect(() => {
        if (!currentUser && !isAuthPage) {
            router.push("/login");
        } else if (currentUser && isAuthPage) {
            router.push("/");
        }
    }, [currentUser, isAuthPage, router]);

    // Show loading while redirecting
    if ((!currentUser && !isAuthPage) || (currentUser && isAuthPage)) {
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
