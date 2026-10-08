import { RECIPES, RECIPE_MAP } from '../data/recipes'
import type { Goal, Ingredient, LogEntry, MealSlot, Nutrition, PlanEntry, Profile, Recipe, Section } from '../types'

export const EMPTY_NUTRITION: Nutrition = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }

export const sumNutrition = (logs: LogEntry[]): Nutrition =>
  logs.reduce((acc, log) => {
    const r = RECIPE_MAP[log.recipeId]
    if (!r) return acc
    return {
      kcal: acc.kcal + r.nutrition.kcal * log.portion,
      protein: acc.protein + r.nutrition.protein * log.portion,
      carbs: acc.carbs + r.nutrition.carbs * log.portion,
      fat: acc.fat + r.nutrition.fat * log.portion,
      fiber: acc.fiber + r.nutrition.fiber * log.portion,
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
  return !recipe.allergens.some((a) => profile.avoid.includes(a))
}

export const recipesFor = (meal: MealSlot | null, profile?: Profile) =>
  RECIPES.filter((r) => (meal ? r.meals.includes(meal) : true) && fitsProfile(r, profile))

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

/** 一鍵排菜單：填滿空的早午晚餐，盡量不重複 */
export const autoPlan = (days: string[], existing: PlanEntry[], profile?: Profile): PlanEntry[] => {
  const result: PlanEntry[] = []
  const used = new Map<string, number>()
  existing.forEach((e) => used.set(e.recipeId, (used.get(e.recipeId) ?? 0) + 1))
  for (const date of days) {
    for (const meal of ['breakfast', 'lunch', 'dinner'] as MealSlot[]) {
      if (existing.some((e) => e.date === date && e.meal === meal)) continue
      const pool = recipesFor(meal, profile)
      if (!pool.length) continue
      const minUse = Math.min(...pool.map((r) => used.get(r.id) ?? 0))
      const fresh = pool.filter((r) => (used.get(r.id) ?? 0) === minUse)
      const chosen = pick(fresh)
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
