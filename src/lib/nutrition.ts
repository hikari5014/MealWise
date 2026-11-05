import { useMemo, useRef } from 'react'
import type { Goal, MealSlot, Nutrition, Profile, Recipe } from '../types'
import type { ResolvedDay } from './dietPlan'

/**
 * 依身體數據算每天需要的熱量與三大營養素。
 * - 去脂體重：直接填的 > 體重 ×（1 − 體脂率）> 骨骼肌重 ÷ 0.56 推估
 * - 基礎代謝：知道去脂體重用 Katch-McArdle（370 + 21.6 × 去脂體重），不知道用 Mifflin-St Jeor
 * - 每天消耗＝基礎代謝 × 活動係數（1.2–1.9，不含刻意運動；運動當天另外加）
 * - 目標熱量：維持 0；增肌 +200～+300；減脂 −300～−500；身體重組 0～−150（蛋白質拉高）
 * - 蛋白質依體重（BMI 30 以上改用 BMI 25 的體重算，避免高估）；脂肪 0.9 g/kg 並限制在總熱量 20–30%；剩下給碳水
 * - 碳水太少時依序把脂肪、蛋白質降到下限，碳水不會算出負數
 */

export type Sex = 'male' | 'female'
export type Activity = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete'
export type Pace = 'slow' | 'normal' | 'fast'

export interface BodySpec {
  sex: Sex
  /** 年齡；0＝沒填（先用 30 歲估算） */
  age: number
  /** 身高 cm；0＝沒填（先用一般身高估算） */
  height: number
  weight: number
  /** 體脂率（%） */
  bodyFat?: number
  /** 骨骼肌重（kg，InBody 等體組成計上的 SMM） */
  smm?: number
  /** 去脂體重（kg）；沒填就由體脂率或骨骼肌重推算 */
  ffm?: number
  activity: Activity
  goal: Goal
  pace: Pace
  /** 每公斤體重吃幾克蛋白質；沒填就依目標（自訂方案用） */
  proteinPerKg?: number
  /** 飲食方案：照比例分配三大營養素；custom＝依體重算蛋白質 */
  preset?: PresetId
  /** 餐點分配：三餐＋點心、168 斷食（兩餐＋點心） */
  meals?: MealPattern
}

export type PresetId = 'cut' | 'balance' | 'bulk' | 'lowcarb' | 'custom'
export type MealPattern = 'three' | 'if168'

/** 飲食方案：熱量增減與蛋白質／碳水／脂肪比例 */
export const PRESETS: { id: Exclude<PresetId, 'custom'>; label: string; goal: Goal; kcal: number; ratio: [number, number, number]; hint: string }[] = [
  { id: 'cut', label: '減脂高蛋白', goal: 'lose', kcal: -400, ratio: [0.35, 0.35, 0.3], hint: '少吃一點、蛋白質拉高保住肌肉' },
  { id: 'balance', label: '均衡維持', goal: 'maintain', kcal: 0, ratio: [0.25, 0.45, 0.3], hint: '吃多少用多少，體重不變' },
  { id: 'bulk', label: '增肌高碳水', goal: 'gain', kcal: 300, ratio: [0.25, 0.5, 0.25], hint: '多吃一些，碳水給訓練能量' },
  { id: 'lowcarb', label: '低碳飲食', goal: 'lose', kcal: -300, ratio: [0.3, 0.15, 0.55], hint: '澱粉很少、油脂提高' },
]

export const MEAL_PATTERNS: { id: MealPattern; label: string; shares: Record<MealSlot, number> }[] = [
  { id: 'three', label: '三餐＋點心', shares: { breakfast: 0.25, lunch: 0.35, dinner: 0.3, snack: 0.1 } },
  { id: 'if168', label: '168 斷食（兩餐＋點心）', shares: { breakfast: 0, lunch: 0.45, dinner: 0.4, snack: 0.15 } },
]
export const mealShares = (p?: Profile | BodySpec) => {
  const id = (p && 'body' in p ? p.body?.meals : (p as BodySpec | undefined)?.meals) ?? 'three'
  return MEAL_PATTERNS.find((m) => m.id === id)!.shares
}

