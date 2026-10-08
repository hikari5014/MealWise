import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { HealthTip } from '../components/BodyCard'
import { AiEstimateSheet } from '../components/AiEstimate'
import { DietPlanSheet, RuleBadge, TodayPlanCard } from '../components/DietPlan'
import { RecipePicker } from '../components/RecipePicker'
import { useShare } from '../components/Share'
import { Icon } from '../components/Icon'
import { RowPhoto, useRecipeDetail } from '../components/RecipeDetail'
import { CountUp, MacroBar, Ring } from '../components/Ring'
import { Card, CheckButton, useToast } from '../components/ui'
import { WaterCup } from '../components/WaterCup'
import { RECIPE_MAP } from '../data/recipes'
import { db } from '../db'
import { greeting, monthDay, todayKey, weekdayLabel } from '../lib/date'
import { haptic, spring } from '../lib/feedback'
import { resolveDay } from '../lib/dietPlan'
import { actions, useLogs, useMarks, usePlans, useRecent, useWater } from '../lib/hooks'
import { macroTargets, PORTIONS, sumNutrition } from '../lib/meal'
import { MEAL_COLOR, MEAL_ICON, MEAL_LABEL, MEAL_SLOTS, type LogEntry, type MealSlot, type PlanEntry, type Profile } from '../types'

