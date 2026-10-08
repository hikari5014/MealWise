import { RECIPE_MAP } from '../data/recipes'
import type { Ingredient, MealSlot, Recipe, Section } from '../types'
import { storageFor, storageOf, type Storage } from './batch'
import { addDays, fromKey } from './date'
import type { IconName } from './icons'
import { formatQty } from './meal'

/** 一次備餐的紀錄 */
export interface BatchSession {
  id: string
  name: string
  createdAt: number
  /** 哪天煮 */
  prepDay: string
  items: { recipeId: string; portions: number }[]
  /** 每一份排到哪天哪餐 */
  assignments: { date: string; meal: MealSlot; recipeId: string }[]
  /** 排進菜單時新增的 plan id（方便整批移除） */
  planIds: number[]
  /** 幾人份（每餐的份量倍數） */
  servings?: number
}

export type Equipment = 'cooker' | 'oven' | 'pot' | 'pan' | 'cold'

export const EQUIPMENT: Record<Equipment, { label: string; icon: IconName }> = {
  cooker: { label: '電鍋／蒸', icon: 'skillet' },
  oven: { label: '烤箱', icon: 'local_fire_department' },
  pot: { label: '燉鍋', icon: 'ramen_dining' },
  pan: { label: '平底鍋', icon: 'skillet' },
  cold: { label: '免開火', icon: 'eco' },
}

/** 依步驟與標籤判斷這道菜主要用什麼煮 */
export const equipmentOf = (r: Recipe): Equipment => {
  const text = r.steps.join() + r.tags.join()
  if (r.kind === 'drink' || r.tags.includes('免開火') || (r.kind === 'salad' && !/煎|炒|烤|燙|煮/.test(text))) return 'cold'
  if (/烤箱|°C 烤|烤盤|烤 \d/.test(text)) return 'oven'
  if (/電鍋|舒肥|蒸/.test(text)) return 'cooker'
  if ((/燉|滷|煮 ?\d{2}|小火煮/.test(text) && r.minutes >= 20) || r.kind === 'soup') return 'pot'
  return 'pan'
}

export interface FlowStep {
  key: string
  /** 從開始算起第幾分鐘 */
  at: number
  minutes: number
  title: string
  detail?: string
  icon: IconName
  /** 跟其他步驟同時進行 */
  parallel?: boolean
  recipeId?: string
}

export interface BatchFlow {
  shopping: { section: Section; items: AggItem[] }[]
  mise: { veg: AggItem[]; protein: AggItem[]; other: string[] }
  steps: FlowStep[]
  totalMinutes: number
  containers: { date: string; meal: MealSlot; recipe: Recipe; storage: 'fridge' | 'freezer' | 'fresh'; thawOn?: string }[]
}

export interface AggItem {
  key: string
  name: string
  qty: number
  unit: string
  section: Section
  from: string[]
}

const SECTIONS: Section[] = ['produce', 'protein', 'dairyEgg', 'grain', 'pantry']

const aggregate = (list: { recipe: Recipe; portions: number }[], pick: (i: Ingredient) => boolean) => {
  const map = new Map<string, AggItem>()
  for (const { recipe, portions } of list) {
    for (const ing of recipe.ingredients) {
      if (!pick(ing) || /^(冷水|熱水|溫水|水)$/.test(ing.name)) continue
      const key = `${ing.name}|${ing.unit}`
      const it = map.get(key) ?? { key, name: ing.name, qty: 0, unit: ing.unit, section: ing.section, from: [] }
      it.qty += ing.qty * portions
      if (!it.from.includes(recipe.name)) it.from.push(recipe.name)
      map.set(key, it)
    }
  }
  return [...map.values()]
}

const isGrain = (i: Ingredient) => i.section === 'grain' && /飯|米|藜麥/.test(i.name)

/** 份量變多，炒煎類大約要分批、時間拉長 */
const batchFactor = (portions: number) => (portions <= 2 ? 1 : portions <= 4 ? 1.4 : 1.8)

