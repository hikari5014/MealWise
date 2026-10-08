import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import localChangelog from '../data/changelog.json'
import { haptic, spring } from '../lib/feedback'
import { Food } from './Food'
import { Icon } from './Icon'
import { Button, Card, Sheet, useToast } from './ui'

export const APP_VERSION = __APP_VERSION__

export interface ChangelogEntry {
  version: string
  date: string
  title: string
  notes: string[]
}

type Status = 'idle' | 'checking' | 'latest' | 'available' | 'updating' | 'offline'

interface UpdateCtx {
  status: Status
  remote: ChangelogEntry[]
  check: (silent?: boolean) => Promise<void>
  update: () => void
}

const Ctx = createContext<UpdateCtx>({ status: 'idle', remote: [], check: async () => {}, update: () => {} })

export const useUpdate = () => useContext(Ctx)

/** 比較版本號：a > b 回傳正數 */
const compare = (a: string, b: string) => {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0)
  return 0
}

export function UpdateProvider({ children }: { children: ReactNode }) {
  const toast = useToast()
  const [status, setStatus] = useState<Status>('idle')
  const [remote, setRemote] = useState<ChangelogEntry[]>([])
  const wantUpdate = useRef(false)
  const reg = useRef<ServiceWorkerRegistration>()

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, r) {
      reg.current = r
    },
  })

  const update = useCallback(() => {
    haptic([10, 30, 10])
    setStatus('updating')
    wantUpdate.current = true
    if (needRefresh) {
      updateServiceWorker(true)
    } else {
      // 新版還沒下載好：叫瀏覽器去抓，抓好會觸發 needRefresh
      reg.current?.update().catch(() => {})
      // 保險：沒有離線功能（例如開發模式）或等太久，就直接重新整理
      window.setTimeout(() => window.location.reload(), reg.current ? 8000 : 300)
    }
  }, [needRefresh, updateServiceWorker])

  // 新版下載好了
  useEffect(() => {
    if (!needRefresh) return
    if (wantUpdate.current) {
      updateServiceWorker(true)
      return
    }
    setStatus('available')
    toast('好食光有新版本了', update, '更新', 8000)
  }, [needRefresh, updateServiceWorker, toast, update])

  const check = useCallback(
    async (silent = false) => {
      if (!silent) {
        haptic(8)
        setStatus('checking')
      }
      try {
        reg.current?.update().catch(() => {})
        const res = await fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(String(res.status))
        const data = (await res.json()) as { version: string; changelog: ChangelogEntry[] }
        const newer = data.changelog.filter((e) => compare(e.version, APP_VERSION) > 0)
        setRemote(newer)
        // 讓「檢查中」的動畫至少轉一下，不然一閃而過感覺沒做事
        if (!silent) await new Promise((r) => window.setTimeout(r, 600))
        if (newer.length) {
          setStatus('available')
          if (!silent) haptic([10, 40, 10, 40, 10])
        } else if (!silent) {
          setStatus('latest')
          haptic(10)
        }
      } catch {
        if (!silent) setStatus(navigator.onLine ? 'latest' : 'offline')
      }
    },
    [],
  )

  // 開啟時與每 30 分鐘默默檢查一次
  useEffect(() => {
    check(true)
    const t = window.setInterval(() => check(true), 30 * 60 * 1000)
    return () => window.clearInterval(t)
  }, [check])

  return <Ctx.Provider value={{ status, remote, check, update }}>{children}</Ctx.Provider>
}

/* ───────────── 「我的」頁：關於與更新 ───────────── */

const STATUS_VIEW: Record<Status, { icon: Parameters<typeof Icon>[0]['name']; text: string; color: string } | null> = {
  idle: null,
  checking: { icon: 'sync', text: '檢查中…', color: 'text-muted' },
  latest: { icon: 'check_circle', text: '已經是最新版本', color: 'text-leaf-dark' },
  available: { icon: 'new_releases', text: '有新版本可以更新！', color: 'text-tomato' },
  updating: { icon: 'system_update', text: '更新中，馬上好…', color: 'text-leaf-dark' },
  offline: { icon: 'error', text: '目前沒有網路，晚點再試', color: 'text-tomato' },
}

