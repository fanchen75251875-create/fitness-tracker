"use client";

import { useState } from "react";
import { useAuth } from "@/lib/store/AuthContextSupabase";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { UserPlus, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!email || !password || !confirmPassword) {
            setError("请填写所有字段");
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("密码至少需要 6 位");
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("两次输入的密码不一致");
            setIsLoading(false);
            return;
        }

        const result = await register(email, password, username || email.split("@")[0]);
        setIsLoading(false);
        
        if (!result.success) {
            setError(result.error || "注册失败");
        }
        // 成功时 router.push 已在 register 函数中处理
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-[var(--primary)] rounded-full mx-auto mb-4 flex items-center justify-center">
                        <UserPlus className="w-10 h-10 text-black" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">创建账户</h1>
                    <p className="text-zinc-500">开始你的健身之旅</p>
                </div>

                <Card>
                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="text-xs text-zinc-500 mb-2 block">邮箱</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-[var(--primary)] outline-none"
                                placeholder="输入邮箱地址"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="text-xs text-zinc-500 mb-2 block">用户名（可选）</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-[var(--primary)] outline-none"
                                placeholder="输入用户名（留空将使用邮箱前缀）"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="text-xs text-zinc-500 mb-2 block">密码</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-[var(--primary)] outline-none"
                                placeholder="至少 6 位"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="text-xs text-zinc-500 mb-2 block">确认密码</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-[var(--primary)] outline-none"
                                placeholder="再次输入密码"
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-[var(--primary)] text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    注册中...
                                </>
                            ) : (
                                <>
                                    注册
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <div className="text-center pt-4 border-t border-white/5">
                            <p className="text-sm text-zinc-500">
                                已有账户？{" "}
                                <button
                                    type="button"
                                    onClick={() => router.push("/login")}
                                    className="text-[var(--primary)] font-bold hover:underline"
                                >
                                    立即登录
                                </button>
                            </p>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
