import { AnimatePresence, motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useMemo, useState } from 'react'
import { EXERCISES, type Exercise } from '../data/exercises'
import { db } from '../db'
import { haptic, spring } from '../lib/feedback'
import {
  BODY_PARTS,
  EQUIP,
  EQUIP_LABEL,
  MUSCLE_ZH,
  bodyData,
  exerciseImage,
  exerciseStats,
  isCardio,
} from '../lib/workout'
import { BodyMap, LOAD_COLORS } from './BodyMap'
import { Food } from './Food'
import { Icon } from './Icon'
import { Button, Sheet, Tap } from './ui'

const LEVEL = { beginner: '新手', intermediate: '進階', expert: '高手' } as const

/** 兩張照片交替＝簡單的動作動畫 */
export function ExerciseAnim({ ex, className = '', play = true }: { ex: Exercise; className?: string; play?: boolean }) {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    if (!play) return
    const t = window.setInterval(() => setFrame((f) => 1 - f), 1100)
    return () => window.clearInterval(t)
  }, [play])
  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
      {[0, 1].map((i) => (
        <motion.img
          key={i}
          src={exerciseImage(ex.id, i)}
          alt=""
          loading="lazy"
          draggable={false}
          initial={false}
          animate={{ opacity: play ? (frame === i ? 1 : 0) : i === 0 ? 1 : 0 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ))}
    </div>
  )
}

export function ExerciseLibrary({
  open,
  onClose,
  onPick,
  pickLabel,
}: {
  open: boolean
  onClose: () => void
  /** 有給就是「挑動作」模式 */
  onPick?: (ex: Exercise) => void
  pickLabel?: string
}) {
  const [part, setPart] = useState<string | null>(null)
  const [equip, setEquip] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [detail, setDetail] = useState<Exercise | null>(null)
  const q = query.trim().toLowerCase()
  const list = useMemo(
    () =>
      EXERCISES.filter((ex) => {
        if (q && !`${ex.zh}${ex.en.toLowerCase()}`.includes(q)) return false
        if (equip && ex.equip !== equip) return false
        if (part) {
          const muscles = BODY_PARTS.find((p) => p.id === part)!.muscles
          if (!ex.primary.some((m) => muscles.includes(m))) return false
        }
        return true
      }),
    [q, equip, part],
  )
  return (
    <>
      <Sheet open={open} onClose={onClose} title={onPick ? '加入動作' : '動作庫'}>
        <div className="space-y-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋動作，例如 臥推、深蹲、划船"
            className="w-full rounded-2xl bg-white px-4 py-3 text-sm shadow-card outline-none ring-leaf/40 focus:ring-2"
          />
          <div className="-mx-5 flex gap-1.5 overflow-x-auto px-5">
            {[{ id: null, label: '全部部位' }, ...BODY_PARTS].map((p) => (
              <Tap
                key={p.id ?? 'all'}
                onClick={() => setPart(p.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition-colors ${part === p.id ? 'bg-ink text-cream' : 'bg-white text-muted shadow-card'}`}
              >
                {p.label}
              </Tap>
            ))}
          </div>
          <div className="-mx-5 flex gap-1.5 overflow-x-auto px-5">
            {[{ id: null, label: '全部器材' }, ...EQUIP.filter((e) => EXERCISES.some((x) => x.equip === e.id))].map((e) => (
              <Tap
                key={e.id ?? 'all'}
                onClick={() => setEquip(e.id)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs transition-colors ${equip === e.id ? 'bg-leaf text-white' : 'bg-leaf-soft/60 text-leaf-dark'}`}
              >
                {e.label}
              </Tap>
            ))}
          </div>
          <p className="px-1 text-[11px] text-muted">共 {list.length} 個動作・點開可以看動作示範和受力肌群</p>
          <ul className="grid grid-cols-2 gap-2">
            {list.map((ex, i) => (
              <motion.li key={ex.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: Math.min(i, 10) * 0.02 }}>
                <Tap press={0.96} onClick={() => setDetail(ex)} className="block w-full overflow-hidden rounded-2xl bg-white text-left shadow-card">
                  <ExerciseAnim ex={ex} play={false} className="aspect-[3/2]" />
                  <span className="block px-2.5 py-2">
                    <span className="block truncate text-sm font-medium">{ex.zh}</span>
                    <span className="block truncate text-[11px] text-muted">
                      {EQUIP_LABEL[ex.equip]}・{ex.primary.map((m) => MUSCLE_ZH[m]).join('、')}
                    </span>
                  </span>
                </Tap>
              </motion.li>
            ))}
          </ul>
        </div>
      </Sheet>
      <ExerciseDetail
        ex={detail}
        onClose={() => setDetail(null)}
        actionLabel={onPick ? (pickLabel ?? '加入這次訓練') : undefined}
        onAction={
          onPick
            ? (ex) => {
                haptic([8, 24, 8])
                setDetail(null)
                onPick(ex)
              }
            : undefined
        }
      />
    </>
  )
}

