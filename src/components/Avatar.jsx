import { useEffect, useState } from 'react'
import { cn } from '../lib/utils.js'

function initialsOf(name, handle) {
  const base = (name || handle || '?').trim()
  return base
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function tierFor(portfolioUrl, handle) {
  if (portfolioUrl) return 'mshots'
  if (handle) return 'unavatar'
  return 'initials'
}

// 候選卡預覽圖抓取順序：
// 1. mShots 網站截圖（若有 portfolioUrl，免費、無需 API key）
// 2. unavatar.io 的 IG 頭像（免費版，抓不到就算了）
// 3. 姓名縮寫圓形頭像（保底）
// mShots 第一次請求可能回傳「still generating」暫時圖，這裡不特別偵測，
// 只用淡入動畫讓畫面自然一點；使用者重新整理頁面通常就會看到正確截圖。
export function Avatar({ handle, name, portfolioUrl, mshotsWidth = 160, className }) {
  const cleanHandle = handle ? String(handle).replace(/^@/, '').trim() : ''
  const [tier, setTier] = useState(() => tierFor(portfolioUrl, cleanHandle))
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setTier(tierFor(portfolioUrl, cleanHandle))
    setLoaded(false)
  }, [portfolioUrl, cleanHandle])

  if (tier === 'initials') {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-sage-100 font-display font-semibold text-sage-700 ring-1 ring-sage-200',
          className
        )}
        aria-hidden="true"
      >
        {initialsOf(name, cleanHandle)}
      </div>
    )
  }

  const src =
    tier === 'mshots'
      ? `https://s.wordpress.com/mshots/v1/${encodeURIComponent(portfolioUrl)}?w=${mshotsWidth}`
      : `https://unavatar.io/instagram/${encodeURIComponent(cleanHandle)}?fallback=false`

  return (
    <img
      key={tier}
      src={src}
      alt={name || (cleanHandle ? `@${cleanHandle}` : '候選人預覽圖')}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      onError={() => {
        setTier(tier === 'mshots' ? (cleanHandle ? 'unavatar' : 'initials') : 'initials')
        setLoaded(false)
      }}
      className={cn(
        'shrink-0 rounded-full bg-oat-200 object-cover ring-1 ring-oat-300 transition-opacity duration-500',
        loaded ? 'opacity-100' : 'opacity-0',
        className
      )}
    />
  )
}
