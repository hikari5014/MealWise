// Apple Watch 運動匯入：捷徑把「健康」App 的體能訓練寫成一行行文字複製到剪貼簿，這裡解析後存成訓練紀錄
import { db } from '../db'
import { EXERCISE_MAP } from '../data/exercises'
import { addDays, todayKey } from './date'
import { saveMark } from './hooks'
import type { TrainType, Workout } from './workout'

export const WATCH_SHORTCUT = '好食光運動'
export const WATCH_TEMPLATE = '好食光運動|類型=[類型]|開始=[開始日期]|分鐘=[時間長度]|距離=[距離]|消耗=[動態能量]|心率=[平均心率]'
export const WATCH_SAMPLE = [
  '好食光運動|類型=戶外跑步|開始=2026/10/18 07:12|分鐘=32.5|距離=5.12 公里|消耗=318 大卡|心率=152',
  '好食光運動|類型=傳統肌力訓練|開始=2026/10/17 19:05|分鐘=58|距離=|消耗=286 大卡|心率=118',
].join('\n')

/** 給 iOS 27 捷徑 AI 的一段描述：貼進「描述捷徑」就會自動組好 */
export const WATCH_AI_PROMPT = `建立一個名為「${WATCH_SHORTCUT}」的捷徑：
1. 從「健康」App 找出最近 7 天的體能訓練（最新的在前，最多 10 筆）。
2. 每一筆體能訓練產生一行文字，格式完全照這樣：
好食光運動|類型=體能訓練類型|開始=開始日期與時間|分鐘=時間長度（分鐘）|距離=距離（公里）|消耗=動態能量（大卡）|心率=平均心率
3. 把所有行用換行合併成一段文字。
4. 拷貝到剪貼簿。`

export const runWatchShortcut = () => {
  window.location.href = `shortcuts://run-shortcut?name=${encodeURIComponent(WATCH_SHORTCUT)}`
}

/* ───────── iOS 版本偵測 ───────── */

/**
 * iOS 26 起 Safari 的使用者代理把系統版本固定成 18_6，
 * 所以先看「Version/27」這種 Safari 版本（跟 iOS 同號），再看系統版本。
 * 加到主畫面的 App 可能兩個都看不到，這時回傳 null 讓使用者自己選。
 */
export function detectIOS(ua = navigator.userAgent): { major: number | null; sure: boolean } {
  if (!/iPhone|iPad|iPod|Macintosh/.test(ua)) return { major: null, sure: false }
  const safari = /Version\/(\d+)/.exec(ua)
  if (safari && +safari[1] >= 26) return { major: +safari[1], sure: true }
  const os = /OS (\d+)_(\d+)/.exec(ua)
  if (os) {
    const major = +os[1]
    // 18_6 可能是真的 iOS 18，也可能是 26 以後被固定住的
    if (major === 18 && +os[2] >= 6) return { major: safari ? +safari[1] : null, sure: !!safari }
    return { major, sure: true }
  }
  return { major: null, sure: false }
}

/* ───────── 解析 ───────── */

export interface WatchWorkout {
  /** 原始的體能訓練類型文字 */
  type: string
  exerciseId: string | null
  /** 重訓類：不建立有氧動作，只把時間、消耗、心率記在當天的訓練上 */
  strength: boolean
  start?: number
  min?: number
  km?: number
  kcal?: number
  hr?: number
  raw: string
}

