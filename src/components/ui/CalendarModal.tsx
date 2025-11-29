"use client";

import { useAppStore } from "@/lib/store/AppContext";
import { Calendar, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CalendarModal({ isOpen, onClose }: CalendarModalProps) {
    const { state, selectedDate, setSelectedDate } = useAppStore();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        if (isOpen) {
            setCurrentMonth(new Date(selectedDate));
        }
    }, [isOpen, selectedDate]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleDateClick = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        setSelectedDate(dateStr);
        onClose();
    };

    const handleToday = () => {
        const today = new Date().toISOString().split("T")[0];
        setSelectedDate(today);
        onClose();
    };

    const hasData = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const log = state.logs[dateStr];
        return log && (log.entries?.length > 0 || log.workoutCompleted || log.weight);
    };

    const isSelected = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return dateStr === selectedDate;
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            year === today.getFullYear() &&
            month === today.getMonth() &&
            day === today.getDate()
        );
    };

    const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={onClose}
                    >
                        <div
                            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[var(--primary)]" />
                                    <h2 className="text-lg font-bold text-white">选择日期</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-zinc-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Month Navigation */}
                            <div className="flex justify-between items-center mb-4">
                                <button
                                    onClick={handlePrevMonth}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5 text-white" />
                                </button>
                                <div className="text-white font-medium">
                                    {year}年 {month + 1}月
                                </div>
                                <button
                                    onClick={handleNextMonth}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            {/* Week Days */}
                            <div className="grid grid-cols-7 gap-2 mb-2">
                                {weekDays.map((day) => (
                                    <div key={day} className="text-center text-xs text-zinc-500 font-medium">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-2">
                                {/* Empty cells for days before month starts */}
                                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                                    <div key={`empty-${i}`} />
                                ))}

                                {/* Days */}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const selected = isSelected(day);
                                    const today = isToday(day);
                                    const data = hasData(day);

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => handleDateClick(day)}
                                            className={cn(
                                                "aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all",
                                                selected
                                                    ? "bg-[var(--primary)] text-black font-bold"
                                                    : today
                                                        ? "bg-white/10 text-white font-medium"
                                                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                            )}
                                        >
                                            <span className="text-sm">{day}</span>
                                            {data && (
                                                <div
                                                    className={cn(
                                                        "absolute bottom-1 w-1 h-1 rounded-full",
                                                        selected ? "bg-black" : "bg-[var(--primary)]"
                                                    )}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="flex gap-2 mt-6">
                                <button
                                    onClick={handleToday}
                                    className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-colors"
                                >
                                    今天
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-2 bg-[var(--primary)] hover:opacity-90 rounded-lg text-black text-sm font-bold transition-opacity"
                                >
                                    确定
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
