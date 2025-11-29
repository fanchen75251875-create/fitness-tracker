"use client";

import { useAppStore } from "@/lib/store/AppContext";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CalendarModal } from "./CalendarModal";

export function DateSelector() {
    const { selectedDate } = useAppStore();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const isToday = selectedDate === new Date().toISOString().split("T")[0];

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("zh-CN", {
            month: "long",
            day: "numeric",
            weekday: "short"
        });
    };

    return (
        <>
            <button
                onClick={() => setIsCalendarOpen(true)}
                className="w-full bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-xl p-4 mb-4 hover:bg-zinc-800/80 transition-colors"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-[var(--primary)]" />
                        </div>
                        <div className="text-left">
                            <div className="text-xs text-zinc-500 mb-0.5">当前日期</div>
                            <div className={cn("text-sm font-medium", isToday ? "text-[var(--primary)]" : "text-white")}>
                                {isToday && <span className="mr-1">今天</span>}
                                {formatDate(selectedDate)}
                            </div>
                        </div>
                    </div>
                    <div className="text-zinc-400">
                        <span className="text-xs">点击选择</span>
                    </div>
                </div>
            </button>

            <CalendarModal
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
            />
        </>
    );
}
