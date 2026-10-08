import type { IconName } from '../lib/icons'
import type { Ingredient, MealSlot, Nutrition, Recipe, Section } from '../types'
import type { Cuisine, Kind } from './cuisine'
import type { FoodImage } from './foodImages'

/**
 * 料理組合器：挑食材 + 烹調方式 → 自動產生食譜與營養。
 * 營養是每 `base` 份量的估計值（生重；飯麵為熟重），參考衛福部食品營養成分資料庫的常見數值四捨五入。
 */
export type Part = 'protein' | 'veg' | 'carb' | 'fat' | 'flavor'

export interface Comp {
  id: string
  name: string
  /** 放在菜名裡的短名 */
  short: string
  part: Part
  image: FoodImage
  section: Section
  unit: string
  /** 營養以多少 unit 為基準 */
  base: number
  /** 預設份量與每次加減 */
  qty: number
  step: number
  n: [kcal: number, protein: number, carbs: number, fat: number, fiber: number]
  meat?: boolean
  /** 調味：菜名前綴、偏向的國家料理 */
  prefix?: string
  cuisine?: Cuisine
  /** 切法／前處理 */
  cut?: string
  /** 熟度提醒 */
  done?: string
}

const c = (
  id: string,
  name: string,
  part: Part,
  image: FoodImage,
  section: Section,
  unit: string,
  base: number,
  qty: number,
  step: number,
  n: Comp['n'],
  extra: Partial<Comp> = {},
): Comp => ({ id, name, short: name, part, image, section, unit, base, qty, step, n, ...extra })

