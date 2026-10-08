import Dexie, { type EntityTable } from 'dexie'
import { LEGACY_AVOID } from './data/avoid'
import type { BodyRecord, Check, LogEntry, PlanEntry, Pref, Profile, WaterDay } from './types'

// 所有資料都只存在這台裝置的瀏覽器裡（IndexedDB）
export const db = new Dexie('mealwise') as Dexie & {
  profile: EntityTable<Profile, 'id'>
  plans: EntityTable<PlanEntry, 'id'>
  logs: EntityTable<LogEntry, 'id'>
  water: EntityTable<WaterDay, 'date'>
  checks: EntityTable<Check, 'key'>
  body: EntityTable<BodyRecord, 'date'>
  prefs: EntityTable<Pref, 'key'>
}

db.version(1).stores({
  profile: 'id',
  plans: '++id, date, [date+meal]',
  logs: '++id, date, planId, recipeId, createdAt',
  water: 'date',
  checks: 'key',
})

// v2：忌口從大分類改成細項
db.version(2)
  .stores({})
  .upgrade((tx) =>
    tx
      .table('profile')
      .toCollection()
      .modify((p: Profile) => {
        p.avoid = [...new Set(p.avoid.flatMap((a) => LEGACY_AVOID[a] ?? [a]))]
      }),
  )

// v3：身體數據（體重、體脂…）與偏好設定
db.version(3).stores({
  body: 'date',
  prefs: 'key',
})