/** 活動量等級（PAL）：指平常生活，不含刻意運動；運動當天的消耗會另外算 */
export const ACTIVITY: { id: Activity; label: string; hint: string; factor: number }[] = [
  { id: 'sedentary', label: '靜態', hint: '坐著工作、很少走動', factor: 1.2 },
  { id: 'light', label: '輕度', hint: '常走路、通勤或做家事', factor: 1.375 },
  { id: 'moderate', label: '中度', hint: '站著工作或一天走很多', factor: 1.55 },
  { id: 'active', label: '高度', hint: '整天走動、搬東西的工作', factor: 1.725 },
  { id: 'athlete', label: '極高', hint: '重度勞力工作', factor: 1.9 },
]

export const PACES: Record<Exclude<Goal, 'maintain'>, { id: Pace; label: string; hint: string; kcal: number }[]> = {
  lose: [
    { id: 'slow', label: '慢慢來', hint: '每天 −300 kcal', kcal: -300 },
    { id: 'normal', label: '標準', hint: '每天 −400 kcal', kcal: -400 },
    { id: 'fast', label: '積極', hint: '每天 −500 kcal', kcal: -500 },
  ],
  gain: [
    { id: 'slow', label: '乾淨增肌', hint: '每天 +200 kcal', kcal: 200 },
    { id: 'normal', label: '標準', hint: '每天 +250 kcal', kcal: 250 },
    { id: 'fast', label: '積極', hint: '每天 +300 kcal', kcal: 300 },
  ],
  recomp: [
    { id: 'slow', label: '熱量平衡', hint: '每天 ±0 kcal', kcal: 0 },
    { id: 'normal', label: '微赤字', hint: '每天 −100 kcal', kcal: -100 },
    { id: 'fast', label: '小赤字', hint: '每天 −150 kcal', kcal: -150 },
  ],
}

/** 每公斤體重的蛋白質（g）：身體重組拉到最高 */
export const DEFAULT_PROTEIN: Record<Goal, number> = { lose: 2.0, maintain: 1.6, gain: 1.8, recomp: 2.2 }
export const PROTEIN_LEVELS = [1.2, 1.4, 1.6, 1.8, 2.0, 2.2]

/** InBody 等的骨骼肌重大約是去脂體重的 56%，只知道骨骼肌重時拿來推估 */
export const SMM_TO_FFM = 0.56
/** 碳水最少留這麼多（g），不夠就先降脂肪、再降蛋白質 */
export const MIN_CARBS = 50

export const defaultSpec = (profile?: Profile, weight?: number, bodyFat?: number): BodySpec => ({
  sex: 'female',
  age: 0,
  height: 0,
  weight: weight ?? 55,
  bodyFat,
  activity: 'light',
  goal: profile?.goal ?? 'maintain',
  pace: 'normal',
  preset: 'custom',
  meals: 'three',
  ...profile?.body,
})

export type FfmSource = 'ffm' | 'bodyFat' | 'smm'

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
  /** 各營養素佔總熱量的百分比 */
  pct: { protein: number; carbs: number; fat: number }
  /** 去脂體重（kg）與它是怎麼來的 */
  ffm?: number
  ffmSource?: FfmSource
  /** 用了哪個公式 */
  method: 'katch' | 'mifflin'
  /** 這天目標比每日總消耗多（+）或少（−）多少 */
  delta: number
  /** 熱量被拉到安全下限 */
  floored: boolean
  /** 為了碳水不要太低而調整過的地方（白話） */
  adjusted: string[]
  /** 沒填、先用一般值估算的項目（例如「年齡」「身高」） */
  assumed: string[]
  proteinPerKg: number
}

const round = (n: number, step = 1) => Math.round(n / step) * step
const valid = (n: number | undefined, min: number, max: number): n is number => typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max

