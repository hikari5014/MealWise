import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'
import { EXERCISE_MAP } from '../data/exercises'
import { haptic, spring } from '../lib/feedback'
import { isIOS } from '../lib/health'
import type { IconName } from '../lib/icons'
import {
  WATCH_AI_PROMPT,
  WATCH_SAMPLE,
  WATCH_SHORTCUT,
  WATCH_TEMPLATE,
  checkWatch,
  detectIOS,
  importWatch,
  isImported,
  parseWatchText,
  recentOnly,
  runWatchShortcut,
  type WatchWorkout,
} from '../lib/watch'
import { fmtDuration } from '../lib/workout'
import { Food } from './Food'
import { Icon } from './Icon'
import { Button, Sheet, Tap, useToast } from './ui'

const PENDING = 'mw-watch-pending'
const setPending = (on: boolean) => {
  try {
    if (on) sessionStorage.setItem(PENDING, String(Date.now()))
    else sessionStorage.removeItem(PENDING)
  } catch {
    /* 無痕模式存不了沒關係 */
  }
}
const isPending = () => {
  try {
    const t = Number(sessionStorage.getItem(PENDING))
    return t > 0 && Date.now() - t < 10 * 60 * 1000
  } catch {
    return false
  }
}

/** 訓練頁的 Apple Watch 卡片：匯入手錶記錄的運動 */
export function WatchCard() {
  const [guide, setGuide] = useState(false)
  const [importing, setImporting] = useState(false)

  // 從捷徑回來時自動打開匯入視窗
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && isPending()) {
        setPending(false)
        setImporting(true)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [])

  const run = () => {
    haptic(10)
    setPending(true)
    runWatchShortcut()
  }

  return (
    <section className="rounded-3xl bg-card p-4 shadow-card">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-cream">
          <Icon name="watch" size={24} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">Apple Watch 運動匯入</span>
          <span className="block text-xs text-muted">手錶記錄的跑步、單車、重訓…一鍵帶進好食光</span>
        </span>
      </div>
      <div className="mt-3 flex gap-2">
        <Button className="flex flex-1 items-center justify-center gap-1.5 text-sm" onClick={run}>
          <Icon name="sync" size={18} />
          匯入運動
        </Button>
        <Button variant="soft" className="flex items-center justify-center gap-1 px-3 text-sm" onClick={() => setImporting(true)}>
          <Icon name="content_paste" size={18} />
          貼上
        </Button>
        <Button variant="soft" className="px-3 text-sm" onClick={() => setGuide(true)}>
          設定教學
        </Button>
      </div>
      <WatchGuide open={guide} onClose={() => setGuide(false)} onTest={run} />
      <ImportSheet open={importing} onClose={() => setImporting(false)} onHelp={() => setGuide(true)} />
    </section>
  )
}

/* ───────── 匯入 ───────── */

