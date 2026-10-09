// 每天由 GitHub Actions 執行：跑 scripts/eatout/*.mjs 重新抓各品牌最新資料。
// 抓失敗或資料量突然少很多，就保留舊檔，不讓一次失敗把資料洗掉。
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const today = new Date().toISOString().slice(0, 10)
const strip = (d) => JSON.stringify({ ...d, fetchedAt: undefined })
let changed = 0
for (const f of readdirSync('scripts/eatout').filter((f) => f.endsWith('.mjs'))) {
  const id = f.replace(/\.mjs$/, '')
  const out = `data/eatout/${id}.json`
  try {
    const mod = await import(pathToFileURL(`scripts/eatout/${f}`).href)
    const data = await Promise.race([mod.default(), new Promise((_, rej) => setTimeout(() => rej(new Error('逾時')), 120000))])
    if (!data?.items?.length) throw new Error('沒有資料')
    const old = existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : null
    if (old && data.items.length < old.items.length * 0.5) throw new Error(`品項從 ${old.items.length} 掉到 ${data.items.length}，先不更新`)
    data.fetchedAt = today
    if (old && strip(old) === strip(data)) {
      console.log(`${id}：沒有變動`)
      continue
    }
    writeFileSync(out, JSON.stringify(data, null, 2) + '\n')
    changed++
    console.log(`${id}：更新 ${data.items.length} 項`)
  } catch (e) {
    console.warn(`${id}：保留舊資料（${e.message}）`)
  }
}
console.log(`共更新 ${changed} 個品牌`)
