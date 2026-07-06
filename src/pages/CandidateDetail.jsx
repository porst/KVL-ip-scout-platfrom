import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { DIMENSIONS, DECISION_STATUSES, STATUS_META } from '../lib/constants.js'
import { RatingBadge, StatusChip, AnchorBadge } from '../components/Badges.jsx'
import { Avatar } from '../components/Avatar.jsx'
import { Card } from '../components/ui/card.jsx'
import { Button } from '../components/ui/button.jsx'
import {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog.jsx'

function Section({ title, children, tone = 'default' }) {
  if (tone === 'highlight') {
    return (
      <section className="rounded-2xl bg-sage-800 p-5 text-white sm:p-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-sage-300">
          {title}
        </h3>
        {children}
      </section>
    )
  }
  return (
    <Card className="p-5 sm:p-6">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-400">
        {title}
      </h3>
      {children}
    </Card>
  )
}

function Field({ label, value }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div>
      <dt className="text-xs text-stone-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-stone-700">{String(value)}</dd>
    </div>
  )
}

function ScoreBar({ label, score, maxScale, note, noteLabel }) {
  const numeric = typeof score === 'number' ? score : Number(score)
  const has = !Number.isNaN(numeric) && score !== null && score !== undefined
  const pct = has ? Math.max(0, Math.min(100, (numeric / maxScale) * 100)) : 0
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-stone-700">{label}</span>
        <span className="font-display text-sm font-semibold tabular-nums text-stone-900">
          {has ? numeric : '–'}
          <span className="ml-0.5 text-xs font-normal text-stone-400">/ {maxScale}</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-oat-200">
        <div
          className="h-full rounded-full bg-sage-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      {note && (
        <p className="mt-2 rounded-xl bg-oat-100 px-3 py-2 text-xs leading-relaxed text-stone-500">
          <span className="font-medium text-stone-600">{noteLabel}：</span>
          {note}
        </p>
      )}
    </div>
  )
}

