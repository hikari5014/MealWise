import { AnimatePresence, motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { EXERCISE_MAP } from '../data/exercises'
import { db } from '../db'
import { todayKey, weekdayLabel } from '../lib/date'
import { haptic, spring } from '../lib/feedback'
import { saveTrain } from '../lib/hooks'
import { TRAIN_MAP, TRAIN_TYPES, doneSets, workoutVolume, type TrainType } from '../lib/workout'
import type { DayMark } from '../types'
import { Food } from './Food'
import { Icon } from './Icon'
import { WorkoutSession } from './WorkoutSession'
import { Tap, useToast } from './ui'

/** 開始（或補記）某一天的訓練，類型照那天的排程 */
export async function startWorkout(date: string, type?: TrainType) {
  const existing = await db.workouts.where('date').equals(date).filter((w) => !w.endedAt).first()
  if (existing) return existing.id!
  return (await db.workouts.add({ date, type, startedAt: Date.now(), entries: [] })) as number
}

/** 小標籤：推／拉／強／有氧 */
export function TrainBadge({ type, size = 'sm' }: { type: TrainType; size?: 'xs' | 'sm' }) {
  const t = TRAIN_MAP[type]
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${size === 'xs' ? 'px-1 text-[9px] leading-[14px]' : 'px-2 py-0.5 text-[11px]'}`}
      style={{ background: t.soft, color: t.color }}
    >
      {size === 'xs' ? t.short : t.label}
    </span>
  )
}

/**
 * 某一天的運動：排程（推、拉、高強度、輕度有氧）＋這天的訓練紀錄。
 * 月曆的日期視窗、週曆的當天都用這個，所以三邊的資料一定一致。
 */
export function DayTraining({ date, mark, weeklyTraining, compact = false }: { date: string; mark?: DayMark; weeklyTraining: boolean; compact?: boolean }) {
  const toast = useToast()
  const today = todayKey()
  const workouts = useLiveQuery(() => db.workouts.where('date').equals(date).toArray(), [date]) ?? []
  const [repeat, setRepeat] = useState(false)
  const [openId, setOpenId] = useState<number | null>(null)
  const current: TrainType | 'rest' | null = mark?.train ?? (mark?.training === false ? 'rest' : null)

  const choose = async (t: TrainType | 'rest' | null) => {
    haptic(t && t !== 'rest' ? [8, 24, 8] : 6)
    await saveTrain(date, t, repeat ? 8 : 0)
    if (repeat) toast(`之後 8 週的每週${weekdayLabel(date)}也一起排好了`)
  }

  const start = async () => {
    haptic([8, 24, 8])
    setOpenId(await startWorkout(date, mark?.train))
  }

  return (
    <section className={compact ? 'space-y-2' : 'space-y-3 rounded-3xl bg-card p-4 shadow-card'}>
      {!compact && (
        <div className="flex items-center gap-1.5 font-bold">
          <Food id="rule-training" size={24} />
          運動排程
        </div>
      )}
      {compact && (
        <div className="flex items-center gap-1.5">
          <Food id="rule-training" size={22} />
          <div className="-mr-4 flex flex-1 gap-1.5 overflow-x-auto pr-4">
            {TRAIN_TYPES.map((t) => {
              const on = current === t.id
              return (
                <Tap
                  key={t.id}
                  onClick={() => choose(on ? null : t.id)}
                  className="shrink-0 rounded-full px-2.5 py-1 text-xs transition-colors"
                  style={{ background: on ? t.color : t.soft, color: on ? 'rgb(var(--on-leaf))' : t.color }}
                >
                  {t.label}
                </Tap>
              )
            })}
            <Tap
              onClick={() => choose(current === 'rest' ? null : 'rest')}
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${current === 'rest' ? 'bg-ink text-cream' : 'bg-card text-muted shadow-card'}`}
            >
              休息
            </Tap>
          </div>
        </div>
      )}
      {!compact && (
        <>
          {(['重訓日', '有氧日'] as const).map((g) => (
            <div key={g} className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-xs text-muted">{g}</span>
              <div className="flex flex-1 gap-1.5">
                {TRAIN_TYPES.filter((t) => t.group === g).map((t) => {
                  const on = current === t.id
                  return (
                    <Tap
                      key={t.id}
                      onClick={() => choose(on ? null : t.id)}
                      animate={{ scale: on ? [1, 1.08, 1] : 1 }}
                      className="flex flex-1 items-center justify-center gap-1 rounded-2xl py-2 text-sm transition-colors"
                      style={{ background: on ? t.color : t.soft, color: on ? 'rgb(var(--on-leaf))' : t.color }}
                    >
                      {on && <Icon name="check" size={16} weight={700} />}
                      {t.label.replace('重訓・', '')}
                    </Tap>
                  )
                })}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-1.5">
            <Tap
              onClick={() => choose('rest')}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${current === 'rest' ? 'bg-ink text-cream' : 'bg-cream text-muted'}`}
            >
              休息不運動
            </Tap>
            <Tap
              onClick={() => choose(null)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${current === null ? 'bg-ink text-cream' : 'bg-cream text-muted'}`}
            >
              依每週設定{current === null ? `（${weeklyTraining ? '運動日' : '休息'}）` : ''}
            </Tap>
            <Tap onClick={() => setRepeat(!repeat)} className="ml-auto flex items-center gap-1 text-xs text-muted">
              <span className={`grid h-4 w-4 place-items-center rounded border ${repeat ? 'border-leaf bg-leaf text-on-leaf' : 'border-ink/30'}`}>
                {repeat && <Icon name="check" size={12} weight={700} />}
              </span>
              每週{weekdayLabel(date)}都這樣
            </Tap>
          </div>
        </>
      )}

      <AnimatePresence initial={false}>
        {workouts.map((w) => (
          <motion.div key={w.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring}>
            <Tap press={0.98} onClick={() => setOpenId(w.id!)} className="flex w-full items-center gap-2 rounded-2xl bg-leaf-soft/60 px-3 py-2 text-left">
              <Icon name={w.endedAt ? 'check_circle' : 'timer'} size={20} fill={!!w.endedAt} className="text-leaf-dark" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 text-sm font-medium">
                  {w.endedAt ? '已完成訓練' : '訓練中'}
                  {w.type && <TrainBadge type={w.type} size="xs" />}
                </span>
                <span className="block truncate text-[11px] text-muted">
                  {doneSets(w)} 組・{Math.round(workoutVolume(w))} kg・{w.entries.map((e) => EXERCISE_MAP[e.exerciseId]?.zh).filter(Boolean).join('、') || '還沒加動作'}
                </span>
              </span>
              <Icon name="chevron_right" size={18} className="text-muted" />
            </Tap>
          </motion.div>
        ))}
      </AnimatePresence>

      {date <= today && current !== 'rest' && !workouts.some((w) => !w.endedAt) && (
        <Tap
          press={0.97}
          onClick={start}
          className={`flex w-full items-center justify-center gap-1.5 rounded-2xl text-sm font-medium ${workouts.length ? 'py-2 text-muted' : 'py-2.5 text-on-leaf'}`}
          style={{ background: workouts.length ? 'rgb(var(--ink) / 0.06)' : current ? TRAIN_MAP[current].color : 'rgb(var(--leaf))' }}
        >
          <Icon name={workouts.length ? 'add' : 'fitness_center'} size={18} />
          {workouts.length ? '再開一次' : date === today ? '開始' : '補記'}
          {current ? TRAIN_MAP[current].label.replace('重訓・', '') + '日' : ''}訓練
        </Tap>
      )}
      <WorkoutSession id={openId} onClose={() => setOpenId(null)} />
    </section>
  )
}
