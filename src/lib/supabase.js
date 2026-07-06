import { createClient } from '@supabase/supabase-js'

// 值來自 Vercel 環境變數（見 vite.config.js 的 define 注入）。
// 這兩個值屬「可公開」等級：Project URL + Publishable key。
// 本機開發若沒設 .env，退回目前專案的公開值，方便直接跑起來。
const supabaseUrl =
  __SUPABASE_URL__ || 'https://pwglvzxhgazmpiujmoza.supabase.co'
const supabasePublishableKey =
  __SUPABASE_PUBLISHABLE_KEY__ || 'sb_publishable_sigWPjepk_UTReef77rzcg_x6P023hf'

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
