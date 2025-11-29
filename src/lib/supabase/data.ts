import { createClient } from "./client";
import { DailyLog, FoodEntry, WorkoutEntry, DietType } from "@/lib/store/types";

const supabase = createClient();

// 获取或创建每日记录
export async function getOrCreateDailyLog(userId: string, date: string): Promise<string> {
    // 先尝试获取
    const { data: existing, error: fetchError } = await supabase
        .from("daily_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("log_date", date)
        .single();

    if (existing) {
        return existing.id;
    }

    // 不存在则创建
    const { data: newLog, error: insertError } = await supabase
        .from("daily_logs")
        .insert({
            user_id: userId,
            log_date: date,
            diet_type: "Med",
        })
        .select("id")
        .single();

    if (insertError || !newLog) {
        throw new Error(`Failed to create daily log: ${insertError?.message}`);
    }

    return newLog.id;
}

// 加载用户的所有每日记录
export async function loadDailyLogs(userId: string): Promise<Record<string, DailyLog>> {
    const { data: logs, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId)
        .order("log_date", { ascending: false });

    if (error) {
        console.error("Error loading daily logs:", error);
        return {};
    }

    const logsMap: Record<string, DailyLog> = {};

    for (const log of logs || []) {
        // 加载该日期的所有食物记录
        const { data: foodEntries } = await supabase
            .from("food_entries")
            .select("*")
            .eq("daily_log_id", log.id)
            .order("created_at", { ascending: true });

        // 加载该日期的所有训练记录
        const { data: workoutEntries } = await supabase
            .from("workout_entries")
            .select("*")
            .eq("daily_log_id", log.id)
            .order("created_at", { ascending: true });

        logsMap[log.log_date] = {
            date: log.log_date,
            dietType: (log.diet_type as DietType) || "Med",
            caloriesIntake: Number(log.calories_intake) || 0,
            proteinIntake: Number(log.protein_intake) || 0,
            carbsIntake: Number(log.carbs_intake) || 0,
            fatIntake: Number(log.fat_intake) || 0,
            workoutVolume: Number(log.workout_volume) || 0,
            caloriesBurned: log.calories_burned ? Number(log.calories_burned) : undefined,
            weight: log.weight ? Number(log.weight) : undefined,
            entries: (foodEntries || []).map((fe) => ({
                id: fe.id,
                name: fe.name,
                calories: Number(fe.calories),
                carbs: Number(fe.carbs),
                protein: Number(fe.protein),
                fat: Number(fe.fat),
                timestamp: new Date(fe.created_at).getTime(),
            })),
            workoutEntries: (workoutEntries || []).map((we) => ({
                id: we.id,
                exerciseName: we.exercise_name,
                sets: we.sets,
                reps: we.reps,
                weight: we.weight,
                volume: Number(we.volume),
                timestamp: new Date(we.created_at).getTime(),
            })),
        };
    }

    return logsMap;
}

// 更新每日记录
export async function updateDailyLog(
    userId: string,
    date: string,
    updates: {
        dietType?: DietType;
        caloriesIntake?: number;
        proteinIntake?: number;
        carbsIntake?: number;
        fatIntake?: number;
        workoutVolume?: number;
        caloriesBurned?: number;
        weight?: number;
    }
): Promise<void> {
    const dailyLogId = await getOrCreateDailyLog(userId, date);

    const { error } = await supabase
        .from("daily_logs")
        .update({
            diet_type: updates.dietType,
            calories_intake: updates.caloriesIntake,
            protein_intake: updates.proteinIntake,
            carbs_intake: updates.carbsIntake,
            fat_intake: updates.fatIntake,
            workout_volume: updates.workoutVolume,
            calories_burned: updates.caloriesBurned,
            weight: updates.weight,
        })
        .eq("id", dailyLogId);

    if (error) {
        throw new Error(`Failed to update daily log: ${error.message}`);
    }
}

// 添加食物记录
export async function addFoodEntry(
    userId: string,
    date: string,
    entry: Omit<FoodEntry, "id" | "timestamp">
): Promise<FoodEntry> {
    const dailyLogId = await getOrCreateDailyLog(userId, date);

    const { data, error } = await supabase
        .from("food_entries")
        .insert({
            daily_log_id: dailyLogId,
            name: entry.name,
            calories: entry.calories,
            carbs: entry.carbs,
            protein: entry.protein,
            fat: entry.fat,
        })
        .select()
        .single();

    if (error || !data) {
        throw new Error(`Failed to add food entry: ${error?.message}`);
    }

    // 重新计算并更新每日记录的总量
    const { data: allEntries } = await supabase
        .from("food_entries")
        .select("calories, carbs, protein, fat")
        .eq("daily_log_id", dailyLogId);

    const totals = (allEntries || []).reduce(
        (acc, curr) => ({
            calories: acc.calories + Number(curr.calories),
            carbs: acc.carbs + Number(curr.carbs),
            protein: acc.protein + Number(curr.protein),
            fat: acc.fat + Number(curr.fat),
        }),
        { calories: 0, carbs: 0, protein: 0, fat: 0 }
    );

    await updateDailyLog(userId, date, {
        caloriesIntake: totals.calories,
        carbsIntake: totals.carbs,
        proteinIntake: totals.protein,
        fatIntake: totals.fat,
    });

    return {
        id: data.id,
        name: data.name,
        calories: Number(data.calories),
        carbs: Number(data.carbs),
        protein: Number(data.protein),
        fat: Number(data.fat),
        timestamp: new Date(data.created_at).getTime(),
    };
}

// 删除食物记录
export async function removeFoodEntry(userId: string, date: string, entryId: string): Promise<void> {
    const { error: deleteError } = await supabase.from("food_entries").delete().eq("id", entryId);

    if (deleteError) {
        throw new Error(`Failed to remove food entry: ${deleteError.message}`);
    }

    // 重新计算并更新每日记录的总量
    const dailyLogId = await getOrCreateDailyLog(userId, date);
    const { data: allEntries } = await supabase
        .from("food_entries")
        .select("calories, carbs, protein, fat")
        .eq("daily_log_id", dailyLogId);

    const totals = (allEntries || []).reduce(
        (acc, curr) => ({
            calories: acc.calories + Number(curr.calories),
            carbs: acc.carbs + Number(curr.carbs),
            protein: acc.protein + Number(curr.protein),
            fat: acc.fat + Number(curr.fat),
        }),
        { calories: 0, carbs: 0, protein: 0, fat: 0 }
    );

    await updateDailyLog(userId, date, {
        caloriesIntake: totals.calories,
        carbsIntake: totals.carbs,
        proteinIntake: totals.protein,
        fatIntake: totals.fat,
    });
}

// 添加训练记录
export async function addWorkoutEntry(
    userId: string,
    date: string,
    entry: Omit<WorkoutEntry, "id" | "timestamp">
): Promise<WorkoutEntry> {
    const dailyLogId = await getOrCreateDailyLog(userId, date);

    const { data, error } = await supabase
        .from("workout_entries")
        .insert({
            daily_log_id: dailyLogId,
            exercise_name: entry.exerciseName,
            sets: entry.sets,
            reps: entry.reps,
            weight: typeof entry.weight === "string" ? 0 : entry.weight,
            volume: entry.volume,
        })
        .select()
        .single();

    if (error || !data) {
        throw new Error(`Failed to add workout entry: ${error?.message}`);
    }

    // 重新计算总训练容量
    const { data: allEntries } = await supabase
        .from("workout_entries")
        .select("volume")
        .eq("daily_log_id", dailyLogId);

    const totalVolume = (allEntries || []).reduce((acc, curr) => acc + Number(curr.volume), 0);

    await updateDailyLog(userId, date, {
        workoutVolume: totalVolume,
    });

    return {
        id: data.id,
        exerciseName: data.exercise_name,
        sets: data.sets,
        reps: data.reps,
        weight: data.weight,
        volume: Number(data.volume),
        timestamp: new Date(data.created_at).getTime(),
    };
}

// 删除训练记录
export async function removeWorkoutEntry(userId: string, date: string, entryId: string): Promise<void> {
    const { error: deleteError } = await supabase.from("workout_entries").delete().eq("id", entryId);

    if (deleteError) {
        throw new Error(`Failed to remove workout entry: ${deleteError.message}`);
    }

    // 重新计算总训练容量
    const dailyLogId = await getOrCreateDailyLog(userId, date);
    const { data: allEntries } = await supabase
        .from("workout_entries")
        .select("volume")
        .eq("daily_log_id", dailyLogId);

    const totalVolume = (allEntries || []).reduce((acc, curr) => acc + Number(curr.volume), 0);

    await updateDailyLog(userId, date, {
        workoutVolume: totalVolume,
    });
}

