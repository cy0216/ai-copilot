import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "AI Copilot",
    description: "Next.js AI Copilot with Supabase & Vercel",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh" suppressHydrationWarning>
        <body className={inter.className}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {/*
            全局背景容器：
            1. bg-[url('/bg.jpg')] 引入 public/bg.jpg
            2. bg-cover bg-center bg-fixed 保证图片铺满且固定不随滚动条偏移
          */}
            <div className="relative min-h-screen bg-[url('/bg.png')] bg-cover bg-center bg-fixed">

                {/*
              遮罩层：
              暗色模式下 overlay 黑色半透明，亮色模式下 overlay 白色半透明，
              配合 backdrop-blur-sm (轻微毛玻璃)，提升整体高科技质感！
            */}
                <div className="min-h-screen bg-background/80 backdrop-blur-sm">
                    <Navbar />
                    <main>{children}</main>
                </div>

            </div>
        </ThemeProvider>
        </body>
        </html>
    );
}