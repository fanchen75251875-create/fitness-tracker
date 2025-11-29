import { AppState } from "./types";

export const INITIAL_DATA: AppState = {
    userProfile: {
        name: "User",
        currentWeight: 75, // Default placeholder
    },
    dietPlans: [
        {
            type: "High",
            label: "高碳日",
            targets: { carbs: 225, protein: 100, fat: 55 },
        },
        {
            type: "Med",
            label: "中碳日",
            targets: { carbs: 180, protein: 100, fat: 75 },
        },
        {
            type: "Low",
            label: "低碳日",
            targets: { carbs: 135, protein: 100, fat: 95 },
        },
    ],
    workoutRoutines: [
        {
            id: "day1",
            dayLabel: "Day 1",
            exercises: [
                { name: "深蹲", sets: 5, reps: 4, weight: "95kg" },
                { name: "斜上哑铃推", sets: 3, reps: 12, weight: "25kg" },
                { name: "箭步蹲", sets: 4, reps: 15, weight: "10kg" },
                { name: "腿举", sets: 4, reps: 10, weight: "合适重量" },
                { name: "内收肌", sets: 4, reps: 20, weight: "最大重量" },
            ],
        },
        {
            id: "day2",
            dayLabel: "Day 2",
            exercises: [
                { name: "侧平举", sets: 4, reps: 15, weight: "10kg" },
                { name: "直腿硬拉", sets: 3, reps: 10, weight: "80kg", note: "无护具" },
                { name: "飞鸟超级组", sets: 4, reps: 12, weight: "8kg" },
                { name: "引体向上", sets: 3, reps: 15, weight: "无负重" },
                { name: "推举", sets: 3, reps: 12, weight: "25kg" },
            ],
        },
        {
            id: "day3",
            dayLabel: "Day 3",
            exercises: [
                { name: "卧推", sets: 5, reps: 4, weight: "87kg" },
                { name: "深蹲", sets: 3, reps: 10, weight: "85kg" },
                { name: "斜上哑铃推", sets: 3, reps: 10, weight: "27.5kg" },
                { name: "夹胸", sets: 3, reps: 12, weight: "合适重量" },
                { name: "臂屈伸+俯卧撑", sets: 3, reps: 12, weight: "自重" },
            ],
        },
        {
            id: "day4",
            dayLabel: "Day 4",
            exercises: [
                { name: "硬拉", sets: 5, reps: 6, weight: "100kg" },
                { name: "飞鸟超级组", sets: 3, reps: 12, weight: "10kg" },
                { name: "负重引体", sets: 3, reps: 8, weight: "20kg" },
                { name: "器械划船", sets: 3, reps: 12, weight: "合适重量" },
                { name: "反手下拉", sets: 3, reps: 15, weight: "合适重量" },
            ],
        },
    ],
    logs: {},
};
