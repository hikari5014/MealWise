import { ALL_COMP_MAP, PANTRY_GROUPS } from '../data/composer'
import { RECIPE_MAP } from '../data/recipes'
import type { MealSlot, PlanEntry, Profile, Recipe, Section } from '../types'
import { batchFriendly, assignPortions } from './batchSession'
import { addDays } from './date'
import { recipesFor, tasteScore } from './meal'

/** 家裡有多少：大約夠幾餐（調味料不算份量，用 99 代表「有」） */
export type Pantry = Record<string, number>
export const AMOUNTS = [
  { value: 2, label: '一點' },
  { value: 4, label: '普通' },
  { value: 7, label: '很多' },
] as const
export const HAVE = 99

/** 不用特地買、家家都有的 */
const STAPLE = /^(冷水|熱水|溫水|水|冰塊|鹽|海鹽|糖|砂糖|二砂|食用油|油|植物油|白胡椒粉?|胡椒粉?|太白粉|地瓜粉)$/

/** 食譜裡的寫法 → 冰箱清單的食材（任一有就算有） */
const ALIAS: Record<string, string[]> = {
  去骨雞腿排: ['chicken-thigh'],
  帶骨雞腿: ['drumstick', 'chicken-thigh'],
  雞腿: ['chicken-thigh', 'drumstick'],
  豬肉片: ['pork-loin', 'pork-shoulder', 'pork-belly'],
  豬肉絲: ['pork-loin', 'pork-tenderloin'],
  豬五花: ['pork-belly'],
  豬五花片: ['pork-belly'],
  豬絞肉: ['pork-mince'],
  蝦子: ['prawn', 'shrimp'],
  蘑菇: ['shiitake', 'king-oyster', 'shimeji'],
  綜合菇: ['shiitake', 'king-oyster', 'shimeji', 'enoki'],
  菇: ['shiitake', 'king-oyster', 'shimeji', 'enoki'],
  蔥薑蒜: ['scallion', 'ginger', 'garlic'],
  蔥: ['scallion'],
  蔥花: ['scallion'],
  老薑: ['ginger'],
  薑: ['ginger'],
  蒜: ['garlic'],
  蒜頭: ['garlic'],
  薑泥: ['ginger'],
  薑片: ['ginger'],
  蒜末: ['garlic'],
  水煮蛋: ['egg'],
  蛋: ['egg'],
  蛋白液: ['egg-white', 'egg'],
  綜合生菜: ['mixed-greens', 'lettuce'],
  蘿蔓生菜: ['mixed-greens', 'lettuce'],
  芝麻葉: ['mixed-greens'],
  生菜: ['mixed-greens', 'lettuce'],
  黃豆芽: ['bean-sprouts'],
  豆芽菜: ['bean-sprouts'],
  香油: ['sesame-oil'],
  麻油: ['sesame-oil'],
  起司絲: ['cheese-shred', 'cheese'],
  優格: ['yogurt'],
  綜合莓果: ['berries', 'blueberry', 'strawberry'],
  碎菜脯: ['preserved-radish'],
  無糖花生醬: ['peanut-butter'],
  乾麵條: ['dry-noodle'],
  米飯: ['white-rice', 'brown-rice', 'multigrain-rice'],
  白飯: ['white-rice', 'brown-rice', 'multigrain-rice'],
}

const norm = (s: string) => s.replace(/（.*?）|\(.*?\)/g, '').replace(/\s/g, '')
const COMPS = Object.values(ALL_COMP_MAP).map((c) => ({ id: c.id, names: [norm(c.name), norm(c.short)].filter((x) => x.length >= 2) }))
const cache = new Map<string, string[]>()

/** 食譜食材名 → 可能對應的冰箱食材 id（空陣列＝清單裡沒有這種東西） */
export function matchIds(name: string): string[] {
  const hit = cache.get(name)
  if (hit) return hit
  const n = norm(name)
  let out = ALIAS[n]
  if (!out) {
    const exact = COMPS.filter((c) => c.names.includes(n)).map((c) => c.id)
    if (exact.length) out = exact
    else {
      // 名稱互相包含（雞胸肉丁 ⊃ 雞胸肉），取最長、最具體的那個
      const sub = COMPS.flatMap((c) => c.names.filter((x) => n.includes(x) || (n.length >= 2 && x.includes(n))).map((x) => ({ id: c.id, len: x.length })))
      sub.sort((a, b) => b.len - a.len)
      out = sub.length ? [...new Set(sub.filter((x) => x.len === sub[0].len).map((x) => x.id))] : []
    }
  }
  cache.set(name, out)
  return out
}

export const isStaple = (name: string) => STAPLE.test(norm(name))

/** 肉、海鮮、豆腐，加上蛋 */
const isProtein = (i: { name: string; section: Section }) => i.section === 'protein' || (i.section === 'dairyEgg' && /蛋/.test(i.name))

