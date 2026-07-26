import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { supabase } from "@/lib/supabase";

// 初始化 Gemini 客户端（自动读取环境变量中的 GEMINI_API_KEY）
const ai = new GoogleGenAI({});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { prompt, userId } = body;

        if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
            return NextResponse.json(
                { error: "提示词 (prompt) 不能为空！" },
                { status: 400 }
            );
        }

        // 1. 调用 Gemini 2.5 Flash 模型生成流式响应
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const encoder = new TextEncoder();
        let fullText = "";

        // 2. 创建 Web 标准可读流，实时推送到前端
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of responseStream) {
                        const textChunk = chunk.text || "";
                        fullText += textChunk;
                        controller.enqueue(encoder.encode(textChunk));
                    }

                    // 流接收完成后，将最终文本写入 Supabase
                    if (fullText) {
                        await supabase.from("prompt_history").insert([
                            {
                                prompt: prompt,
                                response: fullText,
                                ...(userId ? { user_id: userId } : {}),
                            },
                        ]);
                    }
                } catch (err) {
                    console.error("Gemini Streaming Error:", err);
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
            },
        });
        //test
    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json(
            { error: "调用 Gemini API 失败，请检查密钥或网络状态。" },
            { status: 500 }
        );
    }
}
