import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { Card } from '../components/ui/card.jsx'
import { Button } from '../components/ui/button.jsx'

// 基本驗證：IG handle 允許字母數字、句點、底線，1–30 字元（IG 官方限制）
function normalizeHandle(raw) {
  let h = raw.trim()
  // 允許貼整個 IG 網址
  const urlMatch = h.match(/instagram\.com\/([A-Za-z0-9._]+)/i)
  if (urlMatch) h = urlMatch[1]
  h = h.replace(/^@/, '').replace(/\/+$/, '')
  return h
}

function isValidHandle(h) {
  return /^[A-Za-z0-9._]{1,30}$/.test(h)
}

const inputCls =
  'w-full rounded-xl border border-oat-300 bg-oat-50 px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 focus:border-sage-400 focus:outline-none'

export default function AddCandidate() {
  const [form, setForm] = useState({ handle: '', links: '', notes: '', addedBy: '' })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null) // { id, phase: 'scoring' | 'done' | 'trigger_failed' }
  const channelRef = useRef(null)

  useEffect(() => {
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [])

  // 送出後訂閱該筆資料，status 離開 scoring 即顯示完成
  function watchRow(id) {
    channelRef.current = supabase
      .channel(`candidate-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'candidates', filter: `id=eq.${id}` },
        (payload) => {
          if (payload.new.status && payload.new.status !== 'scoring') {
            setResult((r) => (r && r.id === id ? { ...r, phase: 'done' } : r))
          }
        }
      )
      .subscribe()

    // Polling 備援（每 10 秒），Realtime 沒開也能偵測到完成
    const timer = setInterval(async () => {
      const { data } = await supabase
        .from('candidates')
        .select('status')
        .eq('id', id)
        .maybeSingle()
      if (data && data.status !== 'scoring') {
        clearInterval(timer)
        setResult((r) => (r && r.id === id ? { ...r, phase: 'done' } : r))
      }
    }, 10000)
    // 最多輪詢 10 分鐘
    setTimeout(() => clearInterval(timer), 10 * 60 * 1000)
  }

  async function onSubmit(e) {
    e.preventDefault()
    const errs = {}
    const handle = normalizeHandle(form.handle)
    if (!handle) errs.handle = '請填寫 IG handle'
    else if (!isValidHandle(handle))
      errs.handle = 'IG handle 格式不正確（只能包含英數字、句點、底線）'
    if (!form.addedBy.trim()) errs.addedBy = '請填寫你的名字'
    if (form.links && form.links.length > 1000) errs.links = '連結太長了'
    if (form.notes && form.notes.length > 2000) errs.notes = '備注太長了'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)
    setResult(null)

    // 1) 寫入 Supabase，status = 'scoring'
    const now = new Date().toISOString()
    const { data: row, error } = await supabase
      .from('candidates')
      .insert({
        handle_ig: handle,
        status: 'scoring',
        source: 'manual',
        added_by: form.addedBy.trim(),
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error) {
      setSubmitting(false)
      if (error.code === '23505') {
        setErrors({ handle: '這個 IG handle 已經在資料庫裡了' })
      } else {
        setErrors({ submit: `寫入失敗：${error.message}` })
      }
      return
    }

    // 2) 呼叫本專案的 Serverless Function 觸發評分
    //    （token 只存在伺服器端，前端只打自己的 /api）
    const candidateInfo = [
      `IG handle: @${handle}`,
      form.links.trim() ? `其他連結: ${form.links.trim()}` : null,
      form.notes.trim() ? `備注: ${form.notes.trim()}` : null,
      `加入者: ${form.addedBy.trim()}`,
    ]
      .filter(Boolean)
      .join('\n')

    let triggered = false
    try {
      const res = await fetch('/api/trigger-scoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate_info: candidateInfo }),
      })
      triggered = res.ok
    } catch {
      triggered = false
    }

    setSubmitting(false)
    setResult({ id: row.id, phase: triggered ? 'scoring' : 'trigger_failed' })
    setForm({ handle: '', links: '', notes: '', addedBy: form.addedBy })
    if (triggered) watchRow(row.id)
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1.5 font-display text-2xl font-bold tracking-tight text-stone-900">
        手動加入候選人
      </h1>
      <p className="mb-6 text-sm text-stone-400">
        送出後系統會自動觸發 AI 評分，完成後出現在候選牆。
      </p>

      <Card className="p-5 sm:p-7">
        <form onSubmit={onSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">
              IG handle *
            </span>
            <input
              type="text"
              value={form.handle}
              onChange={(e) => setForm((f) => ({ ...f, handle: e.target.value }))}
              placeholder="@illustrator 或貼 IG 個人頁網址"
              className={inputCls}
            />
            {errors.handle && <p className="mt-1.5 text-xs text-brick-600">{errors.handle}</p>}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">
              其他連結（作品集、Behance、個人網站…）
            </span>
            <textarea
              value={form.links}
              onChange={(e) => setForm((f) => ({ ...f, links: e.target.value }))}
              rows={2}
              placeholder="一行一個連結"
              className={inputCls}
            />
            {errors.links && <p className="mt-1.5 text-xs text-brick-600">{errors.links}</p>}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">備注</span>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="為什麼推薦這位插畫師？在哪裡發現的？"
              className={inputCls}
            />
            {errors.notes && <p className="mt-1.5 text-xs text-brick-600">{errors.notes}</p>}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">
              你的名字 *
            </span>
            <input
              type="text"
              value={form.addedBy}
              onChange={(e) => setForm((f) => ({ ...f, addedBy: e.target.value }))}
              maxLength={50}
              placeholder="加入者名字"
              className={inputCls}
            />
            {errors.addedBy && (
              <p className="mt-1.5 text-xs text-brick-600">{errors.addedBy}</p>
            )}
          </label>

          {errors.submit && (
            <p className="rounded-xl bg-brick-50 px-3.5 py-2.5 text-sm text-brick-600">
              {errors.submit}
            </p>
          )}

          <Button type="submit" disabled={submitting} className="w-full" size="lg">
            {submitting ? '送出中…' : '送出並觸發評分'}
          </Button>
        </form>
      </Card>

      {result && (
        <div
          className={`mt-5 rounded-2xl border p-5 text-sm ${
            result.phase === 'done'
              ? 'border-sage-200 bg-sage-50 text-sage-800'
              : result.phase === 'trigger_failed'
              ? 'border-clay-200 bg-clay-50 text-clay-700'
              : 'border-oat-300 bg-oat-50 text-stone-600'
          }`}
        >
          {result.phase === 'scoring' && (
            <>
              <p className="font-medium text-clay-600">✓ 已加入，AI 評分中…</p>
              <p className="mt-1 text-xs text-stone-400">
                評分完成後會自動更新（通常需要幾分鐘），你可以先回候選牆或繼續加入其他人。
              </p>
            </>
          )}
          {result.phase === 'done' && (
            <>
              <p className="font-medium">🎉 評分完成！</p>
              <Link
                to={`/candidate/${result.id}`}
                className="mt-1 inline-block text-xs font-medium underline"
              >
                查看候選卡 →
              </Link>
            </>
          )}
          {result.phase === 'trigger_failed' && (
            <p>
              資料已寫入，但評分觸發失敗。請稍後在候選牆找到這筆資料，或聯繫管理員手動觸發。
            </p>
          )}
        </div>
      )}
    </div>
  )
}
