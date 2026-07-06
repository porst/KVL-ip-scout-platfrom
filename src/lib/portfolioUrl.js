// 優先讀 candidates.links（加入表單「其他連結」寫入的欄位）；
// 其他欄位名稱是防呆備援。都沒有的話，退回從既有文字描述欄位
// 擷取第一個看起來像網址的字串。
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
