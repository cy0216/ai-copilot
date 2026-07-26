"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// 💡 关键修改：直接使用 React.ComponentProps 提取 NextThemesProvider 的属性类型
export function ThemeProvider({
                                  children,
                                  ...props
                              }: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
