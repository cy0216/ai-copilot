"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { PromptHistory } from "@/types/database";

export default function HomePage() {
    const [prompt, setPrompt] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    // 保存从 Supabase 查出来的历史记录
    const [history, setHistory] = useState<PromptHistory[]>([]);

    // 1. 定义加载历史记录的函数
    const fetchHistory = async () => {
        try {
            // 查询 prompt_history 表，按创建时间降序倒序排列，取前 5 条
            const { data, error } = await supabase
                .from("prompt_history")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(5);

            if (!error && data) {
                setHistory(data);
            }
        } catch (err) {
            console.log("未连接真实 Supabase，暂不显示历史记录列表");
        }
    };

    // 2. 组件加载时尝试拉取一次历史记录
    useEffect(() => {
        fetchHistory();
    }, []);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        setResult("");

        const currentPrompt = prompt;
        setPrompt("");

        try {
            // 获取当前已登录的用户
            const { data: { user } } = await supabase.auth.getUser();

            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: currentPrompt }),
            });

            if (!res.ok || !res.body) throw new Error("请求失败");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedText += chunk;
                setResult(accumulatedText);
            }

            // 💡 打字机输出完成后，直接在前端用已登录的客户端写入 Supabase！
            if (user) {
                await supabase.from("prompt_history").insert([
                    {
                        prompt: currentPrompt,
                        response: accumulatedText,
                        user_id: user.id,
                    },
                ]);
            }
        } catch (err) {
            setResult("请求失败，请稍后重试。");
        } finally {
            setLoading(false);
        }
    };


    return (
        <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center p-6 text-center">
            <div className="max-w-3xl space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
                    超绝 <span className="text-blue-500">AI 大王范本</span> 测试
                </h1>
                <p className="text-lg text-muted-foreground">
                    基于 Next.js 与 Supabase 构建，帮助你高效完成内容创作、代码生成与知识库检索。
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="mt-8 flex w-full max-w-xl flex-col sm:flex-row gap-2 rounded-xl border border-border/60 bg-card p-2 shadow-lg"
            >
                <input
                    type="text"
                    placeholder="输入你的提示词 (Prompt)，比如：帮我写一段 Next.js 代码..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-muted-foreground"
                />
                <Button type="submit" disabled={loading}>
                    {loading ? "生成中..." : "生成内容"}
                </Button>
            </form>

            {/* AI 生成结果展示 */}
            {result && (
                <div className="mt-6 w-full max-w-xl rounded-xl border border-border/80 bg-muted/50 p-4 text-left shadow">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{result}</p>
                </div>
            )}

            {/* 历史记录区域 */}
            {history.length > 0 && (
                <div className="mt-10 w-full max-w-xl text-left">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">最近生成历史</h3>
                    <div className="space-y-2">
                        {history.map((item, index) => (
                            <div key={index} className="rounded-lg border border-border/40 p-3 bg-card text-xs">
                                <span className="font-medium text-foreground">问：{item.prompt}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}