function ImportSheet({ open, onClose, onHelp }: { open: boolean; onClose: () => void; onHelp: () => void }) {
  const toast = useToast()
  const [list, setList] = useState<WatchWorkout[] | null>(null)
  const [done, setDone] = useState<Set<number>>(new Set())
  const [pick, setPick] = useState<Set<number>>(new Set())
  const [sample, setSample] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setList(null)
      setError('')
      setSample(false)
    }
  }, [open])

  const load = async (text: string, isSample = false) => {
    const parsed = recentOnly(parseWatchText(text))
    setSample(isSample)
    setList(parsed)
    const already = new Set<number>()
    for (const [i, w] of parsed.entries()) if (await isImported(w)) already.add(i)
    setDone(already)
    setPick(new Set(parsed.map((_, i) => i).filter((i) => !already.has(i))))
    haptic(parsed.length ? [8, 30, 8] : [30, 50, 30])
  }

  const paste = async () => {
    setError('')
    try {
      await load(await navigator.clipboard.readText())
    } catch {
      setError('沒辦法讀剪貼簿，請允許「貼上」，或長按下面的框框手動貼上')
    }
  }

  const doImport = async () => {
    if (!list) return
    const n = await importWatch(list.filter((_, i) => pick.has(i)))
    haptic([10, 40, 10, 40, 20])
    toast(n ? `已匯入 ${n} 筆運動・已標記運動日` : '都已經匯入過了')
    onClose()
  }

  const checks = list ? checkWatch(list) : []

  return (
    <Sheet open={open} onClose={onClose} title="匯入手錶運動">
      <div className="space-y-3 pb-20">
        {!list && (
          <>
            <p className="text-sm text-muted">捷徑跑完後，點下面的按鈕把結果貼進來。</p>
            <Button className="flex w-full items-center justify-center gap-1.5" onClick={paste}>
              <Icon name="content_paste" size={20} />
              貼上捷徑的結果
            </Button>
            <textarea
              aria-label="手動貼上"
              placeholder="或長按這裡貼上"
              onChange={(e) => e.target.value.includes('好食光運動') && load(e.target.value)}
              className="h-20 w-full rounded-2xl bg-card p-3 text-xs shadow-card outline-none"
            />
            {error && <p className="text-xs text-tomato">{error}</p>}
            <div className="flex justify-between text-xs">
              <Tap onClick={() => load(WATCH_SAMPLE, true)} className="py-1 text-leaf-dark">
                用範例資料看看效果
              </Tap>
              <Tap onClick={onHelp} className="py-1 text-muted">
                還沒設定捷徑？
              </Tap>
            </div>
          </>
        )}

        {list && (
          <>
            <Verify checks={checks} />
            {sample && <p className="rounded-2xl bg-honey-soft p-3 text-xs text-honey-ink">這是範例資料，只是讓你看看正確的樣子，不會匯入。</p>}
            <ul className="space-y-2">
              {list.map((w, i) => (
                <WorkoutRow
                  key={i}
                  w={w}
                  done={done.has(i)}
                  on={pick.has(i)}
                  onToggle={() =>
                    setPick((p) => {
                      const n = new Set(p)
                      if (n.has(i)) n.delete(i)
                      else n.add(i)
                      return n
                    })
                  }
                />
              ))}
            </ul>
            <div className="sticky bottom-0 -mx-5 space-y-2 bg-gradient-to-t from-cream via-cream to-transparent px-5 pb-1 pt-4">
              {!sample && list.length > 0 && (
                <Button className="w-full" disabled={!pick.size} onClick={doImport}>
                  {pick.size ? `匯入 ${pick.size} 筆` : '沒有新的運動'}
                </Button>
              )}
              <Button variant="soft" className="w-full" onClick={() => setList(null)}>
                重新貼上
              </Button>
            </div>
          </>
        )}
      </div>
    </Sheet>
  )
}