/** 體能訓練類型 → 好食光的動作；順序有意義（室內跑步要比跑步先比） */
const TYPE_MAP: [RegExp, string | null][] = [
  [/室內跑|indoor ?run|treadmill|跑步機/i, 'jogging-treadmill'],
  [/跑|run|jog/i, 'cx-outdoor-run'],
  [/健行|登山|hik/i, 'cx-hiking'],
  [/步行|健走|walk/i, 'cx-walk'],
  [/划船|row/i, 'rowing-stationary'],
  [/橢圓|滑步|elliptical/i, 'elliptical-trainer'],
  [/樓梯|踏步|登階|stair|step/i, 'cx-stair-climber'],
  [/單車|自行車|腳踏車|飛輪|cycl|bik|spin/i, 'bicycling-stationary'],
  [/游泳|swim/i, 'cx-swimming'],
  [/跳繩|jump ?rope/i, 'rope-jumping'],
  [/拳擊|kickbox|box/i, 'cx-boxing'],
  [/舞|dance|zumba/i, 'cx-dance'],
  [/滑雪|ski/i, 'cx-ski-erg'],
  [/高強度|間歇|hiit|交叉訓練|cross ?train|混合有氧|mixed ?cardio/i, 'cx-hiit'],
  [/肌力|重量|功能性|核心|strength|functional|core|weight/i, null],
]

const number = (s: string) => {
  const m = /-?[\d.,]+/.exec(s)
  if (!m) return undefined
  const v = parseFloat(m[0].replace(/,/g, ''))
  return Number.isFinite(v) ? v : undefined
}

/** 時間長度：32.5、32 分鐘、0:32:10、1 小時 5 分、1950 秒 */
function minutes(s: string) {
  const t = s.trim()
  if (!t) return undefined
  const hms = /(\d+):(\d{1,2})(?::(\d{1,2}))?/.exec(t)
  if (hms) return hms[3] !== undefined ? +hms[1] * 60 + +hms[2] + +hms[3] / 60 : +hms[1] + +hms[2] / 60
  const h = /([\d.]+)\s*(小時|hr|h\b)/i.exec(t)
  const m = /([\d.]+)\s*(分|min|m\b)/i.exec(t)
  const sec = /([\d.]+)\s*(秒|sec|s\b)/i.exec(t)
  if (h || m || sec) return (h ? +h[1] * 60 : 0) + (m ? +m[1] : 0) + (sec ? +sec[1] / 60 : 0)
  const v = number(t)
  if (v === undefined) return undefined
  return v > 400 ? v / 60 : v // 太大的多半是秒數
}

/** 距離：5.12 公里、5120 公尺、3.2 mi */
function km(s: string) {
  const v = number(s)
  if (v === undefined || v <= 0) return undefined
  if (/英里|mi\b|mile/i.test(s)) return v * 1.609
  if (/公尺|(^|[\d\s])m\b|meter/i.test(s) && !/km|公里/i.test(s)) return v / 1000
  return v
}

/** 日期：2026/10/18 07:12、2026年10月18日 上午7:12、Oct 18, 2026 at 7:12 AM */
function date(s: string) {
  const t = s.trim()
  if (!t) return undefined
  const zh = /(\d{4})\D+(\d{1,2})\D+(\d{1,2})\D*?(上午|下午)?\s*(\d{1,2}):(\d{2})/.exec(t)
  if (zh) {
    let hour = +zh[5]
    if (zh[4] === '下午' && hour < 12) hour += 12
    if (zh[4] === '上午' && hour === 12) hour = 0
    return new Date(+zh[1], +zh[2] - 1, +zh[3], hour, +zh[6]).getTime()
  }
  const d = Date.parse(t.replace(' at ', ' '))
  return Number.isFinite(d) ? d : undefined
}

const field = (line: string, key: string) => new RegExp(`${key}=([^|]*)`).exec(line)?.[1]?.trim() ?? ''

export function parseWatchText(raw: string): WatchWorkout[] {
  return raw
    .split(/\n|(?=好食光運動\|)/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith('好食光運動'))
    .map((line) => {
      const type = field(line, '類型') || '體能訓練'
      const hit = TYPE_MAP.find(([re]) => re.test(type))
      const strength = !!hit && hit[1] === null
      const hr = number(field(line, '心率'))
      const kcal = number(field(line, '消耗'))
      return {
        type,
        exerciseId: hit ? hit[1] : 'cx-hiit',
        strength,
        start: date(field(line, '開始')),
        min: minutes(field(line, '分鐘')),
        km: km(field(line, '距離')),
        kcal: kcal && kcal > 0 ? Math.round(kcal) : undefined,
        hr: hr && hr > 30 && hr < 230 ? Math.round(hr) : undefined,
        raw: line,
      }
    })
}

