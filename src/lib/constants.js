// 評級 badge：五種 rating 的顏色與中文標籤
export const RATING_META = {
  PRIORITY: { label: '優先接觸', badge: 'bg-emerald-100 text-emerald-800 ring-emerald-200' },
  QUALIFIED: { label: '合格', badge: 'bg-blue-100 text-blue-800 ring-blue-200' },
  WATCH: { label: '觀察', badge: 'bg-amber-100 text-amber-800 ring-amber-200' },
  PASS: { label: '暫不考慮', badge: 'bg-neutral-200 text-neutral-600 ring-neutral-300' },
  DISQUALIFIED: { label: '不符資格', badge: 'bg-red-100 text-red-700 ring-red-200' },
}

export const RATING_ORDER = ['PRIORITY', 'QUALIFIED', 'WATCH', 'PASS', 'DISQUALIFIED']

// 狀態：資料庫允許值 + 中文標籤（scoring 為評分中的暫時狀態）
export const STATUS_META = {
  scoring: { label: '評分中', dot: 'bg-violet-500', chip: 'bg-violet-50 text-violet-700' },
  pending_review: { label: '待審核', dot: 'bg-sky-500', chip: 'bg-sky-50 text-sky-700' },
  shortlisted: { label: '已入選', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700' },
  in_negotiation: { label: '洽談中', dot: 'bg-indigo-500', chip: 'bg-indigo-50 text-indigo-700' },
  contracted: { label: '已簽約', dot: 'bg-teal-600', chip: 'bg-teal-50 text-teal-700' },
  incubating: { label: '孵化中', dot: 'bg-cyan-500', chip: 'bg-cyan-50 text-cyan-700' },
  watching: { label: '持續觀察', dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700' },
  passed: { label: '已略過', dot: 'bg-neutral-400', chip: 'bg-neutral-100 text-neutral-500' },
  disqualified: { label: '不符資格', dot: 'bg-red-500', chip: 'bg-red-50 text-red-600' },
}

// 團隊決策可選的狀態（不含 scoring — 那是系統暫時狀態）
export const DECISION_STATUSES = [
  'pending_review',
  'shortlisted',
  'in_negotiation',
  'contracted',
  'incubating',
  'watching',
  'passed',
  'disqualified',
]

// 8 維度分數欄位與對應的 reasoning 附註欄位
export const DIMENSIONS = [
  { key: 'd1_style_fit', label: 'D1 風格契合度' },
  { key: 'd2_market_whitespace', label: 'D2 市場空白' },
  { key: 'd3_brand_extension', label: 'D3 品牌延展性', noteKey: 'd3_incubation_note', noteLabel: '孵化備註' },
  { key: 'd4_approachability', label: 'D4 可接觸性', noteKey: 'd4_batna_assessment', noteLabel: 'BATNA 評估' },
  { key: 'd5_audience', label: 'D5 受眾基礎' },
  { key: 'd6_rights', label: 'D6 權利清晰度' },
  { key: 'd7_production', label: 'D7 生產可行性', noteKey: 'd7_embroidery_notes', noteLabel: '刺繡工藝備註' },
  { key: 'd8_rough_diamond', label: 'D8 璞玉潛力' },
]
