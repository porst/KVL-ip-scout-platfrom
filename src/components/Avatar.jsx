import { useState } from 'react'
import { cn } from '../lib/utils.js'

// IG 頭像：透過 unavatar.io 抓取；fallback=false 讓抓不到時回 404，
// 觸發 onError 改顯示姓名縮寫的預設圓形頭像。
export function Avatar({ handle, name, className }) {
  const [failed, setFailed] = useState(false)
  const cleanHandle = handle ? String(handle).replace(/^@/, '').trim() : ''

  const initials = (name || cleanHandle || '?')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (!cleanHandle || failed) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-sage-100 font-display font-semibold text-sage-700 ring-1 ring-sage-200',
          className
        )}
        aria-hidden="true"
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={`https://unavatar.io/instagram/${encodeURIComponent(cleanHandle)}?fallback=false`}
      alt={`@${cleanHandle} 頭像`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn('shrink-0 rounded-full bg-oat-200 object-cover ring-1 ring-oat-300', className)}
    />
  )
}
