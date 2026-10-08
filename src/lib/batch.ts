import { ingredientTags } from '../data/avoid'
import { RECIPE_MAP } from '../data/recipes'
import type { Ingredient, MealSlot, PlanEntry, Recipe } from '../types'
import { addDays, fromKey } from './date'
import { formatQty } from './meal'

/* ───────────── 保存方式 ───────────── */

export interface Storage {
  /** 冷藏可以放幾天 */
  fridgeDays: number
  /** 冷凍可以放幾週（0 = 不適合冷凍） */
  freezeWeeks: number
  /** 不適合預做（例如生魚片、飲品），只能先備料 */
  makeFresh: boolean
  tip: string
  reheat: string
}

const SEAFOOD = ['fish', 'shrimp', 'crab', 'shellfish', 'squid']

/** 依菜色、食材判斷這道菜適合怎麼保存（一般家庭的保守建議） */
export function storageOf(recipe: Recipe): Storage {
  const tags = new Set(recipe.ingredients.flatMap((i) => ingredientTags(i.name)))
  const raw = recipe.ingredients.some((i) => /生食|生魚片/.test(i.name))
  const hasSeafood = SEAFOOD.some((t) => tags.has(t))
  const leafy = recipe.ingredients.some((i) => /生菜|萵苣|蘿蔓|芝麻葉/.test(i.name))
  const kind = recipe.kind
  const stew = kind === 'soup' || /燉|咖哩|滷|湯/.test(recipe.name)

  if (kind === 'drink') {
    return {
      fridgeDays: 1,
      freezeWeeks: 0,
      makeFresh: true,
      tip: '粉類或水果先分裝成一包一包，喝之前再加液體搖勻或打一下',
      reheat: '不用加熱，現做現喝',
    }
  }
  if (raw) {
    return {
      fridgeDays: 1,
      freezeWeeks: 0,
      makeFresh: true,
      tip: '生食當天買當天吃，其他配料可以先切好',
      reheat: '不加熱，冷藏取出直接吃',
    }
  }
  if (kind === 'salad' || leafy) {
    return {
      fridgeDays: 3,
      freezeWeeks: 0,
      makeFresh: false,
      tip: '生菜擦乾、醬汁另外裝小盒，吃之前再淋，才不會出水變軟',
      reheat: '冷吃；有肉的話肉可以單獨微波 30 秒',
    }
  }
  if (kind === 'noodle') {
    return {
      fridgeDays: 2,
      freezeWeeks: 0,
      makeFresh: false,
      tip: '麵條和湯／醬分開裝，吃之前再拌，麵才不會糊',
      reheat: '湯或醬加熱，麵條用熱水燙 30 秒再拌',
    }
  }
  if (hasSeafood) {
    return {
      fridgeDays: 2,
      freezeWeeks: 3,
      makeFresh: false,
      tip: '海鮮放久容易變老、有腥味，排在前兩天吃，後面的冷凍',
      reheat: '微波中火 1.5–2 分鐘，不要加熱太久',
    }
  }
  if (stew) {
    return {
      fridgeDays: 4,
      freezeWeeks: 4,
      makeFresh: false,
      tip: '燉煮、湯品最適合一次做一大鍋，完全放涼再分裝',
      reheat: '冷藏的微波 3 分鐘或小火煮滾；冷凍的前一晚移到冷藏退冰',
    }
  }
  if (kind === 'rice') {
    return {
      fridgeDays: 3,
      freezeWeeks: 3,
      makeFresh: false,
      tip: '飯和菜可以分層放，飯趁溫熱裝盒冷凍口感最好',
      reheat: '飯上灑一點水，微波 2–3 分鐘',
    }
  }
  return {
    fridgeDays: 3,
    freezeWeeks: 3,
    makeFresh: false,
    tip: '煮好後放涼再蓋蓋子，避免水氣讓菜變軟',
    reheat: '微波 2 分鐘，中途翻一下比較均勻',
  }
}

/** 第 dayOffset 天要吃的話（0 = 備餐當天），該冷藏、冷凍還是當天現做 */
export const storageFor = (s: Storage, dayOffset: number): 'fridge' | 'freezer' | 'fresh' => {
  if (s.makeFresh) return 'fresh'
  if (dayOffset <= s.fridgeDays) return 'fridge'
  return s.freezeWeeks > 0 ? 'freezer' : 'fresh'
}

export const STORAGE_LABEL = { fridge: '冷藏', freezer: '冷凍', fresh: '當天現做' } as const

/* ───────────── 單道食譜：做成 N 份 ───────────── */

export const scale = (ings: Ingredient[], n: number) => ings.map((i) => ({ ...i, qty: i.qty * n }))

