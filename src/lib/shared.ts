// 管理員發布的「共享食譜」與「公告」：不用登入也看得到，先用上次存的，再從雲端更新
import { useEffect, useState } from 'react'
import type { Recipe } from '../types'
import { supabase } from './cloud'

const read = <T,>(k: string, d: T): T => {
  try {
    return JSON.parse(localStorage.getItem(k) ?? 'null') ?? d
  } catch {
    return d
  }
}
const write = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {
    /* 存不了就算了 */
  }
}

export const SHARED_PREFIX = 'shared-'

export function useSharedRecipes() {
  const [list, setList] = useState<Recipe[]>(() => read('mw-shared-recipes', []))
  useEffect(() => {
    supabase
      .from('shared_recipes')
      .select('id, data')
      .eq('published', true)
      .then(({ data, error }) => {
        if (error || !data) return
        const next = data.map((r) => ({ ...(r.data as Recipe), id: r.id as string, custom: false }))
        write('mw-shared-recipes', next)
        setList(next)
      })
  }, [])
  return list
}

/** 把自己的食譜變成共享食譜（拿掉個人的欄位） */
export const toShared = (r: Recipe): Recipe => {
  const { createdAt: _c, custom: _x, ...rest } = r
  return { ...rest, id: r.id.startsWith(SHARED_PREFIX) ? r.id : SHARED_PREFIX + r.id, custom: false }
}

export interface Announcement {
  id: number
  title: string
  body: string
  level: 'info' | 'success' | 'warning'
  active: boolean
  created_at: string
}

const DISMISS = 'mw-ann-dismissed'

export function useAnnouncements() {
  const [list, setList] = useState<Announcement[]>(() => read('mw-ann', []))
  const [dismissed, setDismissed] = useState<number[]>(() => read(DISMISS, []))
  useEffect(() => {
    supabase
      .from('announcements')
      .select('id, title, body, level, active, created_at')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data, error }) => {
        if (error || !data) return
        write('mw-ann', data)
        setList(data as Announcement[])
      })
  }, [])
  const visible = list.filter((a) => a.active && !dismissed.includes(a.id))
  const dismiss = (id: number) => {
    const next = [...dismissed, id].slice(-50)
    write(DISMISS, next)
    setDismissed(next)
  }
  return { visible, dismiss }
}
