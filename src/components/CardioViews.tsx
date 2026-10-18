import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { COMBOS, METRIC, type CardioMetric, type ComboTemplate } from '../data/cardio'
import { EXERCISE_MAP, type Exercise } from '../data/exercises'
import { haptic, spring } from '../lib/feedback'
import { blockElapsed, cardioKcal, cardioSummary, fmtDuration, type CardioBlock, type Workout, type WorkoutEntry, type WorkoutSet } from '../lib/workout'
import { Food } from './Food'
import { Icon } from './Icon'
import { CheckButton, Sheet, Tap } from './ui'

/** 指標存在 WorkoutSet 的哪個欄位（時間沿用 r） */
const key = (m: CardioMetric) => (m === 'min' ? 'r' : m) as keyof WorkoutSet
export const metricsOf = (ex: Exercise): CardioMetric[] => ex.metrics ?? ['min', 'km', 'hr', 'kcal']
const val = (s: WorkoutSet, m: CardioMetric) => (s[key(m)] as number | undefined) ?? 0

/** 目標文字：1 km、1000 m、100 下・6 kg、10 分 */
export const targetText = (ex: Exercise, s: WorkoutSet) =>
  metricsOf(ex)
    .filter((m) => m !== 'min' && m !== 'hr' && m !== 'kcal' && val(s, m))
    .map((m) => `${val(s, m)} ${METRIC[m].unit}`)
    .join('・') || (s.r ? `${s.r} 分` : '')

/** 一段有氧的數字輸入：依器材顯示不同欄位 */
export function CardioFields({ ex, set, locked, onChange }: { ex: Exercise; set: WorkoutSet; locked: boolean; onChange: (p: Partial<WorkoutSet>) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {metricsOf(ex).map((m) => (
        <MetricField key={m} metric={m} value={val(set, m)} locked={locked} done={set.done} onChange={(v) => onChange({ [key(m)]: v || (m === 'min' ? 0 : undefined) })} />
      ))}
    </div>
  )
}

function MetricField({ metric, value, locked, done, onChange }: { metric: CardioMetric; value: number; locked: boolean; done: boolean; onChange: (v: number) => void }) {
  const info = METRIC[metric]
  return (
    <label className={`block rounded-xl px-2 py-1.5 transition-colors ${done ? 'bg-leaf-soft' : 'bg-cream'}`}>
      <span className="block text-[10px] text-muted">
        {info.label}
        <span className="ml-0.5 opacity-70">{info.unit}</span>
      </span>
      {locked ? (
        <span className="block text-base font-bold tabular-nums">{value || '—'}</span>
      ) : (
        <input
          inputMode="decimal"
          aria-label={`${info.label}（${info.unit}）`}
          value={value || ''}
          placeholder="—"
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            onChange(Number.isFinite(v) ? v : 0)
          }}
          className="w-full min-w-0 bg-transparent text-base font-bold tabular-nums text-ink outline-none placeholder:text-muted/50"
        />
      )}
    </label>
  )
}

/** 算出來的數字：配速、500 m 分段、消耗 */
function Derived({ ex, sets, weight }: { ex: Exercise; sets: WorkoutSet[]; weight: number }) {
  const c = cardioSummary(ex, sets, weight)
  const parts: string[] = []
  if (c.min) parts.push(`${Math.round(c.min * 10) / 10} 分`)
  if (c.km) parts.push(`${Math.round(c.km * 100) / 100} km`)
  if (c.split) parts.push(`每 500 m ${fmtDuration(c.split)}`)
  else if (c.pace) parts.push(`配速 ${fmtDuration(c.pace)}/km`)
  if (c.kcal) parts.push(`${c.est ? '約 ' : ''}${c.kcal} kcal`)
  if (!parts.length) return null
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-xl bg-sky-soft/60 px-3 py-1.5 text-[11px] tabular-nums text-ink/80">
      <Icon name="monitor_heart" size={14} className="text-sky" />
      {parts.join('・')}
    </div>
  )
}

/** 一般有氧動作：分段記錄（例如跑步機 3 段不同速度） */
export function CardioSegments({
  ex,
  entry,
  locked,
  weight,
  onSet,
  onDone,
  onAdd,
  onRemoveLast,
}: {
  ex: Exercise
  entry: WorkoutEntry
  locked: boolean
  weight: number
  onSet: (i: number, p: Partial<WorkoutSet>) => void
  onDone: (i: number) => void
  onAdd: () => void
  onRemoveLast: () => void
}) {
  return (
    <div className="space-y-2">
      {entry.sets.map((s, i) => (
        <div key={i} className="rounded-2xl border border-ink/5 p-2">
          <div className="mb-1.5 flex items-center justify-between px-1">
            <span className={`text-xs font-bold ${s.done ? 'text-leaf' : 'text-ink/60'}`}>{entry.sets.length > 1 ? `第 ${i + 1} 段` : '這次'}</span>
            {locked ? (
              <Icon name={s.done ? 'check_circle' : 'radio_button_unchecked'} size={20} fill={s.done} className={s.done ? 'text-leaf' : 'text-muted/50'} />
            ) : (
              <CheckButton checked={s.done} onToggle={() => onDone(i)} size={26} />
            )}
          </div>
          <CardioFields ex={ex} set={s} locked={locked} onChange={(p) => onSet(i, p)} />
          {s.done && !s.kcal && s.r > 0 && <p className="mt-1 px-1 text-[10px] text-muted">約 {cardioKcal(ex, s, weight).kcal} kcal（依體重和運動強度估算）</p>}
        </div>
      ))}
      <Derived ex={ex} sets={entry.sets} weight={weight} />
      {!locked && (
        <div className="flex gap-2">
          <Tap onClick={onAdd} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-cream py-2 text-xs text-leaf-dark">
            <Icon name="add" size={16} />
            加一段
          </Tap>
          {entry.sets.length > 1 && (
            <Tap onClick={onRemoveLast} className="rounded-xl bg-cream px-3 py-2 text-xs text-muted">
              刪最後一段
            </Tap>
          )}
        </div>
      )}
    </div>
  )
}

