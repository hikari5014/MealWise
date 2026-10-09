import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { db } from '../db'
import { batchTips, portionLine, scale, STORAGE_LABEL, storageFor, storageOf } from '../lib/batch'
import { addDays, monthDay, todayKey, weekStart, weekdayLabel } from '../lib/date'
import { haptic, spring } from '../lib/feedback'
import { formatQty } from '../lib/meal'
import { MEAL_LABEL, MEAL_SLOTS, type MealSlot, type Recipe } from '../types'
import { Icon } from './Icon'
import { RecipePhoto } from './RecipePhoto'
import { Button, Segmented, Sheet, useToast } from './ui'

const STORAGE_STYLE = {
  fridge: 'bg-sky-soft text-sky',
  freezer: 'bg-frost-soft text-frost',
  fresh: 'bg-honey-soft text-honey-ink',
} as const

/** 把一道食譜放大成 N 份：份量、做法提醒、分裝、保存，還能直接排進菜單 */
export function BatchSheet({ recipe, onClose }: { recipe: Recipe | null; onClose: () => void }) {
  const toast = useToast()
  const [n, setN] = useState(5)
  const [meal, setMeal] = useState<MealSlot>('lunch')
  const [start, setStart] = useState<'tomorrow' | 'today' | 'monday'>('tomorrow')

  useEffect(() => {
    if (recipe) {
      setN(5)
      setMeal(recipe.meals.find((m) => m !== 'snack') ?? recipe.meals[0] ?? 'lunch')
      setStart('tomorrow')
    }
  }, [recipe])

  if (!recipe) return <Sheet open={false} onClose={onClose}>{null}</Sheet>

  const storage = storageOf(recipe)
  const today = todayKey()
  const startDate = start === 'today' ? today : start === 'tomorrow' ? addDays(today, 1) : addDays(weekStart(today), 7)
  // 今天開始就今天煮；其他情況假設前一天煮好
  const prepGap = start === 'today' ? 0 : 1
  const days = Array.from({ length: n }, (_, i) => addDays(startDate, i))
  const ingredients = scale(recipe.ingredients, n)

  const schedule = async () => {
    const ids = (await db.plans.bulkAdd(
      days.map((date) => ({ date, meal, recipeId: recipe.id })),
      { allKeys: true },
    )) as number[]
    haptic([10, 40, 10, 40, 20])
    onClose()
    toast(`已排進 ${n} 天的${MEAL_LABEL[meal]}`, () => db.plans.bulkDelete(ids))
  }

  return (
    <Sheet open onClose={onClose} title="做成一週份">
      <div className="space-y-4">
        <div className="relative flex h-28 items-end overflow-hidden rounded-3xl shadow-card">
          <RecipePhoto recipe={recipe} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="relative p-3 text-white">
            <div className="text-lg font-bold">{recipe.name}</div>
            <div className="text-xs opacity-85">
              一次做 {n} 份・每份 {recipe.nutrition.kcal} kcal
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-3xl bg-card p-4 shadow-card">
          <span className="font-medium">要做幾份？</span>
          <span className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setN(Math.max(2, n - 1))}
              aria-label="少一份"
              className="grid h-9 w-9 place-items-center rounded-full bg-ink/5"
            >
              <Icon name="remove" size={20} />
            </motion.button>
            <motion.span key={n} initial={{ scale: 1.4 }} animate={{ scale: 1 }} transition={spring} className="w-8 text-center text-xl font-bold tabular-nums">
              {n}
            </motion.span>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setN(Math.min(10, n + 1))}
              aria-label="多一份"
              className="grid h-9 w-9 place-items-center rounded-full bg-ink/5"
            >
              <Icon name="add" size={20} />
            </motion.button>
          </span>
        </div>

        {storage.makeFresh && (
          <p className="flex items-start gap-2 rounded-2xl bg-honey-soft p-3 text-sm">
            <Icon name="warning" size={18} fill className="mt-0.5 text-honey-ink" />
            這道不適合整份預做：{storage.tip}
          </p>
        )}

        <Section icon="shopping_basket" title={`材料（${n} 份）`}>
          <ul className="divide-y divide-ink/5">
            {ingredients.map((i) => (
              <li key={i.name} className="flex justify-between py-2 text-sm">
                <span>{i.name}</span>
                <span className="tabular-nums text-muted">{formatQty(i.qty, i.unit)}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon="skillet" title="一次做多份的做法">
          <ol className="mb-3 space-y-2 text-sm">
            {recipe.steps.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf text-[11px] font-bold text-on-leaf">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <ul className="space-y-1.5 rounded-2xl bg-leaf-soft/60 p-3 text-xs text-leaf-dark">
            {batchTips(recipe, n).map((t) => (
              <li key={t} className="flex gap-1.5">
                <Icon name="lightbulb" size={14} fill className="mt-0.5 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </Section>

        <Section icon="kitchen" title="分裝與保存">
          <p className="mb-2 text-sm">
            分成 <b>{n}</b> 盒，每盒放：
          </p>
          <p className="mb-3 rounded-2xl bg-cream p-3 text-xs leading-relaxed">{portionLine(recipe) || recipe.name}</p>
          <div className="mb-3 space-y-1.5">
            {days.map((d, i) => {
              const s = storageFor(storage, prepGap + i)
              return (
                <motion.div
                  key={d}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: i * 0.03 }}
                  className="flex items-center justify-between rounded-xl bg-card px-3 py-2 text-sm shadow-sm"
                >
                  <span>
                    第 {i + 1} 盒・{monthDay(d)}（{weekdayLabel(d)}）
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STORAGE_STYLE[s]}`}>{STORAGE_LABEL[s]}</span>
                </motion.div>
              )
            })}
          </div>
          <p className="text-xs text-muted">{storage.tip}</p>
          <p className="mt-1 text-xs text-muted">加熱：{storage.reheat}</p>
        </Section>

        <Section icon="calendar_month" title="排進菜單">
          <div className="space-y-2">
            <Segmented
              id="batch-start"
              value={start}
              onChange={setStart}
              options={[
                { value: 'today', label: '今天開始' },
                { value: 'tomorrow', label: '明天開始' },
                { value: 'monday', label: '下週一' },
              ]}
            />
            <div className="flex flex-wrap gap-1.5">
              {MEAL_SLOTS.map((m) => (
                <motion.button
                  key={m}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMeal(m)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${meal === m ? 'bg-leaf text-on-leaf' : 'bg-card shadow-sm'}`}
                >
                  {MEAL_LABEL[m]}
                </motion.button>
              ))}
            </div>
          </div>
        </Section>

        <Button className="flex w-full items-center justify-center gap-2" onClick={schedule}>
          <Icon name="event_available" size={20} />
          排進 {monthDay(days[0])}–{monthDay(days[days.length - 1])} 的{MEAL_LABEL[meal]}
        </Button>
      </div>
    </Sheet>
  )
}

function Section({ icon, title, children }: { icon: Parameters<typeof Icon>[0]['name']; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-card p-4 shadow-card">
      <h3 className="mb-2 flex items-center gap-1.5 font-bold">
        <Icon name={icon} size={20} fill className="text-leaf" />
        {title}
      </h3>
      {children}
    </section>
  )
}
