// 雲端同步：本機（IndexedDB）照樣是主要的資料，有登入就把變動推上雲端、把其他裝置的變動拉下來。
// 每筆資料存成 user_records 的一列（表名＋鑰匙＋JSON），以最後修改的為準。
import { useEffect, useState } from 'react'
import { db } from '../db'
import { getSession, supabase } from './cloud'

type Row = Record<string, unknown>

/** 要同步的表；auto＝本機自動編號，跨裝置改用 uid 當鑰匙 */
const TABLES: { name: string; auto?: boolean }[] = [
  { name: 'profile' },
  { name: 'plans', auto: true },
  { name: 'logs', auto: true },
  { name: 'workouts', auto: true },
  { name: 'water' },
  { name: 'checks' },
  { name: 'body' },
  { name: 'prefs' },
  { name: 'days' },
  { name: 'recipes' },
  { name: 'batches' },
]
const AUTO = new Set(TABLES.filter((t) => t.auto).map((t) => t.name))
/** 只存在這台裝置的設定，不同步 */
const LOCAL_PREFS = new Set(['healthSetup'])

const LS = { push: 'mw-sync-push', pull: 'mw-sync-pull', tomb: 'mw-sync-tomb', at: 'mw-sync-at' }
const ls = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v)
    } catch {
      /* 存不了就算了 */
    }
  },
}

/** 正在套用雲端資料時不要再記成「本機有改」 */
let applyingRemote = false

const cloudKey = (tbl: string, r: Row) => (AUTO.has(tbl) ? String(r.uid ?? '') : String(r[db.table(tbl).schema.primKey.name as string] ?? ''))

/* ───────── 記錄本機變動 ───────── */

const tombstones = (): { tbl: string; key: string }[] => {
  try {
    return JSON.parse(ls.get(LS.tomb) ?? '[]')
  } catch {
    return []
  }
}

let installed = false
export function installSyncHooks() {
  if (installed) return
  installed = true
  for (const { name, auto } of TABLES) {
    const t = db.table(name)
    t.hook('creating', (_pk, obj: Row) => {
      if (auto && !obj.uid) obj.uid = crypto.randomUUID()
      if (!applyingRemote) {
        obj._m = Date.now()
        scheduleSync()
      }
    })
    t.hook('updating', () => {
      if (applyingRemote) return undefined
      scheduleSync()
      return { _m: Date.now() }
    })
    t.hook('deleting', (pk, obj: Row) => {
      if (applyingRemote || !obj) return
      const key = auto ? String(obj.uid ?? '') : String(pk)
      if (!key) return
      ls.set(LS.tomb, JSON.stringify([...tombstones(), { tbl: name, key }].slice(-2000)))
      scheduleSync()
    })
  }
}

/* ───────── 狀態 ───────── */

export type SyncState = { status: 'idle' | 'syncing' | 'error' | 'off'; at: number | null; error?: string }
let state: SyncState = { status: 'off', at: Number(ls.get(LS.at)) || null }
const subs = new Set<(s: SyncState) => void>()
const setState = (s: Partial<SyncState>) => {
  state = { ...state, ...s }
  subs.forEach((f) => f(state))
}
export function useSyncState() {
  const [s, setS] = useState(state)
  useEffect(() => {
    subs.add(setS)
    return () => {
      subs.delete(setS)
    }
  }, [])
  return s
}

let timer: number | undefined
export function scheduleSync(delay = 4000) {
  if (!getSession()) return
  window.clearTimeout(timer)
  timer = window.setTimeout(() => void syncNow(), delay)
}

/* ───────── 推上雲端 ───────── */

async function planUidMap() {
  const all = await db.plans.toArray()
  return {
    toUid: new Map(all.map((p) => [p.id!, (p as unknown as Row).uid as string])),
    toId: new Map(all.map((p) => [(p as unknown as Row).uid as string, p.id!])),
  }
}

/** 本機 → 雲端：上次推送後改過的資料，plan 的編號換成 uid */
function toCloud(tbl: string, r: Row, toUid: Map<number, string>): Row {
  const d: Row = { ...r }
  delete d._m
  if (AUTO.has(tbl)) delete d.id
  if (tbl === 'logs' && typeof d.planId === 'number') {
    d.planUid = toUid.get(d.planId as number)
    delete d.planId
  }
  if (tbl === 'batches' && Array.isArray(d.planIds)) {
    d.planUids = (d.planIds as number[]).map((id) => toUid.get(id)).filter(Boolean)
    delete d.planIds
  }
  return d
}

