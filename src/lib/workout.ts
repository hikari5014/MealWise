import type { Muscle } from 'react-body-highlighter'
import { EXERCISE_MAP, type Exercise } from '../data/exercises'
import type { FoodImage } from '../data/foodImages'
import { db } from '../db'
import { addDays } from './date'

/** free-exercise-db 的肌群名稱 */
export type FxMuscle =
  | 'abdominals' | 'abductors' | 'adductors' | 'biceps' | 'calves' | 'chest' | 'forearms' | 'glutes' | 'hamstrings'
  | 'lats' | 'lower back' | 'middle back' | 'neck' | 'quadriceps' | 'shoulders' | 'traps' | 'triceps'

export type Equip = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'smith' | 'body' | 'kettlebell' | 'cardio' | 'other'

export const EQUIP: { id: Equip; label: string; image: FoodImage }[] = [
  { id: 'machine', label: '固定器械', image: 'method-steam' },
  { id: 'cable', label: '龍門架／滑輪', image: 'equip-pot' },
  { id: 'dumbbell', label: '啞鈴', image: 'rule-training' },
  { id: 'barbell', label: '槓鈴', image: 'rule-training' },
  { id: 'smith', label: '史密斯機', image: 'rule-training' },
  { id: 'kettlebell', label: '壺鈴', image: 'rule-training' },
  { id: 'body', label: '徒手', image: 'rule-light' },
  { id: 'cardio', label: '有氧器材', image: 'water' },
  { id: 'other', label: '其他', image: 'rule-training' },
]
export const EQUIP_LABEL = Object.fromEntries(EQUIP.map((e) => [e.id, e.label])) as Record<Equip, string>

export const MUSCLE_ZH: Record<FxMuscle, string> = {
  abdominals: '腹肌', abductors: '臀外側', adductors: '大腿內側', biceps: '二頭肌', calves: '小腿', chest: '胸',
  forearms: '前臂', glutes: '臀部', hamstrings: '大腿後側', lats: '背闊肌', 'lower back': '下背', 'middle back': '中背',
  neck: '頸部', quadriceps: '大腿前側', shoulders: '肩膀', traps: '斜方肌', triceps: '三頭肌',
}

/** 練哪個部位（篩選用的大分類） */
export const BODY_PARTS: { id: string; label: string; muscles: FxMuscle[] }[] = [
  { id: 'chest', label: '胸', muscles: ['chest'] },
  { id: 'back', label: '背', muscles: ['lats', 'middle back', 'lower back', 'traps'] },
  { id: 'shoulder', label: '肩', muscles: ['shoulders'] },
  { id: 'arm', label: '手臂', muscles: ['biceps', 'triceps', 'forearms'] },
  { id: 'leg', label: '腿', muscles: ['quadriceps', 'hamstrings', 'calves', 'adductors', 'abductors'] },
  { id: 'glute', label: '臀', muscles: ['glutes'] },
  { id: 'core', label: '核心', muscles: ['abdominals'] },
]

const REAR = /reverse|face pull|rear/i
const FRONT = /press|front|push|dip/i

/** 換成人體圖元件的肌群名稱；肩膀依動作分前束、後束 */
export function toBody(m: FxMuscle, ex?: Exercise): Muscle[] {
  switch (m) {
    case 'abdominals': return ['abs', 'obliques']
    case 'abductors': return ['abductors']
    case 'adductors': return ['adductor']
    case 'biceps': return ['biceps']
    case 'calves': return ['calves', 'left-soleus', 'right-soleus']
    case 'chest': return ['chest']
    case 'forearms': return ['forearm']
    case 'glutes': return ['gluteal']
    case 'hamstrings': return ['hamstring']
    case 'lats': return ['upper-back']
    case 'middle back': return ['upper-back']
    case 'lower back': return ['lower-back']
    case 'neck': return ['neck']
    case 'quadriceps': return ['quadriceps']
    case 'traps': return ['trapezius']
    case 'triceps': return ['triceps']
    case 'shoulders':
      if (ex && REAR.test(ex.en)) return ['back-deltoids']
      if (ex && FRONT.test(ex.en)) return ['front-deltoids']
      return ['front-deltoids', 'back-deltoids']
  }
}

/** 給人體圖的資料：主要肌群出現兩次（深色）、輔助一次（淺色） */
export function bodyData(ex: Exercise) {
  const primary = [...new Set(ex.primary.flatMap((m) => toBody(m, ex)))]
  const secondary = [...new Set(ex.secondary.flatMap((m) => toBody(m, ex)))].filter((m) => !primary.includes(m))
  return [
    { name: 'primary', muscles: primary },
    { name: 'primary2', muscles: primary },
    { name: 'secondary', muscles: secondary },
  ]
}

export const exerciseImage = (id: string, frame: number) => `${import.meta.env.BASE_URL}exercises/${id}-${frame}.webp`

/* ───────── 運動排程 ───────── */

/** 月曆上的運動排程：重訓分推、拉；有氧分高強度、輕度 */
export type TrainType = 'push' | 'pull' | 'hiit' | 'cardio'

