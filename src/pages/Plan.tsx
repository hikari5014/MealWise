import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { RecipePicker } from '../components/RecipePicker'
import { useShare } from '../components/Share'
import { Icon } from '../components/Icon'
import { RowPhoto, useRecipeDetail } from '../components/RecipeDetail'
import { RecipePhoto } from '../components/RecipePhoto'
import { Button, listContainer, listItem, Segmented, useToast } from '../components/ui'
import { RECIPE_MAP } from '../data/recipes'
import { db } from '../db'
import { addDays, monthDay, todayKey, weekDays, weekdayLabel, weekStart } from '../lib/date'
import { haptic, spring } from '../lib/feedback'
import { usePlans } from '../lib/hooks'
import { autoPlan, recipesFor } from '../lib/meal'
import { MealTitle } from './Today'
import { MEAL_LABEL, MEAL_SLOTS, type MealSlot, type PlanEntry, type Profile } from '../types'

export default function Plan({ profile }: { profile: Profile }) {
  const [view, setView] = useState<'week' | 'library'>('week')
  return (
    <div className="space-y-4">
      <header className="pt-2">
        <h1 className="text-2xl font-bold">菜單</h1>
      </header>
      <Segmented
        id="plan"
        value={view}
        onChange={setView}
        options={[
          { value: 'week', label: '一週菜單', icon: 'calendar_month' },
          { value: 'library', label: '食譜庫', icon: 'menu_book' },
        ]}
      />
      <motion.div
        key={view}
        initial={{ opacity: 0, x: view === 'week' ? -16 : 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {view === 'week' ? <Week profile={profile} /> : <Library profile={profile} />}
      </motion.div>
    </div>
  )
}

export function WeekSwitcher({ start, onChange }: { start: string; onChange: (s: string) => void }) {
  const isThisWeek = start === weekStart(todayKey())
  return (
    <div className="flex items-center justify-between">
      <motion.button
        whileTap={{ scale: 0.85 }}
        aria-label="上一週"
        onClick={() => onChange(addDays(start, -7))}
        className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-card"
      >
        <Icon name="chevron_left" size={22} />
      </motion.button>
      <button className="text-sm font-medium" onClick={() => onChange(weekStart(todayKey()))}>
        {monthDay(start)} – {monthDay(addDays(start, 6))}
        {!isThisWeek && <span className="ml-1 text-xs text-leaf">（回本週）</span>}
      </button>
      <motion.button
        whileTap={{ scale: 0.85 }}
        aria-label="下一週"
        onClick={() => onChange(addDays(start, 7))}
        className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-card"
      >
        <Icon name="chevron_right" size={22} />
      </motion.button>
    </div>
  )
}

function Week({ profile }: { profile: Profile }) {
  const today = todayKey()
  const [start, setStart] = useState(weekStart(today))
  const days = useMemo(() => weekDays(start), [start])
  const [selected, setSelected] = useState(today)
  const [dir, setDir] = useState(0)
  const [picking, setPicking] = useState<MealSlot | null>(null)
  const plans = usePlans(days)
  const toast = useToast()
  const share = useShare()
  const day = days.includes(selected) ? selected : days[0]
  const dayPlans = plans.filter((p) => p.date === day)
  const dayKcal = dayPlans.reduce((s, p) => s + (RECIPE_MAP[p.recipeId]?.nutrition.kcal ?? 0), 0)

  const select = (d: string) => {
    haptic(6)
    setDir(d > day ? 1 : -1)
    setSelected(d)
  }

  const fillWeek = async () => {
    const targetDays = days.filter((d) => d >= today)
    const added = autoPlan(targetDays.length ? targetDays : days, plans, profile)
    if (!added.length) {
      toast('這週都排好了')
      return
    }
    haptic([10, 40, 10, 40, 16])
    const ids = (await db.plans.bulkAdd(added, { allKeys: true })) as number[]
    toast(`幫你排了 ${added.length} 餐`, () => db.plans.bulkDelete(ids))
  }

  const remove = async (plan: PlanEntry) => {
    await db.plans.delete(plan.id!)
    toast(`已移除 ${RECIPE_MAP[plan.recipeId]?.name}`, () => db.plans.put(plan))
  }

  return (
    <div className="space-y-4">
      <WeekSwitcher
        start={start}
        onChange={(s) => {
          setDir(s > start ? 1 : -1)
          setStart(s)
          setSelected(s <= today && today <= addDays(s, 6) ? today : s)
        }}
      />

      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const count = plans.filter((p) => p.date === d).length
          const active = d === day
          return (
            <button key={d} onClick={() => select(d)} className="relative flex flex-col items-center rounded-2xl py-2">
              {active && <motion.span layoutId="day-pill" transition={spring} className="absolute inset-0 rounded-2xl bg-leaf shadow-card" />}
              <span className={`relative text-[11px] ${active ? 'text-white/80' : 'text-muted'}`}>{weekdayLabel(d)}</span>
              <span className={`relative text-base font-bold ${active ? 'text-white' : d === today ? 'text-leaf' : ''}`}>
                {Number(d.slice(-2))}
              </span>
              <span className="relative mt-0.5 flex h-1.5 gap-0.5">
                {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
                  <span key={i} className={`h-1 w-1 rounded-full ${active ? 'bg-white' : 'bg-leaf/60'}`} />
                ))}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex gap-2">
        <Button className="flex-1" onClick={fillWeek}>
          <span className="flex items-center justify-center gap-2">
            <Icon name="auto_awesome" size={20} fill motion="pulse" />
            一鍵排滿這週
          </span>
        </Button>
        <Button variant="soft" className="grid w-12 place-items-center px-0" aria-label="分享菜單" onClick={() => share.openShare({ weekStart: start, day })}>
          <Icon name="qr_code_2" size={22} />
        </Button>
        <Button variant="soft" className="grid w-12 place-items-center px-0" aria-label="掃描朋友的菜單" onClick={share.openScanner}>
          <Icon name="qr_code_scanner" size={22} />
        </Button>
      </div>

      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.div
          key={day}
          custom={dir}
          initial={{ opacity: 0, x: dir * 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -24 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="space-y-4"
        >
          <div className="px-1 text-xs text-muted">
            這天預計 <span className="font-bold tabular-nums text-ink">{dayKcal}</span> / {profile.kcal} kcal
          </div>
          {MEAL_SLOTS.map((meal) => (
            <section key={meal}>
              <h2 className="mb-2 px-1 font-bold">
                <MealTitle meal={meal} />
              </h2>
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {dayPlans
                    .filter((p) => p.meal === meal)
                    .map((p) => (
                      <PlanRow key={p.id} plan={p} onRemove={() => remove(p)} />
                    ))}
                </AnimatePresence>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setPicking(meal)}
                  className="w-full rounded-2xl border-2 border-dashed border-ink/10 py-2.5 text-sm text-muted"
                >
                  <span className="flex items-center justify-center gap-1">
                    <Icon name="add" size={18} />
                    加入{MEAL_LABEL[meal]}
                  </span>
                </motion.button>
              </div>
            </section>
          ))}
        </motion.div>
      </AnimatePresence>

      <RecipePicker
        open={picking !== null}
        meal={picking}
        profile={profile}
        onClose={() => setPicking(null)}
        onPick={async (r) => {
          if (!picking) return
          haptic([8, 24, 8])
          await db.plans.add({ date: day, meal: picking, recipeId: r.id })
        }}
      />
    </div>
  )
}

function PlanRow({ plan, onRemove }: { plan: PlanEntry; onRemove: () => void }) {
  const recipe = RECIPE_MAP[plan.recipeId]
  const openDetail = useRecipeDetail()
  if (!recipe) return null
  const layoutId = `plan-${plan.id}`
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
      transition={spring}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.5, right: 0.05 }}
      onDragEnd={(_, info) => {
        if (info.offset.x < -90) {
          haptic(12)
          onRemove()
        }
      }}
      className="relative flex min-h-[72px] touch-pan-y items-center gap-3 overflow-hidden rounded-2xl bg-white py-3 pl-4 pr-2 shadow-card"
    >
      <RowPhoto recipe={recipe} layoutId={layoutId} />
      <button className="relative min-w-0 flex-1 text-left" onClick={() => openDetail(recipe.id, layoutId)}>
        <div className="truncate font-medium">{recipe.name}</div>
        <div className="text-xs text-muted">
          {recipe.nutrition.kcal} kcal・{recipe.minutes} 分鐘
        </div>
      </button>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onRemove}
        aria-label={`移除${recipe.name}`}
        className="relative grid h-9 w-9 place-items-center rounded-full bg-white/90 text-muted shadow-sm"
      >
        <Icon name="close" size={20} />
      </motion.button>
    </motion.div>
  )
}