export const COMPONENTS: Comp[] = [
  // 蛋白質
  c('chicken-breast', '雞胸肉', 'protein', 'poultry', 'protein', 'g', 100, 150, 25, [117, 23, 0, 2, 0], { short: '雞胸', meat: true, cut: '切成約 1.5 公分厚的片', done: '中心不再粉紅、切開流出清澈肉汁' }),
  c('chicken-thigh', '去皮雞腿肉', 'protein', 'poultry', 'protein', 'g', 100, 150, 25, [125, 19, 0, 5, 0], { short: '雞腿', meat: true, cut: '切成一口大小', done: '中心不再粉紅' }),
  c('pork-loin', '豬里肌', 'protein', 'pig', 'protein', 'g', 100, 120, 20, [140, 21, 0, 6, 0], { short: '豬里肌', meat: true, cut: '切薄片，用刀背拍鬆', done: '表面全變白、中心微粉即可' }),
  c('beef-lean', '瘦牛肉片', 'protein', 'meat', 'protein', 'g', 100, 120, 20, [150, 21, 0, 7, 0], { short: '牛肉', meat: true, cut: '逆紋切片', done: '變色就起鍋，才不會老' }),
  c('salmon', '鮭魚', 'protein', 'fish', 'protein', 'g', 100, 120, 20, [200, 20, 0, 13, 0], { short: '鮭魚', meat: true, cut: '擦乾表面水分', done: '中間由透明轉成不透明' }),
  c('white-fish', '鯛魚片', 'protein', 'tropical-fish', 'protein', 'g', 100, 150, 25, [100, 20, 0, 2, 0], { short: '鯛魚', meat: true, cut: '切成大塊、擦乾', done: '魚肉一壓就散開' }),
  c('mackerel', '鯖魚', 'protein', 'fish', 'protein', 'g', 100, 100, 20, [205, 19, 0, 14, 0], { short: '鯖魚', meat: true, cut: '擦乾，皮面劃兩刀', done: '皮面金黃、肉不透明' }),
  c('shrimp', '蝦仁', 'protein', 'shrimp', 'protein', 'g', 100, 120, 20, [90, 20, 0, 1, 0], { short: '蝦仁', meat: true, cut: '去腸泥，用一點太白粉抓洗後擦乾', done: '捲起變紅就熟' }),
  c('squid', '花枝', 'protein', 'squid', 'protein', 'g', 100, 120, 20, [75, 15, 1, 1, 0], { short: '花枝', meat: true, cut: '切圈或切花', done: '捲起變白就起鍋，煮太久會硬' }),
  c('egg', '雞蛋', 'protein', 'egg', 'dairyEgg', '顆', 1, 2, 1, [75, 7, 0.5, 5, 0], { short: '蛋', cut: '打散，加一小撮鹽' }),
  c('tofu', '板豆腐', 'protein', 'beans', 'protein', 'g', 100, 150, 50, [88, 8.5, 2, 5, 0.6], { short: '豆腐', cut: '切塊，用廚房紙巾壓乾水分' }),
  c('edamame', '毛豆仁', 'protein', 'pea-pod', 'produce', 'g', 100, 80, 20, [125, 13, 9, 5, 6], { short: '毛豆', cut: '洗淨瀝乾' }),
  c('tempeh', '天貝', 'protein', 'beans', 'protein', 'g', 100, 100, 25, [192, 20, 8, 11, 5], { short: '天貝', cut: '切片' }),

  // 蔬菜
  c('broccoli', '青花菜', 'veg', 'broccoli', 'produce', 'g', 100, 100, 50, [30, 3, 5, 0.3, 3], { cut: '切小朵，莖削皮切片' }),
  c('cabbage', '高麗菜', 'veg', 'leafy-green', 'produce', 'g', 100, 120, 40, [23, 1.3, 5, 0.1, 1.3], { cut: '剝片撕小塊' }),
  c('spinach', '菠菜', 'veg', 'leafy-green', 'produce', 'g', 100, 100, 50, [20, 2.5, 3, 0.3, 2.4], { cut: '切段，根部洗淨' }),
  c('bokchoy', '小白菜', 'veg', 'leafy-green', 'produce', 'g', 100, 100, 50, [13, 1.4, 2, 0.2, 1.6], { cut: '切段' }),
  c('sweet-potato-leaves', '地瓜葉', 'veg', 'leafy-green', 'produce', 'g', 100, 100, 50, [30, 3, 4, 0.5, 3], { cut: '摘嫩葉' }),
  c('mushroom', '綜合菇', 'veg', 'mushroom', 'produce', 'g', 100, 80, 20, [30, 2.5, 6, 0.3, 2.5], { short: '菇', cut: '剝小朵，不用水洗、擦乾淨即可' }),
  c('onion', '洋蔥', 'veg', 'onion', 'produce', 'g', 100, 50, 25, [40, 1, 9, 0.1, 1.5], { cut: '切絲' }),
  c('bell-pepper', '甜椒', 'veg', 'bell-pepper', 'produce', 'g', 100, 60, 20, [30, 1, 6, 0.2, 1.8], { cut: '去籽切條' }),
  c('tomato', '番茄', 'veg', 'tomato', 'produce', 'g', 100, 100, 50, [20, 0.9, 4, 0.2, 1.2], { cut: '切塊' }),
  c('zucchini', '櫛瓜', 'veg', 'cucumber', 'produce', 'g', 100, 100, 50, [17, 1.2, 3, 0.3, 1], { cut: '切半月片' }),
  c('carrot', '紅蘿蔔', 'veg', 'carrot', 'produce', 'g', 100, 40, 20, [38, 1, 9, 0.2, 2.6], { cut: '切絲或薄片' }),
  c('cucumber', '小黃瓜', 'veg', 'cucumber', 'produce', 'g', 100, 80, 40, [13, 0.8, 3, 0.1, 1], { cut: '拍裂切段' }),
  c('eggplant', '茄子', 'veg', 'eggplant', 'produce', 'g', 100, 100, 50, [25, 1, 6, 0.2, 3], { cut: '切滾刀塊，泡鹽水防變色' }),
  c('asparagus', '蘆筍', 'veg', 'herb', 'produce', 'g', 100, 80, 40, [22, 2.2, 4, 0.2, 2], { cut: '削掉老皮切段' }),
  c('cauli-rice', '花椰菜米', 'veg', 'broccoli', 'produce', 'g', 100, 120, 40, [25, 2, 5, 0.3, 2], { cut: '花椰菜切碎成米粒大小（或買現成）' }),

  // 主食
  c('white-rice', '白飯', 'carb', 'rice', 'grain', 'g', 100, 150, 50, [183, 3.1, 41, 0.3, 0.6], { short: '飯' }),
  c('brown-rice', '糙米飯', 'carb', 'rice', 'grain', 'g', 100, 150, 50, [165, 3.5, 35, 1.2, 1.8], { short: '飯' }),
  c('sweet-potato', '地瓜', 'carb', 'sweet-potato', 'produce', 'g', 100, 150, 50, [115, 1.2, 27, 0.2, 2.5], { cut: '切塊，電鍋蒸 25 分鐘（外鍋 1 杯水）' }),
  c('pumpkin', '南瓜', 'carb', 'sweet-potato', 'produce', 'g', 100, 150, 50, [70, 2, 15, 0.2, 2], { cut: '切塊，電鍋蒸 15 分鐘' }),
  c('potato', '馬鈴薯', 'carb', 'potato', 'produce', 'g', 100, 150, 50, [77, 2, 17, 0.1, 1.5], { cut: '切塊，電鍋蒸 20 分鐘' }),
  c('quinoa', '藜麥飯', 'carb', 'grain', 'grain', 'g', 100, 120, 40, [120, 4.4, 21, 1.9, 2.8], { short: '藜麥' }),
  c('ww-pasta', '全麥義大利麵（熟）', 'carb', 'spaghetti', 'grain', 'g', 100, 150, 50, [150, 5.5, 30, 1, 3.5], { short: '全麥麵' }),
  c('soba', '蕎麥麵（熟）', 'carb', 'noodle-bowl', 'grain', 'g', 100, 150, 50, [115, 5, 24, 0.5, 2], { short: '蕎麥麵' }),

  // 好油脂
  c('olive-oil', '橄欖油', 'fat', 'droplet', 'pantry', '大匙', 1, 0.5, 0.5, [115, 0, 0, 13, 0]),
  c('camellia-oil', '苦茶油', 'fat', 'droplet', 'pantry', '大匙', 1, 0.5, 0.5, [115, 0, 0, 13, 0], { cuisine: 'tw' }),
  c('avocado', '酪梨', 'fat', 'avocado', 'produce', 'g', 100, 50, 25, [160, 2, 9, 15, 6.7]),
  c('nuts', '綜合堅果', 'fat', 'peanuts', 'pantry', 'g', 100, 15, 5, [600, 20, 20, 50, 8], { short: '堅果' }),
  c('sesame', '白芝麻', 'fat', 'grain', 'pantry', '大匙', 1, 1, 1, [52, 1.6, 2, 4.5, 1], { short: '芝麻' }),

  // 調味
  c('garlic', '蒜頭', 'flavor', 'garlic', 'produce', '瓣', 1, 3, 1, [4, 0.2, 1, 0, 0], { prefix: '蒜香', cuisine: 'tw' }),
  c('ginger', '薑絲', 'flavor', 'ginger', 'produce', 'g', 10, 10, 5, [2, 0, 0.5, 0, 0.2], { prefix: '薑絲', cuisine: 'tw' }),
  c('basil', '九層塔', 'flavor', 'herb', 'produce', 'g', 10, 10, 5, [2, 0.3, 0.3, 0, 0.3], { prefix: '塔香', cuisine: 'tw' }),
  c('soy', '醬油', 'flavor', 'jar', 'pantry', '大匙', 1, 1, 0.5, [10, 1, 1, 0, 0], { prefix: '醬燒', cuisine: 'tw' }),
  c('satay', '沙茶醬', 'flavor', 'jar', 'pantry', '大匙', 1, 1, 0.5, [80, 1, 1, 7.5, 0], { prefix: '沙茶', cuisine: 'tw' }),
  c('miso', '味噌', 'flavor', 'jar', 'pantry', '大匙', 1, 1, 0.5, [35, 2, 4, 1, 1], { prefix: '味噌', cuisine: 'jp' }),
  c('shio-koji', '鹽麴', 'flavor', 'jar', 'pantry', '大匙', 1, 1, 0.5, [15, 0.5, 3, 0, 0], { prefix: '鹽麴', cuisine: 'jp' }),
  c('kimchi', '韓式泡菜', 'flavor', 'leafy-green', 'produce', 'g', 100, 60, 20, [25, 1.5, 4, 0.5, 2], { prefix: '泡菜', cuisine: 'kr' }),
  c('gochujang', '韓式辣醬', 'flavor', 'hot-pepper', 'pantry', '大匙', 1, 1, 0.5, [35, 1, 7, 0.3, 0.5], { prefix: '韓式辣', cuisine: 'kr' }),
  c('curry', '咖哩粉', 'flavor', 'curry', 'pantry', '小匙', 1, 1, 1, [7, 0.3, 1.2, 0.3, 0.6], { prefix: '咖哩', cuisine: 'sea' }),
  c('lemon', '檸檬', 'flavor', 'lemon', 'produce', '顆', 1, 0.5, 0.5, [15, 0.5, 5, 0, 1.5], { prefix: '檸檬', cuisine: 'west' }),
  c('pepper', '黑胡椒鹽', 'flavor', 'salt', 'pantry', '小匙', 1, 1, 1, [3, 0.1, 0.6, 0, 0.3], { prefix: '黑胡椒', cuisine: 'west' }),
  c('herbs', '義式香草', 'flavor', 'herb', 'pantry', '小匙', 1, 1, 1, [3, 0.1, 0.6, 0, 0.4], { prefix: '香草', cuisine: 'med' }),
]

