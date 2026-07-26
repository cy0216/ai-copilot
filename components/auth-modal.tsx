"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

export function AuthModal({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                // 注册新用户
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert("注册成功！如果开启了邮箱验证，请查收邮件；未开启可直接登录。");
            } else {
                // 登录已有用户
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                setOpen(false);
                if (onLoginSuccess) onLoginSuccess();
            }
        } catch (err: any) {
            alert(`认证失败: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* 将 DialogTrigger 直接作为按钮使用 */}
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3">
                登录 / 注册
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>{isSignUp ? "注册账号" : "登录账号"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAuth} className="space-y-4 mt-4">
                    <div>
                        <label className="text-xs font-medium">邮箱地址</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium">密码</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="至少 6 位数字或字母"
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "处理中..." : isSignUp ? "立即注册" : "登录"}
                    </Button>

                    <div className="text-center text-xs text-muted-foreground mt-2">
                        {isSignUp ? "已有账号？" : "还没有账号？"}
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-blue-500 underline ml-1"
                        >
                            {isSignUp ? "去登录" : "去注册"}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}