// 定义我们将在 Supabase 数据库里创建的 prompt_history（历史记录）表结构
export interface PromptHistory {
    id?: string;           // 记录的唯一 ID (UUID)
    prompt: string;        // 用户输入的提示词
    response: string;      // AI 生成的回复内容
    created_at?: string;   // 创建时间
}
