import type { IconName } from './icons'
import type { DayMark, MealSlot, Profile, Recipe } from '../types'
import { addDays, fromKey } from './date'

/** 每一餐的飲食偏好 */
export type MealRule = 'normal' | 'lowCarb' | 'shake' | 'light' | 'skip'

export const MEAL_RULE_LABEL: Record<MealRule | 'feast', string> = {
  normal: '正常吃',
  lowCarb: '不吃澱粉',
  shake: '蛋白飲',
  light: '輕食',
  skip: '不吃',
  feast: '大餐',
}

export const MEAL_RULE_ICON: Record<MealRule | 'feast', IconName> = {
  normal: 'restaurant',
  lowCarb: 'eco',
  shake: 'water_drop',
  light: 'spa',
  skip: 'timer',
  feast: 'celebration',
}

export type Fasting = 'none' | '14:10' | '16:8' | '18:6' | '20:4' | 'omad'

export const FASTING_LABEL: Record<Fasting, string> = {
  none: '不斷食',
  '14:10': '14:10',
  '16:8': '16:8',
  '18:6': '18:6',
  '20:4': '20:4',
  omad: '一日一餐',
}

const EAT_HOURS: Record<Fasting, number> = { none: 24, '14:10': 10, '16:8': 8, '18:6': 6, '20:4': 4, omad: 1.5 }

export interface DietPlan {
  fasting: Fasting
  /** 進食時段開始（從午夜起算的分鐘數） */
  windowStart: number
  meals: Record<MealSlot, MealRule>
  /** 固定的運動日（0 = 週日） */
  trainingDays: number[]
  /** 運動日多吃的熱量 */
  trainingKcal: number
  /** 碳循環：休息日的午晚餐不吃澱粉 */
  carbCycling: boolean
  feast: {
    /** 大餐當天其他餐吃清淡 */
    dayLight: boolean
    /** 大餐之前的餐不吃澱粉 */
    preLowCarb: boolean
    /** 大餐後至少隔幾小時再進食（0 = 不限制） */
    postFastHours: number
  }
}

export const DEFAULT_PLAN: DietPlan = {
  fasting: 'none',
  windowStart: 12 * 60,
  meals: { breakfast: 'normal', lunch: 'normal', dinner: 'normal', snack: 'normal' },
  trainingDays: [],
  trainingKcal: 300,
  carbCycling: false,
  feast: { dayLight: true, preLowCarb: false, postFastHours: 0 },
}

export const getPlan = (profile?: Profile | null): DietPlan => ({
  ...DEFAULT_PLAN,
  ...profile?.plan,
  meals: { ...DEFAULT_PLAN.meals, ...profile?.plan?.meals },
  feast: { ...DEFAULT_PLAN.feast, ...profile?.plan?.feast },
})

/** 每餐的大約時間（分鐘），用來判斷是否落在斷食時段 */
export const MEAL_TIME: Record<MealSlot, number> = {
  breakfast: 8 * 60,
  lunch: 12 * 60 + 30,
  snack: 15 * 60 + 30,
  dinner: 18 * 60 + 30,
}

