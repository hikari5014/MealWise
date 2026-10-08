import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { RecipePicker } from '../components/RecipePicker'
import { RecipeThumb, useRecipeDetail } from '../components/RecipeDetail'
import { CountUp, MacroBar, Ring } from '../components/Ring'
import { Card, CheckButton, useToast } from '../components/ui'
import { WaterCup } from '../components/WaterCup'
import { RECIPE_MAP } from '../data/recipes'
import { db } from '../db'
import { greeting, monthDay, todayKey, weekdayLabel } from '../lib/date'
import { haptic, spring } from '../lib/feedback'
import { actions, useLogs, usePlans, useRecent, useWater } from '../lib/hooks'
import { macroTargets, PORTIONS, sumNutrition } from '../lib/meal'
import { MEAL_EMOJI, MEAL_LABEL, MEAL_SLOTS, type LogEntry, type MealSlot, type PlanEntry, type Profile } from '../types'

export default function Today({ profile, onGoPlan }: { profile: Profile; onGoPlan: () => void }) {
  const date = todayKey()
  const dates = useMemo(() => [date], [date])
  const plans = usePlans(dates)
  const logs = useLogs(dates)
  const water = useWater(date)
  const recent = useRecent()
  const toast = useToast()
  const [picking, setPicking] = useState<MealSlot | null>(null)

  const total = sumNutrition(logs)
  const targets = macroTargets(profile)
  const left = Math.round(profile.kcal - total.kcal)

  const togglePlan = async (plan: PlanEntry) => {
    const done = logs.find((l) => l.planId === plan.id)
    if (done) {
      await db.logs.delete(done.id!)
    } else {
      await actions.log(date, plan.meal, plan.recipeId, plan.id)
      toast(`已記錄 ${RECIPE_MAP[plan.recipeId]?.name}`)
    }
  }

  const removeLog = async (log: LogEntry) => {
    await db.logs.delete(log.id!)
    toast(`已移除 ${RECIPE_MAP[log.recipeId]?.name}`, () => actions.restoreLog(log))
  }

  const cyclePortion = async (log: LogEntry) => {
    const idx = PORTIONS.findIndex((p) => p.value === log.portion)
    const next = PORTIONS[(idx + 1) % PORTIONS.length]
    haptic(6)
    await db.logs.update(log.id!, { portion: next.value })
  }

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <div className="text-sm text-muted">
          {monthDay(date)}（{weekdayLabel(date)}）
        </div>
        <h1 className="text-2xl font-bold">
          {greeting()}
          {profile.name ? `，${profile.name}` : ''} 👋
        </h1>
      </header>

      <Card className="flex items-center gap-5">
        <Ring value={total.kcal} target={profile.kcal}>
          <div>
            <div className="text-3xl font-bold tabular-nums">
              <CountUp value={Math.abs(left)} />
            </div>
            <div className="text-xs text-muted">{left >= 0 ? '還可以吃 kcal' : '超過 kcal'}</div>
          </div>
        </Ring>
        <div className="flex-1 space-y-3">
          <MacroBar label="蛋白質" value={total.protein} target={targets.protein} color="#e07a5f" />
          <MacroBar label="碳水" value={total.carbs} target={targets.carbs} color="#e9b44c" />
          <MacroBar label="脂肪" value={total.fat} target={targets.fat} color="#5fa8d3" />
          <MacroBar label="纖維" value={total.fiber} target={targets.fiber} color="#5b8c5a" />
        </div>
      </Card>

      <Card>
        <WaterCup ml={water} target={profile.waterMl} onAdd={(d) => actions.addWater(date, d)} />
      </Card>

      {plans.length === 0 && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onGoPlan}
          className="w-full rounded-3xl border-2 border-dashed border-leaf/40 p-4 text-left text-sm text-leaf-dark"
        >
          📅 今天還沒排菜單，先去排一下，之後吃飯只要打勾就好 →
        </motion.button>
      )}

      {MEAL_SLOTS.map((meal) => {
        const mealPlans = plans.filter((p) => p.meal === meal)
        const extra = logs.filter((l) => l.meal === meal && !l.planId)
        const mealKcal = sumNutrition(logs.filter((l) => l.meal === meal)).kcal
        return (
          <section key={meal}>
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="font-bold">
                {MEAL_EMOJI[meal]} {MEAL_LABEL[meal]}
              </h2>
              <span className="text-xs tabular-nums text-muted">{Math.round(mealKcal)} kcal</span>
            </div>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {mealPlans.map((plan) => {
                  const log = logs.find((l) => l.planId === plan.id)
                  return (
                    <MealRow
                      key={`p${plan.id}`}
                      recipeId={plan.recipeId}
                      layoutId={`today-p${plan.id}`}
                      done={!!log}
                      portion={log?.portion}
                      onToggle={() => togglePlan(plan)}
                      onPortion={log ? () => cyclePortion(log) : undefined}
                    />
                  )
                })}
                {extra.map((log) => (
                  <MealRow
                    key={`l${log.id}`}
                    recipeId={log.recipeId}
                    layoutId={`today-l${log.id}`}
                    done
                    portion={log.portion}
                    onToggle={() => removeLog(log)}
                    onPortion={() => cyclePortion(log)}
                  />
                ))}
              </AnimatePresence>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setPicking(meal)}
                className="w-full rounded-2xl py-2.5 text-sm text-muted transition-colors hover:bg-ink/5"
              >
                ＋ {mealPlans.length ? '吃了別的' : '快速記錄'}
              </motion.button>
            </div>
          </section>
        )
      })}

      <RecipePicker
        open={picking !== null}
        meal={picking}
        profile={profile}
        recent={recent}
        onClose={() => setPicking(null)}
        title={picking ? `${MEAL_LABEL[picking]}吃了什麼？` : ''}
        onPick={async (r) => {
          if (!picking) return
          haptic([10, 30, 14])
          const id = await actions.log(date, picking, r.id)
          toast(`已記錄 ${r.name}`, () => db.logs.delete(id))
        }}
      />
    </div>
  )
}

function MealRow({
  recipeId,
  layoutId,
  done,
  portion,
  onToggle,
  onPortion,
}: {
  recipeId: string
  layoutId: string
  done: boolean
  portion?: number
  onToggle: () => void
  onPortion?: () => void
}) {
  const recipe = RECIPE_MAP[recipeId]
  const openDetail = useRecipeDetail()
  if (!recipe) return null
  const portionLabel = PORTIONS.find((p) => p.value === portion)?.label
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.18 } }}
      transition={spring}
      className={`flex items-center gap-3 rounded-2xl p-2 pr-3 shadow-card transition-colors ${done ? 'bg-leaf-soft/70' : 'bg-white'}`}
    >
      <button onClick={() => openDetail(recipe.id, layoutId)} aria-label={`查看${recipe.name}`}>
        <RecipeThumb recipe={recipe} layoutId={layoutId} />
      </button>
      <div className="min-w-0 flex-1">
        <div className={`truncate font-medium transition-opacity ${done ? 'opacity-70' : ''}`}>{recipe.name}</div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="tabular-nums">{Math.round(recipe.nutrition.kcal * (portion ?? 1))} kcal</span>
          {onPortion && portionLabel && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onPortion}
              className="rounded-full bg-white px-2 py-0.5 text-leaf-dark shadow-sm"
              aria-label="切換份量"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={portionLabel}
                  initial={{ y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -6, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="inline-block"
                >
                  {portionLabel} ⇅
                </motion.span>
              </AnimatePresence>
            </motion.button>
          )}
        </div>
      </div>
      <CheckButton checked={done} onToggle={onToggle} />
    </motion.div>
  )
}
