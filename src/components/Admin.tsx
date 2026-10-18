// 管理後台：只有管理員看得到（資料庫規則也會擋，不是管理員什麼都拿不到）
import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useEffect, useState } from 'react'
import { db } from '../db'
import { accountAction, supabase } from '../lib/cloud'
import { toShared, type Announcement } from '../lib/shared'
import type { Recipe } from '../types'
import { Icon } from './Icon'
import { Button, Segmented, Sheet, Tap, useToast } from './ui'

type Tab = 'overview' | 'members' | 'news' | 'recipes'

export function AdminSheet({ open, onClose, me }: { open: boolean; onClose: () => void; me: string }) {
  const [tab, setTab] = useState<Tab>('overview')
  return (
    <Sheet open={open} onClose={onClose} title="管理後台">
      <div className="space-y-4">
        <Segmented
          id="admin"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'overview', label: '總覽' },
            { value: 'members', label: '會員' },
            { value: 'news', label: '公告' },
            { value: 'recipes', label: '食譜' },
          ]}
        />
        {open && tab === 'overview' && <Overview />}
        {open && tab === 'members' && <Members me={me} />}
        {open && tab === 'news' && <News />}
        {open && tab === 'recipes' && <SharedRecipes />}
      </div>
    </Sheet>
  )
}

const errText = (e: unknown) => String((e as { message?: string })?.message ?? e)

function useRpc<T>(fn: () => PromiseLike<{ data: T | null; error: unknown }>) {
  const [data, setData] = useState<T | null>(null)
  const [err, setErr] = useState('')
  const load = useCallback(() => {
    fn().then(({ data, error }) => (error ? setErr(errText(error)) : setData(data)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(load, [load])
  return { data, err, reload: load }
}

/* ───────── 總覽 ───────── */

function Overview() {
  const { data, err } = useRpc(() => supabase.rpc('admin_overview'))
  const o = data as Record<string, number> | null
  if (err) return <p className="text-sm text-tomato">{err}</p>
  const items: [string, number | undefined][] = [
    ['會員', o?.members],
    ['7 天內有用', o?.active7],
    ['7 天內新加入', o?.new7],
    ['雲端資料筆數', o?.records],
    ['進行中的公告', o?.announcements],
    ['共享食譜', o?.sharedRecipes],
  ]
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(([l, v]) => (
        <div key={l} className="rounded-2xl bg-card p-3 shadow-card">
          <div className="text-2xl font-bold tabular-nums">{v ?? '…'}</div>
          <div className="text-xs text-muted">{l}</div>
        </div>
      ))}
    </div>
  )
}

/* ───────── 會員 ───────── */

interface MemberRow {
  id: string
  email: string | null
  display_name: string | null
  role: 'user' | 'admin'
  created_at: string
  last_seen_at: string | null
  records: number
  banned: boolean
  provider: string | null
}

const day = (s: string | null) => (s ? new Date(s).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }) : '—')
const PROVIDER: Record<string, string> = { email: 'Email', google: 'Google', apple: 'Apple' }

