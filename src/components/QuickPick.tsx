import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { RECIPE_MAP } from '../data/recipes'
import { db } from '../db'
import { addDays, monthDay, weekdayLabel } from '../lib/date'
import { fitsRule, MEAL_RULE_LABEL, resolveDay } from '../lib/dietPlan'
import { haptic } from '../lib/feedback'
import { recipesFor, tasteScore } from '../lib/meal'
import { MEAL_LABEL, type DayMark, type MealSlot, type PlanEntry, type Profile, type Recipe } from '../types'
import { Icon } from './Icon'
import { RecipePhoto } from './RecipePhoto'
import { Button, Sheet, Tap, useToast } from './ui'

interface Slot {
  date: string
  meal: MealSlot
  rule: ReturnType<typeof resolveDay>['meals'][MealSlot]['rule']
}

const MEALS: MealSlot[] = ['breakfast', 'lunch', 'dinner']

/** 這幾天還空著、而且依飲食計劃要吃的餐 */
export const emptySlots = (days: string[], plans: PlanEntry[], profile: Profile, marks: Record<string, DayMark | undefined>): Slot[] =>
  days.flatMap((date) => {
    const day = resolveDay(date, profile, marks)
    return MEALS.filter((m) => !plans.some((p) => p.date === date && p.meal === m))
      .map((meal) => ({ date, meal, rule: day.meals[meal].rule }))
      .filter((s) => s.rule !== 'skip' && s.rule !== 'feast')
  })

/** 一餐給 3 個建議：符合規則、偏好優先、這週還沒排過的優先 */
const suggest = (slot: Slot, profile: Profile, used: Map<string, number>, seed: number): Recipe[] => {
  let pool = recipesFor(slot.meal, profile).filter((r) => fitsRule(r, slot.rule))
  if (pool.length < 3) pool = recipesFor(null, profile).filter((r) => fitsRule(r, slot.rule))
  const scored = pool
    .map((r) => ({ r, s: tasteScore(r, profile) * 3 - (used.get(r.id) ?? 0) * 4 + ((r.id.length * 7 + seed * 13) % 11) / 3 }))
    .sort((a, b) => b.s - a.s)
  // 前面幾名裡隨機挑 3 個，換一批時才會不一樣
  const top = scored.slice(0, 12)
  const out: Recipe[] = []
  let k = seed
  while (out.length < 3 && top.length) {
    k = (k * 31 + 7) % 997
    out.push(top.splice(k % Math.min(top.length, 6), 1)[0].r)
  }
  return out
}

/**
 * 快速挑選：一餐一餐跳出 3 個建議，點一下就排進去。
 * 比「隨機排滿再一個個改」快很多。
 */
