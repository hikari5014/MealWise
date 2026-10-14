import type { Goal, MealSlot, Nutrition, Profile, Recipe } from '../types'
import type { ResolvedDay } from './dietPlan'

/**
 * 依身體數據算每天需要的熱量與三大營養素。
 * - 基礎代謝：有體脂用 Katch-McArdle（看去脂體重），沒有就用 Mifflin-St Jeor
 * - 每天消耗＝基礎代謝 × 活動係數
 * - 減脂：每週減 0.25／0.5／0.75 kg（1 kg 脂肪約 7700 kcal）；增肌：每天多 200／300／450 kcal
 * - 蛋白質依體重（BMI 30 以上改用 BMI 25 的體重算，避免高估）；脂肪約 27%；剩下給碳水
 */

export type Sex = 'male' | 'female'
export type Activity = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete'
export type Pace = 'slow' | 'normal' | 'fast'

export interface BodySpec {
  sex: Sex
  age: number
  height: number
  weight: number
  bodyFat?: number
  activity: Activity
  goal: Goal
  pace: Pace
  /** 每公斤體重吃幾克蛋白質；沒填就依目標 */
  proteinPerKg?: number
}

export const ACTIVITY: { id: Activity; label: string; hint: string; factor: number }[] = [
  { id: 'sedentary', label: '幾乎不動', hint: '坐辦公室，很少運動', factor: 1.2 },
  { id: 'light', label: '輕度', hint: '每週運動 1–3 天，或常走路', factor: 1.375 },
  { id: 'moderate', label: '中度', hint: '每週運動 3–5 天', factor: 1.55 },
  { id: 'active', label: '高度', hint: '每週運動 6–7 天，或站著工作', factor: 1.725 },
  { id: 'athlete', label: '非常高', hint: '一天練兩次，或勞力工作', factor: 1.9 },
]

export const PACES: Record<Exclude<Goal, 'maintain'>, { id: Pace; label: string; hint: string; kcal: number }[]> = {
  lose: [
    { id: 'slow', label: '慢慢來', hint: '每週約 -0.25 kg', kcal: -275 },
    { id: 'normal', label: '標準', hint: '每週約 -0.5 kg', kcal: -550 },
    { id: 'fast', label: '積極', hint: '每週約 -0.75 kg', kcal: -825 },
  ],
  gain: [
    { id: 'slow', label: '乾淨增肌', hint: '每天 +200 kcal', kcal: 200 },
    { id: 'normal', label: '標準', hint: '每天 +300 kcal', kcal: 300 },
    { id: 'fast', label: '快速', hint: '每天 +450 kcal', kcal: 450 },
  ],
}

export const DEFAULT_PROTEIN: Record<Goal, number> = { lose: 1.8, maintain: 1.4, gain: 1.8 }
export const PROTEIN_LEVELS = [1.2, 1.4, 1.6, 1.8, 2.0, 2.2]

export const defaultSpec = (profile?: Profile, weight?: number, bodyFat?: number): BodySpec => ({
  sex: 'female',
  age: 30,
  height: 160,
  weight: weight ?? 55,
  bodyFat,
  activity: 'light',
  goal: profile?.goal ?? 'maintain',
  pace: 'normal',
  ...profile?.body,
})

export interface Needs {
  bmr: number
  tdee: number
  kcal: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  water: number
  bmi: number
  /** 用了哪個公式 */
  method: 'katch' | 'mifflin'
  /** 熱量被拉到安全下限 */
  floored: boolean
  proteinPerKg: number
}

const round = (n: number, step = 1) => Math.round(n / step) * step

export function calcNeeds(s: BodySpec): Needs {
  const h = s.height / 100
  const bmi = s.weight / (h * h)
  const katch = s.bodyFat !== undefined && s.bodyFat > 3 && s.bodyFat < 60
  const bmr = katch
    ? 370 + 21.6 * s.weight * (1 - s.bodyFat! / 100)
    : 10 * s.weight + 6.25 * s.height - 5 * s.age + (s.sex === 'male' ? 5 : -161)
  const factor = ACTIVITY.find((a) => a.id === s.activity)!.factor
  const tdee = bmr * factor
  const delta = s.goal === 'maintain' ? 0 : PACES[s.goal].find((p) => p.id === s.pace)!.kcal
  const floor = Math.max(bmr, s.sex === 'male' ? 1500 : 1200)
  const raw = tdee + delta
  const kcal = round(Math.max(raw, floor), 10)
  const perKg = s.proteinPerKg ?? DEFAULT_PROTEIN[s.goal]
  const proteinWeight = bmi >= 30 ? 25 * h * h : s.weight
  const protein = round(proteinWeight * perKg)
  const fat = round(Math.max((kcal * 0.27) / 9, s.weight * 0.7))
  const carbs = round(Math.max(50, (kcal - protein * 4 - fat * 9) / 4))
  const fiber = round((kcal / 1000) * 14)
  const water = round(s.weight * 35 + (factor >= 1.725 ? 500 : 0), 50)
  return { bmr: round(bmr), tdee: round(tdee, 10), kcal, protein, carbs, fat, fiber, water, bmi: Math.round(bmi * 10) / 10, method: katch ? 'katch' : 'mifflin', floored: raw < floor, proteinPerKg: perKg }
}

export const bmiLabel = (bmi: number) => (bmi < 18.5 ? '過輕' : bmi < 24 ? '標準' : bmi < 27 ? '過重' : '肥胖')

/* ───────── 每餐份額：排菜單時挑熱量、蛋白質剛好的料理 ───────── */

/** 一天熱量分配到各餐的比例（點心先留 10%） */
const SHARE: Record<MealSlot, number> = { breakfast: 0.25, lunch: 0.35, snack: 0.1, dinner: 0.3 }

export interface Budget {
  kcal: number
  protein: number
}

/** 這天每餐大概該吃多少；有跳過的餐，份額分給其他餐 */
export function mealBudgets(day: ResolvedDay, protein: number): Partial<Record<MealSlot, Budget>> {
  const eaten = (Object.keys(SHARE) as MealSlot[]).filter((m) => day.meals[m].rule !== 'skip')
  const total = eaten.reduce((t, m) => t + SHARE[m], 0)
  if (!total) return {}
  return Object.fromEntries(eaten.map((m) => [m, { kcal: (day.kcal * SHARE[m]) / total, protein: (protein * SHARE[m]) / total }]))
}

/** 越接近這餐的熱量、蛋白質越夠，分數越高（約 0–5） */
export function fitScore(n: Nutrition, b?: Budget) {
  if (!b || b.kcal <= 0) return 0
  const off = Math.min(Math.abs(n.kcal - b.kcal) / b.kcal, 1.5)
  return 3 * (1 - off) + 2 * Math.min(n.protein / Math.max(b.protein, 1), 1.2)
}

export const recipeFit = (r: Recipe, b?: Budget) => fitScore(r.nutrition, b)
