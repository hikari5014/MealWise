import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { addDays, fromKey, monthDay, toKey, todayKey, weekStart, weekdayLabel } from '../lib/date'
import { getPlan, MEAL_RULE_LABEL, resolveDay } from '../lib/dietPlan'
import { haptic, spring } from '../lib/feedback'
import { saveMark, useMarks, usePlans } from '../lib/hooks'
import { MEAL_LABEL, MEAL_SLOTS, type MealSlot, type Profile } from '../types'
import { RuleBadge } from './DietPlan'
import { Icon } from './Icon'
import { Button, Sheet, Tap } from './ui'
import { DayTraining, TrainBadge } from './TrainSchedule'
import { TRAIN_MAP } from '../lib/workout'
import { db } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

const WEEK = ['一', '二', '三', '四', '五', '六', '日']

const monthStart = (key: string) => key.slice(0, 8) + '01'
const addMonths = (key: string, n: number) => {
  const d = fromKey(monthStart(key))
  d.setMonth(d.getMonth() + n)
  return toKey(d)
}

export function MonthCalendar({ profile, onGoDay }: { profile: Profile; onGoDay: (date: string) => void }) {
  const today = todayKey()
  const [month, setMonth] = useState(monthStart(today))
  const [dir, setDir] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [ripple, setRipple] = useState<{ d: string; t: number } | null>(null)
  const first = weekStart(month)
  const cells = useMemo(() => Array.from({ length: 42 }, (_, i) => addDays(first, i)), [first])
  const marks = useMarks(cells)
  const plans = usePlans(cells)
  const doneDays = new Set(
    useLiveQuery(
      () => db.workouts.where('date').between(cells[0], cells[cells.length - 1], true, true).filter((w) => !!w.endedAt).toArray(),
      [cells[0]],
    )?.map((w) => w.date) ?? [],
  )
  const plan = getPlan(profile)
  const m = fromKey(month)

  const go = (n: number) => {
    haptic(6)
    setDir(n)
    setMonth(addMonths(month, n))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => go(-1)}
          aria-label="上個月"
          className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-card"
        >
          <Icon name="chevron_left" size={22} />
        </motion.button>
        <Tap className="text-base font-bold" onClick={() => setMonth(monthStart(today))}>
          {m.getFullYear()} 年 {m.getMonth() + 1} 月
        </Tap>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => go(1)}
          aria-label="下個月"
          className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-card"
        >
          <Icon name="chevron_right" size={22} />
        </motion.button>
      </div>

      <div className="rounded-3xl bg-white p-3 shadow-card">
        <div className="mb-1 grid grid-cols-7 text-center text-[11px] text-muted">
          {WEEK.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <motion.div
          key={month}
          initial={{ opacity: 0, x: dir * 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="grid grid-cols-7 gap-1"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50) go(1)
            else if (info.offset.x > 50) go(-1)
          }}
        >
          {cells.map((d) => {
            const inMonth = d.slice(0, 7) === month.slice(0, 7)
            const mark = marks[d]
            const training = mark?.training ?? plan.trainingDays.includes(fromKey(d).getDay())
            const count = plans.filter((p) => p.date === d).length
            const isToday = d === today
            return (
              <motion.button
                key={d}
                whileTap={{ scale: 0.82 }}
                transition={{ type: 'spring', stiffness: 600, damping: 15 }}
                onClick={() => {
                  haptic([8, 20, 8])
                  setRipple({ d, t: Date.now() })
                  // 先讓點擊的水波跑一下，再打開設定
                  window.setTimeout(() => setSelected(d), 160)
                }}
                className={`relative flex aspect-square flex-col items-center justify-start rounded-xl pt-1 text-sm transition-colors ${
                  inMonth ? '' : 'opacity-35'
                } ${mark?.feast ? 'bg-tomato-soft' : mark?.fast ? 'bg-ink/10' : training ? 'bg-leaf-soft/70' : ''} ${
                  isToday ? 'ring-2 ring-leaf' : ''
                }`}
              >
                {ripple?.d === d && (
                  <motion.span
                    key={ripple.t}
                    initial={{ scale: 0.3, opacity: 0.9 }}
                    animate={{ scale: 1.25, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="pointer-events-none absolute inset-0 rounded-xl bg-leaf/35"
                  />
                )}
                {selected === d && <motion.span layoutId="month-selected" transition={spring} className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-honey" />}
                <span className={`relative tabular-nums ${isToday ? 'font-bold text-leaf-dark' : ''}`}>{Number(d.slice(-2))}</span>
                <span className="relative mt-0.5 flex h-4 items-center gap-0.5">
                  {mark?.feast && <Icon name="celebration" size={13} fill className="text-tomato" />}
                  {mark?.fast && <Icon name="no_meals" size={13} className="text-ink/60" />}
                  {mark?.train ? (
                    <TrainBadge type={mark.train} size="xs" />
                  ) : (
                    training && !mark?.feast && !mark?.fast && <Icon name="fitness_center" size={12} className="text-leaf" />
                  )}
                  {doneDays.has(d) && <Icon name="check_circle" size={12} fill className="text-leaf-dark" />}
                </span>
                {count > 0 && (
                  <span className="absolute bottom-1 flex gap-0.5">
                    {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                      <span key={i} className="h-1 w-1 rounded-full bg-leaf/70" />
                    ))}
                  </span>
                )}
              </motion.button>
            )
          })}
        </motion.div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 text-[11px] text-muted">
        {(['push', 'pull', 'hiit', 'cardio'] as const).map((t) => (
          <span key={t} className="flex items-center gap-1">
            <TrainBadge type={t} size="xs" />
            {TRAIN_MAP[t].label.replace('重訓・', '')}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <Icon name="check_circle" size={13} fill className="text-leaf-dark" />
          已訓練
        </span>
        <span className="flex items-center gap-1">
          <Icon name="celebration" size={13} fill className="text-tomato" />
          大餐
        </span>
        <span className="flex items-center gap-1">
          <Icon name="no_meals" size={13} />
          禁食日
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-leaf/70" />
          已排菜單
        </span>
      </div>
      <p className="text-center text-xs text-muted">點日期可以排運動（推、拉、有氧）、標記大餐或禁食日</p>

      <DaySheet date={selected} profile={profile} onClose={() => setSelected(null)} onGoDay={onGoDay} />
    </div>
  )
}

function DaySheet({
  date,
  profile,
  onClose,
  onGoDay,
}: {
  date: string | null
  profile: Profile
  onClose: () => void
  onGoDay: (date: string) => void
}) {
  const d = date ?? todayKey()
  const dates = useMemo(() => [d, addDays(d, 1)], [d])
  const marks = useMarks(dates)
  const mark = marks[d]
  const plan = getPlan(profile)
  const day = resolveDay(d, profile, marks)
  const next = resolveDay(addDays(d, 1), profile, marks)
  const [note, setNote] = useState('')
  const nextAffected = MEAL_SLOTS.filter((m) => next.meals[m].reason?.startsWith('大餐後'))

  const setFeast = (feast: MealSlot | null) => {
    haptic(feast ? [10, 30, 10] : 6)
    saveMark(d, { feast, feastNote: feast ? note || mark?.feastNote : undefined })
  }

  return (
    <Sheet open={date !== null} onClose={onClose} title={`${monthDay(d)}（${weekdayLabel(d)}）`}>
      <div className="space-y-4">
        <DayTraining date={d} mark={mark} weeklyTraining={plan.trainingDays.includes(fromKey(d).getDay())} />
        <div className="grid grid-cols-1 gap-2">
          <ToggleTile
            on={!!mark?.fast}
            icon="no_meals"
            label="禁食日"
            sub="整天不進食"
            tone="ink"
            onClick={() => saveMark(d, { fast: !mark?.fast })}
          />
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-card">
          <div className="mb-2 flex items-center gap-1.5 font-bold">
            <Icon name="celebration" size={20} fill className="text-tomato" motion={mark?.feast ? 'wiggle' : 'none'} />
            這天有大餐嗎？
          </div>
          <div className="flex flex-wrap gap-1.5">
            {([null, 'breakfast', 'lunch', 'dinner'] as (MealSlot | null)[]).map((m) => {
              const on = (mark?.feast ?? null) === m
              return (
                <motion.button
                  key={m ?? 'none'}
                  whileTap={{ scale: 0.9 }}
                  animate={{ scale: on ? [1, 1.1, 1] : 1 }}
                  onClick={() => setFeast(m)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    on ? (m ? 'bg-tomato text-white' : 'bg-ink text-cream') : 'bg-cream'
                  }`}
                >
                  {m ? MEAL_LABEL[m] : '沒有'}
                </motion.button>
              )
            })}
          </div>
          <AnimatePresence initial={false}>
            {mark?.feast && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <input
                  defaultValue={mark.feastNote ?? ''}
                  onChange={(e) => setNote(e.target.value)}
                  onBlur={(e) => saveMark(d, { feastNote: e.target.value.trim() || undefined })}
                  placeholder="例如：朋友生日燒肉"
                  className="mt-3 w-full rounded-2xl bg-cream px-4 py-2.5 text-sm outline-none ring-tomato/40 focus:ring-2"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-card">
          <div className="mb-2 text-sm font-bold">這天會這樣吃</div>
          <ul className="space-y-1.5">
            {MEAL_SLOTS.map((m) => (
              <motion.li key={m} layout transition={spring} className="flex items-center gap-2 text-sm">
                <span className="w-10 text-muted">{MEAL_LABEL[m]}</span>
                {day.meals[m].rule === 'normal' ? (
                  <span className="text-xs text-muted">{MEAL_RULE_LABEL.normal}</span>
                ) : (
                  <RuleBadge decision={day.meals[m]} />
                )}
              </motion.li>
            ))}
          </ul>
          <div className="mt-2 text-xs text-muted">熱量目標 {day.kcal} kcal</div>
          {nextAffected.length > 0 && (
            <p className="mt-2 rounded-2xl bg-sky-soft p-2.5 text-xs">
              隔天的{nextAffected.map((m) => MEAL_LABEL[m]).join('、')}會跳過（大餐後 {plan.feast.postFastHours} 小時不進食）
            </p>
          )}
        </div>

        <Button
          className="flex w-full items-center justify-center gap-2"
          onClick={() => {
            onClose()
            onGoDay(d)
          }}
        >
          <Icon name="calendar_month" size={20} />
          去排這天的菜單
        </Button>
      </div>
    </Sheet>
  )
}

function ToggleTile({
  on,
  icon,
  label,
  sub,
  onClick,
  tone = 'leaf',
}: {
  on: boolean
  icon: Parameters<typeof Icon>[0]['name']
  label: string
  sub: string
  onClick: () => void
  tone?: 'leaf' | 'ink'
}) {
  const bg = tone === 'leaf' ? 'bg-leaf text-white' : 'bg-ink text-cream'
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={() => {
        haptic(on ? 6 : [8, 24, 8])
        onClick()
      }}
      className={`flex items-center gap-2 rounded-3xl p-3 text-left shadow-card transition-colors ${on ? bg : 'bg-white'}`}
    >
      <motion.span animate={on ? { scale: [1, 1.3, 1], rotate: [0, -10, 0] } : { scale: 1 }} transition={{ duration: 0.4 }}>
        <Icon name={icon} size={24} fill={on} />
      </motion.span>
      <span>
        <span className="block text-sm font-bold">{label}</span>
        <span className={`block text-[11px] ${on ? 'opacity-80' : 'text-muted'}`}>{sub}</span>
      </span>
    </motion.button>
  )
}
