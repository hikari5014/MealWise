// 全家便利商店「全家食在購安心」官方食安查詢站的營養標示（每份）。
// 站上 SPA 呼叫的 JSON API：
//   POST /Web_FFD_2022/ws/QueryFsProductListByFilter  {KEYWORD, MEMBER} → 依分類列出商品
//   POST /Web_FFD_2022/ws/QueryFsProductByItem        {CMNO}            → 單品營養標示
// 只抓鮮食 / 即食分類（飯糰、主餐麵食、三明治、沙拉、小菜滷味湯品、蒸箱、燒烤、鍋物、蛋品），
// 加上現做飲料，另外從乳製品、一般飲料挑優格／優酪乳／豆漿／無糖茶。Node 22 ESM，只用全域 fetch。

const SITE = 'https://foodsafety.family.com.tw/Web_FFD_2022/';
const API = 'https://foodsafety.family.com.tw/Web_FFD_2022/ws/';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';

// CATEGORY_ID → 我們的中文分類
const CATEGORIES = {
  1: '飯糰壽司',
  2: '便當麵食',
  3: '三明治漢堡',
  4: '沙拉蔬果',
  5: '小菜滷味湯品',
  10: '蒸箱食品',
  11: '燒烤熱食',
  12: '關東煮鍋物',
  13: '蛋品',
  8: '現做飲料',
};
// 乳製品(16)、一般飲料(17) 只挑這些關鍵字
const PICKY = {
  16: [/優格|優酪|豆漿|豆奶/, '優格豆漿'],
  17: [/無糖|無加糖|豆漿|豆奶/, '無糖茶豆漿'],
};

async function post(path, body, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(API + path, {
        method: 'POST',
        headers: {
          'User-Agent': UA,
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
          Referer: SITE,
          Origin: 'https://foodsafety.family.com.tw',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.RESULT_CODE !== '00') throw new Error(`RESULT_CODE ${data.RESULT_CODE} ${data.RESULT_DESC}`);
      return data;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw new Error(`全家 API ${path} 失敗：${lastErr?.message}`);
}

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : null);

function parseNote(note) {
  const s = String(note || '');
  const kcal = s.match(/熱量\s*([\d.]+)\s*大卡/);
  const size = s.match(/每份規格\s*([\d.]+)\s*(公克|毫升|克|g|ml|mL)/);
  const pieces = s.match(/本包裝含\s*([\d.]+)\s*份/);
  return {
    kcal: kcal ? Number(kcal[1]) : null,
    size: size ? Number(size[1]) : null,
    unit: size ? (/毫升|ml/i.test(size[2]) ? 'ml' : 'g') : null,
    pieces: pieces ? Number(pieces[1]) : null,
  };
}

async function mapLimit(list, limit, fn) {
  const out = new Array(list.length);
  let next = 0;
  async function worker() {
    while (next < list.length) {
      const i = next++;
      out[i] = await fn(list[i], i);
      await new Promise((r) => setTimeout(r, 150));
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return out;
}

export default async function fetchBrand() {
  const listing = await post('QueryFsProductListByFilter', { KEYWORD: '', MEMBER: 'N' });
  const wanted = [];
  for (const cat of listing.LIST || []) {
    const cid = Number(cat.CATEGORY_ID);
    for (const it of cat.ITEM || []) {
      if (CATEGORIES[cid]) wanted.push({ cmno: it.CMNO, category: CATEGORIES[cid] });
      else if (PICKY[cid] && PICKY[cid][0].test(it.PRODNAME || '')) wanted.push({ cmno: it.CMNO, category: PICKY[cid][1] });
    }
  }
  if (wanted.length < 50) throw new Error(`全家商品清單異常（只有 ${wanted.length} 項）`);

  let failed = 0;
  const details = await mapLimit(wanted, 4, async (w) => {
    try {
      const d = await post('QueryFsProductByItem', { CMNO: w.cmno, MEMBER: 'N' });
      const rec = (d.LIST || []).find((x) => x.NUTRIENTS && x.NUTRIENTS[0]);
      return rec ? { ...w, rec } : null;
    } catch {
      failed++;
      return null;
    }
  });
  if (failed > wanted.length * 0.2) throw new Error(`全家單品查詢失敗太多（${failed}/${wanted.length}）`);

  const items = [];
  const seen = new Set();
  for (const d of details) {
    if (!d) continue;
    const { rec } = d;
    const n = rec.NUTRIENTS[0];
    const note = parseNote(rec.NOTE);
    const protein = num(n.PROTEIN), fat = num(n.TOTALFAT), carbs = num(n.CARBOHYDRATE);
    if (note.kcal == null || protein == null || fat == null || carbs == null) continue;
    // 現做飲料常只填熱量與糖、其餘填 0；這類或明顯打錯（如脂肪 230 g）的資料不收
    const sugar0 = num(n.SUGAR);
    if (note.kcal > 0 && protein + carbs + fat === 0) continue;
    if (sugar0 != null && sugar0 > carbs + 0.5) continue;
    if (4 * protein + 4 * carbs + 9 * fat > 2 * note.kcal + 50) continue;
    const id = `family-${rec.CMNO}`;
    if (seen.has(id)) continue;
    seen.add(id);
    let serving = '1 份';
    if (note.size != null) serving = `1 份（${note.size} ${note.unit}）`;
    if (note.pieces != null && note.pieces !== 1) serving += `，每包裝 ${note.pieces} 份`;
    const item = {
      id,
      name: String(rec.PRODNAME || '').trim(),
      category: d.category,
      serving,
      kcal: note.kcal,
      protein,
      carbs,
      fat,
    };
    const sugar = num(n.SUGAR), sodium = num(n.SODIUM);
    if (sugar != null) item.sugar = sugar;
    if (sodium != null) item.sodium = sodium;
    items.push(item);
  }
  if (items.length < 50) throw new Error(`全家可用品項太少（${items.length}）`);

  return {
    brand: { id: 'family', name: '全家便利商店', kind: 'convenience', site: 'https://www.family.com.tw/' },
    source: SITE,
    fetchedAt: new Date().toISOString().slice(0, 10),
    items,
  };
}
