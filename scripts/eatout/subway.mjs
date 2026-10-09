// Subway 台灣：官網營養資訊頁 (Next.js RSC payload 內的 nutritionData)
const SOURCE = 'https://www.subway.com.tw/nutrition';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const CATS = {
  '6吋潛艇堡': { category: '潛艇堡', prefix: '6吋', serving: g => `6 吋（${g}g）` },
  '精選沙拉': { category: '沙拉', suffix: '（精選沙拉）', serving: g => `1 份（${g}g）` },
  '早餐': { category: '早餐', prefix: '早餐 6吋', serving: g => `6 吋（${g}g）` },
  '附餐': { category: '附餐', serving: g => `1 份（${g}g）` },
  '餅乾': { category: '點心', suffix: '餅乾', serving: g => `1 片（${g}g）` },
};

function slug(s) {
  return String(s).toLowerCase().replace(/™|®/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
const n = v => {
  const x = Number(v);
  return Number.isFinite(x) ? x : undefined;
};

export default async function fetchBrand() {
  const res = await fetch(SOURCE, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`subway: HTTP ${res.status}`);
  const html = await res.text();
  const parts = [...html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)].map(m => JSON.parse(m[1]));
  const s = parts.join('');
  const key = '"nutritionData":';
  const i = s.indexOf(key);
  if (i < 0) throw new Error('subway: nutritionData not found');
  // 找出對應的 JSON 陣列結尾
  let depth = 0, inStr = false, esc = false, j = i + key.length;
  const start = j;
  for (; j < s.length; j++) {
    const c = s[j];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') { depth--; if (depth === 0) { j++; break; } }
  }
  const data = JSON.parse(s.slice(start, j));
  const items = [];
  const seen = new Set();
  for (const cat of data) {
    const conf = CATS[cat.category];
    if (!conf) continue;
    const base = cat.category === '6吋潛艇堡' ? '' : cat.category === '精選沙拉' ? 'salad-' : cat.category === '早餐' ? 'breakfast-' : '';
    for (const it of cat.items || []) {
      let id = `subway-${base}${slug(it.engName || it.name).replace(/-salad$/, '')}`;
      while (seen.has(id)) id += '-2';
      seen.add(id);
      let name = it.name;
      if (conf.prefix) name = `${conf.prefix}${name}`;
      if (conf.suffix && !name.includes(conf.suffix)) name = `${name}${conf.suffix}`;
      const item = {
        id, name, category: conf.category, serving: conf.serving(it.serving),
        kcal: n(it.calories), protein: n(it.protein), carbs: n(it.carbs), fat: n(it.fat),
      };
      if (n(it.sugar) !== undefined) item.sugar = n(it.sugar);
      for (const k of ['kcal', 'protein', 'carbs', 'fat']) {
        if (typeof item[k] !== 'number') throw new Error(`subway: bad ${k} for ${it.name}`);
      }
      items.push(item);
    }
  }
  if (items.length < 10) throw new Error(`subway: only ${items.length} items parsed`);
  return {
    brand: { id: 'subway', name: 'Subway', kind: 'fastfood', site: 'https://www.subway.com.tw/' },
    source: SOURCE,
    fetchedAt: new Date().toISOString().slice(0, 10),
    items,
  };
}