export function AboutCard() {
  const { status, remote, check, update } = useUpdate()
  const [log, setLog] = useState(false)
  const view = STATUS_VIEW[status]

  return (
    <Card>
      <div className="flex items-center gap-3">
        <Food id="bento" size={44} float />
        <div className="flex-1">
          <div className="font-bold">好食光 MealWise</div>
          <div className="text-xs text-muted">
            版本 <span className="tabular-nums">v{APP_VERSION}</span>
          </div>
        </div>
        <Button variant="soft" className="flex items-center gap-1 px-3 py-2 text-sm" onClick={() => setLog(true)}>
          <Icon name="history" size={18} />
          更新日誌
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {view && (
          <motion.div
            key={status}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={spring}
            className="overflow-hidden"
          >
            <div className={`mt-3 flex items-center gap-2 text-sm font-medium ${view.color}`}>
              <Icon
                name={view.icon}
                size={20}
                fill={status !== 'checking'}
                motion={status === 'checking' || status === 'updating' ? 'spin' : status === 'available' ? 'wiggle' : 'pop'}
              />
              {view.text}
            </div>
            {status === 'available' && remote.length > 0 && (
              <ul className="mt-2 space-y-1 rounded-2xl bg-tomato-soft p-3 text-xs">
                <li className="font-bold">
                  v{remote[0].version}・{remote[0].title}
                </li>
                {remote.flatMap((e) => e.notes).map((n) => (
                  <li key={n} className="flex gap-1.5">
                    <span className="text-tomato">•</span>
                    {n}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3">
        {status === 'available' ? (
          <Button className="flex w-full items-center justify-center gap-2" onClick={update}>
            <Icon name="system_update" size={20} fill motion="bounce" />
            立即更新
          </Button>
        ) : (
          <Button
            variant="soft"
            className="flex w-full items-center justify-center gap-2"
            disabled={status === 'checking' || status === 'updating'}
            onClick={() => check()}
          >
            <Icon name="sync" size={20} motion={status === 'checking' ? 'spin' : 'none'} />
            檢查更新
          </Button>
        )}
      </div>

      <ChangelogSheet open={log} onClose={() => setLog(false)} />
    </Card>
  )
}

function ChangelogSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const entries = localChangelog as ChangelogEntry[]
  return (
    <Sheet open={open} onClose={onClose} title="更新日誌">
      <ol className="relative space-y-5 border-l-2 border-leaf/20 pl-5">
        {entries.map((e, i) => (
          <motion.li
            key={e.version}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: 0.05 + i * 0.07 }}
            className="relative"
          >
            <motion.span
              className={`absolute -left-[29px] top-0.5 grid h-4 w-4 place-items-center rounded-full ${
                e.version === APP_VERSION ? 'bg-leaf' : 'bg-white ring-2 ring-leaf/40'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 600, damping: 14, delay: 0.1 + i * 0.07 }}
            />
            <div className="flex items-baseline gap-2">
              <span className="font-bold tabular-nums">v{e.version}</span>
              {e.version === APP_VERSION && (
                <span className="rounded-full bg-leaf-soft px-2 py-0.5 text-[10px] font-bold text-leaf-dark">目前版本</span>
              )}
              <span className="ml-auto text-xs text-muted">{e.date}</span>
            </div>
            <div className="mb-1 text-sm font-medium">{e.title}</div>
            <ul className="space-y-1 text-sm text-ink/80">
              {e.notes.map((n) => (
                <li key={n} className="flex gap-2">
                  <Icon name="check" size={16} className="mt-0.5 text-leaf" weight={600} />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </motion.li>
        ))}
      </ol>
    </Sheet>
  )
}
