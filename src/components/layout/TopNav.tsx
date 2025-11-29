"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, BarChart2, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
    { name: "饮食规划", href: "/", icon: Calendar },
    { name: "训练规划", href: "/workout", icon: Activity },
    { name: "趋势监控", href: "/trends", icon: BarChart2 },
    { name: "基本信息", href: "/profile", icon: User },
];

export function TopNav() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-md border-b border-white/10 pt-safe-top">
            <div className="container mx-auto max-w-md">
                <div className="flex justify-between items-center px-2 h-16">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href;
                        const Icon = tab.icon;

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className="relative flex flex-col items-center justify-center w-full h-full py-2 group"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white/5 rounded-xl"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <Icon
                                    className={cn(
                                        "w-6 h-6 mb-1 transition-colors duration-200",
                                        isActive ? "text-[var(--primary)]" : "text-zinc-500 group-hover:text-zinc-300"
                                    )}
                                />
                                <span
                                    className={cn(
                                        "text-[10px] font-medium transition-colors duration-200",
                                        isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                                    )}
                                >
                                    {tab.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
