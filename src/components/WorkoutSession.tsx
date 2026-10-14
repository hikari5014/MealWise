import { AnimatePresence, motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useRef, useState } from 'react'
import { EXERCISE_MAP, type Exercise } from '../data/exercises'
import { db } from '../db'
import { haptic, spring } from '../lib/feedback'
import { saveMark } from '../lib/hooks'
import {
  EQUIP_LABEL,
  GRIP_BARS,
  GRIP_HANDS,
  GRIP_WIDTHS,
  TRAIN_MAP,
  doneSets,
  gripLabel,
  gripOptions,
  isBodyweight,
  isCardio,
  lastSetsOf,
  moveFor,
  workoutVolume,
  type Grip,
  type Workout,
  type WorkoutSet,
} from '../lib/workout'
import { ExerciseAnim, ExerciseDetail, ExerciseLibrary } from './ExerciseLibrary'
import { Icon } from './Icon'
import { Button, CheckButton, Sheet, Tap, useToast } from './ui'

const REST_OPTIONS = [60, 90, 120, 180]
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s % 60)).padStart(2, '0')}`

/** 進行中的訓練：加動作、記每組重量次數、勾完成會自動開始休息倒數 */
export function WorkoutSession({ id, onClose }: { id: number | null; onClose: () => void }) {
  const toast = useToast()
  const w = useLiveQuery(() => (id ? db.workouts.get(id) : undefined), [id])
  const [adding, setAdding] = useState(false)
  /** 換成別的動作：記第幾個 */
  const [swapIdx, setSwapIdx] = useState<number | null>(null)
  /** 已完成的訓練預設只能看，按「修改紀錄」才能改 */
  const [editing, setEditing] = useState(false)
  useEffect(() => setEditing(false), [id])
  const [detail, setDetail] = useState<Exercise | null>(null)
  const [restFor, setRestFor] = useState(90)
  const [restEnd, setRestEnd] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const tick = useRef<number>()

  useEffect(() => {
    if (!restEnd) return
    tick.current = window.setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t >= restEnd) {
        haptic([200, 100, 200])
        setRestEnd(null)
        toast('休息結束，下一組！')
      }
    }, 250)
    return () => window.clearInterval(tick.current)
  }, [restEnd])

  const save = (next: Workout) => db.workouts.put(next)
  const update = (fn: (x: Workout) => void) => {
    if (!w) return
    const next = structuredClone(w)
    fn(next)
    save(next)
  }

  const addExercise = async (ex: Exercise) => {
    if (!w) return
    const last = await lastSetsOf(ex.id, w.id)
    if (swapIdx !== null) {
      const old = EXERCISE_MAP[w.entries[swapIdx]?.exerciseId]
      update((x) => {
        x.entries[swapIdx].exerciseId = ex.id
        x.entries[swapIdx].grip = last?.grip ?? x.entries[swapIdx].grip
      })
      setSwapIdx(null)
      toast(`${old?.zh ?? '動作'} 已換成 ${ex.zh}，重量組數不變`)
      return
    }
    const sets: WorkoutSet[] =
      last?.sets ?? (isCardio(ex) ? [{ w: 0, r: 20, done: false }] : Array.from({ length: 3 }, () => ({ w: isBodyweight(ex) ? 0 : 20, r: 10, done: false })))
    update((x) => x.entries.push({ exerciseId: ex.id, sets, ...(last?.grip ? { grip: last.grip } : {}) }))
    setAdding(false)
    toast(last ? `已加入 ${ex.zh}，帶入上次的重量` : `已加入 ${ex.zh}`)
  }

  const finish = async () => {
    if (!w) return
    const n = doneSets(w)
    if (!n) {
      await db.workouts.delete(w.id!)
      onClose()
      toast('沒有完成的組數，這次訓練不保存')
      return
    }
    setRestEnd(null)
    await db.workouts.put({ ...w, endedAt: Date.now() })
    await saveMark(w.date, { training: true })
    haptic([10, 40, 10, 40, 20])
    onClose()
    toast(`辛苦了！完成 ${n} 組・已標記為運動日`)
  }

  const finishEdit = async () => {
    if (!w) return
    setEditing(false)
    if (doneSets(w)) await saveMark(w.date, { training: true })
    haptic([8, 30, 8])
    toast('紀錄已更新')
  }

  const removeWorkout = async () => {
    if (!w || !window.confirm('確定要刪除這次訓練紀錄嗎？')) return
    await db.workouts.delete(w.id!)
    onClose()
    toast('已刪除這次訓練')
  }

  const locked = !!w?.endedAt && !editing
  const minutes = w ? Math.round(((w.endedAt ?? now) - w.startedAt) / 60000) : 0
  const restLeft = restEnd ? Math.ceil((restEnd - now) / 1000) : 0

  return (
    <>
      <Sheet open={!!id && !!w} onClose={onClose} title={w ? `${w.endedAt ? `${w.date.slice(5).replace('-', '/')} ` : ''}${w.type ? TRAIN_MAP[w.type].label.replace('重訓・', '') + '日' : ''}${w.endedAt ? '訓練' : '訓練中'}` : ''}>
        {w && (
          <div className="space-y-4 pb-16">
            <div className="grid grid-cols-3 gap-2 text-center">
              <Mini label="時間" value={`${minutes} 分`} />
              <Mini label="完成組數" value={String(doneSets(w))} />
              <Mini label="總重量" value={`${Math.round(workoutVolume(w))} kg`} />
            </div>

            <AnimatePresence initial={false}>
              {w.entries.map((e, ei) => {
                const ex = EXERCISE_MAP[e.exerciseId]
                if (!ex) return null
                const cardio = isCardio(ex)
                return (
                  <motion.section
                    key={`${e.exerciseId}-${ei}`}
                    layout
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={spring}
                    className="rounded-3xl bg-card p-3 shadow-card"
                  >
                    <div className="mb-2 flex items-center gap-2.5">
                      <Tap press={0.95} onClick={() => setDetail(ex)} aria-label={`看${ex.zh}示範`}>
                        <ExerciseAnim ex={ex} className="h-12 w-16 rounded-xl" />
                      </Tap>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{ex.zh}</div>
                        <div className="truncate text-[11px] text-muted">
                          {EQUIP_LABEL[ex.equip]}
                          {locked && e.grip ? `・${gripLabel(e.grip)}` : ''}
                        </div>
                      </div>
                      {!locked && (
                        <>
                          <Tap onClick={() => setSwapIdx(ei)} aria-label={`把${ex.zh}換成別的動作`} className="grid h-8 w-8 place-items-center rounded-full text-muted">
                            <Icon name="swap_horiz" size={18} />
                          </Tap>
                          <Tap
                            onClick={() => update((x) => x.entries.splice(ei, 1))}
                            aria-label={`移除${ex.zh}`}
                            className="grid h-8 w-8 place-items-center rounded-full text-muted"
                          >
                            <Icon name="delete" size={18} />
                          </Tap>
                        </>
                      )}
                    </div>
                    {!locked && gripOptions(ex) && (
                      <GripPicker
                        grip={e.grip}
                        options={gripOptions(ex)!}
                        onChange={(g) =>
                          update((x) => {
                            x.entries[ei].grip = g
                          })
                        }
                      />
                    )}
                    <div className="grid grid-cols-[22px_1fr_22px_1fr_34px] items-center gap-x-1.5 gap-y-1.5 text-center text-[11px] text-muted">
                      <span>組</span>
                      <span>{cardio ? '' : isBodyweight(ex) ? '加重 kg' : '重量 kg'}</span>
                      <span />
                      <span>{cardio ? '分鐘' : '次數'}</span>
                      <span>完成</span>
                      {e.sets.map((s, si) => (
                        <SetRow
                          key={si}
                          n={si + 1}
                          set={s}
                          cardio={cardio}
                          locked={locked}
                          onChange={(patch) => update((x) => Object.assign(x.entries[ei].sets[si], patch))}
                          canApply={!locked && !cardio && si < e.sets.length - 1}
                          onApply={() => {
                            const later = e.sets.length - si - 1
                            haptic([6, 20, 6])
                            update((x) => x.entries[ei].sets.forEach((t, k) => k > si && !t.done && (t.w = s.w)))
                            toast(`已把 ${s.w} kg 套用到後面 ${later} 組`)
                          }}
                          onDone={() => {
                            const done = !s.done
                            update((x) => (x.entries[ei].sets[si].done = done))
                            if (done && !cardio && !w.endedAt) {
                              setRestEnd(Date.now() + restFor * 1000)
                              setNow(Date.now())
                            }
                          }}
                        />
                      ))}
                    </div>
                    {!locked && (
                    <div className="mt-2 flex gap-2">
                      <Tap
                        onClick={() => update((x) => x.entries[ei].sets.push({ ...(e.sets[e.sets.length - 1] ?? { w: 0, r: 10 }), done: false }))}
                        className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-cream py-2 text-xs text-leaf-dark"
                      >
                        <Icon name="add" size={16} />
                        加一組
                      </Tap>
                      {e.sets.length > 1 && (
                        <Tap onClick={() => update((x) => x.entries[ei].sets.pop())} className="rounded-xl bg-cream px-3 py-2 text-xs text-muted">
                          刪最後一組
                        </Tap>
                      )}
                    </div>
                    )}
                  </motion.section>
                )
              })}
            </AnimatePresence>

            {!locked && (
            <Tap press={0.97} onClick={() => setAdding(true)} className="flex w-full items-center justify-center gap-1.5 rounded-3xl border-2 border-dashed border-leaf/40 py-4 text-sm text-leaf-dark">
              <Icon name="add_circle" size={20} />
              加入動作
            </Tap>
            )}

            {!w.endedAt && (
            <div className="flex items-center gap-2 px-1 text-xs text-muted">
              休息時間
              {REST_OPTIONS.map((r) => (
                <Tap key={r} onClick={() => setRestFor(r)} className={`rounded-full px-2.5 py-1 ${restFor === r ? 'bg-ink text-cream' : 'bg-card shadow-card'}`}>
                  {r < 120 ? `${r} 秒` : `${r / 60} 分`}
                </Tap>
              ))}
            </div>
            )}
            {editing && (
              <Tap onClick={removeWorkout} className="mx-auto flex items-center gap-1 px-3 py-1 text-xs text-tomato">
                <Icon name="delete" size={16} />
                刪除這次訓練
              </Tap>
            )}

            <div className="sticky bottom-0 -mx-5 space-y-2 bg-gradient-to-t from-cream via-cream to-transparent px-5 pb-1 pt-4">
              <AnimatePresence>
                {restEnd && !w.endedAt && (
                  <motion.div
                    key="rest"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 30, opacity: 0 }}
                    transition={spring}
                    className="relative flex items-center gap-2 overflow-hidden rounded-2xl bg-ink px-4 py-2.5 text-cream"
                  >
                    <motion.span
                      className="absolute inset-y-0 left-0 bg-leaf/50"
                      initial={false}
                      animate={{ width: `${(restLeft / restFor) * 100}%` }}
                      transition={{ ease: 'linear', duration: 0.25 }}
                    />
                    <Icon name="timer" size={20} className="relative" />
                    <span className="relative flex-1 text-sm">
                      休息 <b className="tabular-nums">{fmt(restLeft)}</b>
                    </span>
                    <Tap onClick={() => setRestEnd((t) => (t ?? Date.now()) + 30000)} className="relative rounded-full bg-card/15 px-2.5 py-1 text-xs">
                      +30 秒
                    </Tap>
                    <Tap onClick={() => setRestEnd(null)} className="relative rounded-full bg-card/15 px-2.5 py-1 text-xs">
                      跳過
                    </Tap>
                  </motion.div>
                )}
              </AnimatePresence>
              {!w.endedAt ? (
                <Button className="w-full" onClick={finish}>
                  完成訓練
                </Button>
              ) : editing ? (
                <Button className="w-full" onClick={finishEdit}>
                  完成修改
                </Button>
              ) : (
                <Button variant="soft" className="flex w-full items-center justify-center gap-1.5" onClick={() => setEditing(true)}>
                  <Icon name="edit" size={18} />
                  修改紀錄
                </Button>
              )}
            </div>
          </div>
        )}
      </Sheet>
      <ExerciseLibrary
        open={adding || swapIdx !== null}
        pickLabel={swapIdx !== null ? '換成這個動作' : undefined}
        onClose={() => {
          setAdding(false)
          setSwapIdx(null)
        }} onPick={addExercise} defaultMove={moveFor(w?.type)} />
      <ExerciseDetail ex={detail} onClose={() => setDetail(null)} />
    </>
  )
}

function SetRow({
  n,
  set,
  cardio,
  locked,
  onChange,
  onDone,
  canApply,
  onApply,
}: {
  n: number
  set: WorkoutSet
  cardio: boolean
  locked: boolean
  onChange: (p: Partial<WorkoutSet>) => void
  onDone: () => void
  canApply: boolean
  onApply: () => void
}) {
  return (
    <>
      <span className={`text-sm font-bold ${set.done ? 'text-leaf' : 'text-ink/60'}`}>{n}</span>
      {cardio ? <span /> : locked ? <Fixed value={set.w} done={set.done} /> : <NumberField value={set.w} step={2.5} onChange={(v) => onChange({ w: v })} done={set.done} />}
      {canApply ? (
        <Tap onClick={onApply} aria-label="重量套用到後面各組" title="套用到後面各組" className="grid h-8 w-[22px] place-items-center rounded-lg text-leaf-dark">
          <Icon name="keyboard_double_arrow_down" size={18} />
        </Tap>
      ) : (
        <span />
      )}
      {locked ? <Fixed value={set.r} done={set.done} /> : <NumberField value={set.r} step={1} onChange={(v) => onChange({ r: v })} done={set.done} />}
      <span className="flex justify-center">
        {locked ? (
          <Icon name={set.done ? 'check_circle' : 'radio_button_unchecked'} size={22} fill={set.done} className={set.done ? 'text-leaf' : 'text-muted/50'} />
        ) : (
          <CheckButton checked={set.done} onToggle={onDone} size={30} />
        )}
      </span>
    </>
  )
}

function NumberField({ value, step, onChange, done }: { value: number; step: number; onChange: (v: number) => void; done: boolean }) {
  return (
    <span className={`flex items-center rounded-xl transition-colors ${done ? 'bg-leaf-soft' : 'bg-cream'}`}>
      <Tap onClick={() => onChange(Math.max(0, +(value - step).toFixed(2)))} aria-label="減少" className="grid h-8 w-7 place-items-center text-muted">
        <Icon name="remove" size={14} />
      </Tap>
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          const v = parseFloat(e.target.value)
          onChange(Number.isFinite(v) ? v : 0)
        }}
        className="w-full min-w-0 bg-transparent text-center text-sm font-medium tabular-nums text-ink outline-none"
      />
      <Tap onClick={() => onChange(+(value + step).toFixed(2))} aria-label="增加" className="grid h-8 w-7 place-items-center text-muted">
        <Icon name="add" size={14} />
      </Tap>
    </span>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card py-2 shadow-card">
      <div className="text-sm font-bold tabular-nums">{value}</div>
      <div className="text-[10px] text-muted">{label}</div>
    </div>
  )
}

function Fixed({ value, done }: { value: number; done: boolean }) {
  return <span className={`rounded-xl py-1.5 text-sm font-medium tabular-nums ${done ? 'bg-leaf-soft text-ink' : 'bg-cream text-muted'}`}>{value}</span>
}

/** 握把設定：收起時顯示目前選的，點開可以選配件、握距、正反手 */
function GripPicker({ grip, options, onChange }: { grip?: Grip; options: { bar: boolean; width: boolean; hand: boolean }; onChange: (g: Grip | undefined) => void }) {
  const [open, setOpen] = useState(false)
  const label = gripLabel(grip)
  const set = (patch: Partial<Grip>) => {
    haptic(6)
    const next = { ...grip, ...patch }
    for (const k of Object.keys(next) as (keyof Grip)[]) if (!next[k]) delete next[k]
    onChange(Object.keys(next).length ? next : undefined)
  }
  const chip = (on: boolean) => `shrink-0 rounded-full px-2.5 py-1 text-[11px] transition-colors ${on ? 'bg-leaf text-on-leaf' : 'bg-cream text-ink/70'}`
  return (
    <div className="mb-2">
      <Tap press={0.97} onClick={() => setOpen(!open)} className="flex items-center gap-1 rounded-full bg-leaf-soft/60 px-2.5 py-1 text-[11px] text-leaf-dark">
        <Icon name="tune" size={14} />
        {label || '設定握把・握距'}
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="grid">
          <Icon name="expand_more" size={14} />
        </motion.span>
      </Tap>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-1.5 overflow-hidden pt-2">
            {options.bar && (
              <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3">
                {GRIP_BARS.map((b) => (
                  <Tap key={b} onClick={() => set({ bar: grip?.bar === b ? undefined : b })} className={chip(grip?.bar === b)}>
                    {b}
                  </Tap>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {options.width &&
                GRIP_WIDTHS.map((x) => (
                  <Tap key={x.id} onClick={() => set({ width: grip?.width === x.id ? undefined : x.id })} className={chip(grip?.width === x.id)}>
                    {x.label}
                  </Tap>
                ))}
              {options.width && <span className="mx-0.5 w-px self-stretch bg-ink/10" />}
              {GRIP_HANDS.map((x) => (
                <Tap key={x.id} onClick={() => set({ hand: grip?.hand === x.id ? undefined : x.id })} className={chip(grip?.hand === x.id)}>
                  {x.label}
                </Tap>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
