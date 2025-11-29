"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store/AppContext";
import { useAuth } from "@/lib/store/AuthContextSupabase";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { User, Trash2, Database, Camera, LogOut, Key } from "lucide-react";
import { DateSelector } from "@/components/ui/DateSelector";

export function ProfileView() {
    const { state, updateWeight, selectedDate } = useAppStore();
    const { currentUser, updateAvatar, updatePassword, logout } = useAuth();
    const router = useRouter();
    const log = state.logs[selectedDate];

    const [weightInput, setWeightInput] = useState(log?.weight?.toString() || state.userProfile.currentWeight.toString());
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSaveWeight = () => {
        const w = parseFloat(weightInput);
        if (!isNaN(w)) {
            updateWeight(selectedDate, w);
            alert("体重已更新");
        }
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateAvatar(reader.result as string);
                alert("头像已更新");
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePasswordChange = async () => {
        if (!newPassword || !confirmPassword) {
            alert("请填写新密码和确认密码");
            return;
        }

        if (newPassword.length < 6) {
            alert("新密码至少需要 6 位");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("两次输入的密码不一致");
            return;
        }

        const result = await updatePassword(newPassword);
        if (result.success) {
            alert("密码已更新");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } else {
            alert(result.error || "密码更新失败");
        }
    };

    const handleLogout = () => {
        if (confirm("确定要退出登录吗？")) {
            logout();
            router.push("/login");
        }
    };

    const handleClearData = () => {
        if (confirm("确定要清除当前用户的所有数据吗？此操作不可恢复。")) {
            if (currentUser) {
                localStorage.removeItem(`fitness_tracker_data_${currentUser.id}`);
                window.location.reload();
            }
        }
    };

    const handleGenerateMockData = () => {
        if (confirm("生成过去7天的模拟数据？这将覆盖现有数据。")) {
            const mockLogs: any = {};
            const todayDate = new Date();

            for (let i = 6; i >= 0; i--) {
                const d = new Date(todayDate);
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split("T")[0];

                const isWorkoutDay = i % 2 === 0;
                mockLogs[dateStr] = {
                    date: dateStr,
                    dietType: ["High", "Med", "Low"][i % 3],
                    caloriesIntake: 2000 + Math.random() * 500,
                    proteinIntake: 150 + Math.random() * 20,
                    carbsIntake: 200 + Math.random() * 50,
                    fatIntake: 60 + Math.random() * 10,
                    workoutVolume: isWorkoutDay ? 5000 + Math.random() * 2000 : 0,
                    weight: 75 + Math.random() * 1 - 0.5,
                    workoutCompleted: isWorkoutDay ? "day1" : undefined
                };
            }

            const newState = { ...state, logs: mockLogs };
            if (currentUser) {
                localStorage.setItem(`fitness_tracker_data_${currentUser.id}`, JSON.stringify(newState));
                window.location.reload();
            }
        }
    };

    return (
        <div className="space-y-6 pb-20 pt-4">
            <DateSelector />

            {/* User Profile Header */}
            <Card className="relative">
                <div className="flex items-center gap-4">
                    <label className="relative cursor-pointer group">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                        />
                        <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-white/10 overflow-hidden group-hover:border-[var(--primary)] transition-colors">
                            {currentUser?.avatar ? (
                                <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-zinc-400" />
                            )}
                        </div>
                        <div className="absolute inset-0 w-20 h-20 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                    </label>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">{currentUser?.username || "用户"}</h1>
                        <p className="text-zinc-500">坚持就是胜利</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-3 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-colors"
                    >
                        <LogOut className="w-5 h-5 text-red-500" />
                    </button>
                </div>
            </Card>

            {/* Weight */}
            <Card>
                <h3 className="font-bold mb-4">今日体重 (kg)</h3>
                <div className="flex gap-4">
                    <input
                        type="number"
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        className="flex-1 bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[var(--primary)]"
                    />
                    <button
                        onClick={handleSaveWeight}
                        className="bg-[var(--primary)] text-black font-bold px-6 rounded-xl hover:brightness-110"
                    >
                        保存
                    </button>
                </div>
            </Card>

            {/* Change Password */}
            <Card>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Key className="w-4 h-4 text-[var(--primary)]" />
                    修改密码
                </h3>
                <div className="space-y-3">
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[var(--primary)]"
                        placeholder="当前密码"
                    />
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[var(--primary)]"
                        placeholder="新密码（至少6位）"
                    />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[var(--primary)]"
                        placeholder="确认新密码"
                    />
                    <button
                        onClick={handlePasswordChange}
                        className="w-full py-3 bg-[var(--primary)] text-black font-bold rounded-xl hover:brightness-110"
                    >
                        更新密码
                    </button>
                </div>
            </Card>

            {/* Data Management */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-500 uppercase px-2">数据管理</h3>

                <button
                    onClick={handleGenerateMockData}
                    className="w-full flex items-center gap-3 p-4 bg-zinc-900/50 rounded-2xl border border-white/5 hover:bg-zinc-800 transition-colors text-left"
                >
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Database className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                        <div className="font-bold text-white">生成模拟数据</div>
                        <div className="text-xs text-zinc-500">用于演示图表效果</div>
                    </div>
                </button>

                <button
                    onClick={handleClearData}
                    className="w-full flex items-center gap-3 p-4 bg-zinc-900/50 rounded-2xl border border-white/5 hover:bg-red-900/20 transition-colors text-left"
                >
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                        <div className="font-bold text-red-500">重置我的数据</div>
                        <div className="text-xs text-zinc-500">清空本地存储记录</div>
                    </div>
                </button>
            </div>
        </div>
    );
}