export function QuickPickSheet({
  open,
  onClose,
  days,
  plans,
  profile,
  marks,
}: {
  open: boolean
  onClose: () => void
  days: string[]
  plans: PlanEntry[]
  profile: Profile
  marks: Record<string, DayMark | undefined>
}) {
  const toast = useToast()
  const [slots, setSlots] = useState<Slot[]>([])
  const [index, setIndex] = useState(0)
  const [seed, setSeed] = useState(1)
  const [added, setAdded] = useState<number[]>([])
  const [used, setUsed] = useState(new Map<string, number>())

  useEffect(() => {
    if (!open) return
    setSlots(emptySlots(days, plans, profile, marks))
    setIndex(0)
    setSeed(Math.floor(Math.random() * 100))
    setAdded([])
    const m = new Map<string, number>()
    plans.forEach((p) => m.set(p.recipeId, (m.get(p.recipeId) ?? 0) + 1))
    setUsed(m)
    // 只在打開時取一次快照，挑選過程中新增的不要讓清單跳動
  }, [open])

  const slot = slots[index]
  const options = useMemo(() => (slot ? suggest(slot, profile, used, seed + index) : []), [slot, profile, used, seed, index])
  const yesterday = slot ? plans.find((p) => p.date === addDays(slot.date, -1) && p.meal === slot.meal) : undefined
  const sameAsYesterday = yesterday ? RECIPE_MAP[yesterday.recipeId] : undefined

  const next = () => {
    setIndex((i) => i + 1)
    setSeed((s) => s + 1)
  }

  const pick = async (r: Recipe) => {
    if (!slot) return
    haptic([8, 24, 8])
    const id = (await db.plans.add({ date: slot.date, meal: slot.meal, recipeId: r.id })) as number
    setAdded((a) => [...a, id])
    setUsed((m) => new Map(m).set(r.id, (m.get(r.id) ?? 0) + 1))
    next()
  }

  const finish = () => {
    onClose()
    if (added.length) toast(`排好了 ${added.length} 餐`, () => db.plans.bulkDelete(added))
  }

  return (
    <Sheet open={open} onClose={finish} title="快速挑選">
      {slots.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted">
          <Icon name="task_alt" size={44} fill className="text-leaf" motion="pop" />
          <p className="mt-2">這段時間都排好了</p>
        </div>
      ) : !slot ? (
        <div className="space-y-4 py-6 text-center">
          <Icon name="celebration" size={52} fill className="text-tomato" motion="pop" />
          <p className="font-bold">完成！排好了 {added.length} 餐</p>
          <Button className="w-full" onClick={finish}>
            好
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-1">
            {slots.map((_, i) => (
              <motion.span
                key={i}
                className="h-1.5 flex-1 rounded-full"
                animate={{ backgroundColor: i < index ? '#5b8c5a' : i === index ? '#e9b44c' : 'rgba(47,42,36,0.1)' }}
              />
            ))}
          </div>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={`${slot.date}-${slot.meal}-${seed}`}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="space-y-3"
            >
              <div className="flex items-baseline justify-between">
                <div className="text-lg font-bold">
                  {monthDay(slot.date)}（{weekdayLabel(slot.date)}）{MEAL_LABEL[slot.meal]}
                </div>
                {slot.rule !== 'normal' && <span className="text-xs text-leaf-dark">{MEAL_RULE_LABEL[slot.rule]}</span>}
              </div>
              {options.map((r, i) => (
                <motion.button
                  key={r.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 30, delay: i * 0.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => pick(r)}
                  className="relative flex h-24 w-full items-end overflow-hidden rounded-3xl text-left shadow-card"
                >
                  <RecipePhoto recipe={r} />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                  <div className="relative p-3 text-white">
                    <div className="font-bold">{r.name}</div>
                    <div className="text-xs opacity-85">
                      {r.nutrition.kcal} kcal・蛋白質 {r.nutrition.protein}g・{r.minutes} 分
                    </div>
                  </div>
                  <span className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-leaf-dark">
                    <Icon name="add" size={22} weight={600} />
                  </span>
                </motion.button>
              ))}
              {sameAsYesterday && (
                <Tap
                  onClick={() => pick(sameAsYesterday)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-leaf-soft py-2.5 text-sm text-leaf-dark"
                >
                  <Icon name="history" size={18} />
                  跟昨天一樣：{sameAsYesterday.name}
                </Tap>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-2">
            <Button variant="soft" className="flex flex-1 items-center justify-center gap-1.5" onClick={() => setSeed((s) => s + 7)}>
              <Icon name="refresh" size={18} />
              換一批
            </Button>
            <Button variant="soft" className="flex-1" onClick={next}>
              這餐跳過
            </Button>
            <Button variant="ghost" onClick={finish}>
              完成
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  )
}

/** 複製上週菜單到這週還空著的餐 */
export async function copyLastWeek(weekStartKey: string) {
  const lastDays = Array.from({ length: 7 }, (_, i) => addDays(weekStartKey, i - 7))
  const last = await db.plans.where('date').anyOf(lastDays).toArray()
  const thisDays = Array.from({ length: 7 }, (_, i) => addDays(weekStartKey, i))
  const current = await db.plans.where('date').anyOf(thisDays).toArray()
  const add = last
    .map((p) => ({ date: addDays(p.date, 7), meal: p.meal, recipeId: p.recipeId }))
    .filter((p) => !current.some((c) => c.date === p.date && c.meal === p.meal))
  if (!add.length) return { count: 0, ids: [] as number[], lastCount: last.length }
  const ids = (await db.plans.bulkAdd(add, { allKeys: true })) as number[]
  return { count: add.length, ids, lastCount: last.length }
}

/** 把某一天的菜單複製到其他天（只補空著的餐） */
export async function copyDay(from: string, targets: string[]) {
  const src = await db.plans.where('date').equals(from).toArray()
  const existing = await db.plans.where('date').anyOf(targets).toArray()
  const add = targets.flatMap((date) =>
    src
      .filter((p) => !existing.some((e) => e.date === date && e.meal === p.meal))
      .map((p) => ({ date, meal: p.meal, recipeId: p.recipeId })),
  )
  if (!add.length) return []
  return (await db.plans.bulkAdd(add, { allKeys: true })) as number[]
}