/** 驗證清單：每個欄位有沒有讀到，沒讀到告訴你怎麼修 */
function Verify({ checks }: { checks: ReturnType<typeof checkWatch> }) {
  const allOk = checks.every((c) => c.ok || c.optional)
  return (
    <div className={`rounded-3xl p-4 ${allOk ? 'bg-leaf-soft' : 'bg-honey-soft/70'}`}>
      <div className="mb-2 flex items-center gap-1.5 text-sm font-bold">
        <Icon name={allOk ? 'check_circle' : 'warning'} size={18} fill className={allOk ? 'text-leaf' : 'text-honey'} />
        {allOk ? '捷徑設定成功！' : '捷徑有些地方要調整'}
      </div>
      <ul className="space-y-1.5">
        {checks.map((c, i) => (
          <motion.li key={c.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: i * 0.06 }} className="text-xs">
            <span className="flex items-center gap-1.5">
              <Icon
                name={c.ok ? 'check_circle' : c.optional ? 'radio_button_unchecked' : 'error'}
                size={16}
                fill={c.ok}
                className={c.ok ? 'text-leaf' : c.optional ? 'text-muted' : 'text-tomato'}
              />
              <span className={c.ok ? '' : 'font-medium'}>{c.label}</span>
            </span>
            {!c.ok && <span className="mt-0.5 block pl-6 text-[11px] text-muted">{c.tip}</span>}
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

function WorkoutRow({ w, done, on, onToggle }: { w: WatchWorkout; done: boolean; on: boolean; onToggle: () => void }) {
  const ex = w.exerciseId ? EXERCISE_MAP[w.exerciseId] : null
  const when = w.start ? new Date(w.start) : null
  return (
    <li>
      <Tap press={0.98} onClick={done ? () => {} : onToggle} className={`flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-card ${done ? 'opacity-50' : ''}`}>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cream">
          {ex?.icon ? <Food id={ex.icon} size={30} /> : <Icon name="fitness_center" size={22} className="text-leaf-dark" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {w.type}
            {ex && !w.strength && <span className="ml-1 text-[11px] font-normal text-muted">→ {ex.zh}</span>}
          </span>
          <span className="block text-[11px] tabular-nums text-muted">
            {when ? `${when.getMonth() + 1}/${when.getDate()} ${String(when.getHours()).padStart(2, '0')}:${String(when.getMinutes()).padStart(2, '0')}` : '日期不明'}
            {w.min ? `・${fmtDuration(w.min * 60)}` : ''}
            {w.km ? `・${Math.round(w.km * 100) / 100} km` : ''}
            {w.kcal ? `・${w.kcal} kcal` : ''}
            {w.hr ? `・♥ ${w.hr}` : ''}
          </span>
          {w.strength && <span className="block text-[10px] text-honey-ink">重訓：數據會加到當天的訓練紀錄</span>}
        </span>
        {done ? (
          <span className="shrink-0 text-[10px] text-muted">已匯入</span>
        ) : (
          <Icon name={on ? 'check_circle' : 'radio_button_unchecked'} size={24} fill={on} className={on ? 'text-leaf' : 'text-muted/50'} />
        )}
      </Tap>
    </li>
  )
}

/* ───────── 設定教學（依 iOS 版本） ───────── */

const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [ok, setOk] = useState(false)
  return (
    <Tap
      onClick={async () => {
        if (await copy(text)) {
          haptic([8, 20, 8])
          setOk(true)
          window.setTimeout(() => setOk(false), 1500)
        }
      }}
      className="inline-flex items-center gap-1 rounded-full bg-leaf px-3 py-1.5 text-xs font-bold text-on-leaf"
    >
      <Icon name={ok ? 'check' : 'content_copy'} size={14} weight={600} />
      {ok ? '已複製' : label}
    </Tap>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <motion.li initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: n * 0.05 }} className="flex gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-cream">{n}</span>
      <div className="min-w-0 flex-1 space-y-2 pb-1 text-sm leading-relaxed">
        <div className="font-bold">{title}</div>
        {children}
      </div>
    </motion.li>
  )
}

function Block({ icon, color, title, lines }: { icon: IconName; color: string; title: string; lines?: string[] }) {
  return (
    <div className="rounded-2xl bg-card p-2.5 shadow-card">
      <div className="flex items-center gap-2 text-xs font-bold">
        <span className="grid h-6 w-6 place-items-center rounded-lg text-white" style={{ backgroundColor: color }}>
          <Icon name={icon} size={15} fill />
        </span>
        {title}
      </div>
      {lines && <div className="mt-1 space-y-0.5 pl-8 text-[11px] text-muted">{lines.map((l) => <div key={l}>{l}</div>)}</div>}
    </div>
  )
}

const ACTIONS = (
  <div className="space-y-1.5">
    <Block icon="favorite" color="rgb(var(--rose))" title="尋找健康樣本" lines={['類型：體能訓練', '開始日期：在過去 7 天內', '排序：最新的在前・限制 10 個']} />
    <Block icon="repeat" color="rgb(var(--sky))" title="重複每一項" />
    <Block icon="edit" color="rgb(var(--honey))" title="文字（在重複裡面）" lines={['好食光運動|類型=…|開始=…|分鐘=…', '…|距離=…|消耗=…|心率=…']} />
    <Block icon="repeat" color="rgb(var(--sky))" title="結束重複" />
    <Block icon="link" color="rgb(var(--leaf))" title="合併文字（用「新行」）" />
    <Block icon="content_paste" color="rgb(var(--sky))" title="拷貝到剪貼簿" />
  </div>
)

function WatchGuide({ open, onClose, onTest }: { open: boolean; onClose: () => void; onTest: () => void }) {
  const detected = detectIOS()
  const [ver, setVer] = useState<'27' | 'old'>(detected.major && detected.major < 27 ? 'old' : '27')
  const [mode, setMode] = useState<'ai' | 'manual'>('ai')
  const ios = isIOS()
  const useAi = ver === '27' && mode === 'ai'

  return (
    <Sheet open={open} onClose={onClose} title="設定 Apple Watch 匯入">
      <div className="space-y-4 pb-20">
        <div className="rounded-3xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-2 text-sm">
            <Icon name="smartphone" size={20} className="text-leaf-dark" />
            {!ios ? (
              <span>這台不是 iPhone，下面是 iPhone 的設定方式</span>
            ) : detected.major && detected.sure ? (
              <span>
                偵測到你的手機是 <b>iOS {detected.major}</b>
              </span>
            ) : (
              <span>看不出 iOS 版本（從主畫面打開時有時看不到），請選一下：</span>
            )}
          </div>
          <div className="mt-2 flex gap-1.5">
            {(
              [
                ['27', 'iOS 27 以上'],
                ['old', 'iOS 26 以下'],
              ] as const
            ).map(([id, label]) => (
              <Tap key={id} onClick={() => setVer(id)} className={`flex-1 rounded-2xl py-2 text-sm transition-colors ${ver === id ? 'bg-ink text-cream' : 'bg-cream'}`}>
                {label}
              </Tap>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted">不確定的話：到「設定 → 一般 → 關於本機 → iOS 版本」看。</p>
        </div>

        {ver === '27' && (
          <div className="flex gap-1.5">
            {(
              [
                ['ai', '用 AI 一句話建立（推薦）'],
                ['manual', '自己一步步建立'],
              ] as const
            ).map(([id, label]) => (
              <Tap key={id} onClick={() => setMode(id)} className={`flex-1 rounded-2xl py-2 text-xs transition-colors ${mode === id ? 'bg-leaf text-on-leaf' : 'bg-card shadow-card'}`}>
                {label}
              </Tap>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.ol key={useAi ? 'ai' : 'manual'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {useAi ? (
              <>
                <Step n={1} title="確認可以用 AI 建立捷徑">
                  <p>iOS 27 的「捷徑」可以用一句話描述，讓 Apple Intelligence 自動組好捷徑。需要：</p>
                  <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted">
                    <li>支援 Apple Intelligence 的 iPhone（iPhone 15 Pro 以後）</li>
                    <li>「設定 → Apple Intelligence 與 Siri」已經打開</li>
                  </ul>
                  <p className="text-xs text-muted">不符合的話，切到上面的「自己一步步建立」。</p>
                </Step>
                <Step n={2} title="複製這段描述">
                  <pre className="whitespace-pre-wrap rounded-2xl bg-card p-3 text-[11px] leading-relaxed shadow-sm">{WATCH_AI_PROMPT}</pre>
                  <div className="flex gap-2">
                    <CopyButton text={WATCH_AI_PROMPT} label="複製描述" />
                    <Tap onClick={() => (window.location.href = 'shortcuts://')} className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1.5 text-xs shadow-sm">
                      打開「捷徑」App
                    </Tap>
                  </div>
                </Step>
                <Step n={3} title="貼給捷徑的 AI">
                  <p>在「捷徑」App 點右上角「＋」新增捷徑，會出現描述捷徑的輸入框，貼上剛剛的描述後送出，等它組好。</p>
                </Step>
                <Step n={4} title="檢查 AI 做的對不對">
                  <p>AI 偶爾會選錯動作，對照一下，應該差不多長這樣：</p>
                  {ACTIONS}
                  <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted">
                    <li>
                      捷徑名稱要是「<b>{WATCH_SHORTCUT}</b>」，一字不差
                    </li>
                    <li>少了什麼，直接跟 AI 說，例如「文字裡加上平均心率」</li>
                    <li>開頭一定要是「好食光運動|」，好食光才認得</li>
                  </ul>
                </Step>
              </>
            ) : (
              <>
                <Step n={1} title={`新增捷徑「${WATCH_SHORTCUT}」`}>
                  <p>打開「捷徑」App，點右上角「＋」，把名稱改成一模一樣的「{WATCH_SHORTCUT}」。</p>
                  <div className="flex gap-2">
                    <CopyButton text={WATCH_SHORTCUT} label="複製名稱" />
                    <Tap onClick={() => (window.location.href = 'shortcuts://')} className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1.5 text-xs shadow-sm">
                      打開「捷徑」App
                    </Tap>
                  </div>
                </Step>
                <Step n={2} title="照這個順序加入動作">{ACTIONS}</Step>
                <Step n={3} title="「文字」動作的內容">
                  <p>貼上範本，再把每個 [ ] 換成「重複項目」的對應欄位（點一下 [ ] 的位置，從鍵盤上方選變數，再選欄位）：</p>
                  <code className="block break-all rounded-2xl bg-card p-3 text-[11px] shadow-sm">{WATCH_TEMPLATE}</code>
                  <CopyButton text={WATCH_TEMPLATE} label="複製範本" />
                </Step>
              </>
            )}
            <Step n={useAi ? 5 : 4} title="驗證是否成功">
              <ol className="list-decimal space-y-0.5 pl-5 text-xs">
                <li>先用 Apple Watch 記錄一次運動（或已經有紀錄）</li>
                <li>按下面「測試捷徑」，第一次會問能不能讀健康資料，選「允許」</li>
                <li>跑完點左上角「返回」回到好食光，點「貼上」</li>
                <li>
                  看到 <b className="text-leaf-dark">「捷徑設定成功！」</b> 和全部打勾就完成了；有紅色的項目會告訴你怎麼修
                </li>
              </ol>
              <Button className="flex w-full items-center justify-center gap-1.5" onClick={onTest}>
                <Icon name="bolt" size={18} fill />
                測試捷徑
              </Button>
            </Step>
          </motion.ol>
        </AnimatePresence>

        <p className="rounded-2xl bg-leaf-soft p-3 text-xs text-leaf-dark">
          小提醒：可以在捷徑的「自動化」設定「體能訓練結束時」或每天固定時間自動執行，回到好食光點「貼上」就好。
        </p>
      </div>
    </Sheet>
  )
}