const WEIGHT: Record<Section, number> = { protein: 3, produce: 2, grain: 2, dairyEgg: 2, pantry: 1 }

export interface Coverage {
  have: string[]
  missing: { name: string; qty: number; unit: string; section: Section }[]
  ratio: number
  /** 主要蛋白質家裡有 */
  mainOwned: boolean
}

/** 這道菜家裡的食材夠不夠 */
export function coverage(recipe: Recipe, pantry: Pantry): Coverage {
  const have: string[] = []
  const missing: Coverage['missing'] = []
  let got = 0
  let total = 0
  let mainOwned = !recipe.ingredients.some((i) => i.section === 'protein')
  for (const ing of recipe.ingredients) {
    if (isStaple(ing.name)) continue
    const w = WEIGHT[ing.section]
    total += w
    const ids = matchIds(ing.name)
    const owned = ids.some((id) => (pantry[id] ?? 0) > 0)
    if (owned) {
      got += w
      have.push(ing.name)
      if (ing.section === 'protein') mainOwned = true
    } else missing.push({ name: ing.name, qty: ing.qty, unit: ing.unit, section: ing.section })
  }
  return { have, missing, ratio: total ? got / total : 0, mainOwned }
}

export interface PantryPlanResult {
  batch: { recipe: Recipe; portions: number; cov: Coverage }[]
  fresh: { recipe: Recipe; days: string[]; cov: Coverage }[]
  plans: { date: string; meal: MealSlot; recipeId: string; kind: 'batch' | 'fresh' }[]
  shopping: { name: string; qty: number; unit: string; section: Section; from: string[]; reason: 'missing' | 'more' }[]
  used: string[]
  unused: string[]
  slots: number
}

export interface PantryPlanOptions {
  start: string
  days: number
  batchMeals: MealSlot[]
  freshMeals: MealSlot[]
  servings: number
  seed?: number
  occupied?: PlanEntry[]
}

const rand = (seed: number) => () => {
  seed = (seed * 9301 + 49297) % 233280
  return seed / 233280
}

/**
 * 用冰箱現有的食材排一段時間的菜：
 * 1. 「一次備好」的菜：適合冷藏冷凍、家裡食材夠的，挑 2–3 道分次吃
 * 2. 「每天換」的菜：快手、新鮮的，用剩下的食材每天輪
 * 3. 缺的、可能不夠的列成要補買的清單
 */