function Members({ me }: { me: string }) {
  const { data, err, reload } = useRpc<MemberRow[]>(() => supabase.rpc('admin_members'))
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState('')
  const toast = useToast()
  const act = async (id: string, f: () => Promise<unknown>, done: string) => {
    setBusy(id)
    try {
      await f()
      toast(done)
      reload()
    } catch (e) {
      toast(`沒有成功：${errText(e)}`)
    } finally {
      setBusy('')
    }
  }
  if (err) return <p className="text-sm text-tomato">{err}</p>
  const list = (data ?? []).filter((m) => !q || `${m.email} ${m.display_name}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="space-y-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜尋 Email 或名字"
        className="w-full rounded-2xl bg-card px-4 py-2.5 text-sm shadow-card outline-none ring-leaf/40 focus:ring-2"
      />
      {!data && <p className="text-sm text-muted">讀取中…</p>}
      {list.map((m) => (
        <div key={m.id} className={`rounded-2xl bg-card p-3 shadow-card ${m.banned ? 'opacity-60' : ''}`}>
          <div className="flex items-center gap-1.5">
            <span className="min-w-0 flex-1 truncate font-medium">{m.display_name || m.email || '（沒有 Email）'}</span>
            {m.role === 'admin' && <span className="rounded-full bg-honey-soft px-1.5 py-0.5 text-[10px] text-honey-ink">管理員</span>}
            {m.banned && <span className="rounded-full bg-tomato-soft px-1.5 py-0.5 text-[10px] text-tomato">已停用</span>}
          </div>
          {m.display_name && <div className="truncate text-xs text-muted">{m.email}</div>}
          <div className="mt-1 text-[11px] text-muted">
            {PROVIDER[m.provider ?? ''] ?? m.provider ?? '—'}・{day(m.created_at)} 加入・最近 {day(m.last_seen_at)}・{m.records} 筆資料
          </div>
          {m.id !== me && (
            <div className="mt-2 flex gap-2 text-xs">
              <Tap
                disabled={busy === m.id}
                onClick={() =>
                  act(
                    m.id,
                    async () => {
                      const { error } = await supabase.rpc('admin_set_role', { target: m.id, new_role: m.role === 'admin' ? 'user' : 'admin' })
                      if (error) throw error
                    },
                    m.role === 'admin' ? '已取消管理員' : '已設為管理員',
                  )
                }
                className="rounded-xl bg-cream px-2.5 py-1.5"
              >
                {m.role === 'admin' ? '取消管理員' : '設為管理員'}
              </Tap>
              <Tap
                disabled={busy === m.id}
                onClick={() =>
                  act(
                    m.id,
                    async () => {
                      const r = await accountAction({ action: 'ban', target: m.id, ban: !m.banned })
                      if (r?.error) throw new Error(r.error)
                    },
                    m.banned ? '已恢復' : '已停用',
                  )
                }
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 ${m.banned ? 'bg-leaf-soft text-leaf-dark' : 'bg-tomato-soft text-tomato'}`}
              >
                <Icon name="block" size={14} />
                {m.banned ? '恢復使用' : '停用帳號'}
              </Tap>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ───────── 公告 ───────── */

const LEVELS: { value: Announcement['level']; label: string }[] = [
  { value: 'info', label: '一般' },
  { value: 'success', label: '好消息' },
  { value: 'warning', label: '注意' },
]

function News() {
  const { data, err, reload } = useRpc<Announcement[]>(() =>
    supabase.from('announcements').select('id, title, body, level, active, created_at').order('created_at', { ascending: false }).limit(30),
  )
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [level, setLevel] = useState<Announcement['level']>('info')
  const toast = useToast()
  const run = async (p: PromiseLike<{ error: unknown }>, done: string) => {
    const { error } = await p
    if (error) return toast(`沒有成功：${errText(error)}`)
    toast(done)
    reload()
  }
  if (err) return <p className="text-sm text-tomato">{err}</p>
  return (
    <div className="space-y-3">
      <div className="space-y-2 rounded-2xl bg-card p-3 shadow-card">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="標題" className="w-full rounded-xl bg-cream px-3 py-2 text-sm outline-none" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="內容（可不填）" rows={3} className="w-full rounded-xl bg-cream px-3 py-2 text-sm outline-none" />
        <Segmented id="ann-level" value={level} onChange={setLevel} options={LEVELS} />
        <Button
          className="w-full"
          disabled={!title.trim()}
          onClick={async () => {
            await run(supabase.from('announcements').insert({ title: title.trim(), body: body.trim(), level }), '公告已發布')
            setTitle('')
            setBody('')
          }}
        >
          發布公告
        </Button>
        <p className="text-[11px] text-muted">所有人打開 App 的「今天」頁就會看到，不用登入。</p>
      </div>
      {(data ?? []).map((a) => (
        <div key={a.id} className={`rounded-2xl bg-card p-3 shadow-card ${a.active ? '' : 'opacity-50'}`}>
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="font-medium">{a.title}</div>
              {a.body && <p className="whitespace-pre-line text-xs text-muted">{a.body}</p>}
              <div className="mt-1 text-[11px] text-muted">
                {LEVELS.find((l) => l.value === a.level)?.label}・{day(a.created_at)}
              </div>
            </div>
            <Tap onClick={() => run(supabase.from('announcements').update({ active: !a.active }).eq('id', a.id), a.active ? '已下架' : '已重新上架')} className="rounded-xl bg-cream px-2.5 py-1.5 text-xs">
              {a.active ? '下架' : '上架'}
            </Tap>
            <Tap aria-label="刪除" onClick={() => run(supabase.from('announcements').delete().eq('id', a.id), '已刪除')} className="p-1.5 text-muted">
              <Icon name="delete" size={18} />
            </Tap>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ───────── 共享食譜 ───────── */

function SharedRecipes() {
  const mine = useLiveQuery(() => db.recipes.orderBy('createdAt').reverse().toArray()) ?? []
  const own = mine.filter((r) => !r.eatout)
  const { data, err, reload } = useRpc<{ id: string; published: boolean }[]>(() => supabase.from('shared_recipes').select('id, published'))
  const toast = useToast()
  const state = new Map((data ?? []).map((r) => [r.id, r.published]))
  const toggle = async (r: Recipe) => {
    const s = toShared(r)
    const on = state.get(s.id)
    const { error } = on ? await supabase.from('shared_recipes').update({ published: false }).eq('id', s.id) : await supabase.from('shared_recipes').upsert({ id: s.id, data: s, published: true })
    if (error) return toast(`沒有成功：${errText(error)}`)
    toast(on ? '已取消共享' : '已共享給所有人')
    reload()
  }
  if (err) return <p className="text-sm text-tomato">{err}</p>
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted">把你自己新增的食譜分享出去，所有人的食譜清單都會出現（重新打開 App 後）。改了食譜內容，再按一次「更新」。</p>
      {!own.length && <p className="text-sm text-muted">還沒有自己新增的食譜。</p>}
      {own.map((r) => {
        const on = state.get(toShared(r).id)
        return (
          <div key={r.id} className="flex items-center gap-2 rounded-2xl bg-card p-3 shadow-card">
            <span className="min-w-0 flex-1 truncate text-sm">{r.name}</span>
            {on && (
              <Tap
                onClick={async () => {
                  const s = toShared(r)
                  const { error } = await supabase.from('shared_recipes').update({ data: s }).eq('id', s.id)
                  toast(error ? `沒有成功：${errText(error)}` : '已更新')
                }}
                className="rounded-xl bg-cream px-2.5 py-1.5 text-xs"
              >
                更新
              </Tap>
            )}
            <Tap onClick={() => toggle(r)} className={`rounded-xl px-2.5 py-1.5 text-xs ${on ? 'bg-leaf text-on-leaf' : 'bg-cream'}`}>
              {on ? '共享中' : '共享'}
            </Tap>
          </div>
        )
      })}
    </div>
  )
}
