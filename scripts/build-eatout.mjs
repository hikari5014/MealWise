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

const updatedAt = brands.map((b) => b.fetchedAt).filter(Boolean).sort().pop() ?? null
mkdirSync('public/eatout', { recursive: true })
writeFileSync('public/eatout/data.json', JSON.stringify({ version: 1, updatedAt, brands, items }))
console.log(`外食資料：${brands.length} 個品牌、${items.length} 個品項`)