export const fmtTime = (min: number) => {
  const m = ((Math.round(min) % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

export interface MealDecision {
  rule: MealRule | 'feast'
  reason?: string
}

export interface ResolvedDay {
  date: string
  training: boolean
  fastDay: boolean
  feastMeal?: MealSlot
  feastNote?: string
  meals: Record<MealSlot, MealDecision>
  kcal: number
  /** 進食時段（分鐘）；不斷食時沒有 */
  window?: { start: number; end: number }
  /** 因為大餐而延後的「最早可以吃」時間（今天的分鐘數，可能大於 1440 表示明天） */
  eatAfter?: number
}

const ORDER: MealSlot[] = ['breakfast', 'lunch', 'snack', 'dinner']

/** 依照設定 + 月曆標記，算出某一天每餐該怎麼吃 */
export function resolveDay(date: string, profile: Profile, marks: Record<string, DayMark | undefined>): ResolvedDay {
  const plan = getPlan(profile)
  const mark = marks[date]
  const prev = marks[addDays(date, -1)]
  const dow = fromKey(date).getDay()
  const training = mark?.training ?? plan.trainingDays.includes(dow)
  const meals = Object.fromEntries(ORDER.map((m) => [m, { rule: plan.meals[m] } as MealDecision])) as Record<
    MealSlot,
    MealDecision
  >
  const set = (m: MealSlot, rule: MealDecision['rule'], reason: string) => (meals[m] = { rule, reason })
  const isOn = (m: MealSlot) => meals[m].rule !== 'skip'

  if (plan.carbCycling && !training) {
    for (const m of ['lunch', 'dinner'] as MealSlot[]) if (meals[m].rule === 'normal') set(m, 'lowCarb', '休息日少澱粉')
  }

  let window: ResolvedDay['window']
  if (plan.fasting !== 'none') {
    window = { start: plan.windowStart, end: plan.windowStart + EAT_HOURS[plan.fasting] * 60 }
    for (const m of ORDER) {
      const t = MEAL_TIME[m]
      if (t < window.start || t > window.end) set(m, 'skip', `${FASTING_LABEL[plan.fasting]} 斷食時段`)
    }
  }

  const fastDay = !!mark?.fast
  if (fastDay) for (const m of ORDER) set(m, 'skip', '禁食日')

  const feastMeal = mark?.feast ?? undefined
  let eatAfter: number | undefined

  // 昨天的大餐：今天要等到幾點才能吃
  if (prev?.feast && plan.feast.postFastHours > 0) {
    const end = MEAL_TIME[prev.feast] + plan.feast.postFastHours * 60 - 1440
    if (end > 0) {
      eatAfter = end
      for (const m of ORDER) if (MEAL_TIME[m] < end && isOn(m)) set(m, 'skip', `大餐後 ${plan.feast.postFastHours} 小時不進食`)
    }
  }

  if (feastMeal && !fastDay) {
    const ft = MEAL_TIME[feastMeal]
    for (const m of ORDER) {
      if (m === feastMeal || !isOn(m)) continue
      if (plan.feast.postFastHours > 0 && MEAL_TIME[m] > ft) {
        set(m, 'skip', `大餐後 ${plan.feast.postFastHours} 小時不進食`)
      } else if (meals[m].rule === 'shake') {
        continue
      } else if (plan.feast.dayLight && m !== 'snack') {
        set(m, 'light', '大餐日其他餐清淡')
      } else if (plan.feast.preLowCarb && MEAL_TIME[m] < ft && meals[m].rule === 'normal') {
        set(m, 'lowCarb', '大餐前不吃澱粉')
      }
    }
    set(feastMeal, 'feast', mark?.feastNote || '今天有大餐')
    if (plan.feast.postFastHours > 0) eatAfter = Math.max(eatAfter ?? 0, ft + plan.feast.postFastHours * 60)
  }

  return {
    date,
    training,
    fastDay,
    feastMeal,
    feastNote: mark?.feastNote,
    meals,
    kcal: profile.kcal + (training ? plan.trainingKcal : 0),
    window,
    eatAfter,
  }
}

/** 食譜是否符合某條規則 */
export const fitsRule = (recipe: Recipe, rule: MealDecision['rule']) => {
  const shake = recipe.tags.includes('蛋白飲')
  switch (rule) {
    case 'shake':
      return shake
    case 'lowCarb':
      return recipe.nutrition.carbs <= 20 && !shake
    case 'light':
      return recipe.nutrition.kcal <= 350 && recipe.nutrition.carbs <= 30
    case 'skip':
    case 'feast':
      return false
    default:
      return !shake
  }
}

export const ruleDescription = (plan: DietPlan) => {
  const parts: string[] = []
  if (plan.fasting !== 'none') {
    parts.push(
      `${FASTING_LABEL[plan.fasting]}（${fmtTime(plan.windowStart)}–${fmtTime(plan.windowStart + EAT_HOURS[plan.fasting] * 60)}）`,
    )
  }
  const special = (Object.entries(plan.meals) as [MealSlot, MealRule][]).filter(([, r]) => r !== 'normal')
  if (special.length) parts.push(`${special.length} 餐有偏好`)
  if (plan.trainingDays.length) parts.push(`每週運動 ${plan.trainingDays.length} 天`)
  if (plan.carbCycling) parts.push('碳循環')
  if (plan.feast.postFastHours) parts.push(`大餐後禁食 ${plan.feast.postFastHours}h`)
  return parts.length ? parts.join('・') : '還沒設定，點一下開始'
}