export function planFromPantry(pantry: Pantry, profile: Profile, o: PantryPlanOptions): PantryPlanResult {
  const r = rand(o.seed ?? 1)
  const budget: Pantry = { ...pantry }
  const isOcc = (date: string, meal: MealSlot) => !!o.occupied?.some((p) => p.date === date && p.meal === meal)
  const dates = Array.from({ length: o.days }, (_, i) => addDays(o.start, i))
  const batchSlots = dates.flatMap((date) => o.batchMeals.filter((m) => !isOcc(date, m)).map((meal) => ({ date, meal })))
  const freshSlots = dates.flatMap((date) => o.freshMeals.filter((m) => !isOcc(date, m)).map((meal) => ({ date, meal })))

  const pool = recipesFor(null, profile)
    .filter((x) => !x.tags.includes('蛋白飲') && x.kind !== 'drink')
    .map((recipe) => ({ recipe, cov: coverage(recipe, pantry), taste: tasteScore(recipe, profile), jitter: r() }))
    .filter((x) => x.cov.ratio >= 0.45 && x.cov.mainOwned)
  const score = (x: (typeof pool)[number]) => x.cov.ratio * 10 + x.taste + x.jitter * 2

  // 用掉食材：每份扣一次「餐數」
  const consume = (recipe: Recipe, n: number) => {
    for (const ing of recipe.ingredients) {
      const id = matchIds(ing.name).find((k) => (budget[k] ?? 0) > 0)
      if (id && budget[id] < HAVE) budget[id] -= n
    }
  }
  const canMake = (recipe: Recipe, n: number) =>
    recipe.ingredients.every((ing) => {
      if (!isProtein(ing)) return true
      const ids = matchIds(ing.name)
      return !ids.length || !ids.some((k) => k in pantry) || ids.some((k) => (budget[k] ?? 0) >= Math.min(n, 2))
    })

  // 1. 一次備好
  const batch: PantryPlanResult['batch'] = []
  if (batchSlots.length) {
    const want = batchSlots.length <= 4 ? 2 : batchSlots.length <= 9 ? 3 : 4
    const cands = pool
      .filter((x) => batchFriendly(x.recipe).ok && x.recipe.meals.some((m) => o.batchMeals.includes(m)))
      // 便當要吃得飽：午晚餐的備餐菜要有份量、有蛋白質
      .filter((x) => o.batchMeals.every((m) => m === 'breakfast') || (x.recipe.nutrition.protein >= 15 && x.recipe.nutrition.kcal >= 250))
      .sort((a, b) => score(b) + b.recipe.nutrition.protein / 10 - (score(a) + a.recipe.nutrition.protein / 10))
    const usedProtein = new Set<string>()
    for (const c of cands) {
      if (batch.length >= want) break
      const prot = c.recipe.ingredients.filter(isProtein).flatMap((i) => matchIds(i.name))
      if (prot.some((p) => usedProtein.has(p))) continue // 主菜不要重複同一種肉
      const per = Math.ceil(batchSlots.length / want)
      if (!canMake(c.recipe, per)) continue
      prot.forEach((p) => usedProtein.add(p))
      batch.push({ recipe: c.recipe, portions: 0, cov: c.cov })
    }
    // 份數平均分，最後一道補足
    batch.forEach((b, i) => (b.portions = Math.floor(batchSlots.length / batch.length) + (i < batchSlots.length % batch.length ? 1 : 0)))
    batch.forEach((b) => consume(b.recipe, b.portions))
  }

  // 2. 每天換
  const freshMap = new Map<string, { recipe: Recipe; days: string[]; cov: Coverage }>()
  const freshPlans: PantryPlanResult['plans'] = []
  const batchIds = new Set(batch.map((b) => b.recipe.id))
  for (const slot of freshSlots) {
    const prev = freshPlans.filter((p) => p.date === addDays(slot.date, -1)).map((p) => p.recipeId)
    const cands = pool
      .filter((x) => x.recipe.meals.includes(slot.meal) && !batchIds.has(x.recipe.id) && !prev.includes(x.recipe.id))
      .filter((x) => (freshMap.get(x.recipe.id)?.days.length ?? 0) < 2 && canMake(x.recipe, 1))
      // 越前面的日子越優先用容易壞的葉菜和海鮮
      .map((x) => ({ x, s: score(x) + (x.recipe.minutes <= 25 ? 1.5 : 0) + (slot.meal !== 'breakfast' && x.recipe.nutrition.protein >= 15 ? 2 : 0) - (freshMap.has(x.recipe.id) ? 3 : 0) }))
      .sort((a, b) => b.s - a.s)
    const pick = cands[0]?.x
    if (!pick) continue
    consume(pick.recipe, 1)
    const cur = freshMap.get(pick.recipe.id) ?? { recipe: pick.recipe, days: [], cov: pick.cov }
    cur.days.push(slot.date)
    freshMap.set(pick.recipe.id, cur)
    freshPlans.push({ date: slot.date, meal: slot.meal, recipeId: pick.recipe.id, kind: 'fresh' })
  }

  const batchPlans = assignPortions(
    batch.map((b) => ({ recipeId: b.recipe.id, portions: b.portions })),
    o.start,
    o.batchMeals,
    (d, m) => isOcc(d, m) || d >= addDays(o.start, o.days),
  ).map((a) => ({ ...a, kind: 'batch' as const }))

  // 3. 要補買：缺的照份量加總；有但可能不夠的提醒多買
  const shop = new Map<string, PantryPlanResult['shopping'][number]>()
  const add = (recipe: Recipe, n: number) => {
    for (const ing of recipe.ingredients) {
      if (isStaple(ing.name)) continue
      const ids = matchIds(ing.name)
      const owned = ids.some((k) => (pantry[k] ?? 0) > 0)
      const short = owned && ids.every((k) => !(k in pantry) || (budget[k] ?? 0) < 0)
      if (owned && !short) continue
      const key = `${ing.name}|${ing.unit}`
      const it = shop.get(key) ?? { name: ing.name, qty: 0, unit: ing.unit, section: ing.section, from: [], reason: owned ? 'more' : 'missing' }
      it.qty += ing.qty * n * o.servings
      if (!it.from.includes(recipe.name)) it.from.push(recipe.name)
      shop.set(key, it)
    }
  }
  batch.forEach((b) => add(b.recipe, b.portions))
  ;[...freshMap.values()].forEach((f) => add(f.recipe, f.days.length))

  const chosen = [...batch.map((b) => b.recipe), ...[...freshMap.values()].map((f) => f.recipe)]
  const usedIds = new Set(chosen.flatMap((rc) => rc.ingredients.flatMap((i) => matchIds(i.name))))
  const owned = Object.keys(pantry).filter((k) => pantry[k] > 0)
  return {
    batch,
    fresh: [...freshMap.values()].sort((a, b) => a.days[0].localeCompare(b.days[0])),
    plans: [...batchPlans, ...freshPlans].sort((a, b) => a.date.localeCompare(b.date)),
    shopping: [...shop.values()].sort((a, b) => (a.reason === b.reason ? 0 : a.reason === 'missing' ? -1 : 1)),
    used: owned.filter((k) => usedIds.has(k)),
    unused: owned.filter((k) => !usedIds.has(k) && pantry[k] < HAVE),
    slots: batchSlots.length + freshSlots.length,
  }
}

export const PANTRY_ITEM_GROUPS = PANTRY_GROUPS
export const recipeOf = (id: string) => RECIPE_MAP[id]
