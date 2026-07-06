import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { DIMENSIONS, DECISION_STATUSES, STATUS_META } from '../lib/constants.js'
import { RatingBadge, StatusChip, Tag } from '../components/Badges.jsx'

function Section({ title, children, tone = 'default' }) {
  const toneCls =
    tone === 'highlight'
      ? 'border-neutral-900 bg-neutral-900 text-white'
      : 'border-neutral-200 bg-white'
  return (
    <section className={`rounded-xl border p-4 sm:p-5 ${toneCls}`}>
      <h3
        className={`mb-3 text-xs font-semibold uppercase tracking-wider ${
          tone === 'highlight' ? 'text-neutral-400' : 'text-neutral-400'
        }`}
      >
        {title}
      </h3>
      {children}
    </section>
  )
}

function Field({ label, value }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div>
      <dt className="text-xs text-neutral-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-neutral-800">{String(value)}</dd>
    </div>
  )
}

function ScoreBar({ label, score, maxScale, note, noteLabel }) {
  const numeric = typeof score === 'number' ? score : Number(score)
  const has = !Number.isNaN(numeric) && score !== null && score !== undefined
  const pct = has ? Math.max(0, Math.min(100, (numeric / maxScale) * 100)) : 0
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-neutral-700">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-neutral-900">
          {has ? numeric : '–'}
          <span className="ml-0.5 text-xs font-normal text-neutral-400">/ {maxScale}</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-neutral-800 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      {note && (
        <p className="mt-1.5 rounded-lg bg-neutral-50 px-2.5 py-1.5 text-xs leading-relaxed text-neutral-500">
          <span className="font-medium text-neutral-600">{noteLabel}：</span>
          {note}
        </p>
      )}
    </div>
  )
}

export default function CandidateDetail() {
  const { id } = useParams()
  const [c, setC] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 決策表單
  const [status, setStatus] = useState('')
  const [decisionNote, setDecisionNote] = useState('')
  const [decidedBy, setDecidedBy] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)

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

  if (loading) return <p className="py-16 text-center text-sm text-neutral-400">載入中…</p>
  if (error)
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-500">{error}</p>
        <Link to="/" className="mt-3 inline-block text-sm text-neutral-500 underline">
          ← 回候選牆
        </Link>
      </div>
    )

  const needsAgent = c.agent_negotiation_required || knownAgents.length > 0

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to="/" className="text-sm text-neutral-400 hover:text-neutral-600">
        ← 回候選牆
      </Link>

      {/* 基本資訊 header */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {c.name || c.handle_ig || '（未命名）'}
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              {c.handle_ig && (
                <a
                  href={`https://instagram.com/${String(c.handle_ig).replace(/^@/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-neutral-600"
                >
                  @{String(c.handle_ig).replace(/^@/, '')}
                </a>
              )}
              {c.country ? ` · ${c.country}` : ''}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold tabular-nums">{c.composite_score ?? '–'}</div>
            <div className="text-[10px] uppercase tracking-wide text-neutral-400">
              composite score
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <RatingBadge rating={c.rating} size="lg" />
          <StatusChip status={c.status} />
          {c.ip_anchor_type && <Tag>{c.ip_anchor_type}</Tag>}
          {c.red_flag_triggered && (
            <span className="inline-flex items-center rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
              ⚠ Red Flag
            </span>
          )}
        </div>
      </div>

      {/* 代理商警示 */}
      {needsAgent && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">🤝 需透過代理談判</p>
          {knownAgents.length > 0 && (
            <ul className="mt-2 space-y-1">
              {knownAgents.map((a, i) => (
                <li key={i} className="text-sm text-amber-800">
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
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-100">
              {c.team_brief}
            </p>
          )}
          {c.suggested_next_action && (
            <div className="mt-4 rounded-lg bg-white/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                建議下一步
              </p>
              <p className="mt-1 text-sm font-medium text-white">{c.suggested_next_action}</p>
            </div>
          )}
        </Section>
      )}

      {/* 8 維度分數 */}
      <Section title={`八維度評分（${maxScale} 分制）`}>
        <div className="space-y-4">
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
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-red-700">
            {c.red_flags}
          </p>
        </Section>
      )}

      {/* 創作輪廓 */}
      <Section title="創作輪廓">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
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
          <p className="mt-3 border-t border-neutral-100 pt-3 text-sm leading-relaxed text-neutral-600">
            {c.sample_work_description}
          </p>
        )}
      </Section>

      {/* 商業與權利 */}
      <Section title="商業與權利">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
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
          <p className="mb-3 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
            上次決策：{c.decided_by}
            {c.decided_at ? ` · ${new Date(c.decided_at).toLocaleString('zh-TW')}` : ''}
            {c.decision_note ? ` — ${c.decision_note}` : ''}
          </p>
        )}
        <form onSubmit={saveDecision} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-neutral-500">
                更新狀態 *
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
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
              <span className="mb-1 block text-xs font-medium text-neutral-500">
                決策者名字 *
              </span>
              <input
                type="text"
                value={decidedBy}
                onChange={(e) => setDecidedBy(e.target.value)}
                maxLength={50}
                placeholder="你的名字"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-500">決策備註</span>
            <textarea
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="為什麼做這個決定？"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
            />
          </label>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
            >
              {saving ? '儲存中…' : '儲存決策'}
            </button>
            {saveMsg && (
              <span className={`text-sm ${saveMsg.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                {saveMsg.text}
              </span>
            )}
          </div>
        </form>
      </Section>

      {/* 中繼資料 */}
      <p className="pb-8 text-center text-xs text-neutral-300">
        來源：{c.source || '—'} · 加入者：{c.added_by || '—'} · 建立：
        {c.created_at ? new Date(c.created_at).toLocaleDateString('zh-TW') : '—'}
      </p>
    </div>
  )
}
