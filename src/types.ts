import type { Cuisine, Kind } from './data/cuisine'
import type { FoodImage } from './data/foodImages'
import type { DietPlan } from './lib/dietPlan'
import type { IconName } from './lib/icons'

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack']

export const MEAL_LABEL: Record<MealSlot, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '點心',
}

export const MEAL_IMAGE: Record<MealSlot, FoodImage> = {
  breakfast: 'meal-breakfast',
  lunch: 'meal-lunch',
  dinner: 'meal-dinner',
  snack: 'meal-snack',
}

export const MEAL_ICON: Record<MealSlot, IconName> = {
  breakfast: 'wb_twilight',
  lunch: 'wb_sunny',
  dinner: 'dark_mode',
  snack: 'cookie',
}

export const MEAL_COLOR: Record<MealSlot, string> = {
  breakfast: '#e9b44c',
  lunch: '#e07a5f',
  dinner: '#5f6fd3',
  snack: '#b07d4f',
}

export type Section = 'produce' | 'protein' | 'dairyEgg' | 'grain' | 'pantry'

export const SECTION_LABEL: Record<Section, string> = {
  produce: '蔬菜水果',
  protein: '肉類海鮮',
  dairyEgg: '蛋豆乳製品',
  grain: '米麵主食',
  pantry: '調味乾貨',
}

export const SECTION_IMAGE: Record<Section, FoodImage> = {
  produce: 'leafy-green',
  protein: 'meat',
  dairyEgg: 'egg',
  grain: 'rice',
  pantry: 'salt',
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
  image: FoodImage
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
  cuisine?: Cuisine
  kind?: Kind
  /** 使用者自己新增的食譜 */
  custom?: boolean
  /** 自訂食譜的圖片網址（不上傳，只存網址） */
  photoUrl?: string
  /** 借用另一道食譜的照片（例如品牌蛋白飲用同口味的奶昔照片） */
  photoOf?: string
  /** 品牌產品的營養資料來源網址 */
  sourceUrl?: string
  /** 依產品標示直接指定的過敏原（補食材名稱判斷不到的） */
  allergenTags?: string[]
  createdAt?: number
  /** 外食天地的品項（沒有食材與做法） */
  eatout?: { brandId: string; brand: string; serving?: string; source?: string; sodium?: number; sugar?: number }
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
  /** 飲食計劃（斷食、每餐偏好、運動日、大餐規則），見 lib/dietPlan.ts */
  plan?: Partial<DietPlan>
  /** 口味偏好 */
  taste?: Taste
}

export interface Taste {
  cuisines: Cuisine[]
  kinds: Kind[]
  /** 最愛的食譜 id */
  favorites: string[]
  /** 不想再出現的食譜 id */
  dislikes: string[]
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
  /** 自訂餐點（外食、大餐）時是空字串 */
  recipeId: string
  /** 外食或大餐：自己輸入或請 AI 估算的營養 */
  custom?: { name: string; nutrition: Nutrition }
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

/** 月曆上某一天的標記 */
export interface DayMark {
  date: string
  /** 哪一餐是大餐 */
  feast?: MealSlot | null
  feastNote?: string
  /** 手動指定是否為運動日（沒設定就照每週固定的運動日） */
  training?: boolean
  /** 整天禁食 */
  fast?: boolean
}
