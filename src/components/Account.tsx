// 會員帳號：登入（Email 驗證碼／Google／Apple）、同步狀態、登出、刪除帳號，管理員多一個後台入口
import { useState } from 'react'
import { db } from '../db'
import { accountAction, authErrorText, sendEmailCode, signInWith, signOut, useMember, useSession, verifyEmailCode } from '../lib/cloud'
import { resetSyncMarks, syncNow, useSyncState } from '../lib/sync'
import { AdminSheet } from './Admin'
import { Icon } from './Icon'
import { Button, Card, Sheet, Tap, useToast } from './ui'

const ago = (t: number | null) => {
  if (!t) return '還沒同步過'
  const m = Math.round((Date.now() - t) / 60000)
  if (m < 1) return '剛剛同步'
  if (m < 60) return `${m} 分鐘前同步`
  if (m < 1440) return `${Math.round(m / 60)} 小時前同步`
  return `${Math.round(m / 1440)} 天前同步`
}

export function AccountCard() {
  const session = useSession()
  const member = useMember(session)
  const sync = useSyncState()
  const toast = useToast()
  const [login, setLogin] = useState(false)
  const [admin, setAdmin] = useState(false)
  const [leaving, setLeaving] = useState<'out' | 'delete' | null>(null)

  if (session === undefined) return null

  if (!session)
    return (
      <Card>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-soft text-sky">
            <Icon name="cloud" size={26} fill />
          </span>
          <div className="flex-1">
            <div className="font-bold">登入會員</div>
            <div className="text-xs text-muted">資料備份到雲端，換手機也不會不見</div>
          </div>
          <Button className="px-4 py-2 text-sm" onClick={() => setLogin(true)}>
            登入
          </Button>
        </div>
        <LoginSheet open={login} onClose={() => setLogin(false)} />
      </Card>
    )

  const name = member?.display_name || session.user.email || '會員'
  const icon = sync.status === 'error' ? 'cloud_off' : sync.status === 'syncing' ? 'sync' : 'cloud_done'
  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${sync.status === 'error' ? 'bg-tomato-soft text-tomato' : 'bg-leaf-soft text-leaf-dark'}`}>
          <Icon name={icon} size={26} fill motion={sync.status === 'syncing' ? 'spin' : 'none'} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold">{name}</div>
          <div className="text-xs text-muted">
            {sync.status === 'syncing' ? '同步中…' : sync.status === 'error' ? '同步失敗，等等會再試' : ago(sync.at)}
            {member?.role === 'admin' && <span className="ml-1.5 rounded-full bg-honey-soft px-1.5 py-0.5 text-[10px] text-honey-ink">管理員</span>}
          </div>
        </div>
        <Button
          variant="soft"
          className="px-3 py-2 text-sm"
          onClick={async () => {
            await syncNow()
            toast('同步好了')
          }}
        >
          立即同步
        </Button>
      </div>
      {sync.status === 'error' && sync.error && <p className="mt-2 break-all text-[11px] text-tomato">{sync.error}</p>}
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {member?.role === 'admin' && (
          <Tap onClick={() => setAdmin(true)} className="flex items-center gap-1 rounded-2xl bg-honey-soft px-3 py-2 text-honey-ink">
            <Icon name="admin_panel_settings" size={18} />
            管理後台
          </Tap>
        )}
        <Tap onClick={() => setLeaving('out')} className="flex items-center gap-1 rounded-2xl bg-cream px-3 py-2">
          <Icon name="logout" size={18} />
          登出
        </Tap>
        <Tap onClick={() => setLeaving('delete')} className="ml-auto px-2 py-2 text-xs text-muted underline">
          刪除帳號
        </Tap>
      </div>
      <AdminSheet open={admin} onClose={() => setAdmin(false)} me={session.user.id} />
      <LeaveSheet mode={leaving} onClose={() => setLeaving(null)} />
    </Card>
  )
}

/* ───────── 登入 ───────── */

export function LoginSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const toast = useToast()

  const run = async (f: () => Promise<{ error: unknown }>) => {
    setBusy(true)
    setErr('')
    try {
      const { error } = await f()
      if (error) throw error
      return true
    } catch (e) {
      setErr(authErrorText(e))
      return false
    } finally {
      setBusy(false)
    }
  }
  const close = () => {
    setSent(false)
    setCode('')
    setErr('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={close} title="登入會員">
      <div className="space-y-3">
        <p className="text-sm text-muted">登入後，菜單、紀錄、訓練和設定會自動備份，在別的手機登入同一個帳號就會出現。</p>
        <Tap disabled={busy} onClick={() => run(() => signInWith('google'))} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card py-3 font-bold shadow-card">
          <GoogleMark />用 Google 登入
        </Tap>
        <Tap disabled={busy} onClick={() => run(() => signInWith('apple'))} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3 font-bold text-cream">
          <AppleMark />用 Apple 登入
        </Tap>
        <div className="flex items-center gap-2 py-1 text-xs text-muted">
          <span className="h-px flex-1 bg-ink/10" />或用 Email<span className="h-px flex-1 bg-ink/10" />
        </div>
        {!sent ? (
          <>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder="你的 Email"
              className="w-full rounded-2xl bg-card px-4 py-3 shadow-card outline-none ring-leaf/40 focus:ring-2"
            />
            <Button
              className="w-full"
              disabled={busy || !/.+@.+\..+/.test(email)}
              onClick={async () => {
                if (await run(() => sendEmailCode(email))) setSent(true)
              }}
            >
              {busy ? '寄送中…' : '寄驗證碼給我'}
            </Button>
          </>
        ) : (
          <>
            <p className="flex items-start gap-1.5 text-sm">
              <Icon name="mail" size={18} className="mt-0.5 text-leaf-dark" />
              <span>
                驗證碼已寄到 <b>{email}</b>，把信裡的 6 位數字填進來（沒看到請找一下垃圾信件）。
              </span>
            </p>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full rounded-2xl bg-card px-4 py-3 text-center text-2xl tracking-[0.4em] shadow-card outline-none ring-leaf/40 focus:ring-2"
            />
            <Button
              className="w-full"
              disabled={busy || code.length < 6}
              onClick={async () => {
                if (await run(() => verifyEmailCode(email, code))) {
                  toast('登入成功，開始同步')
                  close()
                }
              }}
            >
              {busy ? '確認中…' : '登入'}
            </Button>
            <Tap onClick={() => setSent(false)} className="w-full py-1 text-xs text-muted underline">
              換一個 Email／重寄
            </Tap>
          </>
        )}
        {err && <p className="text-sm text-tomato">{err}</p>}
        <p className="flex items-center gap-1 pt-1 text-[11px] text-muted">
          <Icon name="lock" size={14} />
          只有你自己看得到你的資料。
        </p>
      </div>
    </Sheet>
  )
}

/* ───────── 登出／刪除帳號 ───────── */

function LeaveSheet({ mode, onClose }: { mode: 'out' | 'delete' | null; onClose: () => void }) {
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const leave = async (wipe: boolean, del = false) => {
    setBusy(true)
    try {
      if (del) {
        const r = await accountAction({ action: 'delete_me' })
        if (r?.error) throw new Error(r.error)
      } else await syncNow()
      await signOut()
      resetSyncMarks()
      if (wipe) await Promise.all(db.tables.map((t) => t.clear()))
      toast(del ? '帳號和雲端資料已刪除' : '已登出')
      onClose()
    } catch (e) {
      toast(`沒有成功：${String((e as Error)?.message ?? e)}`)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Sheet open={mode !== null} onClose={onClose} title={mode === 'delete' ? '刪除帳號？' : '登出'}>
      {mode === 'delete' ? (
        <div className="space-y-3">
          <p className="text-sm text-muted">雲端上的備份會全部刪除，無法復原。這台手機上的資料會留著。</p>
          <Button className="w-full !bg-tomato" disabled={busy} onClick={() => leave(false, true)}>
            {busy ? '刪除中…' : '確定刪除帳號'}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted">雲端的備份會保留，下次登入就回來。</p>
          <Button className="w-full" disabled={busy} onClick={() => leave(false)}>
            登出，這台的資料留著
          </Button>
          <Button variant="soft" className="w-full" disabled={busy} onClick={() => leave(true)}>
            登出，並清掉這台的資料
          </Button>
          <p className="text-[11px] text-muted">借別人的手機用、或要換別的帳號，選第二個。</p>
        </div>
      )}
    </Sheet>
  )
}

const GoogleMark = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
)

const AppleMark = () => (
  <svg width="16" height="18" viewBox="0 0 384 512" fill="currentColor" aria-hidden>
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
)
