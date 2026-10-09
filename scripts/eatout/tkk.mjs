// 頂呱呱：官網「美味單品」列表與各商品頁的「營養成分」區塊
const BASE = 'https://www.tkkinc.com.tw/';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const SLUGS = {
  '原味炸雞': 'original-chicken', '辣味炸雞': 'spicy-chicken', '原味雞腿': 'original-drumstick',
  '辣味雞翅': 'spicy-wing', '雞脖子': 'chicken-neck', '呱呱雞柳條': 'chicken-strips',
  '呱呱雞排': 'chicken-cutlet', '呱呱雞脆骨': 'chicken-cartilage', '青花椒鹹酥雞': 'sichuan-popcorn-chicken',
  '呱呱啵啵球': 'bobo-balls', '波浪薯條': 'wavy-fries', '阿勇雞塊10入': 'nuggets-10', '呱呱包': 'gua-bao',
};

async function get(url) {
  let last;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      last = e;
      await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  throw new Error(`tkk: ${url}: ${last?.message}`);
}

const strip = s => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const num = s => {
  const m = String(s ?? '').match(/-?\d+(?:\.\d+)?/);
  return m ? Math.round(Number(m[0]) * 10) / 10 : undefined;
};

function servingOf(c) {
  const m = c.match(/(\d+)\s*(入|塊|支|份|個)/);
  if (m) return `${m[1]} ${m[2]}`;
  const paren = c.match(/[（(](.+)[)）]/);
  return paren ? `1 份（${paren[1]}）` : '1 份';
}

export default async function fetchBrand() {
  const list = await get(BASE + 'sideDish.html');
  // 列表頁沒列出、但仍在販售的單品（如呱呱包）
  const EXTRA = ['sideDishProduct_42_呱呱包.html'];
  const links = [...new Set([...[...list.matchAll(/href="(sideDishProduct_(\d+)_([^"]+)\.html)"/g)].map(m => m[1]), ...EXTRA])];
  if (links.length < 5) throw new Error(`tkk: only ${links.length} product links`);
  const items = [];
  for (const href of links) {
    const [, pid, rawName] = href.match(/sideDishProduct_(\d+)_([^"]+)\.html/);
    const url = BASE + encodeURI(decodeURIComponent(href));
    const html = await get(url);
    const sec = html.split('營養成分')[1];
    if (!sec) continue;
    const vals = {};
    for (const m of sec.slice(0, 6000).matchAll(/ingredient--title">([^<]+)<\/div>\s*<div class="quantity">([^<]*)<\/div>/g)) {
      vals[strip(m[1])] = m[2];
    }
    const name = decodeURIComponent(rawName);
    const text = strip(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ''));
    const contentM = text.match(/內容\s*(.+?)\s*[（(]本圖片/);
    const item = {
      id: `tkk-${SLUGS[name] || 'item-' + pid}`,
      name,
      category: /薯|球/.test(name) ? '點心' : name === '呱呱包' ? '漢堡' : '炸雞',
      serving: servingOf(contentM ? contentM[1].trim() : ''),
      kcal: num(vals['熱量']), protein: num(vals['蛋白質']), carbs: num(vals['碳水化合物']), fat: num(vals['脂肪']),
    };
    if (num(vals['糖']) !== undefined) item.sugar = num(vals['糖']);
    if (num(vals['鈉']) !== undefined) item.sodium = num(vals['鈉']);
    if (!['kcal', 'protein', 'carbs', 'fat'].every(k => typeof item[k] === 'number')) continue;
    item.source = url;
    items.push(item);
  }
  if (items.length < 5) throw new Error(`tkk: only ${items.length} items parsed`);
  return {
    brand: { id: 'tkk', name: '頂呱呱', kind: 'fastfood', site: 'https://www.tkkinc.com.tw/' },
    source: BASE + 'sideDish.html',
    fetchedAt: new Date().toISOString().slice(0, 10),
    items,
  };
}
