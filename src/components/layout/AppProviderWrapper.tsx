"use client";

import { useAuth } from "@/lib/store/AuthContextSupabase";
import { AppProvider } from "@/lib/store/AppContext";

export function AppProviderWrapper({ children }: { children: React.ReactNode }) {
    const { currentUser } = useAuth();

    return <AppProvider userId={currentUser?.id}>{children}</AppProvider>;
}