/** 驗證捷徑輸出：每個欄位有沒有讀到 */
export function checkWatch(list: WatchWorkout[]) {
  const has = (k: keyof WatchWorkout) => list.some((w) => w[k] !== undefined && w[k] !== null)
  return [
    { label: '找到體能訓練', ok: list.length > 0, tip: '剪貼簿裡沒有「好食光運動|」開頭的文字，請確認捷徑最後有「拷貝到剪貼簿」' },
    { label: '開始時間', ok: has('start'), tip: '「開始=」後面要放體能訓練的「開始日期」' },
    { label: '時間長度', ok: has('min'), tip: '「分鐘=」後面要放「時間長度」' },
    { label: '消耗熱量', ok: has('kcal'), tip: '「消耗=」後面要放「動態能量」或「總能量」' },
    { label: '平均心率', ok: has('hr'), tip: '「心率=」後面要放「平均心率」；沒戴手錶的運動本來就沒有' },
    { label: '距離', ok: has('km'), tip: '只有跑步、走路、單車這類才有距離，重訓沒有是正常的', optional: true },
  ]
}

const keyOf = (w: WatchWorkout) => `watch:${w.start ?? ''}:${w.type}:${Math.round(w.min ?? 0)}`

/** 已經匯入過的不重複匯入 */
export async function isImported(w: WatchWorkout) {
  return !!(await db.workouts.filter((x) => x.importKey === keyOf(w)).first())
}

const dateKey = (t?: number) => {
  if (!t) return todayKey()
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const trainType = (w: WatchWorkout): TrainType | undefined =>
  w.strength ? undefined : w.exerciseId === 'cx-hiit' || w.exerciseId === 'cx-boxing' || (w.hr ?? 0) >= 150 ? 'hiit' : 'cardio'

/**
 * 存成好食光的訓練：有氧建立一筆有氧紀錄；
 * 重訓類如果當天已有好食光的訓練就把手錶數據掛上去，沒有才新建一筆。
 */
export async function importWatch(list: WatchWorkout[]) {
  let added = 0
  for (const w of list) {
    if (await isImported(w)) continue
    const date = dateKey(w.start)
    const start = w.start ?? Date.now()
    const watch = { type: w.type, min: w.min, kcal: w.kcal, hr: w.hr, km: w.km }
    if (w.strength) {
      const sameDay = (await db.workouts.where('date').equals(date).toArray()).filter((x) => !x.watch && x.entries.length)
      const target = sameDay.sort((a, b) => Math.abs(a.startedAt - start) - Math.abs(b.startedAt - start))[0]
      if (target) {
        await db.workouts.put({ ...target, watch, importKey: keyOf(w) })
        added++
        continue
      }
    }
    const ex = w.exerciseId ? EXERCISE_MAP[w.exerciseId] : null
    const workout: Workout = {
      date,
      type: trainType(w),
      startedAt: start,
      endedAt: start + (w.min ?? 0) * 60000,
      entries: ex ? [{ exerciseId: ex.id, sets: [{ w: 0, r: Math.round((w.min ?? 0) * 10) / 10, done: true, km: w.km ? Math.round(w.km * 100) / 100 : undefined, kcal: w.kcal, hr: w.hr }] }] : [],
      watch,
      importKey: keyOf(w),
    }
    await db.workouts.add(workout)
    await saveMark(date, { training: true })
    added++
  }
  return added
}

/** 最近 7 天以外的就不顯示，避免捷徑抓太多 */
export const recentOnly = (list: WatchWorkout[]) => list.filter((w) => !w.start || dateKey(w.start) >= addDays(todayKey(), -14))