/** 一份裡主要的幾樣（給分裝時寫「每盒放什麼」用） */
export const portionLine = (recipe: Recipe) =>
  recipe.ingredients
    .filter((i) => i.section !== 'pantry')
    .slice(0, 4)
    .map((i) => `${i.name} ${formatQty(i.qty, i.unit)}`)
    .join(' + ')

export const batchTips = (recipe: Recipe, n: number): string[] => {
  const tips: string[] = []
  if (n >= 3 && /炒|煎/.test(recipe.steps.join())) tips.push('份量變多時，肉和菜分 2～3 批下鍋，鍋子才不會降溫出水')
  if (n >= 3 && /烤/.test(recipe.steps.join() + recipe.tags.join())) tips.push('烤盤不要疊太滿，需要的話分兩盤，上下層中途對調')
  if (/燉|滷|煮/.test(recipe.steps.join())) tips.push(`水量不用乘 ${n} 倍，約 ${Math.max(2, Math.round(n * 0.7))} 倍就夠，最後再看濃稠度調整`)
  tips.push('調味先放八成，試過味道再補，份量放大後鹹淡容易跑掉')
  tips.push('完全放涼（約 30 分鐘內）再分裝冷藏，避免細菌在溫熱時大量增加')
  return tips
}

/* ───────────── 一週備餐 ───────────── */

export interface PrepItem {
  key: string
  name: string
  qty: number
  unit: string
  from: string[]
}

export interface Container {
  date: string
  meal: MealSlot
  recipe: Recipe
  storage: 'fridge' | 'freezer' | 'fresh'
  /** 冷凍的話，哪天晚上要移到冷藏退冰 */
  thawOn?: string
}

export interface WeekPrep {
  prepDay: string
  recipes: { recipe: Recipe; count: number; storage: Storage }[]
  grains: PrepItem[]
  longCook: { recipe: Recipe; count: number }[]
  veggies: PrepItem[]
  proteins: PrepItem[]
  ahead: { recipe: Recipe; task: string; keep: string }[]
  containers: Container[]
  fresh: Container[]
  minutes: number
}

const aggregate = (entries: { recipe: Recipe; count: number }[], servings: number, pick: (i: Ingredient) => boolean) => {
  const map = new Map<string, PrepItem>()
  for (const { recipe, count } of entries) {
    for (const ing of recipe.ingredients) {
      if (!pick(ing)) continue
      const key = `${ing.name}|${ing.unit}`
      const item = map.get(key) ?? { key, name: ing.name, qty: 0, unit: ing.unit, from: [] }
      item.qty += ing.qty * count * servings
      if (!item.from.includes(recipe.name)) item.from.push(recipe.name)
      map.set(key, item)
    }
  }
  return [...map.values()].sort((a, b) => b.from.length - a.from.length)
}

const isGrain = (i: Ingredient) => i.section === 'grain' && /飯|米|藜麥|燕麥/.test(i.name)
const LONG_COOK = /燉|滷|烤|咖哩|濃湯/

/**
 * 把一段時間的菜單轉成「一次備餐」的流程：
 * 先開電鍋煮主食、烤箱／燉鍋，再一起洗切蔬菜、處理肉，最後分裝。
 */
export function buildWeekPrep(plans: PlanEntry[], prepDay: string, servings: number): WeekPrep {
  const counts = new Map<string, number>()
  for (const p of plans) if (p.date >= prepDay) counts.set(p.recipeId, (counts.get(p.recipeId) ?? 0) + 1)
  const recipes = [...counts.entries()]
    .map(([id, count]) => ({ recipe: RECIPE_MAP[id], count }))
    .filter((x) => x.recipe)
    .map((x) => ({ ...x, storage: storageOf(x.recipe) }))
  const cookable = recipes.filter((x) => !x.storage.makeFresh)

  const containers: Container[] = []
  const fresh: Container[] = []
  const prepTime = fromKey(prepDay).getTime()
  const order: Record<MealSlot, number> = { breakfast: 0, lunch: 1, snack: 2, dinner: 3 }
  for (const p of [...plans].sort((a, b) => a.date.localeCompare(b.date) || order[a.meal] - order[b.meal])) {
    if (p.date < prepDay) continue
    const recipe = RECIPE_MAP[p.recipeId]
    if (!recipe) continue
    const offset = Math.round((fromKey(p.date).getTime() - prepTime) / 86400000)
    const storage = storageFor(storageOf(recipe), offset)
    const c: Container = { date: p.date, meal: p.meal, recipe, storage }
    if (storage === 'freezer') c.thawOn = addDays(p.date, -1)
    if (storage === 'fresh') fresh.push(c)
    else containers.push(c)
  }

  const ahead = cookable.flatMap(({ recipe }) => recipe.prep.map((t) => ({ recipe, task: t.task, keep: t.keep })))
  const longCook = cookable.filter(({ recipe }) => LONG_COOK.test(recipe.name + recipe.steps.join()) || recipe.minutes >= 30)
  const grains = aggregate(cookable, servings, isGrain)
  const veggies = aggregate(recipes, servings, (i) => i.section === 'produce')
  const proteins = aggregate(cookable, servings, (i) => i.section === 'protein')

  // 粗估：最長的那道燉煮（可以同時進行）+ 每樣蔬菜 4 分鐘 + 每樣肉 5 分鐘 + 每盒分裝 1 分鐘
  const minutes =
    Math.max(30, ...longCook.map((x) => x.recipe.minutes)) + veggies.length * 4 + proteins.length * 5 + containers.length

  return { prepDay, recipes, grains, longCook, veggies, proteins, ahead, containers, fresh, minutes }
}

