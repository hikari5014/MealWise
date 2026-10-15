// 把 data/eatout/*.json（每個品牌一個檔）合併成 public/eatout/data.json，給 app 下載
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'

const KINDS = ['fastfood', 'cafe', 'asian', 'drink', 'convenience', 'bakery', 'generic']
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v * 10) / 10 : undefined)

const brands = []
const items = []
const seen = new Set()
for (const f of readdirSync('data/eatout').filter((f) => f.endsWith('.json')).sort()) {
  let d
  try {
    d = JSON.parse(readFileSync(`data/eatout/${f}`, 'utf8'))
  } catch (e) {
    console.warn(`略過 ${f}：${e.message}`)
    continue
  }
  const b = d.brand
  if (!b?.id || !b?.name || !Array.isArray(d.items)) continue
  let count = 0
  for (const it of d.items) {
    const kcal = num(it.kcal), protein = num(it.protein), carbs = num(it.carbs), fat = num(it.fat)
    // 只公布熱量的來源（例如 7-11）允許沒有三大營養素
    const macros = [protein, carbs, fat].every((v) => v !== undefined)
    if (kcal === undefined || (!macros && !d.kcalOnly) || !it.name || !it.id || seen.has(it.id)) continue
    seen.add(it.id)
    const row = { id: it.id, b: b.id, n: String(it.name).trim(), k: kcal }
    if (macros) Object.assign(row, { p: protein, c: carbs, f: fat })
    else {
      row.ko = 1
      if (fat !== undefined) row.f = fat
    }
    if (it.category) row.cat = it.category
    if (it.serving) row.s = it.serving
    for (const [key, short] of [['fiber', 'fi'], ['sugar', 'su'], ['sodium', 'na']]) if (num(it[key]) !== undefined) row[short] = num(it[key])
    if (it.source && it.source !== d.source) row.src = it.source
    items.push(row)
    count++
  }
  if (count) brands.push({ id: b.id, name: b.name, kind: KINDS.includes(b.kind) ? b.kind : 'fastfood', site: b.site, source: d.source, fetchedAt: d.fetchedAt, count, ...(d.kcalOnly ? { kcalOnly: true } : {}) })
}

// 只公布熱量的品項：找名字相近、有完整營養標示的品項，照它們的熱量比例估算三大營養素（標 es）
const CAT_RATIO = {
  飯糰: [0.12, 0.6, 0.28], 麵包甜點: [0.08, 0.5, 0.42], 輕食小食: [0.2, 0.4, 0.4], 麵食: [0.15, 0.55, 0.3],
  霜淇淋: [0.07, 0.55, 0.38], 小食: [0.2, 0.35, 0.45], 鮮食: [0.2, 0.45, 0.35], 便當: [0.18, 0.52, 0.3],
  沙拉蔬食: [0.18, 0.4, 0.42], 焗烤: [0.16, 0.44, 0.4], 大亨堡: [0.15, 0.4, 0.45], 丼飯: [0.17, 0.55, 0.28],
  三明治漢堡: [0.17, 0.45, 0.38], 拌飯拌麵: [0.13, 0.57, 0.3], 小吃: [0.15, 0.45, 0.4], 水果: [0.04, 0.92, 0.04],
}
const bigrams = (s) => {
  const t = s.replace(/[（(][^）)]*[）)]|[\s\d.・\-/,，A-Za-z]+/g, '')
  const out = new Set()
  for (let i = 0; i < t.length - 1; i++) out.add(t.slice(i, i + 2))
  return out
}
const refs = items.filter((x) => !x.ko && x.k >= 40).map((x) => ({ x, g: bigrams(x.n), r: [(x.p * 4) / x.k, (x.c * 4) / x.k, (x.f * 9) / x.k] }))
let estimated = 0
for (const it of items) {
  if (!it.ko) continue
  const g = bigrams(it.n)
  const near = refs
    .map((ref) => {
      let hit = 0
      for (const b of g) if (ref.g.has(b)) hit++
      return { ref, s: hit / Math.max(1, Math.min(g.size, ref.g.size)) }
    })
    .filter((m) => m.s >= 0.34)
    .sort((a, b) => b.s - a.s)
    .slice(0, 6)
  const base = CAT_RATIO[it.cat] ?? [0.15, 0.5, 0.35]
  const ratio = near.length
    ? base.map((v, i) => 0.3 * v + 0.7 * (near.reduce((t, m) => t + Math.min(m.ref.r[i], 1), 0) / near.length))
    : base
  const sum = ratio[0] + ratio[1] + ratio[2]
  const [rp, rc, rf] = ratio.map((v) => v / sum)
  let fat = it.f
  if (fat === undefined) fat = (it.k * rf) / 9
  const rest = Math.max(0, it.k - fat * 9)
  it.p = num((rest * (rp / (rp + rc))) / 4)
  it.c = num((rest * (rc / (rp + rc))) / 4)
  it.f = num(fat)
  it.es = 1
  estimated++
}
if (estimated) console.log(`只公布熱量的 ${estimated} 項已估算三大營養素`)

const updatedAt = brands.map((b) => b.fetchedAt).filter(Boolean).sort().pop() ?? null
mkdirSync('public/eatout', { recursive: true })
writeFileSync('public/eatout/data.json', JSON.stringify({ version: 1, updatedAt, brands, items }))
console.log(`外食資料：${brands.length} 個品牌、${items.length} 個品項`)