export const COMP_MAP: Record<string, Comp> = Object.fromEntries(COMPONENTS.map((x) => [x.id, x]))

export const PART_LABEL: Record<Part, { label: string; hint: string; max: number }> = {
  protein: { label: '蛋白質', hint: '選 1–2 樣', max: 2 },
  veg: { label: '蔬菜', hint: '選 1–3 樣', max: 3 },
  carb: { label: '主食', hint: '可不選＝低碳', max: 1 },
  fat: { label: '好油脂', hint: '可不選', max: 2 },
  flavor: { label: '調味', hint: '決定是哪國口味', max: 3 },
}

export type Method = 'pan' | 'stir' | 'oven' | 'steam' | 'soup' | 'cold' | 'air'

export const METHODS: { id: Method; label: string; verb: string; icon: IconName; oil: number; minutes: number }[] = [
  { id: 'pan', label: '煎', verb: '煎', icon: 'skillet', oil: 0.5, minutes: 15 },
  { id: 'stir', label: '炒', verb: '炒', icon: 'skillet', oil: 1, minutes: 15 },
  { id: 'oven', label: '烤箱', verb: '烤', icon: 'local_fire_department', oil: 0.5, minutes: 25 },
  { id: 'air', label: '氣炸', verb: '氣炸', icon: 'local_fire_department', oil: 0.25, minutes: 20 },
  { id: 'steam', label: '蒸', verb: '蒸', icon: 'water_drop', oil: 0, minutes: 20 },
  { id: 'soup', label: '煮湯', verb: '湯', icon: 'ramen_dining', oil: 0, minutes: 30 },
  { id: 'cold', label: '涼拌', verb: '涼拌', icon: 'eco', oil: 0.5, minutes: 15 },
]

