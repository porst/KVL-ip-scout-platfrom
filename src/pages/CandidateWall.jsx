import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { RATING_ORDER, RATING_META, STATUS_META, ANCHOR_META } from '../lib/constants.js'
import { RatingBadge, StatusChip, AnchorBadge } from '../components/Badges.jsx'
import { Avatar } from '../components/Avatar.jsx'
import { getPortfolioUrl } from '../lib/portfolioUrl.js'
import { Card } from '../components/ui/card.jsx'

const SORTS = {
  score_desc: { label: '分數：高 → 低' },
  newest: { label: '最新加入' },
  updated: { label: '最近更新' },
}

function sortRows(rows, sortKey) {
  const copy = [...rows]
  if (sortKey === 'score_desc') {
    copy.sort((a, b) => (b.composite_score ?? -1) - (a.composite_score ?? -1))
  } else if (sortKey === 'newest') {
    copy.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  } else {
    copy.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
  }
  return copy
}

function FilterSelect({ label, value, onChange, options, allOption = true }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="shrink-0 text-stone-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-oat-300 bg-oat-50 px-2.5 py-2 text-sm text-stone-700 focus:border-sage-400 focus:outline-none"
      >
        {allOption && <option value="">全部</option>}
        {options.map(([val, text]) => (
          <option key={val} value={val}>
            {text}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function CandidateWall() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ rating: '', anchor: '', source: '', status: '' })
  const [sortKey, setSortKey] = useState('score_desc')
  const pollTimer = useRef(null)

  async function fetchAll() {
    const { data, error } = await supabase.from('candidates').select('*')
    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setRows(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()

    // Realtime：candidates 任何變動即時更新畫面（新增後評分完成 → 卡片自動刷新）
    const channel = supabase
      .channel('candidates-wall')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates' }, (payload) => {
        setRows((prev) => {
          if (payload.eventType === 'INSERT') {
            if (prev.some((r) => r.id === payload.new.id)) return prev
            return [...prev, payload.new]
          }
          if (payload.eventType === 'UPDATE') {
            return prev.map((r) => (r.id === payload.new.id ? payload.new : r))
          }
          if (payload.eventType === 'DELETE') {
            return prev.filter((r) => r.id !== payload.old.id)
          }
          return prev
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Polling 備援：只要有候選人卡在「評分中」，每 10 秒補抓一次
  // （若 Supabase 專案未開啟該表的 Realtime replication，仍能自動刷新）
  const hasScoring = rows.some((r) => r.status === 'scoring')
  useEffect(() => {
    if (!hasScoring) return
    pollTimer.current = setInterval(fetchAll, 10000)
    return () => clearInterval(pollTimer.current)
  }, [hasScoring])

  const anchorOptions = useMemo(
    () =>
      [...new Set(rows.map((r) => r.ip_anchor_type).filter(Boolean))]
        .sort()
        .map((v) => [v, ANCHOR_META[v]?.label ? `${v} ${ANCHOR_META[v].label}` : v]),
    [rows]
  )
  const sourceOptions = useMemo(
    () => [...new Set(rows.map((r) => r.source).filter(Boolean))].sort().map((v) => [v, v]),
    [rows]
  )

  const visible = useMemo(() => {
    let out = rows
    if (filters.rating) out = out.filter((r) => r.rating === filters.rating)
    if (filters.anchor) out = out.filter((r) => r.ip_anchor_type === filters.anchor)
    if (filters.source) out = out.filter((r) => r.source === filters.source)
    if (filters.status) out = out.filter((r) => r.status === filters.status)
    return sortRows(out, sortKey)
  }, [rows, filters, sortKey])

  return (
    <div>
      <Card className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl p-4">
        <FilterSelect
          label="評級"
          value={filters.rating}
          onChange={(v) => setFilters((f) => ({ ...f, rating: v }))}
          options={RATING_ORDER.map((r) => [r, `${r} ${RATING_META[r].label}`])}
        />
        <FilterSelect
          label="IP 錨點"
          value={filters.anchor}
          onChange={(v) => setFilters((f) => ({ ...f, anchor: v }))}
          options={anchorOptions}
        />
        <FilterSelect
          label="來源"
          value={filters.source}
          onChange={(v) => setFilters((f) => ({ ...f, source: v }))}
          options={sourceOptions}
        />
        <FilterSelect
          label="狀態"
          value={filters.status}
          onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
          options={Object.entries(STATUS_META).map(([k, m]) => [k, m.label])}
        />
        <div className="ml-auto">
          <FilterSelect
            label="排序"
            value={sortKey}
            onChange={setSortKey}
            options={Object.entries(SORTS).map(([k, m]) => [k, m.label])}
            allOption={false}
          />
        </div>
      </Card>

      {loading && <p className="py-20 text-center text-sm text-stone-400">載入中…</p>}
      {error && (
        <p className="py-20 text-center text-sm text-brick-600">讀取失敗：{error}</p>
      )}
      {!loading && !error && visible.length === 0 && (
        <p className="py-20 text-center text-sm text-stone-400">沒有符合條件的候選人。</p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {visible.map((c) => (
          <Link key={c.id} to={`/candidate/${c.id}`} className="group">
            <Card className="h-full p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-sage-300 group-hover:shadow-[0_4px_16px_rgba(60,50,35,0.08)]">
              <div className="mb-4 flex items-start gap-3.5">
                <Avatar
                  handle={c.handle_ig}
                  name={c.name}
                  portfolioUrl={getPortfolioUrl(c)}
                  mshotsWidth={120}
                  className="h-12 w-12 text-sm"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-display text-base font-semibold text-stone-900">
                    {c.name || c.handle_ig || '（未命名）'}
                  </h2>
                  <p className="truncate text-xs text-stone-400">
                    {c.handle_ig ? `@${String(c.handle_ig).replace(/^@/, '')}` : ''}
                    {c.country ? ` · ${c.country}` : ''}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-display text-2xl font-bold tabular-nums text-sage-700">
                    {c.composite_score ?? '–'}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-stone-400">
                    score
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <RatingBadge rating={c.rating} />
                <StatusChip status={c.status} />
                <AnchorBadge type={c.ip_anchor_type} />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