/** 檢查輸入；回傳白話的問題清單，空陣列＝沒問題 */
export function validateSpec(s: BodySpec): string[] {
  const e: string[] = []
  if (!valid(s.weight, 25, 300)) e.push('體重要在 25～300 kg 之間')
  if (s.height !== 0 && !valid(s.height, 100, 250)) e.push('身高要在 100～250 cm 之間')
  if (s.age !== 0 && !valid(s.age, 10, 100)) e.push('年齡要在 10～100 歲之間')
  if (s.bodyFat !== undefined && !valid(s.bodyFat, 3, 60)) e.push('體脂率要在 3～60% 之間')
  if (s.smm !== undefined && (!valid(s.smm, 5, 80) || s.smm >= s.weight)) e.push('骨骼肌重要大於 5 kg，而且比體重輕')
  if (s.ffm !== undefined && (!valid(s.ffm, 15, 200) || s.ffm >= s.weight || s.ffm < s.weight * 0.4)) e.push('去脂體重要比體重輕，而且至少是體重的 4 成')
  if (s.proteinPerKg !== undefined && !valid(s.proteinPerKg, 0.8, 3)) e.push('每公斤蛋白質要在 0.8～3 g 之間')
  return e
}

/** 去脂體重：直接填的優先，其次體脂率，最後用骨骼肌重推估 */
export function resolveFfm(s: BodySpec): { ffm: number; source: FfmSource } | undefined {
  if (valid(s.ffm, 15, 200) && s.ffm < s.weight) return { ffm: s.ffm, source: 'ffm' }
  if (valid(s.bodyFat, 3, 60)) return { ffm: s.weight * (1 - s.bodyFat / 100), source: 'bodyFat' }
  if (valid(s.smm, 5, 80) && s.smm < s.weight) return { ffm: Math.min(s.weight * 0.95, s.smm / SMM_TO_FFM), source: 'smm' }
  return undefined
}

/** 沒填的年齡、身高先用一般值 */
const ageOf = (s: BodySpec) => (valid(s.age, 10, 100) ? s.age : 30)
const heightOf = (s: BodySpec) => (valid(s.height, 100, 250) ? s.height : s.sex === 'male' ? 172 : 160)

/** 基礎代謝與每日總消耗（首頁算熱量赤字也用這個） */
export function calcEnergy(s: BodySpec) {
  const f = resolveFfm(s)
  const bmr = f ? 370 + 21.6 * f.ffm : 10 * s.weight + 6.25 * heightOf(s) - 5 * ageOf(s) + (s.sex === 'male' ? 5 : -161)
  const factor = ACTIVITY.find((a) => a.id === s.activity)?.factor ?? 1.375
  return { bmr, tdee: bmr * factor, factor, ffm: f?.ffm, ffmSource: f?.source, method: (f ? 'katch' : 'mifflin') as 'katch' | 'mifflin' }
}

export const goalDelta = (s: BodySpec) => {
  const preset = PRESETS.find((p) => p.id === s.preset)
  if (preset) return preset.kcal
  if (s.goal === 'maintain') return 0
  return (PACES[s.goal].find((p) => p.id === s.pace) ?? PACES[s.goal][1]).kcal
}

