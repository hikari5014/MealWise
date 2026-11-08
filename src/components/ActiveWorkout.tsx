// 訓練中的小膠囊：關掉訓練畫面後縮成頂端的小視窗，隨時點開；頁面內容會往下讓位，不會被擋住
import { AnimatePresence, motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { EXERCISE_MAP } from '../data/exercises'
import { db } from '../db'
import { haptic, spring } from '../lib/feedback'
import { saveMark } from '../lib/hooks'
import { activeMs, doneSets, endWorkout, isCardio, lastActive, pauseWorkout, shouldAskIdle, type Workout } from '../lib/workout'
import { Icon } from './Icon'
import { Button, Sheet, Tap, useToast } from './ui'
import { WorkoutSession } from './WorkoutSession'

const Ctx = createContext<{ open: (id: number) => void }>({ open: () => {} })
/** 打開某次訓練的畫面（全 App 共用同一個） */
export const useWorkoutSession = () => useContext(Ctx)

export function WorkoutSessionProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<number | null>(null)
  const active = useLiveQuery(
    () =>
      db.workouts
        .orderBy('startedAt')
        .reverse()
        .filter((w) => !w.endedAt)
        .first(),
    [],
  )
  const showPill = !!active && openId === null
  // 很久沒有動作：像 Apple Watch 一樣問要不要結束（每分鐘檢查一次）
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 60_000)
    const vis = () => document.visibilityState === 'visible' && setNow(Date.now())
    document.addEventListener('visibilitychange', vis)
    return () => {
      window.clearInterval(t)
      document.removeEventListener('visibilitychange', vis)
    }
  }, [])
  const askIdle = !!active && openId === null && shouldAskIdle(active, now)

  // 小視窗出現時，頁面頂端多留一點空間
  useEffect(() => {
    document.documentElement.style.setProperty('--pill-h', showPill ? '44px' : '0px')
  }, [showPill])

  return (
    <Ctx.Provider value={{ open: setOpenId }}>
      {children}
      <AnimatePresence>{showPill && active && <ActivePill key="pill" w={active} onOpen={() => setOpenId(active.id!)} />}</AnimatePresence>
      <WorkoutSession id={openId} onClose={() => setOpenId(null)} />
      <IdleSheet w={askIdle ? active! : null} onOpen={(id) => setOpenId(id)} />
    </Ctx.Provider>
  )
}

const kindOf = (w: Workout) => {
  let cardio = false
  let strength = false
  for (const e of w.entries) {
    if (e.block || isCardio(EXERCISE_MAP[e.exerciseId])) cardio = true
    else strength = true
  }
  if (!cardio && !strength) return w.type === 'cardio' || w.type === 'hiit' ? 'cardio' : 'strength'
  return cardio && strength ? 'both' : cardio ? 'cardio' : 'strength'
}

const clock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600)
  const mm = String(Math.floor((s % 3600) / 60)).padStart(h ? 2 : 1, '0')
  return `${h ? `${h}:` : ''}${mm}:${String(s % 60).padStart(2, '0')}`
}

