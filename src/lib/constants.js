// 配色原則：低飽和莫蘭迪色系，呼應 high-whitespace / cozy-healing 的美學方向。

// 評級 badge：五種 rating 的顏色與中文標籤
export const RATING_META = {
  PRIORITY: { label: '優先接觸', badge: 'bg-sage-100 text-sage-800 ring-sage-200' },
  QUALIFIED: { label: '合格', badge: 'bg-[#e2e9ef] text-[#40566b] ring-[#c9d6e2]' },
  WATCH: { label: '觀察', badge: 'bg-[#f2ead3] text-[#79662e] ring-[#e2d5ad]' },
  PASS: { label: '暫不考慮', badge: 'bg-oat-200 text-stone-500 ring-oat-400' },
  DISQUALIFIED: { label: '不符資格', badge: 'bg-brick-50 text-brick-700 ring-brick-100' },
}

export const RATING_ORDER = ['PRIORITY', 'QUALIFIED', 'WATCH', 'PASS', 'DISQUALIFIED']

// IP 錨點類型：莫蘭迪色 badge（候選牆與詳情頁共用）
export const ANCHOR_META = {
  character: { label: '角色 IP', badge: 'bg-[#e4e9ee] text-[#4a5b6b] ring-[#ccd6df]' }, // 藍灰
  style: { label: '風格 IP', badge: 'bg-[#e9e5ee] text-[#5d5468] ring-[#d6cede]' }, // 紫灰
  service: { label: '服務接案', badge: 'bg-[#ece7e1] text-[#6b6259] ring-[#dad2c8]' }, // 暖灰
  incubation: { label: '孵化潛力', badge: 'bg-[#f0e8d0] text-[#7a6a33] ring-[#e0d3a9]' }, // 芥末黃
}

export const ANCHOR_FALLBACK = { label: null, badge: 'bg-oat-200 text-stone-500 ring-oat-400' }

// 狀態：資料庫允許值 + 中文標籤（scoring 為評分中的暫時狀態）
export const STATUS_META = {
  scoring: { label: '評分中', dot: 'bg-clay-400', chip: 'bg-clay-50 text-clay-700' },
  pending_review: { label: '待審核', dot: 'bg-[#7d97ad]', chip: 'bg-[#eaeff4] text-[#4a5b6b]' },
  shortlisted: { label: '已入選', dot: 'bg-sage-500', chip: 'bg-sage-100 text-sage-800' },
  in_negotiation: { label: '洽談中', dot: 'bg-[#8b81a8]', chip: 'bg-[#edeaf3] text-[#5d5468]' },
  contracted: { label: '已簽約', dot: 'bg-sage-700', chip: 'bg-sage-100 text-sage-900' },
  incubating: { label: '孵化中', dot: 'bg-[#c2a94e]', chip: 'bg-[#f2ead3] text-[#79662e]' },
  watching: { label: '持續觀察', dot: 'bg-clay-500', chip: 'bg-clay-50 text-clay-700' },
  passed: { label: '已略過', dot: 'bg-stone-400', chip: 'bg-oat-200 text-stone-500' },
  disqualified: { label: '不符資格', dot: 'bg-brick-500', chip: 'bg-brick-50 text-brick-700' },
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