export default function CandidateDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [c, setC] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 決策表單
  const [status, setStatus] = useState('')
  const [decisionNote, setDecisionNote] = useState('')
  const [decidedBy, setDecidedBy] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)

  // 刪除
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (cancelled) return
      if (error) setError(error.message)
      else if (!data) setError('找不到這位候選人')
      else {
        setC(data)
        setStatus(data.status || '')
        setDecisionNote(data.decision_note || '')
        setDecidedBy(data.decided_by || '')
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  const knownAgents = useMemo(() => {
    if (!c?.known_agents) return []
    const v = c.known_agents
    if (Array.isArray(v)) return v
    if (typeof v === 'object') return [v]
    try {
      const parsed = JSON.parse(v)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      return [{ name: String(v) }]
    }
  }, [c])

  // 分數尺度：全部 ≤ 5 視為 5 分制，否則 10 分制
  const maxScale = useMemo(() => {
    if (!c) return 10
    const vals = DIMENSIONS.map((d) => Number(c[d.key])).filter((n) => !Number.isNaN(n))
    return vals.length && Math.max(...vals) <= 5 ? 5 : 10
  }, [c])

  async function saveDecision(e) {
    e.preventDefault()
    setSaveMsg(null)
    if (!status) {
      setSaveMsg({ ok: false, text: '請選擇狀態' })
      return
    }
    if (!decidedBy.trim()) {
      setSaveMsg({ ok: false, text: '請填寫決策者名字' })
      return
    }
    setSaving(true)
    const payload = {
      status,
      decision_note: decisionNote.trim() || null,
      decided_by: decidedBy.trim(),
      decided_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await supabase
      .from('candidates')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle()
    setSaving(false)
    if (error) {
      setSaveMsg({ ok: false, text: `儲存失敗：${error.message}` })
    } else {
      if (data) setC(data)
      setSaveMsg({ ok: true, text: '已儲存決策 ✓' })
    }
  }

  async function deleteCandidate() {
    setDeleting(true)
    setDeleteError(null)
    const { error } = await supabase.from('candidates').delete().eq('id', id)
    setDeleting(false)
    if (error) {
      setDeleteError(`刪除失敗：${error.message}`)
    } else {
      navigate('/')
    }
  }

  if (loading) return <p className="py-20 text-center text-sm text-stone-400">載入中…</p>
  if (error)
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-brick-600">{error}</p>
        <Link to="/" className="mt-3 inline-block text-sm text-sage-700 underline">
          ← 回候選牆
        </Link>
      </div>
    )

  const needsAgent = c.agent_negotiation_required || knownAgents.length > 0

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link to="/" className="text-sm text-stone-400 transition-colors hover:text-sage-700">
        ← 回候選牆
      </Link>

      {/* 基本資訊 header */}
      <Card className="p-5 sm:p-7">
        <div className="flex flex-wrap items-start gap-4 sm:gap-5">
          <Avatar handle={c.handle_ig} name={c.name} className="h-16 w-16 text-lg sm:h-20 sm:w-20 sm:text-xl" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              {c.name || c.handle_ig || '（未命名）'}
            </h1>
            <p className="mt-1 text-sm text-stone-400">
              {c.handle_ig && (
                <a
                  href={`https://instagram.com/${String(c.handle_ig).replace(/^@/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sage-700 underline decoration-sage-300 underline-offset-2 hover:decoration-sage-600"
                >
                  @{String(c.handle_ig).replace(/^@/, '')}
                </a>
              )}
              {c.country ? ` · ${c.country}` : ''}
            </p>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl font-bold tabular-nums text-sage-700 sm:text-4xl">
              {c.composite_score ?? '–'}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-stone-400">
              composite score
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <RatingBadge rating={c.rating} size="lg" />
          <StatusChip status={c.status} />
          <AnchorBadge type={c.ip_anchor_type} />
          {c.red_flag_triggered && (
            <span className="inline-flex items-center rounded-full bg-brick-500 px-2.5 py-0.5 text-xs font-semibold text-white">
              ⚠ Red Flag
            </span>
          )}
        </div>
      </Card>

      {/* 代理商警示 */}
      {needsAgent && (
        <div className="rounded-2xl border border-clay-200 bg-clay-50 p-5">
          <p className="text-sm font-semibold text-clay-700">🤝 需透過代理談判</p>
          {knownAgents.length > 0 && (
            <ul className="mt-2 space-y-1">
              {knownAgents.map((a, i) => (
                <li key={i} className="text-sm text-clay-700/90">
                  •{' '}
                  {typeof a === 'string'
                    ? a
                    : [a.name || a.agency || a.agent, a.market || a.region, a.scope]
                        .filter(Boolean)
                        .join(' — ') || JSON.stringify(a)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Team brief 與建議行動 */}
      {(c.team_brief || c.suggested_next_action) && (
        <Section title="Team Brief" tone="highlight">
          {c.team_brief && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-sage-50">
              {c.team_brief}
            </p>
          )}
          {c.suggested_next_action && (
            <div className="mt-4 rounded-xl bg-white/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-sage-300">
                建議下一步
              </p>
              <p className="mt-1 text-sm font-medium text-white">{c.suggested_next_action}</p>
            </div>
          )}
        </Section>
      )}

      {/* 8 維度分數 */}
      <Section title={`八維度評分（${maxScale} 分制）`}>
        <div className="space-y-5">
          {DIMENSIONS.map((d) => (
            <ScoreBar
              key={d.key}
              label={d.label}
              score={c[d.key]}
              maxScale={maxScale}
              note={d.noteKey ? c[d.noteKey] : null}
              noteLabel={d.noteLabel}
            />
          ))}
        </div>
      </Section>

      {/* Red flags */}
      {c.red_flags && (
        <Section title="Red Flags">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-brick-600">
            {c.red_flags}
          </p>
        </Section>
      )}

      {/* 創作輪廓 */}
      <Section title="創作輪廓">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <Field label="IP 錨點類型" value={c.ip_anchor_type} />
          <Field label="風格標籤" value={c.style_tags} />
          <Field label="色彩調性" value={c.palette} />
          <Field label="常見母題" value={c.motifs} />
          <Field
            label="有角色世界觀"
            value={
              c.has_character_world === null || c.has_character_world === undefined
                ? null
                : c.has_character_world
                ? '有'
                : '無'
            }
          />
          <Field label="對應向量" value={c.matched_vectors} />
        </dl>
        {c.sample_work_description && (
          <p className="mt-4 border-t border-oat-200 pt-4 text-sm leading-relaxed text-stone-600">
            {c.sample_work_description}
          </p>
        )}
      </Section>

      {/* 商業與權利 */}
      <Section title="商業與權利">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <Field label="經紀狀態" value={c.agency_status} />
          <Field label="既有授權" value={c.existing_licenses} />
          <Field label="周邊飽和度" value={c.merch_saturation} />
          <Field label="亞洲市場存在感" value={c.asia_presence} />
          <Field label="商業意識" value={c.commercial_awareness} />
          <Field label="IG 追蹤數" value={c.followers_ig?.toLocaleString?.() ?? c.followers_ig} />
          <Field
            label="互動率"
            value={
              c.engagement_rate !== null && c.engagement_rate !== undefined
                ? `${c.engagement_rate}%`
                : null
            }
          />
          <Field label="權利歸屬清晰度" value={c.ownership_clarity} />
        </dl>
      </Section>

      {/* 團隊決策 */}
      <Section title="團隊決策">
        {c.decided_by && (
          <p className="mb-4 rounded-xl bg-oat-100 px-3.5 py-2.5 text-xs text-stone-500">
            上次決策：{c.decided_by}
            {c.decided_at ? ` · ${new Date(c.decided_at).toLocaleString('zh-TW')}` : ''}
            {c.decision_note ? ` — ${c.decision_note}` : ''}
          </p>
        )}
        <form onSubmit={saveDecision} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-stone-500">
                更新狀態 *
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-oat-300 bg-oat-50 px-3 py-2.5 text-sm focus:border-sage-400 focus:outline-none"
              >
                <option value="">選擇狀態…</option>
                {DECISION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}（{s}）
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-stone-500">
                決策者名字 *
              </span>
              <input
                type="text"
                value={decidedBy}
                onChange={(e) => setDecidedBy(e.target.value)}
                maxLength={50}
                placeholder="你的名字"
                className="w-full rounded-xl border border-oat-300 bg-oat-50 px-3 py-2.5 text-sm focus:border-sage-400 focus:outline-none"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-stone-500">決策備註</span>
            <textarea
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="為什麼做這個決定？"
              className="w-full rounded-xl border border-oat-300 bg-oat-50 px-3 py-2.5 text-sm focus:border-sage-400 focus:outline-none"
            />
          </label>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? '儲存中…' : '儲存決策'}
            </Button>
            {saveMsg && (
              <span className={`text-sm ${saveMsg.ok ? 'text-sage-700' : 'text-brick-600'}`}>
                {saveMsg.text}
              </span>
            )}
          </div>
        </form>

        {/* 刪除此候選：紅色、二次確認 */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-oat-200 pt-5">
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="destructive" size="sm">
                刪除此候選
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>確定要刪除嗎？</DialogTitle>
              <DialogDescription>
                將永久刪除「{c.name || c.handle_ig || '未命名'}
                」的候選資料，包含評分與決策紀錄。此操作無法復原。
              </DialogDescription>
              <div className="mt-6 flex justify-end gap-3">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    取消
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleting}
                  onClick={deleteCandidate}
                >
                  {deleting ? '刪除中…' : '確認刪除'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {deleteError && <span className="text-sm text-brick-600">{deleteError}</span>}
        </div>
      </Section>

      {/* 中繼資料 */}
      <p className="pb-8 text-center text-xs text-stone-300">
        來源：{c.source || '—'} · 加入者：{c.added_by || '—'} · 建立：
        {c.created_at ? new Date(c.created_at).toLocaleDateString('zh-TW') : '—'}
      </p>
    </div>
  )
}
