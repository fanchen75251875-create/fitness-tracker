"use client";

import { useState } from "react";

export default function TestPage() {
    const [text, setText] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const testAPI = async () => {
        setLoading(true);
        setResult("测试中...");

        try {
            const response = await fetch("/api/analyze-food", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: text,
                    image: null,
                }),
            });

            const data = await response.json();
            setResult(JSON.stringify(data, null, 2));
        } catch (error: any) {
            setResult(`错误: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Gemini API 测试页面</h1>

            <div className="space-y-4">
                <div>
                    <label className="block mb-2">输入食物描述：</label>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full p-2 border rounded text-black"
                        placeholder="例如：一杯美式咖啡"
                    />
                </div>

                <button
                    onClick={testAPI}
                    disabled={!text || loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    {loading ? "测试中..." : "测试 API"}
                </button>

                <div>
                    <label className="block mb-2">API 响应：</label>
                    <pre className="bg-gray-100 p-4 rounded text-black overflow-auto">
                        {result || "等待测试..."}
                    </pre>
                </div>
            </div>
        </div>
    );
}