export const TRAIN_TYPES: { id: TrainType; label: string; short: string; group: string; image: FoodImage; color: string; soft: string }[] = [
  { id: 'push', label: '重訓・推', short: '推', group: '重訓日', image: 'rule-training', color: '#e07a5f', soft: '#fbe3dc' },
  { id: 'pull', label: '重訓・拉', short: '拉', group: '重訓日', image: 'rule-training', color: '#c98b2b', soft: '#fbf0d9' },
  { id: 'hiit', label: '高強度有氧', short: '強', group: '有氧日', image: 'rule-feast', color: '#d4577a', soft: '#fbe1ea' },
  { id: 'cardio', label: '輕度有氧', short: '有氧', group: '有氧日', image: 'water', color: '#4f8fbf', soft: '#e1eef8' },
]
export const TRAIN_MAP = Object.fromEntries(TRAIN_TYPES.map((t) => [t.id, t])) as Record<TrainType, (typeof TRAIN_TYPES)[number]>

/** 動作庫的訓練類型篩選 */
export const MOVES: { id: 'push' | 'pull' | 'core' | 'cardio'; label: string }[] = [
  { id: 'push', label: '推' },
  { id: 'pull', label: '拉' },
  { id: 'core', label: '核心' },
  { id: 'cardio', label: '有氧' },
]
/** 排程類型 → 動作庫預設篩選 */
export const moveFor = (t?: TrainType) => (t === 'push' ? 'push' : t === 'pull' ? 'pull' : t ? 'cardio' : null)

/* ───────── 紀錄 ───────── */

export interface WorkoutSet {
  /** 重量 kg（有氧為 0） */
  w: number
  /** 次數（有氧為分鐘） */
  r: number
  done: boolean
}
export interface WorkoutEntry {
  exerciseId: string
  sets: WorkoutSet[]
}
export interface Workout {
  id?: number
  date: string
  /** 開始時這天排的類型 */
  type?: TrainType
  startedAt: number
  endedAt?: number
  entries: WorkoutEntry[]
}

export const isCardio = (ex?: Exercise) => ex?.equip === 'cardio'
export const isBodyweight = (ex?: Exercise) => ex?.equip === 'body'

/** Epley 公式估最大重量 */
export const oneRm = (s: WorkoutSet) => (s.w > 0 && s.r > 0 ? s.w * (1 + s.r / 30) : 0)
export const volumeOf = (sets: WorkoutSet[]) => sets.filter((s) => s.done).reduce((t, s) => t + s.w * s.r, 0)
export const workoutVolume = (w: Workout) => w.entries.reduce((t, e) => t + volumeOf(e.sets), 0)
export const doneSets = (w: Workout) => w.entries.reduce((t, e) => t + e.sets.filter((s) => s.done).length, 0)

/** 上一次做這個動作的組數（新增動作時帶入） */
export async function lastSetsOf(exerciseId: string, beforeId?: number): Promise<WorkoutSet[] | null> {
  const list = await db.workouts.orderBy('startedAt').reverse().limit(60).toArray()
  for (const w of list) {
    if (w.id === beforeId) continue
    const e = w.entries.find((x) => x.exerciseId === exerciseId && x.sets.some((s) => s.done))
    if (e) return e.sets.filter((s) => s.done).map((s) => ({ ...s, done: false }))
  }
  return null
}

export interface ExerciseStat {
  best?: WorkoutSet
  bestRm: number
  heaviest: number
  sessions: { date: string; top: WorkoutSet; volume: number }[]
}

export function exerciseStats(exerciseId: string, workouts: Workout[]): ExerciseStat {
  const sessions: ExerciseStat['sessions'] = []
  let best: WorkoutSet | undefined
  let bestRm = 0
  let heaviest = 0
  for (const w of [...workouts].sort((a, b) => a.startedAt - b.startedAt)) {
    const sets = w.entries.filter((e) => e.exerciseId === exerciseId).flatMap((e) => e.sets.filter((s) => s.done))
    if (!sets.length) continue
    const top = sets.reduce((a, b) => (oneRm(b) > oneRm(a) || (oneRm(a) === 0 && b.r > a.r) ? b : a))
    sessions.push({ date: w.date, top, volume: volumeOf(sets) })
    for (const s of sets) {
      if (oneRm(s) > bestRm) {
        bestRm = oneRm(s)
        best = s
      }
      heaviest = Math.max(heaviest, s.w)
    }
  }
  return { best, bestRm, heaviest, sessions }
}

/** 最近 7 天每個肌群練了幾組（主要 1、輔助 0.5） */
export function weeklyMuscles(workouts: Workout[], today: string) {
  const from = addDays(today, -6)
  const sets: Partial<Record<FxMuscle, number>> = {}
  for (const w of workouts) {
    if (w.date < from || w.date > today) continue
    for (const e of w.entries) {
      const ex = EXERCISE_MAP[e.exerciseId]
      if (!ex || isCardio(ex)) continue
      const n = e.sets.filter((s) => s.done).length
      ex.primary.forEach((m) => (sets[m] = (sets[m] ?? 0) + n))
      ex.secondary.forEach((m) => (sets[m] = (sets[m] ?? 0) + n / 2))
    }
  }
  return sets
}

/** 依組數給人體圖顏色深淺：1–5 組淺、6–11 組中、12 組以上深 */
export function weeklyBodyData(sets: Partial<Record<FxMuscle, number>>) {
  const data: { name: string; muscles: Muscle[] }[] = []
  for (const [m, n] of Object.entries(sets) as [FxMuscle, number][]) {
    const level = n >= 12 ? 3 : n >= 6 ? 2 : n > 0 ? 1 : 0
    for (let i = 0; i < level; i++) data.push({ name: `${m}-${i}`, muscles: toBody(m) })
  }
  return data
}