export function ExerciseDetail({ ex, onClose, actionLabel, onAction }: { ex: Exercise | null; onClose: () => void; actionLabel?: string; onAction?: (ex: Exercise) => void }) {
  const [showSteps, setShowSteps] = useState(false)
  const workouts = useLiveQuery(() => (ex ? db.workouts.orderBy('startedAt').toArray() : []), [ex?.id]) ?? []
  const stats = useMemo(() => (ex ? exerciseStats(ex.id, workouts) : null), [ex, workouts])
  return (
    <Sheet open={!!ex} onClose={onClose} title={ex?.zh}>
      {ex && (
        <div className="space-y-4">
          <ExerciseAnim ex={ex} className="aspect-[3/2] rounded-3xl shadow-card" />
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="rounded-full bg-leaf-soft px-2 py-0.5 text-leaf-dark">{EQUIP_LABEL[ex.equip]}</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-muted shadow-sm">{LEVEL[ex.level]}</span>
            {ex.compound && <span className="rounded-full bg-honey-soft px-2 py-0.5 text-[#a07a20]">多關節</span>}
            <span className="text-muted">{ex.en}</span>
          </div>
          <div className="flex items-start gap-2 rounded-2xl bg-honey-soft/60 p-3 text-sm">
            <Icon name="lightbulb" size={18} fill className="mt-0.5 text-honey" />
            <span>{ex.cue}</span>
          </div>
          {!isCardio(ex) && (
            <section className="rounded-3xl bg-white p-4 shadow-card">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold">受力肌群</span>
                <span className="flex items-center gap-2 text-[11px] text-muted">
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: LOAD_COLORS[1] }} />
                    主要
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: LOAD_COLORS[0] }} />
                    輔助
                  </span>
                </span>
              </div>
              <BodyMap data={bodyData(ex)} colors={LOAD_COLORS} />
              <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                {ex.primary.map((m) => (
                  <span key={m} className="rounded-full px-2 py-0.5 text-white" style={{ background: LOAD_COLORS[1] }}>
                    {MUSCLE_ZH[m]}
                  </span>
                ))}
                {ex.secondary.map((m) => (
                  <span key={m} className="rounded-full px-2 py-0.5" style={{ background: LOAD_COLORS[0] }}>
                    {MUSCLE_ZH[m]}
                  </span>
                ))}
              </div>
            </section>
          )}
          {stats && stats.sessions.length > 0 && (
            <section className="rounded-3xl bg-white p-4 shadow-card">
              <div className="mb-2 flex items-center gap-1.5 text-sm font-bold">
                <Food id="rule-training" size={22} />
                我的紀錄
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat label="做過" value={`${stats.sessions.length} 次`} />
                <Stat label="最重" value={stats.heaviest ? `${stats.heaviest} kg` : '—'} />
                <Stat label="估計 1RM" value={stats.bestRm ? `${Math.round(stats.bestRm)} kg` : '—'} />
              </div>
              <ul className="mt-3 space-y-1 text-xs text-muted">
                {stats.sessions
                  .slice(-5)
                  .reverse()
                  .map((s, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{s.date.slice(5).replace('-', '/')}</span>
                      <span className="tabular-nums">
                        {isCardio(ex) ? `${s.top.r} 分鐘` : `最佳 ${s.top.w ? `${s.top.w}kg × ` : ''}${s.top.r} 下${s.volume ? `・總量 ${Math.round(s.volume)}kg` : ''}`}
                      </span>
                    </li>
                  ))}
              </ul>
            </section>
          )}
          <div className="rounded-3xl bg-white p-4 shadow-card">
            <Tap press={0.98} onClick={() => setShowSteps(!showSteps)} className="flex w-full items-center gap-2 text-left text-sm font-bold">
              <Icon name="menu_book" size={18} className="text-leaf-dark" />
              詳細步驟（英文原文）
              <motion.span animate={{ rotate: showSteps ? 180 : 0 }} className="ml-auto text-muted">
                <Icon name="expand_more" size={20} />
              </motion.span>
            </Tap>
            <AnimatePresence initial={false}>
              {showSteps && (
                <motion.ol initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="list-decimal space-y-1 overflow-hidden pl-5 pt-3 text-xs leading-relaxed text-ink/80">
                  {ex.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </motion.ol>
              )}
            </AnimatePresence>
          </div>
          <p className="px-1 text-[10px] text-muted">動作照片與資料：free-exercise-db（公眾領域）</p>
          {onAction && actionLabel && (
            <div className="sticky bottom-0 -mx-5 bg-gradient-to-t from-cream via-cream to-transparent px-5 pb-1 pt-4">
              <Button className="w-full" onClick={() => onAction(ex)}>
                {actionLabel}
              </Button>
            </div>
          )}
        </div>
      )}
    </Sheet>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-cream py-2">
      <div className="text-sm font-bold tabular-nums">{value}</div>
      <div className="text-[10px] text-muted">{label}</div>
    </div>
  )
}
