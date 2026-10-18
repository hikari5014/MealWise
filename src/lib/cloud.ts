// 會員與雲端：Supabase（東京）。網址和公開金鑰本來就是給前端用的，資料安全靠資料庫的 RLS 規則
import { createClient, type Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

export const SUPABASE_URL = 'https://tkzduoxcmnlolksnvgqt.supabase.co'
const SUPABASE_KEY = 'sb_publishable_Xwy2FxyhxyCcbhqPTos4HQ_yp3OU82c'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce', storageKey: 'mw-auth' },
})

/** 登入後回到 App 的網址（要加進 Supabase 的 Redirect URLs） */
export const appUrl = () => `${location.origin}${import.meta.env.BASE_URL}`

export interface Member {
  id: string
  email: string | null
  display_name: string | null
  role: 'user' | 'admin'
}

let current: Session | null = null
const listeners = new Set<(s: Session | null) => void>()
supabase.auth.getSession().then(({ data }) => {
  current = data.session
  listeners.forEach((f) => f(current))
})
supabase.auth.onAuthStateChange((_e, s) => {
  current = s
  listeners.forEach((f) => f(current))
})

export const getSession = () => current

/** 目前登入狀態；undefined 代表還在讀取 */
export function useSession() {
  const [s, setS] = useState<Session | null | undefined>(current ?? undefined)
  useEffect(() => {
    const f = (x: Session | null) => setS(x)
    listeners.add(f)
    supabase.auth.getSession().then(({ data }) => setS(data.session))
    return () => {
      listeners.delete(f)
    }
  }, [])
  return s
}

export function useMember(session: Session | null | undefined) {
  const [m, setM] = useState<Member | null>(null)
  useEffect(() => {
    if (!session) return setM(null)
    let alive = true
    supabase
      .from('profiles')
      .select('id, email, display_name, role')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => alive && setM(data as Member | null))
    supabase.rpc('touch_last_seen').then(() => {})
    return () => {
      alive = false
    }
  }, [session?.user.id])
  return m
}

export const sendEmailCode = (email: string) => supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: appUrl(), shouldCreateUser: true } })

export const verifyEmailCode = (email: string, token: string) => supabase.auth.verifyOtp({ email, token, type: 'email' })

export const signInWith = (provider: 'google' | 'apple') => supabase.auth.signInWithOAuth({ provider, options: { redirectTo: appUrl() } })

export const signOut = () => supabase.auth.signOut()

/** 呼叫雲端帳號小程式（刪除帳號、停用會員） */
export async function accountAction(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('account', { body })
  if (error) throw error
  return data as { ok?: boolean; error?: string }
}

/** 登入錯誤訊息換成白話 */
export function authErrorText(e: unknown) {
  const msg = String((e as { message?: string })?.message ?? e)
  if (/rate|too many|seconds/i.test(msg)) return '寄太多次了，請等一分鐘再試'
  if (/invalid|expired|token/i.test(msg)) return '驗證碼不對或已過期，請重新寄一次'
  if (/email/i.test(msg)) return 'Email 格式不正確'
  if (/provider is not enabled|unsupported provider/i.test(msg)) return '這個登入方式還沒在後台開啟'
  if (/network|fetch/i.test(msg)) return '連不上伺服器，請確認網路'
  return msg
}
