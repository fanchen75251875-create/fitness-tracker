"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store/AppContext";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Plus, Trash2, Save, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateSelector } from "@/components/ui/DateSelector";

export function WorkoutLogger() {
    const { state, addWorkoutEntry, removeWorkoutEntry, selectedDate } = useAppStore();
    const log = state.logs[selectedDate];
    const entries = log?.workoutEntries || [];

    const [isAdding, setIsAdding] = useState(false);
    const [newEntry, setNewEntry] = useState({
        exerciseName: "",
        weight: "",
        sets: "",
        reps: "",
    });

    // Pre-defined common exercises for quick selection
    const commonExercises = [
        "深蹲", "硬拉", "卧推", "引体向上", "推举",
        "哑铃划船", "腿举", "二头弯举", "三头下压",
        "侧平举", "面拉", "卷腹"
    ];

    const handleAddEntry = () => {
        if (!newEntry.exerciseName || !newEntry.sets || !newEntry.reps) return;

        const weight = parseFloat(newEntry.weight) || 0;
        const sets = parseInt(newEntry.sets) || 0;
        const reps = parseInt(newEntry.reps) || 0;
        const volume = weight * sets * reps;

        addWorkoutEntry(selectedDate, {
            exerciseName: newEntry.exerciseName,
            weight: newEntry.weight, // Keep as string to preserve "Bodyweight" etc if needed, but logic uses number
            sets,
            reps,
            volume,
        });

        setNewEntry({ exerciseName: "", weight: "", sets: "", reps: "" });
        setIsAdding(false);
    };

    const totalVolume = entries.reduce((acc, curr) => acc + curr.volume, 0);

    return (
        <div className="space-y-6 pb-24 pt-4">
            <DateSelector />

            {/* Summary Header */}
            <div className="flex justify-between items-end px-2">
                <div>
                    <h2 className="text-zinc-500 text-xs uppercase tracking-wider">今日训练</h2>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        训练记录
                        <span className="text-sm font-normal text-zinc-500 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                            {entries.length} 个动作
                        </span>
                    </h1>
                </div>
                <div className="text-right">
                    <div className="text-xs text-zinc-500">总容量</div>
                    <div className="text-xl font-mono font-bold text-[var(--primary)]">
                        {totalVolume} <span className="text-xs text-zinc-500">kg</span>
                    </div>
                </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {entries.length > 0 ? (
                        entries.map((entry, index) => (
                            <motion.div
                                key={entry.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Card className="p-4 flex justify-between items-center border-l-4 border-l-[var(--primary)]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-zinc-400">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{entry.exerciseName}</h3>
                                            <p className="text-xs text-zinc-400">
                                                {entry.sets}组 × {entry.reps}次 @ {entry.weight}kg
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeWorkoutEntry(selectedDate, entry.id)}
                                        className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        !isAdding && (
                            <div className="text-center py-10 text-zinc-500 bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-800">
                                <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">今天还没有记录训练</p>
                                <p className="text-xs opacity-50">点击下方按钮添加动作</p>
                            </div>
                        )
                    )}
                </AnimatePresence>
            </div>

            {/* Add Entry Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-white/10 p-6 pb-safe-bottom z-50 rounded-t-3xl shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">添加动作</h3>
                            <button onClick={() => setIsAdding(false)} className="p-2 bg-zinc-800 rounded-full">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">动作名称</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newEntry.exerciseName}
                                        onChange={(e) => setNewEntry({ ...newEntry, exerciseName: e.target.value })}
                                        className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:border-[var(--primary)] outline-none"
                                        placeholder="例如：深蹲"
                                        list="exercises-list"
                                    />
                                    <datalist id="exercises-list">
                                        {commonExercises.map(ex => <option key={ex} value={ex} />)}
                                    </datalist>
                                </div>
                                {/* Quick tags */}
                                <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar pb-1">
                                    {commonExercises.slice(0, 5).map(ex => (
                                        <button
                                            key={ex}
                                            onClick={() => setNewEntry({ ...newEntry, exerciseName: ex })}
                                            className="text-xs px-2 py-1 bg-zinc-800 rounded-md whitespace-nowrap hover:bg-zinc-700"
                                        >
                                            {ex}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">重量 (kg)</label>
                                    <input
                                        type="number"
                                        value={newEntry.weight}
                                        onChange={(e) => setNewEntry({ ...newEntry, weight: e.target.value })}
                                        className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-center text-white focus:border-[var(--primary)] outline-none"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">组数</label>
                                    <input
                                        type="number"
                                        value={newEntry.sets}
                                        onChange={(e) => setNewEntry({ ...newEntry, sets: e.target.value })}
                                        className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-center text-white focus:border-[var(--primary)] outline-none"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">次数</label>
                                    <input
                                        type="number"
                                        value={newEntry.reps}
                                        onChange={(e) => setNewEntry({ ...newEntry, reps: e.target.value })}
                                        className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-center text-white focus:border-[var(--primary)] outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleAddEntry}
                                disabled={!newEntry.exerciseName}
                                className="w-full py-4 bg-[var(--primary)] text-black font-bold rounded-xl mt-4 disabled:opacity-50"
                            >
                                确认添加
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Add Button */}
            {!isAdding && (
                <div className="fixed bottom-24 right-6 z-40">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-14 h-14 bg-[var(--primary)] rounded-full flex items-center justify-center shadow-lg shadow-[var(--primary)]/30 hover:scale-105 transition-transform active:scale-95 text-black"
                    >
                        <Plus className="w-8 h-8" />
                    </button>
                </div>
            )}
        </div>
    );
}