export function calcNeeds(s: BodySpec): Needs {
  const h = heightOf(s) / 100
  const bmi = s.weight / (h * h)
  const e = calcEnergy(s)
  const preset = PRESETS.find((p) => p.id === s.preset)
  const delta = goalDelta(s)
  const floor = Math.max(e.bmr, s.sex === 'male' ? 1500 : 1200)
  const raw = e.tdee + delta
  const kcal = round(Math.max(raw, floor), 10)
  const proteinWeight = bmi >= 30 ? 25 * h * h : s.weight
  const adjusted: string[] = []
  let protein: number, fat: number, carbs: number
  if (preset) {
    protein = round((kcal * preset.ratio[0]) / 4)
    carbs = round((kcal * preset.ratio[1]) / 4)
    fat = round((kcal * preset.ratio[2]) / 9)
  } else {
    const perKg = s.proteinPerKg ?? DEFAULT_PROTEIN[s.goal]
    protein = proteinWeight * perKg
    // 脂肪：每公斤 0.9 g，限制在總熱量 20–30%
    fat = Math.min(Math.max(s.weight * 0.9, (kcal * 0.2) / 9), (kcal * 0.3) / 9)
    carbs = (kcal - protein * 4 - fat * 9) / 4
    if (carbs < MIN_CARBS) {
      // 先把脂肪降到下限（20% 或每公斤 0.6 g，取低的）
      const minFat = Math.min((kcal * 0.2) / 9, s.weight * 0.6)
      if (fat > minFat) {
        fat = Math.max(minFat, fat - ((MIN_CARBS - carbs) * 4) / 9)
        adjusted.push('碳水太少，脂肪先降到下限')
      }
      carbs = (kcal - protein * 4 - fat * 9) / 4
    }
    if (carbs < MIN_CARBS) {
      // 再把蛋白質降到每公斤 1.6 g
      const minProtein = proteinWeight * Math.min(perKg, 1.6)
      if (protein > minProtein) {
        protein = Math.max(minProtein, protein - (MIN_CARBS - carbs))
        adjusted.push('碳水還是太少，蛋白質降到每公斤 1.6 g')
      }
      carbs = (kcal - protein * 4 - fat * 9) / 4
    }
    if (carbs < 0) {
      adjusted.push('熱量太低，蛋白質和脂肪就吃滿了，碳水算 0')
      carbs = 0
    }
    protein = round(protein)
    fat = round(fat)
    carbs = round(carbs)
  }
  // 有去脂體重時基礎代謝用不到年齡、身高；身高還會用在 BMI
  const assumed = [...(!valid(s.age, 10, 100) && e.method === 'mifflin' ? ['年齡'] : []), ...(!valid(s.height, 100, 250) ? ['身高'] : [])]
  const total = protein * 4 + carbs * 4 + fat * 9 || 1
  const pct = { protein: Math.round((protein * 400) / total), carbs: Math.round((carbs * 400) / total), fat: Math.round((fat * 900) / total) }
  const perKg = Math.round((protein / s.weight) * 10) / 10
  const fiber = round((kcal / 1000) * 14)
  const water = round(s.weight * 35 + (e.factor >= 1.725 ? 500 : 0), 50)
  return {
    bmr: round(e.bmr),
    tdee: round(e.tdee, 10),
    kcal,
    protein,
    carbs,
    fat,
    fiber,
    water,
    bmi: Math.round(bmi * 10) / 10,
    pct,
    ffm: e.ffm === undefined ? undefined : Math.round(e.ffm * 10) / 10,
    ffmSource: e.ffmSource,
    method: e.method,
    delta,
    floored: raw < floor,
    adjusted,
    assumed,
    proteinPerKg: perKg,
  }
}

/** 介面用：輸入一改就重算；輸入有問題時保留上一次的結果並列出問題 */
export function useNeeds(s: BodySpec) {
  const errors = useMemo(() => validateSpec(s), [s])
  const last = useRef<Needs | null>(null)
  const needs = useMemo(() => {
    if (errors.length && last.current) return last.current
    const n = calcNeeds(s)
    if (!errors.length) last.current = n
    return n
  }, [s, errors])
  return { needs, errors, ok: errors.length === 0 }
}

export const bmiLabel = (bmi: number) => (bmi < 18.5 ? '過輕' : bmi < 24 ? '標準' : bmi < 27 ? '過重' : '肥胖')

/* ───────── 每餐份額：排菜單時挑熱量、蛋白質剛好的料理 ───────── */


export interface Budget {
  kcal: number
  protein: number
}

/** 這天每餐大概該吃多少；有跳過的餐，份額分給其他餐 */
export function mealBudgets(day: ResolvedDay, protein: number, SHARE: Record<MealSlot, number> = MEAL_PATTERNS[0].shares): Partial<Record<MealSlot, Budget>> {
  const eaten = (Object.keys(SHARE) as MealSlot[]).filter((m) => day.meals[m].rule !== 'skip' && SHARE[m] > 0)
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
