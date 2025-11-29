"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AppState, DailyLog, DietType, FoodEntry, WorkoutEntry } from "./types";
import { INITIAL_DATA } from "./initialData";
import {
    loadDailyLogs,
    updateDailyLog,
    addFoodEntry as addFoodEntryToDB,
    removeFoodEntry as removeFoodEntryFromDB,
    addWorkoutEntry as addWorkoutEntryToDB,
    removeWorkoutEntry as removeWorkoutEntryFromDB,
} from "@/lib/supabase/data";

type AppContextType = {
    state: AppState;
    setDietType: (date: string, type: DietType) => void;
    logWorkout: (date: string, routineId: string, volume: number, burned: number) => void;
    addWorkoutEntry: (date: string, entry: Omit<WorkoutEntry, "id" | "timestamp">) => void;
    removeWorkoutEntry: (date: string, entryId: string) => void;
    addFoodEntry: (date: string, entry: Omit<FoodEntry, "id" | "timestamp">) => void;
    removeFoodEntry: (date: string, entryId: string) => void;
    updateWeight: (date: string, weight: number) => void;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children, userId }: { children: React.ReactNode; userId?: string }) {
    const [state, setState] = useState<AppState>(INITIAL_DATA);
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

    // Load from Supabase when user changes
    useEffect(() => {
        if (!userId) {
            setState(INITIAL_DATA);
            setIsLoaded(true);
            return;
        }

        const loadData = async () => {
            try {
                const logs = await loadDailyLogs(userId);
                setState((prev) => ({
                    ...prev,
                    logs,
                }));
            } catch (error) {
                console.error("Failed to load data from Supabase:", error);
                setState(INITIAL_DATA);
            } finally {
                setIsLoaded(true);
            }
        };

        loadData();
    }, [userId]);

    const getLog = useCallback((date: string): DailyLog => {
        return (
            state.logs[date] || {
                date,
                dietType: "Med",
                caloriesIntake: 0,
                proteinIntake: 0,
                carbsIntake: 0,
                fatIntake: 0,
                entries: [],
                workoutVolume: 0,
                caloriesBurned: 0,
            }
        );
    }, [state.logs]);

    const refreshLog = useCallback(
        async (date: string) => {
            if (!userId) return;

            try {
                const logs = await loadDailyLogs(userId);
                setState((prev) => ({
                    ...prev,
                    logs,
                }));
            } catch (error) {
                console.error("Failed to refresh log:", error);
            }
        },
        [userId]
    );

    const setDietType = useCallback(
        async (date: string, type: DietType) => {
            if (!userId) return;

            try {
                await updateDailyLog(userId, date, { dietType: type });
                await refreshLog(date);
            } catch (error) {
                console.error("Failed to update diet type:", error);
                alert("更新失败，请重试");
            }
        },
        [userId, refreshLog]
    );

    const logWorkout = useCallback(
        async (date: string, routineId: string, volume: number, burned: number) => {
            if (!userId) return;

            try {
                await updateDailyLog(userId, date, {
                    workoutVolume: volume,
                    caloriesBurned: burned,
                });
                await refreshLog(date);
            } catch (error) {
                console.error("Failed to log workout:", error);
                alert("保存失败，请重试");
            }
        },
        [userId, refreshLog]
    );

    const addWorkoutEntry = useCallback(
        async (date: string, entry: Omit<WorkoutEntry, "id" | "timestamp">) => {
            if (!userId) return;

            try {
                await addWorkoutEntryToDB(userId, date, entry);
                await refreshLog(date);
            } catch (error) {
                console.error("Failed to add workout entry:", error);
                alert("添加失败，请重试");
            }
        },
        [userId, refreshLog]
    );

    const removeWorkoutEntry = useCallback(
        async (date: string, entryId: string) => {
            if (!userId) return;

            try {
                await removeWorkoutEntryFromDB(userId, date, entryId);
                await refreshLog(date);
            } catch (error) {
                console.error("Failed to remove workout entry:", error);
                alert("删除失败，请重试");
            }
        },
        [userId, refreshLog]
    );

    const addFoodEntry = useCallback(
        async (date: string, entry: Omit<FoodEntry, "id" | "timestamp">) => {
            if (!userId) return;

            try {
                await addFoodEntryToDB(userId, date, entry);
                await refreshLog(date);
            } catch (error) {
                console.error("Failed to add food entry:", error);
                alert("添加失败，请重试");
            }
        },
        [userId, refreshLog]
    );

    const removeFoodEntry = useCallback(
        async (date: string, entryId: string) => {
            if (!userId) return;

            try {
                await removeFoodEntryFromDB(userId, date, entryId);
                await refreshLog(date);
            } catch (error) {
                console.error("Failed to remove food entry:", error);
                alert("删除失败，请重试");
            }
        },
        [userId, refreshLog]
    );

    const updateWeight = useCallback(
        async (date: string, weight: number) => {
            if (!userId) return;

            try {
                await updateDailyLog(userId, date, { weight });
                // Also update profile current weight
                setState((prev) => ({
                    ...prev,
                    userProfile: { ...prev.userProfile, currentWeight: weight },
                }));
                await refreshLog(date);
            } catch (error) {
                console.error("Failed to update weight:", error);
                alert("更新失败，请重试");
            }
        },
        [userId, refreshLog]
    );

    return (
        <AppContext.Provider
            value={{
                state,
                setDietType,
                logWorkout,
                addWorkoutEntry,
                removeWorkoutEntry,
                addFoodEntry,
                removeFoodEntry,
                updateWeight,
                selectedDate,
                setSelectedDate,
            }}
        >
            {isLoaded ? children : (
                <div className="min-h-screen bg-black text-white flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-zinc-500">加载应用数据...</p>
                    </div>
                </div>
            )}
        </AppContext.Provider>
    );
}

export function useAppStore() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useAppStore must be used within an AppProvider");
    }
    return context;
}
