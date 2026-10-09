import { recipeAvoidTags } from '../data/avoid'
import { RECIPES, RECIPE_MAP } from '../data/recipes'
import { fitsRule, resolveDay } from './dietPlan'
import type { DayMark, Goal, Ingredient, LogEntry, MealSlot, Nutrition, PlanEntry, Profile, Recipe, Section } from '../types'

export const EMPTY_NUTRITION: Nutrition = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }

export const sumNutrition = (logs: LogEntry[]): Nutrition =>
  logs.reduce((acc, log) => {
    const nutri = log.custom?.nutrition ?? RECIPE_MAP[log.recipeId]?.nutrition
    if (!nutri) return acc
    return {
      kcal: acc.kcal + nutri.kcal * log.portion,
      protein: acc.protein + nutri.protein * log.portion,
      carbs: acc.carbs + nutri.carbs * log.portion,
      fat: acc.fat + nutri.fat * log.portion,
      fiber: acc.fiber + nutri.fiber * log.portion,
    }
  }, EMPTY_NUTRITION)

/** 依熱量目標換算三大營養素目標（公克） */
export const macroTargets = (profile: Profile) => {
  const ratio: Record<Goal, [number, number, number]> = {
    lose: [0.3, 0.4, 0.3],
    maintain: [0.2, 0.5, 0.3],
    gain: [0.3, 0.45, 0.25],
  }
  const [p, c, f] = ratio[profile.goal]
  return {
    protein: Math.round((profile.kcal * p) / 4),
    carbs: Math.round((profile.kcal * c) / 4),
    fat: Math.round((profile.kcal * f) / 9),
    fiber: 25,
  }
}

export const suggestKcal = (goal: Goal) => ({ lose: 1600, maintain: 1900, gain: 2400 })[goal]

export const fitsProfile = (recipe: Recipe, profile?: Profile) => {
  if (!profile) return true
  if (profile.vegetarian && !recipe.vegetarian) return false
  if (profile.taste?.dislikes.includes(recipe.id)) return false
  return !recipeAvoidTags(recipe).some((t) => profile.avoid.includes(t))
}

export const recipesFor = (meal: MealSlot | null, profile?: Profile) =>
  RECIPES.filter((r) => !r.eatout && (meal ? r.meals.includes(meal) : true) && fitsProfile(r, profile))

/** 越符合口味偏好分數越高：最愛 +4、喜歡的料理國家 +2、喜歡的菜色類型 +1 */
export const tasteScore = (recipe: Recipe, profile?: Profile) => {
  const t = profile?.taste
  if (!t) return 0
  return (
    (t.favorites.includes(recipe.id) ? 4 : 0) +
    (recipe.cuisine && t.cuisines.includes(recipe.cuisine) ? 2 : 0) +
    (recipe.kind && t.kinds.includes(recipe.kind) ? 1 : 0)
  )
}

/** 依偏好加權抽一道：分數越高越容易被選到 */
const pickWeighted = (arr: Recipe[], profile?: Profile) => {
  const weights = arr.map((r) => 1 + tasteScore(r, profile) * 2)
  let n = Math.random() * weights.reduce((a, b) => a + b, 0)
  for (let i = 0; i < arr.length; i++) {
    n -= weights[i]
    if (n <= 0) return arr[i]
  }
  return arr[arr.length - 1]
}

/**
 * 一鍵排菜單：依照每天的飲食計劃（斷食、每餐偏好、運動日、大餐）
 * 填滿空的餐，盡量不重複。
 */
export const autoPlan = (
  days: string[],
  existing: PlanEntry[],
  profile: Profile,
  marks: Record<string, DayMark | undefined> = {},
): PlanEntry[] => {
  const result: PlanEntry[] = []
  const used = new Map<string, number>()
  existing.forEach((e) => used.set(e.recipeId, (used.get(e.recipeId) ?? 0) + 1))
  for (const date of days) {
    const day = resolveDay(date, profile, marks)
    for (const meal of ['breakfast', 'lunch', 'dinner'] as MealSlot[]) {
      if (existing.some((e) => e.date === date && e.meal === meal)) continue
      const rule = day.meals[meal].rule
      if (rule === 'skip' || rule === 'feast') continue
      const base = recipesFor(meal, profile)
      let pool = base.filter((r) => fitsRule(r, rule))
      // 蛋白飲大多標成早餐／點心；找不到就從全部食譜裡找符合規則的
      if (!pool.length) pool = recipesFor(null, profile).filter((r) => fitsRule(r, rule))
      if (!pool.length) pool = base
      if (!pool.length) continue
      const minUse = Math.min(...pool.map((r) => used.get(r.id) ?? 0))
      const fresh = pool.filter((r) => (used.get(r.id) ?? 0) === minUse)
      const chosen = pickWeighted(fresh, profile)
      used.set(chosen.id, (used.get(chosen.id) ?? 0) + 1)
      result.push({ date, meal, recipeId: chosen.id })
    }
  }
  return result
}

export interface ShoppingItem {
  key: string
  name: string
  qty: number
  unit: string
  section: Section
  from: string[]
}

/** 把菜單上所有食材加總、合併同名同單位 */
export const buildShopping = (plans: PlanEntry[], servings: number): ShoppingItem[] => {
  const map = new Map<string, ShoppingItem>()
  for (const plan of plans) {
    const r = RECIPE_MAP[plan.recipeId]
    if (!r) continue
    r.ingredients.forEach((ing: Ingredient) => {
      if (/^(冷水|熱水|溫水|水)$/.test(ing.name)) return
      const key = `${ing.name}|${ing.unit}`
      const item = map.get(key) ?? { key, name: ing.name, qty: 0, unit: ing.unit, section: ing.section, from: [] }
      item.qty += ing.qty * servings
      if (!item.from.includes(r.name)) item.from.push(r.name)
      map.set(key, item)
    })
  }
  return [...map.values()]
}

export const formatQty = (qty: number, unit: string) => {
  const rounded = unit === 'g' || unit === 'ml' ? Math.ceil(qty / 10) * 10 : Math.round(qty * 4) / 4
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, '')
  return `${text} ${unit}`
}

export const PORTIONS = [
  { value: 0.5, label: '小份', hint: '半份' },
  { value: 1, label: '中份', hint: '一份' },
  { value: 1.5, label: '大份', hint: '一份半' },
]
