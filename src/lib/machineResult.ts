// 掃健身器材「運動結束畫面」的 QR Code，直接變成有氧紀錄。
// 目前支援 Life Fitness 的 Halo Fitness：https://halo.fitness/q?t=c&r=<base64 JSON>，數字都在網址裡，不用連網。
import { db } from '../db'
import { todayKey } from './date'
import { saveMark } from './hooks'
import type { Workout, WorkoutSet } from './workout'

export interface MachineResult {
  /** 這次運動的編號（避免重複記錄） */
  id: string
  brand: string
  /** 機器序號：用來記住這台是什麼器材 */
  serial?: string
  /** 機器種類代碼（品牌自己的編號） */
  typeCode?: string
  start?: number
  min: number
  kcal?: number
  hr?: number
  mets?: number
  watts?: number
  level?: number
  km?: number
  rpm?: number
  spm?: number
}

const n = (v: unknown) => {
  const x = typeof v === 'number' ? v : parseFloat(String(v ?? ''))
  return Number.isFinite(x) ? x : undefined
}
const pos = (v: unknown) => {
  const x = n(v)
  return x !== undefined && x > 0 ? x : undefined
}
const fromB64 = (s: string) => {
  const t = s.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(t + '='.repeat((4 - (t.length % 4)) % 4))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

/** 認不得就回傳 null */
export function parseMachineResult(text: string): MachineResult | null {
  let url: URL
  try {
    url = new URL(text.trim())
  } catch {
    return null
  }
  if (!/(^|\.)halo\.fitness$/i.test(url.hostname)) return null
  const r = url.searchParams.get('r')
  if (!r) return null
  let j: Record<string, unknown>
  try {
    j = JSON.parse(fromB64(r))
  } catch {
    return null
  }
  const sec = pos(j.et)
  if (!sec || sec > 24 * 3600) return null
  const start = j.dt ? Date.parse(String(j.dt)) : NaN
  const dist = j.dc as { v?: unknown } | undefined
  // 距離的數字是公尺（30 分鐘、平均每分鐘 43.6 公尺 ≈ 1313 公尺，兩個數字對得上）
  const meters = pos(dist?.v)
  const hr = pos(j.ahr)
  const mets = pos(j.am)
  return {
    id: String(j.id ?? r.slice(0, 40)),
    brand: 'Life Fitness（Halo）',
    serial: j.bs ? String(j.bs) : undefined,
    typeCode: j.t ? String(j.t) : undefined,
    start: Number.isFinite(start) ? start : undefined,
    min: Math.round((sec / 60) * 10) / 10,
    kcal: pos(j.c) ? Math.round(pos(j.c)!) : undefined,
    hr: hr && hr > 30 && hr < 230 ? Math.round(hr) : undefined,
    // 螢幕顯示 6.5，資料裡是 65（乘了 10）
    mets: mets ? (mets > 25 ? mets / 10 : mets) : undefined,
    watts: pos(j.aw),
    level: pos(j.al) ? Math.round(pos(j.al)! * 10) / 10 : undefined,
    km: meters ? Math.round(meters / 10) / 100 : undefined,
    rpm: pos(j.ar),
    spm: pos(j.aspm),
  }
}

/** 沒記過這台時猜是什麼器材：有步頻＝跑步機，有轉速＝飛輪，其他當滑步機 */
export const guessExercise = (r: MachineResult) => (r.spm ? 'jogging-treadmill' : r.rpm ? 'bicycling-stationary' : 'elliptical-trainer')

export const toSet = (r: MachineResult): WorkoutSet => ({
  w: 0,
  r: r.min,
  done: true,
  ...(r.km ? { km: r.km } : {}),
  ...(r.kcal ? { kcal: r.kcal } : {}),
  ...(r.hr ? { hr: r.hr } : {}),
  ...(r.level ? { lvl: r.level } : {}),
  ...(r.rpm ? { rpm: Math.round(r.rpm) } : {}),
  ...(r.spm ? { spm: Math.round(r.spm) } : {}),
})

const SEEN = 'machineResultSeen'
export async function alreadyRecorded(r: MachineResult) {
  const list = ((await db.prefs.get(SEEN))?.value as string[] | undefined) ?? []
  return list.includes(r.id)
}
async function markRecorded(r: MachineResult) {
  const list = ((await db.prefs.get(SEEN))?.value as string[] | undefined) ?? []
  await db.prefs.put({ key: SEEN, value: [...list.filter((x) => x !== r.id), r.id].slice(-300) })
}

const dateOf = (t?: number) => {
  if (!t) return todayKey()
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 存起來：有進行中的訓練就加進去，沒有就新建一筆已完成的有氧紀錄 */
export async function recordMachineResult(r: MachineResult, exerciseId: string, workoutId?: number) {
  const set = toSet(r)
  if (workoutId) {
    const w = await db.workouts.get(workoutId)
    if (w) {
      await db.workouts.put({ ...w, entries: [...w.entries, { exerciseId, sets: [set] }], lastActiveAt: Date.now() })
      await markRecorded(r)
      return w.id!
    }
  }
  const start = r.start ?? Date.now() - r.min * 60000
  const date = dateOf(start)
  const workout: Workout = {
    date,
    type: (r.mets ?? 0) >= 8 || (r.hr ?? 0) >= 150 ? 'hiit' : 'cardio',
    startedAt: start,
    endedAt: start + r.min * 60000,
    entries: [{ exerciseId, sets: [set] }],
    importKey: `machine:${r.id}`,
  }
  const id = (await db.workouts.add(workout)) as number
  await saveMark(date, { training: true })
  await markRecorded(r)
  return id
}