export interface Combo {
  /** 食材 id → 份量 */
  items: Record<string, number>
  method: Method
}

const join = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join('、')}和${xs[xs.length - 1]}`)
const round = (x: number, d = 0) => Math.round(x * 10 ** d) / 10 ** d

export function comboParts(combo: Combo) {
  const list = Object.entries(combo.items)
    .map(([id, qty]) => ({ comp: COMP_MAP[id], qty }))
    .filter((x) => x.comp && x.qty > 0)
  const of = (p: Part) => list.filter((x) => x.comp.part === p)
  return { list, protein: of('protein'), veg: of('veg'), carb: of('carb'), fat: of('fat'), flavor: of('flavor') }
}

export function comboNutrition(combo: Combo): Nutrition {
  const t = [0, 0, 0, 0, 0]
  for (const { comp, qty } of comboParts(combo).list) comp.n.forEach((v, i) => (t[i] += (v * qty) / comp.base))
  return { kcal: round(t[0]), protein: round(t[1]), carbs: round(t[2]), fat: round(t[3]), fiber: round(t[4], 1) }
}

/** 自動取名：蒜香煎雞胸佐青花菜、味噌烤鮭魚、薑絲鯛魚菠菜湯… */
export function comboName(combo: Combo) {
  const { protein, veg, carb, flavor } = comboParts(combo)
  const m = METHODS.find((x) => x.id === combo.method)!
  const prefix = flavor.find((f) => f.comp.prefix)?.comp.prefix ?? ''
  const p = protein.map((x) => x.comp.short).join('')
  const v = veg.slice(0, 2).map((x) => x.comp.short)
  if (!p && !v.length) return '我的組合料理'
  let name: string
  if (combo.method === 'soup') name = `${prefix}${p}${v.join('')}湯`
  else if (combo.method === 'stir') name = `${prefix}${v[0] ?? ''}炒${p || v[1] || ''}`
  else if (combo.method === 'cold') name = `${prefix}涼拌${p}${v.length && p ? '佐' : ''}${v.join('')}`
  else name = `${prefix}${m.verb}${p || v.join('')}${p && v.length ? `佐${v.join('')}` : ''}`
  const noodle = carb.find((x) => /麵/.test(x.comp.short))
  if (noodle && combo.method !== 'soup') name = `${prefix}${p}${v[0] ?? ''}${noodle.comp.short}`
  return name
}

/** 產生做法 */
export function comboSteps(combo: Combo): string[] {
  const { protein, veg, carb, fat, flavor } = comboParts(combo)
  const oil = fat.find((f) => f.comp.unit === '大匙' && f.comp.id !== 'sesame')
  const oilName = oil ? `${oil.comp.name} ${oil.qty} 大匙` : '少許油'
  const P = join(protein.map((x) => x.comp.name))
  const V = join(veg.map((x) => x.comp.name))
  const aroma = flavor.filter((f) => ['garlic', 'ginger', 'basil'].includes(f.comp.id))
  const sauce = flavor.filter((f) => !['garlic', 'ginger', 'basil'].includes(f.comp.id))
  const S = sauce.length ? join(sauce.map((x) => x.comp.name)) : '鹽'
  const marinade = sauce.filter((x) => !['kimchi', 'lemon'].includes(x.comp.id))
  const M = marinade.length ? marinade[0].comp.name : '鹽'
  const A = aroma.length ? join(aroma.map((x) => x.comp.name)) : ''
  const out: string[] = []

  for (const { comp } of protein) if (comp.cut) out.push(`${comp.name}${comp.cut}${comp.meat && combo.method !== 'soup' ? `，用一點${M}抓醃 10 分鐘` : ''}`)
  if (veg.length) out.push(veg.map((x) => `${x.comp.name}${x.comp.cut ?? '洗淨切好'}`).join('；'))
  if (aroma.length) out.push(`${A}切好備用`)
  const steamCarb = carb.filter((x) => x.comp.cut)
  if (steamCarb.length) out.push(steamCarb.map((x) => `${x.comp.name}${x.comp.cut}`).join('；') + '，趁這時間做其他步驟')
  const noodle = carb.find((x) => /麵/.test(x.comp.short))
  if (noodle) out.push(`${noodle.comp.short}照包裝煮熟，冷水沖過瀝乾`)

  const done = protein.map((x) => x.comp.done).filter(Boolean)[0]
  const doneText = done ? `（${done}）` : ''
  switch (combo.method) {
    case 'pan':
      out.push(`平底鍋加${oilName}中火燒熱，${P}下鍋每面煎 3–4 分鐘${doneText}，取出`)
      if (veg.length) out.push(`原鍋${A ? `爆香${A}，` : ''}放入${V}炒熟，加${S}調味`)
      break
    case 'stir':
      out.push(`鍋中加${oilName}${A ? `，小火爆香${A}` : '燒熱'}，${P ? `轉大火下${P}炒到變色${doneText}，先盛出` : ''}`)
      if (veg.length) out.push(`同一鍋下${V}炒到快熟，${P ? `${P}回鍋，` : ''}加${S}和 2 大匙水拌炒均勻`)
      break
    case 'oven':
      out.push('烤箱預熱 200°C')
      out.push(`${P}${veg.length ? `和${V}` : ''}拌上${oilName}、${S}${A ? `、${A}` : ''}，平鋪在烤盤`)
      out.push(`烤 ${protein.some((x) => /魚|蝦|花枝/.test(x.comp.name)) ? '12–15' : '18–22'} 分鐘，中途翻面一次${doneText}`)
      break
    case 'air':
      out.push(`${P}表面抹${oilName}和${S}${A ? `、${A}` : ''}`)
      out.push(`氣炸鍋 190°C 炸 12–15 分鐘，中途翻面${veg.length ? `；${V}拌一點油鹽，最後 6 分鐘放進去` : ''}${doneText}`)
      break
    case 'steam':
      out.push(`${P}放在深盤，鋪上${[V, A].filter(Boolean).join('和')}，淋${S}`)
      out.push(`電鍋外鍋 1 杯水，蒸到開關跳起（約 15 分鐘）${doneText}`)
      if (oil) out.push(`起鍋前淋上${oilName}`)
      break
    case 'soup':
      out.push(`鍋中放 500ml 水${A ? `和${A}` : ''}煮滾`)
      if (P) out.push(`下${P}小火煮 8–10 分鐘，撈掉浮沫${doneText}`)
      if (veg.length) out.push(`加入${V}再煮 5 分鐘`)
      out.push(`加${S}調味${oil ? `，起鍋滴幾滴${oil.comp.name}` : ''}`)
      break
    case 'cold':
      if (P) out.push(`${P}放進滾水，轉小火燙熟${doneText}，撈起泡冰水後切片或撕絲`)
      if (veg.length) out.push(`${V}${veg.some((x) => ['cucumber', 'tomato', 'bell-pepper'].includes(x.comp.id)) ? '（生吃的直接切）' : ''}燙 1 分鐘，瀝乾放涼`)
      out.push(`全部和${S}${A ? `、${A}` : ''}${oil ? `、${oilName}` : ''}拌勻，冰 10 分鐘更入味`)
      break
  }
  if (noodle) out.push(combo.method === 'soup' ? `${noodle.comp.short}放碗底，把湯淋上去` : `${noodle.comp.short}加進來拌勻就完成`)
  const toppings = fat.filter((f) => f.comp.unit !== '大匙' || f.comp.id === 'sesame')
  if (toppings.length) out.push(`盛盤，放上${join(toppings.map((x) => x.comp.name))}`)
  const rice = carb.find((x) => !x.comp.cut && !/麵/.test(x.comp.short))
  if (rice) out.push(`搭配${rice.comp.name} ${rice.qty}g 一起吃`)
  return out
}

const KIND_OF = (combo: Combo): Kind => {
  const { carb } = comboParts(combo)
  if (combo.method === 'soup') return 'soup'
  if (carb.some((x) => /麵/.test(x.comp.short))) return 'noodle'
  if (carb.some((x) => x.comp.short === '飯' || x.comp.id === 'quinoa')) return 'rice'
  if (combo.method === 'cold') return 'salad'
  return 'plate'
}

const cuisineOf = (combo: Combo): Cuisine | undefined => {
  const votes = new Map<Cuisine, number>()
  for (const { comp } of comboParts(combo).list) if (comp.cuisine) votes.set(comp.cuisine, (votes.get(comp.cuisine) ?? 0) + (comp.part === 'flavor' ? 2 : 1))
  return [...votes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
}

const COLORS: Record<Method, string> = {
  pan: '#fbf0d9',
  stir: '#fbe7d6',
  oven: '#f8e3d3',
  air: '#f8e3d3',
  steam: '#e3eedf',
  soup: '#e5eef5',
  cold: '#e3eedf',
}

/** 把組合變成一道正式的食譜（存進「我的食譜」） */
export function comboToRecipe(combo: Combo, id: string, name = comboName(combo)): Recipe {
  const parts = comboParts(combo)
  const nutrition = comboNutrition(combo)
  const m = METHODS.find((x) => x.id === combo.method)!
  const ingredients: Ingredient[] = parts.list.map(({ comp, qty }) => ({ name: comp.name, qty, unit: comp.unit, section: comp.section }))
  const meals: MealSlot[] = ['lunch', 'dinner']
  if (parts.protein.some((x) => x.comp.id === 'egg' || x.comp.id === 'tofu') && combo.method !== 'soup') meals.unshift('breakfast')
  const tags = ['組合料理', m.label]
  if (nutrition.protein >= 30) tags.push('高蛋白')
  if (nutrition.carbs <= 20) tags.push('低碳')
  if (parts.fat.some((f) => ['avocado', 'nuts', 'olive-oil', 'camellia-oil'].includes(f.comp.id)) || parts.protein.some((x) => ['salmon', 'mackerel'].includes(x.comp.id)))
    tags.push('好油脂')
  const extra = parts.carb.some((x) => x.comp.cut) ? 5 : 0
  return {
    id,
    name,
    image: parts.protein[0]?.comp.image ?? parts.veg[0]?.comp.image ?? 'salad',
    color: COLORS[combo.method],
    meals,
    minutes: m.minutes + extra,
    tags,
    vegetarian: !parts.list.some((x) => x.comp.meat),
    ingredients,
    steps: comboSteps(combo),
    prep: parts.protein.some((x) => x.comp.meat) && combo.method !== 'soup' ? [{ task: `${join(parts.protein.map((x) => x.comp.name))}先切好醃起來`, keep: '冷藏 1 天' }] : [],
    nutrition,
    cuisine: cuisineOf(combo),
    kind: KIND_OF(combo),
    custom: true,
    createdAt: Date.now(),
  }
}

/** 隨機組一道：1 蛋白 + 1–2 菜 + 依方法配調味；低碳時不放主食 */
export function randomCombo(opts: { lowCarb?: boolean; vegetarian?: boolean } = {}): Combo {
  const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]
  const by = (p: Part) => COMPONENTS.filter((x) => x.part === p)
  const proteins = by('protein').filter((x) => !opts.vegetarian || !x.meat)
  const method = pick(METHODS).id
  const items: Record<string, number> = {}
  const pr = pick(proteins)
  items[pr.id] = pr.qty
  const vegs = by('veg').sort(() => Math.random() - 0.5).slice(0, 1 + Math.round(Math.random()))
  vegs.forEach((v) => (items[v.id] = v.qty))
  if (!opts.lowCarb && Math.random() < 0.6) {
    const k = pick(by('carb'))
    items[k.id] = k.qty
  }
  const flavorSets = [['garlic', 'soy'], ['ginger', 'soy'], ['miso'], ['shio-koji'], ['kimchi'], ['garlic', 'pepper', 'lemon'], ['herbs', 'lemon'], ['curry', 'garlic'], ['basil', 'garlic'], ['satay', 'garlic']]
  pick(flavorSets).forEach((id) => (items[id] = COMP_MAP[id].qty))
  const m = METHODS.find((x) => x.id === method)!
  if (m.oil) items[Math.random() < 0.7 ? 'olive-oil' : 'camellia-oil'] = m.oil
  if (Math.random() < 0.35) {
    const f = pick(['avocado', 'nuts', 'sesame'])
    items[f] = COMP_MAP[f].qty
  }
  return { items, method }
}
