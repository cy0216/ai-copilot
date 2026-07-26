import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
    try {
        // 1. 解析前端传过来的请求体 (包含 prompt 和 userId)
        const body = await request.json();
        const { prompt, userId } = body;

        // 2. 基础参数校验
        if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
            return NextResponse.json(
                { error: "提示词 (prompt) 不能为空！" },
                { status: 400 }
            );
        }

        // 要模拟/生成的完整 AI 回复文本
        const fullText = `【AI 流式回复】：针对你提到的“${prompt}”，这是一个标准的 Next.js App Router 流式响应示例。利用 ReadableStream 架构，我们可以做到像 ChatGPT 一样实时将字符推送至前端！`;

        // 创建一个 TextEncoder 文本编码器，把字符串转成 Uint8Array 字节流
        const encoder = new TextEncoder();

        // 3. 创建 ReadableStream（可读流）
        const stream = new ReadableStream({
            async start(controller) {
                // 模拟大模型逐字生成：每 50 毫秒向前端推送几个字符
                for (let i = 0; i < fullText.length; i += 2) {
                    const chunk = fullText.slice(i, i + 2);
                    controller.enqueue(encoder.encode(chunk));
                    // 等待 50 毫秒模拟思考和网络传输延迟
                    await new Promise((resolve) => setTimeout(resolve, 50));
                }

                // 4. 流式推送完毕后，将记录同步写入 Supabase 数据库
                try {
                    await supabase.from("prompt_history").insert([
                        {
                            prompt: prompt,
                            response: fullText,
                            // 如果前端传了 userId 则带上，无则存 NULL
                            ...(userId ? { user_id: userId } : {}),
                        },
                    ]);
                } catch (dbError) {
                    console.warn("Supabase 写入失败或权限不足:", dbError);
                }

                // 5. 关闭数据流
                controller.close();
            },
        });

        // 6. 返回包含 text/plain 流式响应头的 Response
        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
            },
        });
    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        );
    }
}