/** 蔬菜常見的處理方式 */
export const vegTip = (name: string) => {
  if (/生菜|萵苣|蘿蔓|芝麻葉|菠菜|小白菜|地瓜葉|青菜/.test(name)) return '洗淨後用脫水籃或紙巾吸乾，鋪紙巾裝盒'
  if (/青花菜|花椰菜/.test(name)) return '切小朵、泡水洗淨，瀝乾裝盒'
  if (/洋蔥|蒜|薑|蔥/.test(name)) return '切好分小盒，辛香料可以一次備好一週'
  if (/番茄|小黃瓜|甜椒|櫛瓜/.test(name)) return '洗淨擦乾，吃之前再切比較不會出水'
  if (/菇/.test(name)) return '不要泡水，用紙巾擦乾淨，切片裝盒'
  if (/馬鈴薯/.test(name)) return '去皮切塊後泡水，避免變黑'
  if (/地瓜|南瓜|紅蘿蔔/.test(name)) return '去皮切塊裝盒'
  if (/酪梨/.test(name)) return '吃之前再切，切開的那半抹檸檬汁、包緊冷藏'
  if (/檸檬/.test(name)) return '要用時再切或先擠成汁冷藏'
  if (/毛豆|四季豆|豆芽/.test(name)) return '燙熟放涼後裝盒'
  if (/莓|香蕉|蘋果|奇異果|水果/.test(name)) return '吃之前再洗切，避免變色出水'
  return '洗淨、切好、擦乾後裝盒'
}

export const proteinTip = (name: string, qty: number, unit: string, portions: number) => {
  const each = portions > 1 ? `，分成 ${portions} 份（每份約 ${formatQty(qty / portions, unit)}）` : ''
  if (/雞/.test(name)) return `切好用鹽、胡椒或醬料醃起來${each}`
  if (/牛|豬|羊/.test(name)) return `切片或切塊、醃好${each}`
  if (/魚|鮭|鱈|鯖|鯛/.test(name)) return `擦乾、撒鹽${each}，最晚兩天內煮`
  if (/蝦/.test(name)) return `去腸泥、擦乾${each}`
  return `分裝${each}`
}

/** 純文字版（方便複製給家人或貼到備忘錄） */
export function weekPrepText(w: WeekPrep, mealLabel: Record<MealSlot, string>, dayLabel: (d: string) => string) {
  const lines: string[] = [`【好食光・一週備餐】備餐日 ${dayLabel(w.prepDay)}`, `預估 ${Math.round(w.minutes / 10) * 10} 分鐘`, '']
  if (w.grains.length) {
    lines.push('① 先煮主食')
    w.grains.forEach((g) => lines.push(`・${g.name} 共 ${formatQty(g.qty, g.unit)}`))
    lines.push('')
  }
  if (w.longCook.length) {
    lines.push('② 燉煮／烤箱（同時進行）')
    w.longCook.forEach((x) => lines.push(`・${x.recipe.name} ×${x.count} 份`))
    lines.push('')
  }
  if (w.veggies.length) {
    lines.push('③ 洗切蔬菜')
    w.veggies.forEach((v) => lines.push(`・${v.name} 共 ${formatQty(v.qty, v.unit)}：${vegTip(v.name)}`))
    lines.push('')
  }
  if (w.proteins.length) {
    lines.push('④ 處理肉類海鮮')
    w.proteins.forEach((p) => lines.push(`・${p.name} 共 ${formatQty(p.qty, p.unit)}`))
    lines.push('')
  }
  lines.push('⑤ 分裝')
  w.containers.forEach((c) =>
    lines.push(`・${dayLabel(c.date)} ${mealLabel[c.meal]}｜${c.recipe.name}｜${c.storage === 'freezer' ? `冷凍（${dayLabel(c.thawOn!)}晚上移冷藏）` : '冷藏'}`),
  )
  if (w.fresh.length) {
    lines.push('', '⑥ 當天現做')
    w.fresh.forEach((c) => lines.push(`・${dayLabel(c.date)} ${mealLabel[c.meal]}｜${c.recipe.name}`))
  }
  return lines.join('\n')
}