async function push(full: boolean) {
  const since = full ? 0 : Number(ls.get(LS.push)) || 0
  const started = Date.now()
  const { toUid } = await planUidMap()
  const rows: { tbl: string; key: string; data: Row | null; deleted: boolean }[] = []
  for (const { name } of TABLES) {
    const all = (await db.table(name).toArray()) as Row[]
    for (const r of all) {
      // 完整推送時，從雲端拉下來的（_m=0）就不用再推回去
      if (full ? r._m === 0 : !(Number(r._m) > since)) continue
      if (name === 'prefs' && LOCAL_PREFS.has(String(r.key))) continue
      const key = cloudKey(name, r)
      if (key) rows.push({ tbl: name, key, data: toCloud(name, r, toUid), deleted: false })
    }
  }
  const tomb = tombstones()
  for (const t of tomb) rows.push({ tbl: t.tbl, key: t.key, data: null, deleted: true })
  for (let i = 0; i < rows.length; i += 400) {
    const { error } = await supabase.from('user_records').upsert(rows.slice(i, i + 400), { onConflict: 'user_id,tbl,key' })
    if (error) throw error
  }
  // 推完才清掉，失敗下次會再推
  const left = tombstones().slice(tomb.length)
  ls.set(LS.tomb, JSON.stringify(left))
  ls.set(LS.push, String(started))
  return rows.length
}

/* ───────── 拉下來 ───────── */

const ORDER = (tbl: string) => (tbl === 'plans' ? 0 : 1) // 先拉菜單，紀錄才對得到 plan

async function pull(full: boolean, cloudWins = false) {
  let since = full ? '1970-01-01T00:00:00Z' : (ls.get(LS.pull) ?? '1970-01-01T00:00:00Z')
  const pushedAt = Number(ls.get(LS.push)) || 0
  let total = 0
  for (;;) {
    const { data, error } = await supabase
      .from('user_records')
      .select('tbl, key, data, deleted, updated_at')
      .gt('updated_at', since)
      .order('updated_at', { ascending: true })
      .limit(1000)
    if (error) throw error
    if (!data?.length) break
    const rows = [...data].sort((a, b) => ORDER(a.tbl) - ORDER(b.tbl))
    applyingRemote = true
    try {
      await db.transaction('rw', TABLES.map((t) => db.table(t.name)), async () => {
        const { toId } = await planUidMap()
        for (const r of rows) {
          const known = TABLES.find((t) => t.name === r.tbl)
          if (!known) continue
          const t = db.table(r.tbl)
          const local = AUTO.has(r.tbl) ? ((await t.where('uid').equals(r.key).first()) as Row | undefined) : ((await t.get(r.key)) as Row | undefined)
          // 本機在上次推送之後又改過：保留本機的，下次推上去
          // 第一次登入時以雲端為準（新手機剛填的設定不該蓋掉原本的）
          if (!cloudWins && local && Number(local._m) > pushedAt) continue
          if (r.deleted) {
            if (local) await t.delete(AUTO.has(r.tbl) ? (local.id as number) : r.key)
            continue
          }
          const d: Row = { ...(r.data as Row), _m: 0 }
          if (AUTO.has(r.tbl)) {
            d.uid = r.key
            if (local) d.id = local.id
            else delete d.id
          }
          if (r.tbl === 'logs') {
            d.planId = d.planUid ? toId.get(d.planUid as string) : undefined
            delete d.planUid
          }
          if (r.tbl === 'batches') {
            d.planIds = ((d.planUids as string[] | undefined) ?? []).map((u) => toId.get(u)).filter((x) => x !== undefined)
            delete d.planUids
          }
          await t.put(d)
          if (r.tbl === 'plans' && !local) toId.set(r.key, (await t.where('uid').equals(r.key).first())?.id as number)
        }
      })
    } finally {
      applyingRemote = false
    }
    total += rows.length
    since = data[data.length - 1].updated_at as string
    ls.set(LS.pull, since)
    if (data.length < 1000) break
  }
  return total
}

/* ───────── 對外 ───────── */

let running: Promise<void> | null = null

/** 同步一次；full＝第一次登入時全部推、全部拉 */
export function syncNow(full = false): Promise<void> {
  if (!getSession()) {
    setState({ status: 'off' })
    return Promise.resolve()
  }
  running ??= (async () => {
    setState({ status: 'syncing', error: undefined })
    try {
      if (full) {
        // 第一次：先拿雲端的，再把這台獨有的推上去
        await pull(true, true)
        await push(true)
      } else {
        await push(false)
        await pull(false)
      }
      const at = Date.now()
      ls.set(LS.at, String(at))
      setState({ status: 'idle', at })
    } catch (e) {
      setState({ status: 'error', error: String((e as { message?: string })?.message ?? e) })
    } finally {
      running = null
    }
  })()
  return running
}

/** 登出時清掉同步記號，下一個帳號登入會重新完整同步 */
export function resetSyncMarks() {
  for (const k of [LS.push, LS.pull, LS.tomb, LS.at]) {
    try {
      localStorage.removeItem(k)
    } catch {
      /* 沒關係 */
    }
  }
  setState({ status: 'off', at: null })
}

export const isFirstSync = () => !ls.get(LS.pull)

/** 登入後自動同步：剛登入、回到 App、每 5 分鐘各一次 */
export function useAutoSync(userId: string | undefined) {
  useEffect(() => {
    if (!userId) {
      setState({ status: 'off' })
      return
    }
    void syncNow(isFirstSync())
    const onVis = () => {
      if (document.visibilityState === 'visible') void syncNow()
    }
    document.addEventListener('visibilitychange', onVis)
    const iv = window.setInterval(() => void syncNow(), 5 * 60_000)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.clearInterval(iv)
    }
  }, [userId])
}
