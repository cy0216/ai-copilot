import { createClient } from "@supabase/supabase-js";

// 读取刚才在 .env.local 里配置的环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// 初始化并导出 Supabase 客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey);