import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar"; // 1. 引入 Navbar

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "AI Copilot App",
    description: "基于 Next.js + Supabase 的智能创作助手",
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
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            {/* 2. 放在 children 上方，这样所有子页面顶部都会自动有导航栏 */}
            <Navbar />
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}