export default function Today({ profile, onGoPlan }: { profile: Profile; onGoPlan: () => void }) {
  const date = todayKey()
  const dates = useMemo(() => [date], [date])
  const plans = usePlans(dates)
  const logs = useLogs(dates)
  const water = useWater(date)
  const recent = useRecent()
  const toast = useToast()
  const share = useShare()
  const [picking, setPicking] = useState<MealSlot | null>(null)
  const [eatOut, setEatOut] = useState<MealSlot | null>(null)
  const [planSheet, setPlanSheet] = useState(false)
  const marks = useMarks(dates)
  const day = resolveDay(date, profile, marks)

  const total = sumNutrition(logs)
  const targets = macroTargets({ ...profile, kcal: day.kcal })
  const left = Math.round(day.kcal - total.kcal)

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
    toast(`已移除 ${log.custom?.name ?? RECIPE_MAP[log.recipeId]?.name}`, () => actions.restoreLog(log))
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
          {profile.name ? `，${profile.name}` : ''}
          <Icon name="waving_hand" size={28} fill className="ml-1 align-[-4px] text-honey" motion="wiggle" />
        </h1>
      </header>

      <Card className="flex items-center gap-5">
        <Ring value={total.kcal} target={day.kcal}>
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

      <TodayPlanCard day={day} onOpenSettings={() => setPlanSheet(true)} />

      <Card>
        <WaterCup ml={water} target={profile.waterMl} onAdd={(d) => actions.addWater(date, d)} />
      </Card>

      <HealthTip />

      {plans.length === 0 && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onGoPlan}
          className="w-full rounded-3xl border-2 border-dashed border-leaf/40 p-4 text-left text-sm text-leaf-dark"
        >
          <span className="flex items-center gap-2">
            <Icon name="event_available" size={22} motion="bounce" />
            <span className="flex-1">今天還沒排菜單，先去排一下，之後吃飯只要打勾就好</span>
            <Icon name="arrow_forward" size={20} />
          </span>
        </motion.button>
      )}
      {plans.length === 0 && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={share.openScanner}
          className="-mt-2 flex w-full items-center justify-center gap-1.5 py-1 text-xs text-muted"
        >
          <Icon name="qr_code_scanner" size={16} />
          或掃描朋友分享的菜單 QR Code
        </motion.button>
      )}

      {MEAL_SLOTS.map((meal) => {
        const mealPlans = plans.filter((p) => p.meal === meal)
        const extra = logs.filter((l) => l.meal === meal && !l.planId)
        const mealKcal = sumNutrition(logs.filter((l) => l.meal === meal)).kcal
        return (
          <section key={meal}>
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <h2 className="flex items-center gap-2 font-bold">
                <MealTitle meal={meal} />
                <RuleBadge decision={day.meals[meal]} compact />
              </h2>
              <span className="text-xs tabular-nums text-muted">{Math.round(mealKcal)} kcal</span>
            </div>
            {day.meals[meal].rule === 'skip' && !mealPlans.length && !extra.length && (
              <p className="mb-1 flex items-center gap-1.5 px-1 text-xs text-muted">
                <Icon name="hourglass_top" size={15} />
                {day.meals[meal].reason}，這餐先跳過
              </p>
            )}
            {day.meals[meal].rule === 'feast' && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setEatOut(meal)}
                className="mb-2 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-br from-tomato-soft to-honey-soft p-3 text-left shadow-card"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-tomato">
                  <Icon name="celebration" size={24} fill motion="wiggle" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-bold">今天的大餐{day.feastNote ? `：${day.feastNote}` : ''}</span>
                  <span className="block text-xs text-ink/70">吃完拍張照，請 AI 幫你估熱量</span>
                </span>
                <Icon name="smart_toy" size={22} className="text-tomato" />
              </motion.button>
            )}
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
                {extra.map((log) =>
                  log.custom ? (
                    <CustomRow key={`l${log.id}`} log={log} onRemove={() => removeLog(log)} />
                  ) : (
                  <MealRow
                    key={`l${log.id}`}
                    recipeId={log.recipeId}
                    layoutId={`today-l${log.id}`}
                    done
                    portion={log.portion}
                    onToggle={() => removeLog(log)}
                    onPortion={() => cyclePortion(log)}
                  />
                  ),
                )}
              </AnimatePresence>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setPicking(meal)}
                className="w-full rounded-2xl py-2.5 text-sm text-muted transition-colors hover:bg-ink/5"
              >
                <span className="flex items-center justify-center gap-1">
                  <Icon name="add" size={18} />
                  {mealPlans.length ? '吃了別的' : '快速記錄'}
                </span>
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
        rule={picking ? day.meals[picking].rule : undefined}
        onEatOut={() => setEatOut(picking)}
        onClose={() => setPicking(null)}
        title={picking ? `${MEAL_LABEL[picking]}吃了什麼？` : ''}
        onPick={async (r) => {
          if (!picking) return
          haptic([10, 30, 14])
          const id = await actions.log(date, picking, r.id)
          toast(`已記錄 ${r.name}`, () => db.logs.delete(id))
        }}
      />
      <AiEstimateSheet open={eatOut !== null} meal={eatOut} date={date} onClose={() => setEatOut(null)} />
      <DietPlanSheet open={planSheet} onClose={() => setPlanSheet(false)} profile={profile} />
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
      className={`relative flex min-h-[72px] items-center gap-3 overflow-hidden rounded-2xl py-3 pl-4 pr-3 shadow-card transition-colors ${
        done ? 'bg-leaf-soft' : 'bg-white'
      }`}
    >
      <RowPhoto recipe={recipe} layoutId={layoutId} dim={done} />
      <div className="relative min-w-0 flex-1">
        <button
          onClick={() => openDetail(recipe.id, layoutId)}
          className={`block max-w-full truncate text-left font-medium transition-opacity ${done ? 'opacity-70' : ''}`}
        >
          {recipe.name}
        </button>
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
                  {portionLabel}
                  <Icon name="swap_vert" size={13} className="ml-0.5 align-[-2px]" />
                </motion.span>
              </AnimatePresence>
            </motion.button>
          )}
        </div>
      </div>
      <div className="relative">
        <CheckButton checked={done} onToggle={onToggle} />
      </div>
    </motion.div>
  )
}

export function MealTitle({ meal }: { meal: MealSlot }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="grid h-7 w-7 place-items-center rounded-lg"
        style={{ backgroundColor: `${MEAL_COLOR[meal]}22`, color: MEAL_COLOR[meal] }}
      >
        <Icon name={MEAL_ICON[meal]} size={18} fill />
      </span>
      {MEAL_LABEL[meal]}
    </span>
  )
}

function CustomRow({ log, onRemove }: { log: LogEntry; onRemove: () => void }) {
  const c = log.custom!
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.18 } }}
      transition={spring}
      className="relative flex min-h-[72px] items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-white via-white to-tomato-soft py-3 pl-4 pr-3 shadow-card"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 truncate font-medium">
          <Icon name="ramen_dining" size={18} fill className="shrink-0 text-tomato" />
          <span className="truncate">{c.name}</span>
        </div>
        <div className="text-xs tabular-nums text-muted">
          {Math.round(c.nutrition.kcal)} kcal・蛋白質 {c.nutrition.protein}g・碳水 {c.nutrition.carbs}g
        </div>
      </div>
      <div className="relative">
        <CheckButton checked onToggle={onRemove} />
      </div>
    </motion.div>
  )
}
