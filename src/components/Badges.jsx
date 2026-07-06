import { RATING_META, STATUS_META } from '../lib/constants.js'

export function RatingBadge({ rating, size = 'sm' }) {
  if (!rating) return null
  const meta = RATING_META[rating] || {
    label: rating,
    badge: 'bg-neutral-100 text-neutral-600 ring-neutral-200',
  }
  const sizeCls = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ring-1 ring-inset ${meta.badge} ${sizeCls}`}
    >
      {rating}
      <span className="ml-1 font-normal opacity-70">{meta.label}</span>
    </span>
  )
}

export function StatusChip({ status }) {
  if (!status) return null
  const meta = STATUS_META[status] || {
    label: status,
    dot: 'bg-neutral-400',
    chip: 'bg-neutral-100 text-neutral-500',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${meta.chip}`}
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
    <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
      {children}
    </span>
  )
}
