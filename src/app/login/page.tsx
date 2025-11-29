"use client";

import { useState } from "react";
import { useAuth } from "@/lib/store/AuthContextSupabase";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { User, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!email || !password) {
            setError("请输入邮箱和密码");
            setIsLoading(false);
            return;
        }

        const result = await login(email, password);
        setIsLoading(false);
        
        if (!result.success) {
            setError(result.error || "登录失败");
        }
        // 成功时 router.push 已在 login 函数中处理
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-[var(--primary)] rounded-full mx-auto mb-4 flex items-center justify-center">
                        <User className="w-10 h-10 text-black" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">欢迎回来</h1>
                    <p className="text-zinc-500">登录你的健身账户</p>
                </div>

                <Card>
                    <form onSubmit={handleLogin} className="space-y-4">
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
                            <label className="text-xs text-zinc-500 mb-2 block">密码</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-[var(--primary)] outline-none"
                                placeholder="输入密码"
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
                                    登录中...
                                </>
                            ) : (
                                <>
                                    登录
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <div className="text-center pt-4 border-t border-white/5">
                            <p className="text-sm text-zinc-500">
                                还没有账户？{" "}
                                <button
                                    type="button"
                                    onClick={() => router.push("/register")}
                                    className="text-[var(--primary)] font-bold hover:underline"
                                >
                                    立即注册
                                </button>
                            </p>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
