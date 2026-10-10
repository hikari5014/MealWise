// 衛福部食品藥物管理署「食品營養成分資料集」（政府開放資料，data.gov.tw dataset 8543）共用下載與解析。
// 數值全部直接取自資料集：有「每單位重」者用每單位含量，否則用每 100 克含量；
// 也可以在挑選清單第 4 欄指定一份幾克（例如吐司一片 45 g），用每 100 克含量換算。
import { inflateRawSync } from 'node:zlib';

export const DATA_URL = 'https://data.fda.gov.tw/data/opendata/export/20/csv';
export const DATASET_PAGE = 'https://data.gov.tw/dataset/8543';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';

const FIELDS = {
  kcal: ['熱量', '修正熱量'],
  protein: ['粗蛋白'],
  fat: ['粗脂肪'],
  carbs: ['總碳水化合物'],
  fiber: ['膳食纖維'],
  sugar: ['糖質總量'],
  sodium: ['鈉'],
};

function unzipFirst(buf) {
  // 找 End of Central Directory
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('FDA 下載不是有效的 ZIP');
  const cdOffset = buf.readUInt32LE(eocd + 16);
  if (buf.readUInt32LE(cdOffset) !== 0x02014b50) throw new Error('ZIP central directory 錯誤');
  const method = buf.readUInt16LE(cdOffset + 10);
  const compSize = buf.readUInt32LE(cdOffset + 20);
  const localOff = buf.readUInt32LE(cdOffset + 42);
  const nameLen = buf.readUInt16LE(localOff + 26);
  const extraLen = buf.readUInt16LE(localOff + 28);
  const start = localOff + 30 + nameLen + extraLen;
  const data = buf.subarray(start, start + compSize);
  if (method === 0) return data;
  if (method === 8) return inflateRawSync(data);
  throw new Error('不支援的 ZIP 壓縮方式 ' + method);
}

function* parseCsv(text) {
  let i = 0;
  const n = text.length;
  if (text.charCodeAt(0) === 0xfeff) i = 1;
  let row = [], field = '', inQ = false;
  while (i < n) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQ = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { inQ = true; i++; continue; }
    if (c === ',') { row.push(field); field = ''; i++; continue; }
    if (c === '\r') { i++; continue; }
    if (c === '\n') { row.push(field); yield row; row = []; field = ''; i++; continue; }
    field += c; i++;
  }
  if (field !== '' || row.length) { row.push(field); yield row; }
}

const num = (s) => {
  const t = String(s ?? '').trim();
  if (t === '') return null;
  const v = Number(t);
  return Number.isFinite(v) ? v : null;
};

let cached = null;
async function loadFoods() {
  if (cached) return cached;
  const res = await fetch(DATA_URL, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`FDA 開放資料下載失敗 HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const text = unzipFirst(buf).toString('utf8');
  const foods = new Map();
  let header = null;
  for (const row of parseCsv(text)) {
    if (!header) { header = row; continue; }
    const r = Object.fromEntries(header.map((h, j) => [h, row[j]]));
    const id = r['整合編號'];
    let f = foods.get(id);
    if (!f) {
      f = { name: r['樣品名稱'], unitw: r['每單位重'], n: {} };
      foods.set(id, f);
    }
    f.n[r['分析項']] = { per100: num(r['每100克含量']), perUnit: num(r['每單位重含量']) };
  }
  if (!header || !header.includes('整合編號') || !header.includes('每100克含量')) {
    throw new Error('FDA CSV 欄位格式改變');
  }
  cached = foods;
  return foods;
}

/**
 * picks：[整合編號, 類別, 顯示名稱?, 一份幾克?]
 * per100Only：每單位重不是「一份」的品項（整塊蛋糕、整片魚肉），固定用每 100 克
 */
export async function fetchTfnd(picks, { prefix, per100Only = [] }) {
  const foods = await loadFoods();
  const skip = new Set(per100Only);
  const items = [];
  const missing = [];
  for (const [code, category, display, grams] of picks) {
    const f = foods.get(code);
    if (!f) { missing.push(code); continue; }
    const w = num(String(f.unitw || '').replace('克', ''));
    // 資料集的「每單位重」有時是整顆水果、整隻雞或整個蛋糕；只在像一份的重量時採用
    const useUnit = !grams && w != null && w >= 10 && w <= 400 && !skip.has(code);
    const item = {
      id: `${prefix}-${code.toLowerCase()}`,
      name: display || f.name,
      category,
      serving: grams ? `1 份（${grams} g）` : useUnit ? `1 份（${w} g）` : '100 g',
    };
    let ok = true;
    for (const [key, names] of Object.entries(FIELDS)) {
      let v = null;
      for (const nm of names) {
        const e = f.n[nm];
        if (!e) continue;
        v = useUnit ? e.perUnit : e.per100 != null && grams ? Math.round(e.per100 * grams) / 100 : e.per100;
        if (v != null) break;
      }
      if (v == null) {
        if (['kcal', 'protein', 'carbs', 'fat'].includes(key)) ok = false;
        continue;
      }
      item[key] = v;
    }
    if (!ok) { missing.push(code); continue; }
    items.push(item);
  }
  if (items.length < picks.length * 0.8) {
    throw new Error(`FDA 資料可用品項太少（${items.length}/${picks.length}），缺：${missing.join(',')}`);
  }
  return items;
}
