"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase";
import { PromptHistory } from "@/types/database";
import { AuthModal } from "@/components/auth-modal";
import { User } from "@supabase/supabase-js";

export function Navbar() {
    const [history, setHistory] = useState<PromptHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    // 1. 监听 Supabase 用户登录状态变更
    useEffect(() => {
        // 获取当前已登录的用户信息
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });

        // 订阅登录状态变化（登录、登出事件）
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // 2. 拉取属于当前已登录用户的历史记录
    const fetchHistory = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data } = await supabase
                .from("prompt_history")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(10);

            if (data) {
                setHistory(data);
            }
        } catch (err) {
            console.log("拉取历史记录失败");
        } finally {
            setLoading(false);
        }
    };

    // 3. 退出登录
    const handleLogout = async () => {
        await supabase.auth.signOut();
        setHistory([]);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-8">
                {/* 左侧 Logo */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
              AI Copilot
            </span>
                    </Link>
                </div>

                {/* 右侧：按钮与状态 */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            {/* 已登录状态：显示历史记录抽屉 */}
                            <Sheet>
                                <SheetTrigger
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                                    onClick={fetchHistory}
                                >
                                    📜 历史记录
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>我的历史记录</SheetTitle>
                                    </SheetHeader>

                                    <div className="mt-6 flex flex-col gap-3">
                                        {loading && (
                                            <p className="text-sm text-muted-foreground">加载中...</p>
                                        )}

                                        {!loading && history.length === 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                暂无历史记录，快去发送提示词吧！
                                            </p>
                                        )}

                                        {history.map((item, index) => (
                                            <div
                                                key={index}
                                                className="rounded-lg border border-border/60 p-3 text-xs bg-muted/40 space-y-1"
                                            >
                                                <p className="font-semibold text-foreground">
                                                    问：{item.prompt}
                                                </p>
                                                <p className="text-muted-foreground line-clamp-2">
                                                    答：{item.response}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </SheetContent>
                            </Sheet>

                            {/* 用户邮箱提示与登出按钮 */}
                            <span className="text-xs text-muted-foreground hidden sm:inline-block">
                {user.email}
              </span>
                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                退出
                            </Button>
                        </>
                    ) : (
                        /* 未登录状态：显示登录弹窗 */
                        <AuthModal />
                    )}
                </div>
            </div>
        </header>
    );
}
