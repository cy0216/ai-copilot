import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

// 初始化豆包客户端
const openai = new OpenAI({
    apiKey: process.env.DOUBAO_API_KEY,
    baseURL: "https://ark.cn-beijing.volces.com/api/v3", // 火山引擎兼容端点
});

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // 1. 调用豆包模型（开启流式响应）
        const stream = await openai.chat.completions.create({
            model: process.env.DOUBAO_ENDPOINT_ID || "",
            messages: [
                { role: "system", content: "你是一个极其有用的 AI 助手。" },
                { role: "user", content: prompt },
            ],
            stream: true,
        });

        // 2. 将 OpenAI 格式的流转为 ReadableStream 给前端打字机渲染，同时累加完整文本
        let fullText = "";
        const encoder = new TextEncoder();

        const customStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const text = chunk.choices[0]?.delta?.content || "";
                    if (text) {
                        fullText += text;
                        controller.enqueue(encoder.encode(text));
                    }
                }

                // 流传输结束后，异步写入 Supabase 保存记录
                if (fullText.trim()) {
                    supabase
                        .from("messages")
                        .insert([
                            { role: "user", content: prompt },
                            { role: "assistant", content: fullText },
                        ])
                        .then(({ error }) => {
                            if (error) console.error("Supabase error:", error);
                        });
                }

                controller.close();
            },
        });

        return new Response(customStream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error: any) {
        console.error("Doubao API Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}