function ActivePill({ w, onOpen }: { w: Workout; onOpen: () => void }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])
  const paused = !!w.pausedAt
  const kind = kindOf(w)
  // 有氧和重訓都有：每 5 秒換一個動作
  const pose = kind === 'both' ? (Math.floor(now / 5000) % 2 ? 'cardio' : 'strength') : kind
  const last = [...w.entries].reverse().find((e) => EXERCISE_MAP[e.exerciseId])
  const name = last ? EXERCISE_MAP[last.exerciseId].zh : ''

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      transition={spring}
      className="pointer-events-none fixed inset-x-0 z-30 flex justify-center px-4"
      style={{ top: 'calc(env(safe-area-inset-top) + 6px)' }}
    >
      <Tap
        press={0.95}
        onClick={() => {
          haptic(8)
          onOpen()
        }}
        aria-label="打開訓練中的畫面"
        className="pointer-events-auto flex h-9 max-w-[260px] items-center gap-2 rounded-full bg-ink pl-1.5 pr-3 text-cream shadow-card"
      >
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${paused ? 'bg-honey text-ink' : 'bg-leaf text-on-leaf'}`}>
          {paused ? (
            <Icon name="pause" size={18} />
          ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={pose} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.2 }}>
              <ExerciseFigure pose={pose} size={22} />
            </motion.span>
          </AnimatePresence>
          )}
        </span>
        <span className="text-xs font-bold tabular-nums">{clock(activeMs(w, now))}</span>
        {paused && <span className="text-[11px] text-honey">暫停中</span>}
        {name && !paused && <span className="min-w-0 truncate text-[11px] text-cream/70">{name}</span>}
        <Icon name="expand_more" size={16} className="shrink-0 text-cream/70" />
      </Tap>
    </motion.div>
  )
}

/* ───────── 運動中的小人 ───────── */

const loop = { duration: 0.5, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' as const }
const lift = { duration: 0.9, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' as const }

/** 線條小人：cardio＝跑步，strength＝舉槓鈴 */
export function ExerciseFigure({ pose, size = 24 }: { pose: 'cardio' | 'strength'; size?: number }) {
  const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (pose === 'cardio')
    return (
      <motion.svg width={size} height={size} viewBox="0 0 24 24" animate={{ y: [0, -1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} aria-hidden>
        <circle cx="14.5" cy="4" r="2.2" fill="currentColor" />
        <path d="M13.5 7.5 L11.5 14" {...line} />
        <motion.path {...line} animate={{ d: ['M13.2 8.5 L16.5 11 M13.2 8.5 L9.8 10.2', 'M13.2 8.5 L10.2 11.5 M13.2 8.5 L16.2 9.6'] }} transition={loop} />
        <motion.path
          {...line}
          animate={{ d: ['M11.5 14 L14.5 17 L13.5 21 M11.5 14 L8.8 17.5 L6.2 18', 'M11.5 14 L9.4 18 L9.8 21.5 M11.5 14 L14.2 16.5 L16.4 15.6'] }}
          transition={loop}
        />
      </motion.svg>
    )
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="5.6" r="2.1" fill="currentColor" />
      <path d="M12 8.4 L12 14.5" {...line} />
      <motion.path
        {...line}
        animate={{ d: ['M12 9.4 L8.6 7 L7.6 2.6 M12 9.4 L15.4 7 L16.4 2.6', 'M12 9.4 L8.8 11.2 L7.6 8 M12 9.4 L15.2 11.2 L16.4 8'] }}
        transition={lift}
      />
      <motion.g animate={{ y: [0, 5] }} transition={lift}>
        <path d="M5.6 3 L18.4 3" {...line} strokeWidth={1.8} />
        <rect x="4.4" y="1.2" width="2" height="3.6" rx="0.8" fill="currentColor" />
        <rect x="17.6" y="1.2" width="2" height="3.6" rx="0.8" fill="currentColor" />
      </motion.g>
      <motion.path {...line} animate={{ d: ['M12 14.5 L9.8 18.5 L9.8 22.5 M12 14.5 L14.2 18.5 L14.2 22.5', 'M12 14.5 L9.2 18 L9.8 22.5 M12 14.5 L14.8 18 L14.2 22.5'] }} transition={lift} />
    </svg>
  )
}

const hhmm = (t: number) => new Date(t).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })

/** 很久沒動作時問：結束（算到最後有動作的時間）、暫停，或還在練 */
function IdleSheet({ w, onOpen }: { w: Workout | null; onOpen: (id: number) => void }) {
  const toast = useToast()
  const [shown, setShown] = useState<Workout | null>(null)
  useEffect(() => {
    if (w) setShown(w)
  }, [w?.id, !!w])
  const close = async (patch?: Partial<Workout>) => {
    if (shown) await db.workouts.update(shown.id!, { idleAskedAt: Date.now(), ...patch })
    setShown(null)
  }
  if (!shown) return null
  const last = lastActive(shown)
  const idleMin = Math.round((Date.now() - last) / 60000)
  const done = doneSets(shown)
  return (
    <Sheet open={!!w && !!shown} onClose={() => close()} title="還在運動嗎？">
      <div className="space-y-2 pb-4">
        <p className="text-sm text-muted">
          已經 {idleMin >= 60 ? `${Math.floor(idleMin / 60)} 小時 ${idleMin % 60} 分鐘` : `${idleMin} 分鐘`}沒有記錄了，是不是忘了按「完成訓練」？
        </p>
        <Button
          className="flex w-full items-center justify-center gap-1.5"
          onClick={async () => {
            const cur = (await db.workouts.get(shown.id!)) ?? shown
            const ended = endWorkout(cur, { at: lastActive(cur) })
            await db.workouts.put(ended)
            if (done) await saveMark(shown.date, { training: true })
            setShown(null)
            haptic([10, 40, 10])
            toast(done ? `已結束，時間算到 ${hhmm(last)}（最後一次記錄）` : '已結束這次訓練')
          }}
        >
          <Icon name="task_alt" size={20} />
          結束訓練（算到 {hhmm(last)}）
        </Button>
        <Button
          variant="soft"
          className="flex w-full items-center justify-center gap-1.5"
          onClick={async () => {
            const cur = (await db.workouts.get(shown.id!)) ?? shown
            await db.workouts.put({ ...pauseWorkout(cur, lastActive(cur)), idleAskedAt: Date.now() })
            setShown(null)
            toast('已暫停，沒動作的這段時間不算進運動時間')
          }}
        >
          <Icon name="pause" size={20} />
          暫停（從 {hhmm(last)} 開始算暫停）
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={async () => {
            const id = shown.id!
            await close({ lastActiveAt: Date.now() })
            onOpen(id)
          }}
        >
          還在練，打開訓練
        </Button>
      </div>
    </Sheet>
  )
}
