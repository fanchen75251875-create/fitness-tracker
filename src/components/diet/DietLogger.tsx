"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store/AppContext";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Flame, Utensils, Trash2, Camera, Type, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { DateSelector } from "@/components/ui/DateSelector";

export function DietLogger() {
    const { state, setDietType, addFoodEntry, removeFoodEntry, selectedDate } = useAppStore();
    // const today = new Date().toISOString().split("T")[0];
    const log = state.logs[selectedDate] || {
        dietType: "Med",
        caloriesIntake: 0,
        proteinIntake: 0,
        carbsIntake: 0,
        fatIntake: 0,
        entries: [],
    };

    const currentPlan = state.dietPlans.find((p) => p.type === log.dietType)!;

    // Calculate total calorie target based on macros (4/4/9 rule)
    const targetCalories =
        currentPlan.targets.carbs * 4 +
        currentPlan.targets.protein * 4 +
        currentPlan.targets.fat * 9;

    // UI State
    const [isAdding, setIsAdding] = useState(false);
    const [inputType, setInputType] = useState<"manual" | "text" | "image">("manual");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Form State
    const [addForm, setAddForm] = useState({ name: "", carbs: "", protein: "", fat: "" });
    const [aiInput, setAiInput] = useState(""); // Text input or Image name

    // Store multiple uploaded image files
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    
    // Store AI analysis results (multiple foods)
    const [aiResults, setAiResults] = useState<Array<{
        name: string;
        calories: number;
        carbs: number;
        protein: number;
        fat: number;
    }>>([]);

    const handleAdd = () => {
        const c = Number(addForm.carbs) || 0;
        const p = Number(addForm.protein) || 0;
        const f = Number(addForm.fat) || 0;
        const cal = c * 4 + p * 4 + f * 9;

        if (cal === 0) return;

        addFoodEntry(selectedDate, {
            name: addForm.name || (inputType === "manual" ? "手动记录" : "AI 识别"),
            calories: cal,
            carbs: c,
            protein: p,
            fat: f,
        });

        setAddForm({ name: "", carbs: "", protein: "", fat: "" });
        setAiInput("");
        setIsAdding(false);
        setInputType("manual");
    };

    // Batch add multiple AI results
    const handleBatchAdd = () => {
        aiResults.forEach((result) => {
            addFoodEntry(selectedDate, {
                name: result.name,
                calories: result.calories,
                carbs: result.carbs,
                protein: result.protein,
                fat: result.fat,
            });
        });
        setAiResults([]);
        setImageFiles([]);
        setIsAdding(false);
        setInputType("manual");
    };

    const handleAnalyze = async () => {
        if (!aiInput && imageFiles.length === 0) return;
        setIsAnalyzing(true);

        try {
            // Convert images to base64 array
            let imagesBase64: string[] = [];
            if (imageFiles.length > 0) {
                imagesBase64 = await Promise.all(
                    imageFiles.map((file) => 
                        new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result as string);
                            reader.readAsDataURL(file);
                        })
                    )
                );
            }

            // Call real Gemini API
            const response = await fetch("/api/analyze-food", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: inputType === "text" ? aiInput : null,
                    images: imagesBase64.length > 0 ? imagesBase64 : undefined,
                    // Backward compatibility: single image
                    image: imagesBase64.length === 1 ? imagesBase64[0] : undefined,
                }),
            });

            const data = await response.json();

            if (data.error) {
                alert(`AI 识别失败: ${data.error}`);
                return;
            }

            // Handle both array and single object responses
            const results = Array.isArray(data) ? data : [data];

            if (inputType === "image" && results.length > 0) {
                // For image mode, show multiple results
                setAiResults(results);
            } else {
                // For text mode or single result, fill in the form
                const firstResult = results[0];
                setAddForm({
                    name: firstResult.name,
                    carbs: firstResult.carbs.toString(),
                    protein: firstResult.protein.toString(),
                    fat: firstResult.fat.toString(),
                });
                setInputType("manual"); // Switch to manual to show result
            }
        } catch (error) {
            console.error("AI Analysis Error:", error);
            alert("AI 识别失败，请检查网络连接或 API Key 配置");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setImageFiles(files);
            setAiInput(files.length === 1 ? files[0].name : `${files.length} 张图片`);
            setAiResults([]); // Clear previous results
        }
    };

    const removeImage = (index: number) => {
        const newFiles = imageFiles.filter((_, i) => i !== index);
        setImageFiles(newFiles);
        setAiInput(newFiles.length === 0 ? "" : newFiles.length === 1 ? newFiles[0].name : `${newFiles.length} 张图片`);
    };

    const getProgress = (current: number, target: number) =>
        Math.min(100, Math.max(0, (current / target) * 100));

    return (
        <div className="space-y-6 pb-20">
            {/* Header & Mode Selector */}
            <div className="flex flex-col gap-4">
                <DateSelector />

                <div className="grid grid-cols-3 gap-2 bg-zinc-900/50 p-1 rounded-2xl border border-white/5">
                    {state.dietPlans.map((plan) => (
                        <button
                            key={plan.type}
                            onClick={() => setDietType(selectedDate, plan.type)}
                            className={cn(
                                "py-2 px-3 rounded-xl text-xs font-medium transition-all duration-300",
                                log.dietType === plan.type
                                    ? "bg-zinc-800 text-white shadow-lg border border-white/10"
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            {plan.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Stats Ring (Calories) */}
            <div className="flex justify-center py-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-[var(--primary)] blur-[60px] opacity-20 rounded-full" />
                    <ProgressRing
                        size={240}
                        strokeWidth={16}
                        progress={getProgress(log.caloriesIntake || 0, targetCalories)}
                        value={Math.round(log.caloriesIntake || 0)}
                        unit={`/ ${targetCalories} kcal`}
                        label="今日热量摄入"
                        color="var(--primary)"
                    />
                </div>
            </div>

            {/* Macro Grid (3 Columns) */}
            <div className="grid grid-cols-3 gap-3">
                <Card className="flex flex-col items-center py-4 gap-2 px-2">
                    <ProgressRing
                        size={50}
                        strokeWidth={5}
                        progress={getProgress(log.carbsIntake || 0, currentPlan.targets.carbs)}
                        color="#3b82f6" // Blue
                        value={Math.round(log.carbsIntake || 0)}
                    />
                    <div className="text-center">
                        <div className="text-[10px] text-zinc-400">碳水</div>
                        <div className="text-xs font-bold">{currentPlan.targets.carbs}g</div>
                    </div>
                </Card>

                <Card className="flex flex-col items-center py-4 gap-2 px-2">
                    <ProgressRing
                        size={50}
                        strokeWidth={5}
                        progress={getProgress(log.proteinIntake || 0, currentPlan.targets.protein)}
                        color="#10b981" // Green
                        value={Math.round(log.proteinIntake || 0)}
                    />
                    <div className="text-center">
                        <div className="text-[10px] text-zinc-400">蛋白质</div>
                        <div className="text-xs font-bold">{currentPlan.targets.protein}g</div>
                    </div>
                </Card>

                <Card className="flex flex-col items-center py-4 gap-2 px-2">
                    <ProgressRing
                        size={50}
                        strokeWidth={5}
                        progress={getProgress(log.fatIntake || 0, currentPlan.targets.fat)}
                        color="#eab308" // Yellow
                        value={Math.round(log.fatIntake || 0)}
                    />
                    <div className="text-center">
                        <div className="text-[10px] text-zinc-400">脂肪</div>
                        <div className="text-xs font-bold">{currentPlan.targets.fat}g</div>
                    </div>
                </Card>
            </div>

            {/* Add Entry Section */}
            <Card className="relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-[var(--primary)]" />
                        记录饮食
                    </h3>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                        <Plus className={cn("w-5 h-5 transition-transform", isAdding ? "rotate-45" : "")} />
                    </button>
                </div>

                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                        >
                            {/* Input Type Tabs */}
                            <div className="flex gap-2 border-b border-white/10 pb-2">
                                <button
                                    onClick={() => {
                                        setInputType("manual");
                                        setImageFiles([]);
                                        setAiResults([]);
                                        setAiInput("");
                                    }}
                                    className={cn("text-xs px-3 py-1 rounded-full transition-colors", inputType === "manual" ? "bg-white text-black" : "text-zinc-500")}
                                >
                                    手动
                                </button>
                                <button
                                    onClick={() => {
                                        setInputType("text");
                                        setImageFiles([]);
                                        setAiResults([]);
                                        setAiInput("");
                                    }}
                                    className={cn("text-xs px-3 py-1 rounded-full transition-colors flex items-center gap-1", inputType === "text" ? "bg-white text-black" : "text-zinc-500")}
                                >
                                    <Type className="w-3 h-3" /> 文字 AI
                                </button>
                                <button
                                    onClick={() => {
                                        setInputType("image");
                                        setAiInput("");
                                        setAiResults([]);
                                    }}
                                    className={cn("text-xs px-3 py-1 rounded-full transition-colors flex items-center gap-1", inputType === "image" ? "bg-white text-black" : "text-zinc-500")}
                                >
                                    <Camera className="w-3 h-3" /> 图片 AI
                                </button>
                            </div>

                            {/* Input Fields */}
                            {inputType === "manual" ? (
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-3">
                                        <label className="text-[10px] text-zinc-500 uppercase">食物名称 (可选)</label>
                                        <input
                                            type="text"
                                            value={addForm.name}
                                            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm focus:border-[var(--primary)] outline-none"
                                            placeholder="例如: 鸡胸肉"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-500 uppercase">碳水 (g)</label>
                                        <input
                                            type="number"
                                            value={addForm.carbs}
                                            onChange={(e) => setAddForm({ ...addForm, carbs: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-center text-sm focus:border-[var(--primary)] outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-500 uppercase">蛋白质 (g)</label>
                                        <input
                                            type="number"
                                            value={addForm.protein}
                                            onChange={(e) => setAddForm({ ...addForm, protein: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-center text-sm focus:border-green-500 outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-500 uppercase">脂肪 (g)</label>
                                        <input
                                            type="number"
                                            value={addForm.fat}
                                            onChange={(e) => setAddForm({ ...addForm, fat: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-center text-sm focus:border-yellow-500 outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {inputType === "text" ? (
                                        <textarea
                                            value={aiInput}
                                            onChange={(e) => setAiInput(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm focus:border-[var(--primary)] outline-none min-h-[80px]"
                                            placeholder="输入食物描述，例如：一个苹果和一杯牛奶"
                                        />
                                    ) : (
                                        <div className="space-y-3">
                                            <label className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-[var(--primary)]/50 transition-colors cursor-pointer block relative overflow-hidden group">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    className="hidden"
                                                    onChange={handleImageUpload}
                                                />
                                                {imageFiles.length > 0 ? (
                                                    <div className="relative z-10">
                                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                                            {imageFiles.map((file, index) => (
                                                                <div key={index} className="relative group/item">
                                                                    <img
                                                                        src={URL.createObjectURL(file)}
                                                                        alt={`Preview ${index + 1}`}
                                                                        className="w-full h-32 object-cover rounded-lg shadow-lg"
                                                                    />
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            removeImage(index);
                                                                        }}
                                                                        className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity"
                                                                    >
                                                                        <Trash2 className="w-3 h-3 text-white" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <p className="text-xs text-zinc-400 mt-2">
                                                            {imageFiles.length} 张图片已选择，点击可更换
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Camera className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                                                        <p className="text-xs text-zinc-400">点击上传食物图片（支持多张）</p>
                                                    </>
                                                )}
                                            </label>
                                            
                                            {/* Show AI analysis results */}
                                            {aiResults.length > 0 && (
                                                <div className="space-y-2 mt-4">
                                                    <div className="text-xs text-zinc-400 font-medium">识别到 {aiResults.length} 个食物：</div>
                                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                                        {aiResults.map((result, index) => (
                                                            <div key={index} className="p-3 bg-black/30 rounded-lg border border-white/10">
                                                                <div className="font-medium text-sm text-white mb-1">{result.name}</div>
                                                                <div className="text-xs text-zinc-500">
                                                                    {Math.round(result.calories)} kcal · C:{result.carbs} P:{result.protein} F:{result.fat}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button
                                                        onClick={handleBatchAdd}
                                                        className="w-full py-3 bg-[var(--primary)] text-black font-bold rounded-xl mt-2 active:scale-95 transition-transform"
                                                    >
                                                        批量添加所有食物
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={(!aiInput && imageFiles.length === 0) || isAnalyzing}
                                        className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                                        {isAnalyzing 
                                            ? `正在分析${imageFiles.length > 0 ? ` ${imageFiles.length} 张图片` : ""}...` 
                                            : imageFiles.length > 0 
                                                ? `AI 识别 ${imageFiles.length} 张图片中的食物`
                                                : "AI 智能计算热量"}
                                    </button>
                                </div>
                            )}

                            {inputType === "manual" && (
                                <button
                                    onClick={handleAdd}
                                    className="w-full py-3 bg-[var(--primary)] text-black font-bold rounded-xl mt-2 active:scale-95 transition-transform"
                                >
                                    确认添加
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* History List */}
                <div className="mt-4 space-y-2">
                    {log.entries && log.entries.length > 0 ? (
                        log.entries.slice().reverse().map((entry) => (
                            <div key={entry.id} className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/5">
                                <div>
                                    <div className="font-medium text-sm text-white">{entry.name}</div>
                                    <div className="text-xs text-zinc-500">
                                        {Math.round(entry.calories)} kcal · C:{entry.carbs} P:{entry.protein} F:{entry.fat}
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFoodEntry(selectedDate, entry.id)}
                                    className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    ) : (
                        !isAdding && <div className="text-center text-xs text-zinc-600 py-2">暂无记录</div>
                    )}
                </div>
            </Card>
        </div>
    );
}
