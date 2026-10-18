// 掃健身器材上的 QR Code：先看自己教過的，再比對 public/machines.json 的品牌、型號關鍵字
import { db } from '../db'

export interface MachineRule {
  id: string
  name: string
  match: string
  exercises: string[]
}
export interface MachineData {
  version: number
  updatedAt?: string
  brands: { name: string; match: string }[]
  rules: MachineRule[]
}

/** 自己教過的器材：QR Code 內容 → 做過的動作（常用的在前面） */
export interface MachineBinding {
  ids: string[]
  name?: string
  at: number
}

const PREF = 'machineMap'

let memo: Promise<MachineData> | null = null
export function loadMachines(): Promise<MachineData> {
  memo ??= fetch(`${import.meta.env.BASE_URL}machines.json`, { cache: 'no-cache' })
    .then((r) => (r.ok ? (r.json() as Promise<MachineData>) : Promise.reject(r.status)))
    .catch((e) => {
      memo = null
      throw e
    })
  return memo
}

/** 好食光自己的動作碼：mealwise:ex:<id> 或網址帶 #ex=<id> */
export const ownExerciseCode = (text: string) => /(?:mealwise:ex:|[#?&]ex=)([a-z0-9-]+)/i.exec(text)?.[1] ?? null

/** 當作記憶的鑰匙：去掉追蹤參數和結尾斜線 */
export const machineKey = (text: string) => {
  const t = text.trim()
  try {
    const u = new URL(t)
    for (const k of [...u.searchParams.keys()]) if (/^(utm_|fbclid|gclid)/i.test(k)) u.searchParams.delete(k)
    return (u.origin + u.pathname.replace(/\/+$/, '') + u.search + u.hash).toLowerCase()
  } catch {
    return t.toLowerCase()
  }
}

/** 比對用：解碼網址、轉小寫、符號換成空白 */
export const normalizeMachineText = (text: string) => {
  let t = text
  try {
    t = decodeURIComponent(t)
  } catch {
    /* 解不開就用原文 */
  }
  return ` ${t.toLowerCase().replace(/[-_+/.=?&#%:,;()[\]{}|]+/g, ' ').replace(/\s+/g, ' ')} `
}

export function matchMachine(text: string, data: MachineData) {
  const t = normalizeMachineText(text)
  const test = (re: string) => {
    try {
      return new RegExp(re, 'i').test(t)
    } catch {
      return false
    }
  }
  return {
    rule: data.rules.find((r) => test(r.match)),
    brand: data.brands.find((b) => test(b.match))?.name,
  }
}

export async function getBindings(): Promise<Record<string, MachineBinding>> {
  return ((await db.prefs.get(PREF))?.value as Record<string, MachineBinding> | undefined) ?? {}
}

/** 記住這台用了哪個動作（放到最前面） */
export async function rememberMachine(key: string, exerciseId: string, name?: string) {
  const all = await getBindings()
  const old = all[key]
  all[key] = { ids: [exerciseId, ...(old?.ids ?? []).filter((x) => x !== exerciseId)].slice(0, 12), name: name ?? old?.name, at: Date.now() }
  await db.prefs.put({ key: PREF, value: all })
}

export async function forgetMachine(key: string) {
  const all = await getBindings()
  delete all[key]
  await db.prefs.put({ key: PREF, value: all })
}