/**
 * 產生一次備餐的完整流程：採購 → 備料 → 開火順序（可並行的同時進行）→ 放涼 → 分裝
 */
export function buildBatchFlow(session: Pick<BatchSession, 'items' | 'assignments' | 'prepDay' | 'servings'>): BatchFlow {
  const people = session.servings ?? 1
  const list = session.items
    .map((x) => ({ recipe: RECIPE_MAP[x.recipeId], portions: x.portions * people }))
    .filter((x) => x.recipe)

  const shopping = SECTIONS.map((section) => ({ section, items: aggregate(list, (i) => i.section === section) })).filter(
    (g) => g.items.length,
  )
  const grains = aggregate(list, isGrain)
  const veg = aggregate(list, (i) => i.section === 'produce')
  const protein = aggregate(list, (i) => i.section === 'protein')
  const other = list.flatMap(({ recipe }) => recipe.prep.map((p) => `${recipe.name}：${p.task}`))

  const steps: FlowStep[] = []
  let cursor = 0
  if (grains.length) {
    steps.push({
      key: 'grain',
      at: 0,
      minutes: 5,
      title: '洗米、主食下鍋',
      detail: grains.map((g) => `${g.name} 共 ${formatQty(g.qty, g.unit)}`).join('、') + '，按下開關就不用管它',
      icon: 'skillet',
    })
    cursor = 5
  }
  const byEq = (eq: Equipment) => list.filter((x) => equipmentOf(x.recipe) === eq)
  const ovens = byEq('oven')
  if (ovens.length) {
    steps.push({ key: 'preheat', at: cursor, minutes: 10, title: '烤箱預熱 200°C', icon: 'local_fire_department', parallel: true })
  }
  const miseMinutes = 5 + veg.length * 3 + protein.length * 4
  steps.push({
    key: 'mise',
    at: cursor,
    minutes: miseMinutes,
    title: '一次備料：洗切蔬菜、處理肉',
    detail: `${veg.length} 樣蔬菜、${protein.length} 樣肉類海鮮，清單在下面「備料」`,
    icon: 'kitchen',
  })
  cursor += miseMinutes

  let end = cursor
  // 燉煮先下鍋（同時進行）
  for (const { recipe, portions } of byEq('pot')) {
    steps.push({
      key: `pot-${recipe.id}`,
      at: cursor,
      minutes: recipe.minutes,
      title: `${recipe.name} ×${portions} 下鍋燉`,
      detail: '水量不用乘倍數，約 0.7 倍就夠；燉著時去做別的',
      icon: 'ramen_dining',
      parallel: true,
      recipeId: recipe.id,
    })
    end = Math.max(end, cursor + recipe.minutes)
  }
  for (const { recipe, portions } of byEq('cooker')) {
    steps.push({
      key: `cook-${recipe.id}`,
      at: cursor,
      minutes: recipe.minutes,
      title: `${recipe.name} ×${portions} 放電鍋／蒸`,
      icon: 'skillet',
      parallel: true,
      recipeId: recipe.id,
    })
    end = Math.max(end, cursor + recipe.minutes)
  }
  for (const { recipe, portions } of ovens) {
    const start = Math.max(cursor, (grains.length ? 5 : 0) + 10)
    steps.push({
      key: `oven-${recipe.id}`,
      at: start,
      minutes: recipe.minutes,
      title: `${recipe.name} ×${portions} 進烤箱`,
      detail: portions > 3 ? '份量多就分兩盤，中途上下對調' : undefined,
      icon: 'local_fire_department',
      parallel: true,
      recipeId: recipe.id,
    })
    end = Math.max(end, start + recipe.minutes)
  }
  // 平底鍋一道接一道
  let panCursor = cursor
  for (const { recipe, portions } of byEq('pan')) {
    const m = Math.round(Math.min(recipe.minutes, 20) * batchFactor(portions))
    steps.push({
      key: `pan-${recipe.id}`,
      at: panCursor,
      minutes: m,
      title: `${recipe.name} ×${portions}`,
      detail: portions > 2 ? `分 ${Math.ceil(portions / 2)} 批下鍋，才不會出水` : undefined,
      icon: 'skillet',
      recipeId: recipe.id,
    })
    panCursor += m
  }
  for (const { recipe, portions } of byEq('cold')) {
    steps.push({
      key: `cold-${recipe.id}`,
      at: panCursor,
      minutes: 8,
      title: `${recipe.name} ×${portions}（不用開火）`,
      detail: '醬汁另外裝，吃前再拌',
      icon: 'eco',
      recipeId: recipe.id,
    })
    panCursor += 8
  }
  end = Math.max(end, panCursor, grains.length ? 45 : 0)

  const containers = session.assignments
    .map((a) => {
      const recipe = RECIPE_MAP[a.recipeId]
      if (!recipe) return null
      const offset = Math.round((fromKey(a.date).getTime() - fromKey(session.prepDay).getTime()) / 86400000)
      const storage = storageFor(storageOf(recipe), offset)
      return { ...a, recipe, storage, thawOn: storage === 'freezer' ? addDays(a.date, -1) : undefined }
    })
    .filter((c): c is NonNullable<typeof c> => !!c)

  steps.push({ key: 'cool', at: end, minutes: 25, title: '攤平放涼', detail: '淺盤攤開、不要蓋蓋子，降到室溫再分裝（不要超過 2 小時）', icon: 'water_drop' })
  steps.push({
    key: 'pack',
    at: end + 25,
    minutes: Math.min(40, Math.max(10, containers.length * people * 2)),
    title: `分裝 ${containers.length * people} 盒`,
    detail: '盒子貼上日期，冷凍的放冷凍庫最裡面',
    icon: 'kitchen',
  })

  return {
    shopping,
    mise: { veg, protein, other },
    steps,
    totalMinutes: end + 25 + Math.min(40, Math.max(10, containers.length * people * 2)),
    containers,
  }
}

