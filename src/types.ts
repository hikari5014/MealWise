export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack']

export const MEAL_LABEL: Record<MealSlot, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '點心',
}

export const MEAL_EMOJI: Record<MealSlot, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍪',
}

export type Section = 'produce' | 'protein' | 'dairyEgg' | 'grain' | 'pantry'

export const SECTION_LABEL: Record<Section, string> = {
  produce: '🥬 蔬菜水果',
  protein: '🍗 肉類海鮮',
  dairyEgg: '🥚 蛋豆乳製品',
  grain: '🍚 米麵主食',
  pantry: '🧂 調味乾貨',
}

export const SECTION_ORDER: Section[] = ['produce', 'protein', 'dairyEgg', 'grain', 'pantry']

export interface Nutrition {
  kcal: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

export interface Ingredient {
  name: string
  qty: number
  unit: string
  section: Section
}

export interface PrepTask {
  task: string
  keep: string
}

export interface Recipe {
  id: string
  name: string
  emoji: string
  color: string
  meals: MealSlot[]
  minutes: number
  tags: string[]
  vegetarian: boolean
  /** 1 人份 */
  ingredients: Ingredient[]
  steps: string[]
  prep: PrepTask[]
  /** 1 人份 */
  nutrition: Nutrition
}

export type Goal = 'lose' | 'maintain' | 'gain'

export const GOAL_LABEL: Record<Goal, string> = {
  lose: '輕盈減脂',
  maintain: '均衡維持',
  gain: '增肌補能',
}

export interface Profile {
  id: 'me'
  name: string
  goal: Goal
  kcal: number
  waterMl: number
  vegetarian: boolean
  /** 過敏或不想吃的細項 id，見 data/avoid.ts */
  avoid: string[]
  servings: number
}

export interface PlanEntry {
  id?: number
  date: string
  meal: MealSlot
  recipeId: string
}

export interface LogEntry {
  id?: number
  date: string
  meal: MealSlot
  recipeId: string
  planId?: number
  portion: number
  createdAt: number
}

export interface WaterDay {
  date: string
  ml: number
}

export interface Check {
  key: string
  checked: boolean
}

export interface BodyRecord {
  date: string
  weight?: number
  bodyFat?: number
  steps?: number
  activeKcal?: number
  source: 'health' | 'manual'
  updatedAt: number
}

export interface Pref {
  key: string
  value: unknown
}
