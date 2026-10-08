import { RECIPE_MAP } from '../data/recipes'
import type { MealSlot, PlanEntry } from '../types'
import { addDays, fromKey } from './date'

/**
 * 分享碼格式（放在網址 # 後面，QR Code 掃到的就是這個網址）：
 *   #share=<z|p><base64url>
 * z = deflate 壓縮過；p = 沒壓縮（舊瀏覽器）
 * 內容：版本~標題~分享者~天數~d餐別:食譜id,...
 */

export interface SharedPlan {
  title: string
  by: string
  days: number
  entries: { day: number; meal: MealSlot; recipeId: string }[]
  /** 這台裝置不認得的食譜數（對方版本比較新） */
  unknown: number
}

const MEAL_CODE: Record<MealSlot, string> = { breakfast: 'b', lunch: 'l', dinner: 'd', snack: 's' }
const CODE_MEAL = Object.fromEntries(Object.entries(MEAL_CODE).map(([k, v]) => [v, k])) as Record<string, MealSlot>

const clean = (s: string) => s.replace(/[~|,]/g, ' ').trim().slice(0, 30)

const toB64 = (bytes: Uint8Array) => {
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const fromB64 = (s: string) => {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

const pipe = async (bytes: Uint8Array, stream: CompressionStream | DecompressionStream) => {
  const out = new Blob([bytes]).stream().pipeThrough(stream)
  return new Uint8Array(await new Response(out).arrayBuffer())
}

export async function encodePlan(opts: { title: string; by: string; start: string; days: number; plans: PlanEntry[] }) {
  const startTime = fromKey(opts.start).getTime()
  const items = opts.plans
    .map((p) => ({ day: Math.round((fromKey(p.date).getTime() - startTime) / 86400000), p }))
    .filter(({ day }) => day >= 0 && day < opts.days)
    .sort((a, b) => a.day - b.day)
    .map(({ day, p }) => `${day}${MEAL_CODE[p.meal]}:${p.recipeId}`)
  const text = ['1', clean(opts.title), clean(opts.by), String(opts.days), items.join(',')].join('~')
  const bytes = new TextEncoder().encode(text)
  if (typeof CompressionStream !== 'undefined') {
    try {
      return `z${toB64(await pipe(bytes, new CompressionStream('deflate-raw')))}`
    } catch {
      // 不支援就不壓縮
    }
  }
  return `p${toB64(bytes)}`
}

export async function decodePlan(code: string): Promise<SharedPlan | null> {
  try {
    const kind = code[0]
    let bytes = fromB64(code.slice(1))
    if (kind === 'z') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'))
    else if (kind !== 'p') return null
    const [ver, title, by, days, list] = new TextDecoder().decode(bytes).split('~')
    if (ver !== '1') return null
    let unknown = 0
    const entries: SharedPlan['entries'] = []
    for (const item of (list ?? '').split(',').filter(Boolean)) {
      const m = item.match(/^(\d+)([blds]):(.+)$/)
      if (!m) continue
      if (!RECIPE_MAP[m[3]]) {
        unknown++
        continue
      }
      entries.push({ day: Number(m[1]), meal: CODE_MEAL[m[2]], recipeId: m[3] })
    }
    return { title: title || '好食光菜單', by: by ?? '', days: Math.max(1, Math.min(14, Number(days) || 7)), entries, unknown }
  } catch {
    return null
  }
}

export const shareUrl = (code: string) => `${location.origin}${import.meta.env.BASE_URL}#share=${code}`

/** 從掃到的文字或網址取出分享碼 */
export const extractCode = (text: string) => {
  const m = text.match(/[#&?]share=([A-Za-z0-9_-]+)/)
  if (m) return m[1]
  return /^[zp][A-Za-z0-9_-]{8,}$/.test(text.trim()) ? text.trim() : null
}

export const toPlanEntries = (plan: SharedPlan, start: string): PlanEntry[] =>
  plan.entries.map((e) => ({ date: addDays(start, e.day), meal: e.meal, recipeId: e.recipeId }))
