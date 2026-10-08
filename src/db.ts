import Dexie, { type EntityTable } from 'dexie'
import type { Check, LogEntry, PlanEntry, Profile, WaterDay } from './types'

// 所有資料都只存在這台裝置的瀏覽器裡（IndexedDB）
export const db = new Dexie('mealwise') as Dexie & {
  profile: EntityTable<Profile, 'id'>
  plans: EntityTable<PlanEntry, 'id'>
  logs: EntityTable<LogEntry, 'id'>
  water: EntityTable<WaterDay, 'date'>
  checks: EntityTable<Check, 'key'>
}

db.version(1).stores({
  profile: 'id',
  plans: '++id, date, [date+meal]',
  logs: '++id, date, planId, recipeId, createdAt',
  water: 'date',
  checks: 'key',
})
