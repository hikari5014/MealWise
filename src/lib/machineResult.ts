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
  /** 登階機：踩了幾步、大約爬了幾層樓 */
  steps?: number
  floors?: number
  rpm?: number
  spm?: number
}

/** Life Fitness 登階機：螢幕上 1,060 步＝62 層樓 */
const STEPS_PER_FLOOR = 17.1

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
  // dt 是機器上「運動結束」的當地時間（雖然寫 +00:00，其實不是 UTC：螢幕 10:27 下午 → dt 22:27），開始時間要往前推
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(String(j.dt ?? ''))
  const end = m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]).getTime() : NaN
  const start = end - sec * 1000
  const typeCode = j.t ? String(j.t) : undefined
  const dist = pos((j.dc as { v?: unknown } | undefined)?.v)
  // 登階機（132）的 dc 是「步數」（螢幕：步進 1,060、62 層 → 約 17.1 步一層）；其他機器先當成公尺
  const stair = typeCode === '132'
  const meters = stair ? undefined : dist
  const steps = stair && dist ? Math.round(dist) : undefined
  const hr = pos(j.ahr)
  const mets = pos(j.am)
  return {
    id: String(j.id ?? r.slice(0, 40)),
    brand: 'Life Fitness（Halo）',
    serial: j.bs ? String(j.bs) : undefined,
    typeCode,
    start: Number.isFinite(start) ? start : undefined,
    min: Math.round((sec / 60) * 10) / 10,
    kcal: pos(j.c) ? Math.round(pos(j.c)!) : undefined,
    hr: hr && hr > 30 && hr < 230 ? Math.round(hr) : undefined,
    // 螢幕顯示 6.5，資料裡是 65（乘了 10）
    mets: mets ? (mets > 25 ? mets / 10 : mets) : undefined,
    watts: pos(j.aw),
    level: pos(j.al) ? Math.round(pos(j.al)! * 10) / 10 : undefined,
    km: meters ? Math.round(meters / 10) / 100 : undefined,
    steps,
    floors: steps ? Math.round(steps / STEPS_PER_FLOOR) : undefined,
    rpm: pos(j.ar),
    spm: pos(j.aspm),
  }
}

/** 已經確認過的機器種類代碼（使用者實際掃過、告訴我們是什麼） */
const TYPE_CODES: Record<string, string> = {
  '132': 'cx-stair-climber', // Life Fitness 登階機
}

/** 沒記過這台時猜是什麼器材：先看種類代碼；不認得的話，有步頻＝跑步機，有轉速＝飛輪，其他當滑步機 */
export const guessExercise = (r: MachineResult) =>
  (r.typeCode && TYPE_CODES[r.typeCode]) || (r.spm ? 'jogging-treadmill' : r.rpm ? 'bicycling-stationary' : 'elliptical-trainer')

export const toSet = (r: MachineResult): WorkoutSet => ({
  w: 0,
  r: r.min,
  done: true,
  ...(r.km ? { km: r.km } : {}),
  ...(r.floors ? { floors: r.floors } : {}),
  ...(r.kcal ? { kcal: r.kcal } : {}),
  ...(r.hr ? { hr: r.hr } : {}),
  ...(r.level ? { lvl: r.level } : {}),
  ...(r.rpm ? { rpm: Math.round(r.rpm) } : {}),
  ...(r.spm ? { spm: Math.round(r.spm) } : {}),
})

const SEEN = 'machineResultSeen'
const FIXED = 'machineResultFix1'

/**
 * 舊版把登階機的步數當成公里、把結束時間（當地）當成開始時間（UTC）。
 * 這裡把舊版掃進來的登階機紀錄修正一次：公里 → 樓層，時間改對。
 */
export async function fixOldMachineImports() {
  if ((await db.prefs.get(FIXED))?.value) return
  const list = await db.workouts.filter((w) => !!w.importKey?.startsWith('machine:')).toArray()
  for (const w of list) {
    const e = w.entries[0]
    const s = e?.sets[0]
    if (!e || !s || e.exerciseId !== 'cx-stair-climber' || !s.km || s.floors) continue
    const ms = (w.endedAt ?? w.startedAt) - w.startedAt
    // 舊的開始時間＝把當地時間當 UTC 解讀；換回當地時間後那其實是結束時間
    const end = w.startedAt + new Date(w.startedAt).getTimezoneOffset() * 60000
    const { km, ...rest } = s
    await db.workouts.put({ ...w, date: dateOf(end - ms), startedAt: end - ms, endedAt: end, entries: [{ ...e, sets: [{ ...rest, floors: Math.round((km * 1000) / STEPS_PER_FLOOR) }] }] })
  }
  await db.prefs.put({ key: FIXED, value: true })
}
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
