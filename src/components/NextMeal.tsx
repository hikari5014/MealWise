import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { RECIPE_MAP } from '../data/recipes'
import { fitsRule, MEAL_TIME, type ResolvedDay } from '../lib/dietPlan'
import { haptic, spring } from '../lib/feedback'
import { actions } from '../lib/hooks'
import { recipesFor, tasteScore } from '../lib/meal'
import { fitScore, mealShares, type Budget } from '../lib/nutrition'
import { MEAL_LABEL, type LogEntry, type MealSlot, type Nutrition, type PlanEntry, type Profile, type Recipe } from '../types'
import { Icon } from './Icon'
import { useRecipeDetail } from './RecipeDetail'
import { RecipePhoto } from './RecipePhoto'
import { Card, Tap, useToast } from './ui'

const MAIN: MealSlot[] = ['breakfast', 'lunch', 'dinner']
/** 過了這餐時間多久就當作錯過 */
const GRACE = 90

/**
 * 下一餐要吃什麼：看現在幾點、今天還剩多少熱量和蛋白質，
 * 分給還沒吃的餐，挑 3 道最剛好的。
 */
export function nextMealPlan(day: ResolvedDay, logs: LogEntry[], total: Nutrition, proteinTarget: number, SHARE: Record<MealSlot, number>, now = new Date()) {
  const min = now.getHours() * 60 + now.getMinutes()
  const eaten = (m: MealSlot) => logs.some((l) => l.meal === m)
  const open = (m: MealSlot) => day.meals[m].rule !== 'skip' && day.meals[m].rule !== 'feast' && !eaten(m)
  const left = { kcal: day.kcal - total.kcal, protein: proteinTarget - total.protein }
  const remaining = MAIN.filter((m) => open(m) && SHARE[m] > 0 && MEAL_TIME[m] + GRACE > min)
  let meal: MealSlot | undefined = remaining[0]
  let budget: Budget
  if (meal) {
    // 點心的份額先留著，不要全部塞進正餐
    const snack = day.meals.snack.rule !== 'skip' && !eaten('snack') ? SHARE.snack : 0
    const share = remaining.reduce((t, m) => t + SHARE[m], 0) + snack
    budget = { kcal: (left.kcal * SHARE[meal]) / share, protein: (left.protein * SHARE[meal]) / share }
  } else if (left.kcal >= 150 && day.meals.snack.rule !== 'skip') {
    // 三餐都過了，還有額度就推點心
    meal = 'snack'
    budget = { kcal: Math.min(left.kcal, 350), protein: Math.max(left.protein, 5) }
  } else return null
  return { meal, budget: { kcal: Math.max(budget.kcal, 120), protein: Math.max(budget.protein, 0) }, left }
}

export function NextMealCard({
  day,
  logs,
  plans,
  total,
  proteinTarget,
  profile,
  date,
}: {
  day: ResolvedDay
  logs: LogEntry[]
  plans: PlanEntry[]
  total: Nutrition
  proteinTarget: number
  profile: Profile
  date: string
}) {
  const toast = useToast()
  const openDetail = useRecipeDetail()
  const [seed, setSeed] = useState(0)
  const next = nextMealPlan(day, logs, total, proteinTarget, mealShares(profile))
  const planned = next ? plans.filter((p) => p.meal === next.meal).map((p) => RECIPE_MAP[p.recipeId]).filter(Boolean) : []

  const options = useMemo(() => {
    if (!next) return []
    const rule = day.meals[next.meal].rule
    let pool = recipesFor(next.meal, profile).filter((r) => fitsRule(r, rule))
    if (pool.length < 3) pool = recipesFor(null, profile).filter((r) => fitsRule(r, rule))
    const today = new Set(logs.map((l) => l.recipeId))
    const ranked = pool
      .filter((r) => !today.has(r.id))
      .map((r) => ({ r, s: fitScore(r.nutrition, next.budget) * 2 + tasteScore(r, profile) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 9)
    // 換一批：在前 9 名裡輪流拿 3 個
    return [0, 1, 2].map((i) => ranked[(seed * 3 + i) % ranked.length]?.r).filter((r): r is Recipe => !!r)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next?.meal, Math.round((next?.budget.kcal ?? 0) / 50), seed, profile, logs.length])

  if (!next || !options.length) return null
  const { meal, budget, left } = next

  const eat = async (r: Recipe) => {
    haptic([8, 30, 8])
    await actions.log(date, meal, r.id)
    toast(`已記錄 ${MEAL_LABEL[meal]}：${r.name}`)
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-1.5 font-bold">
            <Icon name="auto_awesome" size={20} fill className="text-honey" />
            下一餐建議・{MEAL_LABEL[meal]}
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            今天還剩 {Math.max(0, Math.round(left.kcal))} kcal・蛋白質 {Math.max(0, Math.round(left.protein))} g
            {meal !== 'snack' && <>，這餐大約吃 <b className="text-ink">{Math.round(budget.kcal)}</b> kcal</>}
          </p>
        </div>
        <Tap
          onClick={() => {
            haptic(6)
            setSeed((s) => s + 1)
          }}
          className="flex shrink-0 items-center gap-0.5 rounded-full bg-leaf-soft/60 px-2.5 py-1 text-[11px] text-leaf-dark"
        >
          <Icon name="refresh" size={14} />
          換一批
        </Tap>
      </div>
      {planned.length > 0 && <p className="mt-2 rounded-2xl bg-cream px-3 py-2 text-xs text-muted">已經排了「{planned.map((r) => r!.name).join('、')}」，想換的話可以參考：</p>}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {options.map((r, i) => {
            const off = r.nutrition.kcal / budget.kcal
            const tag = off < 0.8 ? '偏少' : off > 1.2 ? '偏多' : '剛好'
            return (
              <motion.div
                key={`${seed}-${r.id}`}
                layout
                initial={{ opacity: 0, y: 14, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ ...spring, delay: i * 0.05 }}
                className="flex flex-col overflow-hidden rounded-2xl bg-cream"
              >
                <Tap press={0.96} onClick={() => openDetail(r.id, `next-${r.id}`)} className="text-left">
                  <motion.div layoutId={`next-${r.id}`} className="relative aspect-square">
                    <RecipePhoto recipe={r} />
                    <span
                      className={`absolute left-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold shadow ${
                        tag === '剛好' ? 'bg-leaf text-on-leaf' : 'bg-card/90 text-muted'
                      }`}
                    >
                      {tag}
                    </span>
                  </motion.div>
                  <div className="px-2 pt-1.5">
                    <div className="line-clamp-2 text-xs font-medium leading-snug">{r.name}</div>
                    <div className="mt-0.5 text-[10px] tabular-nums text-muted">
                      {r.nutrition.kcal} kcal・蛋白 {r.nutrition.protein}g
                    </div>
                  </div>
                </Tap>
                <Tap onClick={() => eat(r)} className="m-1.5 mt-1 rounded-xl bg-card py-1 text-[11px] text-leaf-dark shadow-sm">
                  吃這個
                </Tap>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </Card>
  )
}
