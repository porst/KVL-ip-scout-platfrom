// Vercel Serverless Function：在伺服器端觸發 Claude Code Routine 評分。
// ROUTINE_FIRE_URL 與 ROUTINE_API_TOKEN 只從環境變數讀取（Vercel 專案設定），
// 絕不能出現在前端程式碼或回應內容中。
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const candidateInfo = req.body?.candidate_info
  if (typeof candidateInfo !== 'string' || !candidateInfo.trim()) {
    return res.status(400).json({ error: 'candidate_info is required' })
  }
  if (candidateInfo.length > 5000) {
    return res.status(400).json({ error: 'candidate_info too long' })
  }

  const fireUrl = process.env.ROUTINE_FIRE_URL
  const token = process.env.ROUTINE_API_TOKEN
  if (!fireUrl || !token) {
    return res.status(500).json({ error: 'Scoring service is not configured' })
  }

  try {
    const upstream = await fetch(fireUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'experimental-cc-routine-2026-04-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `請評估這位插畫師：\n${candidateInfo.trim()}`,
      }),
    })

    if (!upstream.ok) {
      // 不把上游回應原文轉發給瀏覽器，避免洩漏內部細節
      console.error('Routine fire failed:', upstream.status, await upstream.text())
      return res.status(502).json({ error: 'Failed to trigger scoring' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Routine fire error:', err)
    return res.status(502).json({ error: 'Failed to trigger scoring' })
  }
}
