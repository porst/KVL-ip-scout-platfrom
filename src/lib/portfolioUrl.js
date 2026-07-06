// candidates 表目前沒有專屬的「連結」欄位，這裡採盡力而為策略：
// 先看是否有明確的連結型欄位（未來若加了 links/website 等欄位可直接被讀到），
// 否則從既有的文字描述欄位裡擷取第一個看起來像網址的字串。
const URL_FIELD_CANDIDATES = ['links', 'portfolio_url', 'website', 'other_links', 'link']
const TEXT_FIELD_CANDIDATES = [
  'sample_work_description',
  'existing_licenses',
  'matched_vectors',
  'team_brief',
]
const URL_RE = /https?:\/\/[^\s,;"'<>()]+/i

export function getPortfolioUrl(candidate) {
  if (!candidate) return null
  for (const field of URL_FIELD_CANDIDATES) {
    const v = candidate[field]
    if (typeof v === 'string') {
      const match = v.match(URL_RE)
      if (match) return match[0]
    }
  }
  for (const field of TEXT_FIELD_CANDIDATES) {
    const v = candidate[field]
    if (typeof v === 'string') {
      const match = v.match(URL_RE)
      if (match) return match[0]
    }
  }
  return null
}