/** 秒錶：正在計時時每秒更新 */
function useNow(active: boolean) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!active) return
    const t = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(t)
  }, [active])
  return active ? now : Date.now()
}

/**
 * 有氧組合（Hyrox、器材循環…）：一個碼錶跑全程，
 * 每完成一站按一下，自動記下這站花了多久。
 */
export function BlockCard({
  w,
  block,
  locked,
  weight,
  update,
  onAddStation,
  onDetail,
  onToast,
}: {
  w: Workout
  block: CardioBlock
  locked: boolean
  weight: number
  update: (fn: (x: Workout) => void) => void
  onAddStation: () => void
  onDetail: (ex: Exercise) => void
  onToast: (msg: string) => void
}) {
  const stations = w.entries.map((e, i) => ({ e, i })).filter(({ e }) => e.block === block.id)
  const running = !!block.startedAt
  const now = useNow(running)
  const elapsed = blockElapsed(block, now)
  const current = stations.find(({ e }) => !e.sets[0]?.done)
  const doneCount = stations.filter(({ e }) => e.sets[0]?.done).length
  const [open, setOpen] = useState<number | null>(null)

  const patchBlock = (fn: (b: CardioBlock) => void) =>
    update((x) => {
      const b = x.blocks?.find((y) => y.id === block.id)
      if (b) fn(b)
    })

  const toggle = () => {
    haptic(10)
    patchBlock((b) => {
      if (b.startedAt) {
        b.ms += Date.now() - b.startedAt
        b.startedAt = undefined
      } else b.startedAt = Date.now()
    })
  }

  const lap = () => {
    if (!current) return
    if (!block.startedAt && !block.ms) {
      toggle()
      onToast('碼錶開始！做完這站再按一次')
      return
    }
    haptic([10, 30, 10])
    const t = blockElapsed(block)
    const split = t - block.lapMs
    const last = stations.filter(({ e }) => !e.sets[0]?.done).length === 1
    update((x) => {
      const s = x.entries[current.i].sets[0]
      s.r = Math.round((split / 60000) * 100) / 100
      s.done = true
      const b = x.blocks!.find((y) => y.id === block.id)!
      b.lapMs = t
      if (!b.startedAt) b.startedAt = Date.now()
      if (last) {
        b.ms = t
        b.startedAt = undefined
      }
    })
    const ex = EXERCISE_MAP[current.e.exerciseId]
    onToast(last ? `完成！總時間 ${fmtDuration(t / 1000)}` : `${ex?.zh ?? '這站'} ${fmtDuration(split / 1000)}`)
  }

  const removeBlock = () => {
    if (!window.confirm(`刪除「${block.name}」整組？`)) return
    update((x) => {
      x.entries = x.entries.filter((e) => e.block !== block.id)
      x.blocks = x.blocks?.filter((b) => b.id !== block.id)
    })
  }

  const totals = stations.reduce(
    (t, { e }) => {
      const ex = EXERCISE_MAP[e.exerciseId]
      if (!ex) return t
      const c = cardioSummary(ex, e.sets, weight)
      return { km: t.km + c.km, kcal: t.kcal + c.kcal }
    },
    { km: 0, kcal: 0 },
  )

  return (
    <motion.section layout transition={spring} className="overflow-hidden rounded-3xl bg-card shadow-card">
      <div className="bg-ink px-4 pb-3 pt-3 text-cream">
        <div className="flex items-center gap-2">
          <Icon name="timer" size={18} />
          <span className="flex-1 truncate text-sm font-bold">{block.name}</span>
          <span className="text-[11px] opacity-70">
            {doneCount}/{stations.length} 站
          </span>
          {!locked && (
            <Tap onClick={removeBlock} aria-label="刪除這組" className="grid h-7 w-7 place-items-center rounded-full opacity-70">
              <Icon name="delete" size={16} />
            </Tap>
          )}
        </div>
        <div className="mt-1 flex items-end gap-3">
          <motion.span className="text-4xl font-bold tabular-nums" animate={{ opacity: running ? [1, 0.75, 1] : 1 }} transition={{ repeat: running ? Infinity : 0, duration: 2 }}>
            {fmtDuration(elapsed / 1000)}
          </motion.span>
          <span className="pb-1.5 text-[11px] tabular-nums opacity-70">
            {totals.km ? `${Math.round(totals.km * 100) / 100} km・` : ''}
            {totals.kcal ? `約 ${Math.round(totals.kcal)} kcal` : ''}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream/15">
          <motion.div className="h-full rounded-full bg-leaf" initial={false} animate={{ width: `${(doneCount / Math.max(1, stations.length)) * 100}%` }} transition={spring} />
        </div>
        {!locked && !w.endedAt && stations.length > 0 && (
          <div className="mt-3 flex gap-2">
            <Tap onClick={toggle} className="flex items-center justify-center gap-1 rounded-2xl bg-cream/15 px-4 py-2.5 text-sm">
              <Icon name={running ? 'pause' : 'play_arrow'} size={18} fill />
              {running ? '暫停' : elapsed ? '繼續' : '開始'}
            </Tap>
            {current && (
              <Tap press={0.96} onClick={lap} className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-leaf py-2.5 text-sm font-bold text-on-leaf">
                <Icon name="check" size={18} weight={700} />
                完成這站
              </Tap>
            )}
          </div>
        )}
      </div>

      <ol className="divide-y divide-ink/5">
        {stations.map(({ e, i }, k) => {
          const ex = EXERCISE_MAP[e.exerciseId]
          if (!ex) return null
          const s = e.sets[0]
          const isCurrent = current?.i === i && !w.endedAt
          return (
            <li key={`${e.exerciseId}-${i}`} className={isCurrent ? 'bg-leaf-soft/50' : ''}>
              <Tap press={0.99} onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center gap-2.5 px-3 py-2 text-left">
                <span className={`w-5 text-center text-xs font-bold tabular-nums ${s?.done ? 'text-leaf' : 'text-muted'}`}>{k + 1}</span>
                <Food id={ex.icon ?? 'cx-dash'} size={28} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{ex.zh}</span>
                  <span className="block truncate text-[11px] text-muted">{s ? targetText(ex, s) : ''}</span>
                </span>
                {s?.done ? (
                  <span className="flex items-center gap-1 text-sm font-bold tabular-nums text-leaf-dark">
                    {fmtDuration((s.r || 0) * 60)}
                    <Icon name="check_circle" size={16} fill className="text-leaf" />
                  </span>
                ) : isCurrent ? (
                  <span className="rounded-full bg-leaf px-2 py-0.5 text-[10px] font-bold text-on-leaf">這站</span>
                ) : null}
              </Tap>
              <AnimatePresence initial={false}>
                {open === i && s && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-2 px-3 pb-3">
                      <CardioFields
                        ex={ex}
                        set={s}
                        locked={locked}
                        onChange={(p) =>
                          update((x) => {
                            Object.assign(x.entries[i].sets[0], p)
                          })
                        }
                      />
                      <div className="flex gap-2 text-xs">
                        <Tap onClick={() => onDetail(ex)} className="rounded-xl bg-cream px-3 py-1.5 text-muted">
                          怎麼做
                        </Tap>
                        {!locked && (
                          <>
                            <Tap
                              onClick={() =>
                                update((x) => {
                                  x.entries[i].sets[0].done = !s.done
                                })
                              }
                              className="rounded-xl bg-cream px-3 py-1.5 text-leaf-dark"
                            >
                              {s.done ? '改成未完成' : '標記完成'}
                            </Tap>
                            <Tap
                              onClick={() => {
                                setOpen(null)
                                update((x) => {
                                  x.entries.splice(i, 1)
                                })
                              }}
                              className="ml-auto rounded-xl bg-cream px-3 py-1.5 text-tomato"
                            >
                              移除這站
                            </Tap>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          )
        })}
      </ol>
      {!locked && (
        <Tap onClick={onAddStation} className="flex w-full items-center justify-center gap-1 border-t border-ink/5 py-2.5 text-xs text-leaf-dark">
          <Icon name="add" size={16} />
          加入一站
        </Tap>
      )}
    </motion.section>
  )
}

/** 選有氧組合課表 */
export function ComboPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (c: ComboTemplate) => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="有氧組合">
      <p className="mb-3 text-xs text-muted">一個碼錶跑全程，每完成一站按一下，自動記下每站花了多久。</p>
      <div className="space-y-2 pb-6">
        {COMBOS.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: i * 0.04 }}>
            <Tap press={0.97} onClick={() => onPick(c)} className="flex w-full items-center gap-3 rounded-3xl bg-card p-3 text-left shadow-card">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cream">
                <Food id={c.icon} size={34} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{c.name}</span>
                <span className="block text-xs text-muted">{c.hint}</span>
              </span>
              <Icon name="chevron_right" size={20} className="text-muted" />
            </Tap>
          </motion.div>
        ))}
      </div>
    </Sheet>
  )
}
