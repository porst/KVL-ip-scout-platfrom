import { RATING_META, STATUS_META, ANCHOR_META, ANCHOR_FALLBACK } from '../lib/constants.js'
import { Badge } from './ui/badge.jsx'
import { cn } from '../lib/utils.js'

export function RatingBadge({ rating, size = 'sm' }) {
  if (!rating) return null
  const meta = RATING_META[rating] || {
    label: rating,
    badge: 'bg-oat-200 text-stone-600 ring-oat-400',
  }
  return (
    <Badge className={cn(meta.badge, size === 'lg' && 'px-3 py-1 text-sm')}>
      <span className="font-semibold">{rating}</span>
      <span className="ml-1 font-normal opacity-70">{meta.label}</span>
    </Badge>
  )
}

export function AnchorBadge({ type }) {
  if (!type) return null
  const meta = ANCHOR_META[type] || ANCHOR_FALLBACK
  return (
    <Badge className={meta.badge}>
      {type}
      {meta.label && <span className="ml-1 opacity-70">{meta.label}</span>}
    </Badge>
  )
}

export function StatusChip({ status }) {
  if (!status) return null
  const meta = STATUS_META[status] || {
    label: status,
    dot: 'bg-stone-400',
    chip: 'bg-oat-200 text-stone-500',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.chip}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${meta.dot} ${
          status === 'scoring' ? 'animate-pulse' : ''
        }`}
      />
      {meta.label}
    </span>
  )
}

export function Tag({ children }) {
  return (
    <span className="inline-flex items-center rounded-md bg-oat-200 px-2 py-0.5 text-xs text-stone-600">
      {children}
    </span>
  )
}