const ORDER: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack']

/**
 * 把每道菜的份數分配到接下來幾天的餐：
 * 放不久的（海鮮、麵）排前面，同一道菜盡量不要連續兩餐出現。
 */
export function assignPortions(
  items: { recipeId: string; portions: number }[],
  startDate: string,
  meals: MealSlot[],
  occupied: (date: string, meal: MealSlot) => boolean = () => false,
) {
  const queue = items
    .map((x) => ({ ...x, recipe: RECIPE_MAP[x.recipeId], left: x.portions }))
    .filter((x) => x.recipe && x.portions > 0)
    .map((x) => ({ ...x, shelf: storageOf(x.recipe).fridgeDays + storageOf(x.recipe).freezeWeeks * 7 }))
    .sort((a, b) => a.shelf - b.shelf)
  const out: BatchSession['assignments'] = []
  const sortedMeals = ORDER.filter((m) => meals.includes(m))
  let last = ''
  for (let d = 0; d < 21 && queue.some((q) => q.left > 0); d++) {
    const date = addDays(startDate, d)
    for (const meal of sortedMeals) {
      if (occupied(date, meal)) continue
      const avail = queue.filter((q) => q.left > 0 && q.recipe.meals.some((m) => m === meal || (meal !== 'breakfast' && m !== 'breakfast')))
      const pool = avail.length ? avail : queue.filter((q) => q.left > 0)
      if (!pool.length) break
      const pickOne = pool.find((q) => q.recipeId !== last) ?? pool[0]
      pickOne.left--
      last = pickOne.recipeId
      out.push({ date, meal, recipeId: pickOne.recipeId })
    }
  }
  return out
}

/** 適不適合拿來一次備餐（不適合的排後面並標註） */
export const batchFriendly = (r: Recipe): { ok: boolean; storage: Storage } => {
  const storage = storageOf(r)
  return { ok: !storage.makeFresh && storage.fridgeDays >= 2, storage }
}

export const fmtClock = (min: number) => `${Math.floor(min / 60)}:${String(Math.round(min % 60)).padStart(2, '0')}`
