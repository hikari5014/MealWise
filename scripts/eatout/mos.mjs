// 摩斯漢堡：官網「美味專區」各商品頁的「單份○○營養標示」表格
const BASE = 'https://www.mos.com.tw/menu/';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const PAGES = [
  ['set.aspx', '主餐'],
  ['breakfast.aspx', '早餐'],
  ['sideDishes.aspx', '副餐'],
  ['soup.aspx', '湯品'],
  ['dessert.aspx', '甜點'],
  ['beverage.aspx', '飲料'],
];

async function get(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (attempt === 2) throw new Error(`mos: ${url}: ${e.message}`);
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}

const strip = s => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const num = s => {
  const m = String(s).match(/-?\d+(?:\.\d+)?/);
  if (!m) return undefined;
  const x = Number(m[0]);
  return Math.round(x * 10) / 10;
};

function parseDetail(html) {
  const h = html.replace(/<!--[\s\S]*?-->/g, '');
  const m = h.match(/<div class="facts">\s*<h1>([\s\S]*?)<\/h1>\s*<table>([\s\S]*?)<\/table>/i);
  if (!m) return null;
  const title = strip(m[1]);
  const name = title.replace(/^單份/, '').replace(/營養標示$/, '').trim();
  const rows = {};
  for (const r of m[2].matchAll(/<tr>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>/gi)) {
    rows[strip(r[1]).replace(/\s|　/g, '')] = strip(r[2]);
  }
  return { name, rows };
}

export default async function fetchBrand() {
  const links = new Map();
  for (const [page, category] of PAGES) {
    const html = await get(BASE + page);
    for (const m of html.matchAll(/href="((?:set_detail|breakfast_detail|Detail)\.aspx\?id=(M\d+))"/g)) {
      if (!links.has(m[2])) links.set(m[2], { url: BASE + m[1], category });
    }
  }
  if (links.size < 10) throw new Error(`mos: only ${links.size} product links`);
  const entries = [...links.entries()];
  const items = [];
  const names = new Set();
  const CONC = 4;
  for (let i = 0; i < entries.length; i += CONC) {
    const batch = entries.slice(i, i + CONC);
    const results = await Promise.all(batch.map(async ([id, info]) => [id, info, await get(info.url).catch(() => null)]));
    for (const [id, info, html] of results) {
      if (!html) continue;
      const d = parseDetail(html);
      if (!d) continue;
      const r = d.rows;
      const item = {
        id: `mos-${id.toLowerCase()}`,
        name: d.name,
        category: info.category,
        serving: r['重量'] ? `1 份（${num(r['重量'])}g）` : '1 份',
        kcal: num(r['熱量']), protein: num(r['蛋白質']), carbs: num(r['碳水化合物']), fat: num(r['脂肪']),
      };
      if (r['糖'] !== undefined && num(r['糖']) !== undefined) item.sugar = num(r['糖']);
      if (r['膳食纖維'] !== undefined && num(r['膳食纖維']) !== undefined) item.fiber = num(r['膳食纖維']);
      if (r['鈉'] !== undefined && num(r['鈉']) !== undefined) item.sodium = num(r['鈉']);
      if (!['kcal', 'protein', 'carbs', 'fat'].every(k => typeof item[k] === 'number')) continue;
      if (names.has(item.name) || /_/.test(item.name)) continue;
      names.add(item.name);
      item.source = info.url;
      items.push(item);
    }
  }
  if (items.length < 10) throw new Error(`mos: only ${items.length} items parsed`);
  return {
    brand: { id: 'mos', name: '摩斯漢堡', kind: 'fastfood', site: 'https://www.mos.com.tw/' },
    source: BASE + 'set.aspx',
    fetchedAt: new Date().toISOString().slice(0, 10),
    items,
  };
}
