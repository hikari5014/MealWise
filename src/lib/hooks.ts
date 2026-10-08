import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { LogEntry, MealSlot } from '../types'

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
    return [...new Set(logs.map((l) => l.recipeId))]
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
