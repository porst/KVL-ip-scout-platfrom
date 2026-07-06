# IP Scout — 插畫師 IP 授權候選資料庫

團隊協作網頁平台：瀏覽候選插畫師、查看 AI 八維度評分、做團隊決策、手動加入新候選人並自動觸發評分。

## 技術棧

- **前端**：React 18 + Vite + Tailwind CSS v4，React Router SPA
- **設計系統**：shadcn/ui 風格元件（Card / Badge / Button / Dialog，基於 Radix + cva），
  北歐簡約調性——燕麥米白底（#FAF7F2）、鼠尾草綠主色（#6B8E7F）、陶土橘點綴（#C97D5D）、
  莫蘭迪色系 badge；標題 Space Grotesk、內文 Inter（@fontsource 自託管）
- **頭像**：unavatar.io 抓 IG 頭像，失敗時以姓名縮寫圓形頭像備援
- **資料庫**：Supabase（`candidates` 表，讀寫皆透過 Publishable key）
- **即時更新**：Supabase Realtime 訂閱 + 10 秒 polling 備援（Realtime replication 未開啟也能運作）
- **評分觸發**：Vercel Serverless Function `/api/trigger-scoring` → Claude Code Routine fire API

## 部署到 Vercel

1. 在 Vercel 建立新專案，Import 這個 GitHub repo（分支或 merge 到 main 皆可）。
   Framework 會自動偵測為 **Vite**，build 設定不用改。
2. 在 **Settings → Environment Variables** 加入四個變數：

   | 變數 | 說明 | 安全等級 |
   |---|---|---|
   | `SUPABASE_URL` | Supabase Project URL | 公開安全（會進前端 bundle） |
   | `SUPABASE_PUBLISHABLE_KEY` | Supabase Publishable key | 公開安全（會進前端 bundle） |
   | `ROUTINE_FIRE_URL` | Claude Code Routine 的 fire endpoint | **機密**，只被 Serverless Function 讀取 |
   | `ROUTINE_API_TOKEN` | Routine API token | **機密**，只被 Serverless Function 讀取 |

3. Deploy。Vercel 會給一個 `*.vercel.app` 網址，直接轉發給團隊即可（無需登入）。

> **安全備註**：`ROUTINE_*` 兩個變數只在 `api/trigger-scoring.js` 以 `process.env` 讀取，
> 不會出現在任何前端程式碼或 bundle 裡。前端只使用 Supabase Publishable key（可公開）。
> 若要提高即時性，可在 Supabase Dashboard → Database → Replication 開啟 `candidates` 表的
> Realtime；未開啟時系統會以每 10 秒 polling 作為備援。

## 本機開發

```bash
npm install
npm run dev        # 前端（/api 需在 Vercel 環境，本機可用 `vercel dev`）
```

複製 `.env.example` 為 `.env` 並填入值（`.env` 已被 gitignore，不會被 commit）。

## 專案結構

```
api/trigger-scoring.js    # Serverless Function：伺服器端呼叫 Routine fire API
src/
  lib/supabase.js         # Supabase client（Publishable key）
  lib/constants.js        # 評級顏色、狀態標籤、八維度定義
  pages/CandidateWall.jsx # 頁面 1：候選牆（篩選、排序、Realtime）
  pages/CandidateDetail.jsx # 頁面 2：詳情頁（維度長條圖、代理警示、團隊決策）
  pages/AddCandidate.jsx  # 頁面 3：加入表單（驗證 → 寫入 → 觸發評分 → 訂閱結果）
```

---

## 📖 怎麼用（轉發給團隊）

嗨大家，這是我們的插畫師 IP 授權候選資料庫 **IP Scout**，手機電腦都能開，不用登入：

**🔍 看候選人（候選牆）**
打開網址就是候選牆，每張卡片顯示名字、國家、評級（綠 PRIORITY＝優先接觸、藍 QUALIFIED＝合格、黃 WATCH＝觀察、灰 PASS、紅 DISQUALIFIED）和綜合分數。上方可以依評級、IP 錨點類型、來源、狀態篩選，也能切換排序（分數／最新加入／最近更新）。

**📋 看詳情**
點任一張卡片進入詳情頁：八個維度的評分長條圖、AI 給的 Team Brief 和建議下一步、商業與權利資訊。如果這位插畫師有已知代理商，頁面會用黃色框特別標示「需透過代理談判」。

**✅ 做決策**
在詳情頁最下方「團隊決策」區塊：選擇新狀態（已入選、洽談中、已簽約⋯）、寫下決策備註、填上自己的名字，按「儲存決策」就會直接更新資料庫，大家都看得到。確定不需要的候選人可以按紅色「刪除此候選」（會再確認一次才真的刪除，刪掉就無法復原，請謹慎使用）。

**➕ 推薦新人選**
點右上角「＋ 加入候選」，填 IG handle（可以直接貼 IG 網址）、相關連結、備注和你的名字後送出。系統會自動觸發 AI 評分，幾分鐘後評分完成，候選牆上就會出現完整的候選卡，不用重新整理頁面。

有問題找我 🙌
