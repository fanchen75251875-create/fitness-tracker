export type MacroTargets = {
    carbs: number;
    protein: number;
    fat: number;
};

export type DietType = 'High' | 'Med' | 'Low';

export type DietPlan = {
    type: DietType;
    label: string;
    targets: MacroTargets;
};

export type Exercise = {
    name: string;
    sets: number;
    reps: number; // Target reps
    weight: number | string; // Target weight (e.g. "95kg" or "Bodyweight")
    note?: string;
};

export type WorkoutRoutine = {
    id: string;
    dayLabel: string; // e.g. "Day 1"
    exercises: Exercise[];
};

export type FoodEntry = {
    id: string;
    name: string;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    timestamp: number;
};

export type WorkoutEntry = {
    id: string;
    exerciseName: string;
    sets: number;
    reps: number;
    weight: number | string;
    volume: number; // sets * reps * weight
    timestamp: number;
};

export type DailyLog = {
    date: string; // ISO date string YYYY-MM-DD
    dietType: DietType;
    caloriesIntake: number;
    proteinIntake: number;
    carbsIntake: number;
    fatIntake: number;
    entries: FoodEntry[]; // List of food entries for history/undo
    workoutEntries?: WorkoutEntry[]; // List of exercises completed today
    workoutCompleted?: string; // DEPRECATED: ID of the routine completed (kept for backward compatibility)
    workoutVolume: number; // Total volume calculated
    caloriesBurned?: number; // Estimated calories burned
    weight?: number; // Body weight in kg
};

export type AppState = {
    dietPlans: DietPlan[];
    workoutRoutines: WorkoutRoutine[];
    logs: Record<string, DailyLog>; // Keyed by date
    userProfile: {
        name: string;
        currentWeight: number;
    };
};