function Library({ profile }: { profile: Profile }) {
  const [meal, setMeal] = useState<MealSlot | 'all'>('all')
  const [query, setQuery] = useState('')
  const openDetail = useRecipeDetail()
  const list = recipesFor(meal === 'all' ? null : meal, profile).filter(
    (r) => !query.trim() || r.name.includes(query.trim()) || r.tags.some((t) => t.includes(query.trim())),
  )
  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜尋食譜或標籤"
        className="w-full rounded-2xl bg-white px-4 py-3 text-sm shadow-card outline-none ring-leaf/40 focus:ring-2"
      />
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
        {(['all', ...MEAL_SLOTS] as const).map((m) => (
          <motion.button
            key={m}
            whileTap={{ scale: 0.92 }}
            onClick={() => setMeal(m)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors ${
              meal === m ? 'bg-ink text-cream' : 'bg-white text-muted shadow-card'
            }`}
          >
            {m === 'all' ? '全部' : MEAL_LABEL[m]}
          </motion.button>
        ))}
      </div>
      <p className="px-1 text-xs text-muted">已依你的飲食需求過濾，共 {list.length} 道</p>
      <motion.div key={meal} variants={listContainer} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
        {list.map((r) => {
          const layoutId = `lib-${r.id}`
          return (
            <motion.button
              key={r.id}
              variants={listItem}
              whileTap={{ scale: 0.96 }}
              onClick={() => openDetail(r.id, layoutId)}
              className="relative aspect-[4/5] overflow-hidden rounded-3xl text-left shadow-card"
            >
              <motion.div layoutId={layoutId} className="absolute inset-0">
                <RecipePhoto recipe={r} />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-x-3 bottom-3 text-white">
                <div className="text-[15px] font-bold leading-snug drop-shadow">{r.name}</div>
                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-white/85">
                  <Icon name="local_fire_department" size={13} fill />
                  {r.nutrition.kcal} kcal
                  <span className="mx-0.5 opacity-60">·</span>
                  <Icon name="timer" size={13} />
                  {r.minutes} 分
                </div>
              </div>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
