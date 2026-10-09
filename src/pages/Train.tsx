import { motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { BodyMap, WEEK_COLORS } from '../components/BodyMap'
import { ExerciseLibrary } from '../components/ExerciseLibrary'
import { Icon } from '../components/Icon'
import { WorkoutSession } from '../components/WorkoutSession'
import { Tap } from '../components/ui'
import { EXERCISE_MAP } from '../data/exercises'
import { db } from '../db'
import { addDays, fromKey, monthDay, todayKey, weekdayLabel, weekStart } from '../lib/date'
import { getPlan } from '../lib/dietPlan'
import { useMarks } from '../lib/hooks'
import { DayTraining, TrainBadge } from '../components/TrainSchedule'
import type { Profile } from '../types'
import { spring } from '../lib/feedback'
import { BODY_PARTS, MUSCLE_ZH, doneSets, weeklyBodyData, weeklyMuscles, workoutVolume, type FxMuscle } from '../lib/workout'

export default function Train({ profile }: { profile: Profile }) {
  const today = todayKey()
  const workouts = useLiveQuery(() => db.workouts.orderBy('startedAt').reverse().toArray()) ?? []
  const [openId, setOpenId] = useState<number | null>(null)
  const [library, setLibrary] = useState(false)
  const next7 = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, i)), [today])
  const marks = useMarks(next7)
  const week = useMemo(() => weeklyMuscles(workouts, today), [workouts, today])
  const weekData = useMemo(() => weeklyBodyData(week), [week])
  const untrained = BODY_PARTS.filter((p) => !p.muscles.some((m) => (week[m] ?? 0) > 0))
  const weekCount = workouts.filter((w) => w.endedAt && w.date >= weekStart(today)).length


  return (
    <div className="space-y-4">
      <header className="pt-2">
        <h1 className="text-2xl font-bold">訓練</h1>
        <p className="text-xs text-muted">記錄重訓，看看每個動作練到哪裡</p>
      </header>

      <div className="space-y-1">
        <div className="flex items-baseline justify-between px-1">
          <span className="font-bold">今天</span>
          <span className="text-xs text-muted">這週練了 {weekCount} 次</span>
        </div>
        <DayTraining date={today} mark={marks[today]} weeklyTraining={getPlan(profile).trainingDays.includes(fromKey(today).getDay())} />
      </div>

      <section>
        <div className="mb-2 px-1 text-sm font-bold">接下來 7 天</div>
        <div className="grid grid-cols-7 gap-1">
          {next7.map((d) => {
            const t = marks[d]?.train
            const done = workouts.some((w) => w.date === d && w.endedAt)
            return (
              <div key={d} className="flex flex-col items-center gap-1 rounded-2xl bg-white py-2 shadow-card">
                <span className="text-[10px] text-muted">{weekdayLabel(d)}</span>
                <span className="text-sm font-bold">{Number(d.slice(-2))}</span>
                {t ? <TrainBadge type={t} size="xs" /> : <span className="text-[9px] leading-[14px] text-muted">{marks[d]?.training === false ? '休' : '—'}</span>}
                {done && <Icon name="check_circle" size={12} fill className="text-leaf-dark" />}
              </div>
            )
          })}
        </div>
        <p className="mt-1.5 px-1 text-[11px] text-muted">到「菜單 → 月曆」點日期可以排推、拉、有氧，也能設定每週固定</p>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-card">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-bold">這 7 天練到的部位</span>
          <span className="flex items-center gap-1 text-[10px] text-muted">
            少
            {WEEK_COLORS.map((c) => (
              <span key={c} className="h-2.5 w-4 rounded-sm" style={{ background: c }} />
            ))}
            多
          </span>
        </div>
        <BodyMap data={weekData} colors={WEEK_COLORS} height={190} />
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
          {(Object.entries(week) as [FxMuscle, number][])
            .sort((a, b) => b[1] - a[1])
            .map(([m, n]) => (
              <span key={m} className="rounded-full bg-leaf-soft px-2 py-0.5 text-leaf-dark">
                {MUSCLE_ZH[m]} {Math.round(n)} 組
              </span>
            ))}
        </div>
        {workouts.length > 0 && untrained.length > 0 && (
          <p className="mt-2 text-xs text-[#a07a20]">這週還沒練到：{untrained.map((p) => p.label).join('、')}</p>
        )}
        {!workouts.length && <p className="mt-2 text-xs text-muted">完成訓練後，這裡會用顏色深淺標出練到的肌群</p>}
      </section>

      <Tap press={0.98} onClick={() => setLibrary(true)} className="flex w-full items-center gap-3 rounded-3xl bg-white p-4 text-left shadow-card">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-leaf-soft text-leaf-dark">
          <Icon name="menu_book" size={24} />
        </span>
        <span className="flex-1">
          <span className="block font-bold">動作庫</span>
          <span className="block text-xs text-muted">100 多個動作・依器材和部位分類・示範動畫與受力肌群</span>
        </span>
        <Icon name="chevron_right" size={22} className="text-muted" />
      </Tap>

      <section>
        <h2 className="mb-2 px-1 font-bold">訓練紀錄</h2>
        {!workouts.filter((w) => w.endedAt).length && <p className="px-1 text-sm text-muted">還沒有紀錄</p>}
        <ul className="space-y-2">
          {workouts
            .filter((w) => w.endedAt)
            .slice(0, 20)
            .map((w, i) => (
              <motion.li key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: Math.min(i, 8) * 0.03 }}>
                <Tap press={0.98} onClick={() => setOpenId(w.id!)} className="block w-full rounded-2xl bg-white p-3 text-left shadow-card">
                  <span className="flex items-baseline justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      {monthDay(w.date)}（{weekdayLabel(w.date)}）
                      {w.type && <TrainBadge type={w.type} />}
                    </span>
                    <span className="text-xs text-muted">
                      {Math.round((w.endedAt! - w.startedAt) / 60000)} 分・{doneSets(w)} 組・{Math.round(workoutVolume(w))} kg
                    </span>
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted">
                    {w.entries.map((e) => EXERCISE_MAP[e.exerciseId]?.zh).filter(Boolean).join('、')}
                  </span>
                </Tap>
              </motion.li>
            ))}
        </ul>
      </section>

      <WorkoutSession
        id={openId}
        onClose={() => setOpenId(null)}
      />
      <ExerciseLibrary open={library} onClose={() => setLibrary(false)} />
    </div>
  )
}
