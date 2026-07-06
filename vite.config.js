import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Supabase 連線資訊從環境變數讀取（Vercel 專案設定），
// 這裡把非 VITE_ 前綴的變數注入前端。只放「可公開」的值：
// Project URL 與 Publishable key。ROUTINE_* 絕對不可加進來。
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss()],
    define: {
      __SUPABASE_URL__: JSON.stringify(env.SUPABASE_URL || env.VITE_SUPABASE_URL || ''),
      __SUPABASE_PUBLISHABLE_KEY__: JSON.stringify(
        env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
      ),
    },
  }
})
