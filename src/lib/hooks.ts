import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { DayMark, LogEntry, MealSlot } from '../types'
import { addDays } from './date'

/** undefined = 讀取中，null = 還沒設定 */
export const useProfile = () => useLiveQuery(() => db.profile.get('me').then((p) => p ?? null))

export const usePlans = (dates: string[]) =>
  useLiveQuery(() => db.plans.where('date').anyOf(dates).toArray(), [dates.join()]) ?? []

export const useLogs = (dates: string[]) =>
  useLiveQuery(() => db.logs.where('date').anyOf(dates).toArray(), [dates.join()]) ?? []

export const useWater = (date: string) => useLiveQuery(() => db.water.get(date).then((w) => w?.ml ?? 0), [date]) ?? 0

/** 最近吃過的食譜（不重複，新到舊） */
export const useRecent = () =>
  useLiveQuery(async () => {
    const logs = await db.logs.orderBy('createdAt').reverse().limit(40).toArray()
    return [...new Set(logs.map((l) => l.recipeId).filter(Boolean))]
  }) ?? []

export const useChecks = (prefix: string) =>
  useLiveQuery(
    async () => {
      const rows = await db.checks.where('key').startsWith(prefix).toArray()
      return new Set(rows.filter((r) => r.checked).map((r) => r.key))
    },
    [prefix],
  ) ?? new Set<string>()

export const actions = {
  async addWater(date: string, delta: number) {
    const cur = (await db.water.get(date))?.ml ?? 0
    await db.water.put({ date, ml: Math.max(0, cur + delta) })
  },
  async log(date: string, meal: MealSlot, recipeId: string, planId?: number, portion = 1) {
    return db.logs.add({ date, meal, recipeId, planId, portion, createdAt: Date.now() })
  },
  async restoreLog(entry: LogEntry) {
    await db.logs.put(entry)
  },
  async toggleCheck(key: string, checked: boolean) {
    await db.checks.put({ key, checked })
  },
}

/** 最近 n 天的身體數據（舊到新） */
export const useBody = (days = 30) =>
  useLiveQuery(async () => {
    const all = await db.body.orderBy('date').reverse().limit(days).toArray()
    return all.reverse()
  }, [days]) ?? []

export const usePref = <T,>(key: string, fallback: T): [T, (v: T) => Promise<unknown>] => {
  const value = useLiveQuery(() => db.prefs.get(key).then((p) => (p ? (p.value as T) : fallback)), [key]) ?? fallback
  return [value, (v: T) => db.prefs.put({ key, value: v })]
}

/** 月曆標記；會多抓前一天，因為「昨天的大餐」會影響今天 */
export const useMarks = (dates: string[]) =>
  useLiveQuery(
    async () => {
      if (!dates.length) return {}
      const keys = [addDays(dates[0], -1), ...dates]
      const rows = await db.days.where('date').anyOf(keys).toArray()
      return Object.fromEntries(rows.map((r) => [r.date, r])) as Record<string, DayMark>
    },
    [dates.join()],
  ) ?? ({} as Record<string, DayMark>)

export const saveMark = async (date: string, patch: Partial<DayMark>) => {
  const cur = (await db.days.get(date)) ?? { date }
  const next = { ...cur, ...patch, date }
  const empty = !next.feast && next.training === undefined && !next.fast
  if (empty) await db.days.delete(date)
  else await db.days.put(next)
}
