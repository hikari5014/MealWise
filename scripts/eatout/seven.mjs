// 7-ELEVEN 鮮食：官網鮮食頁使用的 XML（只公布熱量，部分品項有脂肪、鈉）
const BASE = 'https://www.7-11.com.tw/freshfoods/read_food_xml.aspx?='
const PAGE = 'https://www.7-11.com.tw/freshfoods/'

const CATS = [
  [/飯糰|手卷|飯卷/, '飯糰'], [/便當|餐盒|盒餐/, '便當'], [/丼/, '丼飯'], [/三明治|吐司|漢堡|堡/, '三明治漢堡'],
  [/熱狗|香腸|大亨堡/, '大亨堡'], [/沙拉|蔬/, '沙拉蔬食'], [/麵|粉|意麵|義大利/, '麵食'], [/焗|烤/, '焗烤'],
  [/麵包|軟法|吐司|可頌|貝果|蛋糕|甜點|布丁|泡芙/, '麵包甜點'], [/霜淇淋|冰/, '霜淇淋'], [/雞胸|雞腿|蛋|地瓜|玉米|筍/, '輕食小食'],
]
const BY_PAGE = { 0: '飯糰', 1: '水果', 3: '小食', 4: '便當', 5: '麵食', 6: '輕食小食', 7: '大亨堡', 10: '麵包甜點', 12: '小吃', 13: '麵食', 14: '便當', 15: '三明治漢堡', 16: '焗烤', 17: '拌飯拌麵', 19: '輕食小食', 21: '霜淇淋', 22: '丼飯', 23: '大亨堡' }
const pick = (block, tag) => (block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`)) ?? [])[1]?.trim() ?? ''
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
const firstNum = (s) => {
  const m = s.replace(/,/g, '').match(/\d+(\.\d+)?/)
  return m ? Number(m[0]) : undefined
}

export default async function fetchBrand() {
  const items = []
  const seen = new Set()
  for (let n = 0; n <= 23; n++) {
    const res = await fetch(BASE + n, { headers: { 'User-Agent': 'Mozilla/5.0 (MealWise data updater)' } })
    if (!res.ok) continue
    const xml = await res.text()
    for (const block of xml.split('<Item').slice(1)) {
      const name = decode(pick(block, 'name'))
      const kcal = firstNum(pick(block, 'kcal'))
      if (!name || !kcal || kcal > 2500 || seen.has(name)) continue
      seen.add(name)
      const img = pick(block, 'image').replace(/^images\//, '').replace(/\.\w+$/, '')
      const item = {
        id: `seven-${n}-${img || items.length}`.replace(/[^a-zA-Z0-9-]/g, '_'),
        name,
        category: CATS.find(([re]) => re.test(name))?.[1] ?? BY_PAGE[n] ?? '鮮食',
        serving: '1 份',
        kcal,
      }
      const fat = firstNum(pick(block, 'fat'))
      const sodium = firstNum(pick(block, 'sodium'))
      if (fat !== undefined) item.fat = fat
      if (sodium !== undefined) item.sodium = sodium
      items.push(item)
    }
  }
  if (items.length < 100) throw new Error(`只抓到 ${items.length} 項`)
  return {
    brand: { id: 'seven', name: '7-ELEVEN', kind: 'convenience', site: 'https://www.7-11.com.tw/' },
    source: PAGE,
    kcalOnly: true,
    fetchedAt: new Date().toISOString().slice(0, 10),
    items,
  }
}
