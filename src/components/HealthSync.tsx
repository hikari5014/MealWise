import { AnimatePresence, motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { db } from '../db'
import { haptic, spring } from '../lib/feedback'
import {
  isIOS,
  parseHealthText,
  runShortcut,
  saveBody,
  SHORTCUT_NAME,
  SHORTCUT_TEMPLATE,
  type HealthData,
} from '../lib/health'
import { CountUp } from './Ring'
import { Button, Sheet, useToast } from './ui'

export const PREF_SETUP = 'health-setup'
export const PREF_TIP_DISMISSED = 'health-tip-dismissed'
const PENDING_KEY = 'mealwise-health-pending'

interface Ctx {
  /** 跑捷徑，回來後自動跳出「貼上」 */
  sync: () => void
  openGuide: (step?: number) => void
  openPaste: () => void
  openManual: () => void
}

const HealthCtx = createContext<Ctx>({ sync: () => {}, openGuide: () => {}, openPaste: () => {}, openManual: () => {} })

export const useHealth = () => useContext(HealthCtx)

const setPending = (on: boolean) => {
  try {
    if (on) sessionStorage.setItem(PENDING_KEY, String(Date.now()))
    else sessionStorage.removeItem(PENDING_KEY)
  } catch {
    // 無痕模式等情況存不了，沒關係
  }
}

const isPending = () => {
  try {
    const t = Number(sessionStorage.getItem(PENDING_KEY))
    return t > 0 && Date.now() - t < 10 * 60 * 1000
  } catch {
    return false
  }
}

export function HealthSyncProvider({ children }: { children: ReactNode }) {
  const [guide, setGuide] = useState<number | null>(null)
  const [paste, setPaste] = useState(false)
  const [manual, setManual] = useState(false)

  const sync = useCallback(() => {
    haptic(10)
    setPending(true)
    runShortcut()
  }, [])

  // 從捷徑回到好食光時，自動跳出貼上視窗
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && isPending()) {
        setPending(false)
        setPaste(true)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [])

  const value: Ctx = {
    sync,
    openGuide: (step = 0) => setGuide(step),
    openPaste: () => setPaste(true),
    openManual: () => setManual(true),
  }

  return (
    <HealthCtx.Provider value={value}>
      {children}
      <GuideSheet step={guide} setStep={setGuide} onSync={sync} />
      <PasteSheet
        open={paste}
        onClose={() => setPaste(false)}
        onHelp={() => {
          setPaste(false)
          setGuide(3)
        }}
      />
      <ManualSheet open={manual} onClose={() => setManual(false)} />
    </HealthCtx.Provider>
  )
}

/* ───────────── 教學 ───────────── */

const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function CopyChip({ text, label }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={async () => {
        if (await copy(text)) {
          haptic([8, 20, 8])
          setDone(true)
          window.setTimeout(() => setDone(false), 1400)
        }
      }}
      className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-leaf-dark shadow-sm"
    >
      <motion.span
        key={done ? 'ok' : 'copy'}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={spring}
      >
        {done ? '✓ 已複製' : `📋 ${label ?? '複製'}`}
      </motion.span>
    </motion.button>
  )
}

/** 仿「捷徑」App 的動作方塊 */
function ActionBlock({ icon, color, title, lines }: { icon: string; color: string; title: string; lines?: ReactNode[] }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 14, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: spring } }}
      className="rounded-2xl bg-white p-3 shadow-card"
    >
      <div className="flex items-center gap-2 text-sm font-bold">
        <span className="grid h-7 w-7 place-items-center rounded-lg text-sm text-white" style={{ backgroundColor: color }}>
          {icon}
        </span>
        {title}
      </div>
      {lines && (
        <div className="mt-2 space-y-1 pl-9 text-xs text-muted">
          {lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

const Token = ({ children }: { children: ReactNode }) => (
  <span className="mx-0.5 inline-block rounded-md bg-sky px-1.5 py-0.5 text-[11px] font-medium text-white">{children}</span>
)

const Blocks = ({ children }: { children: ReactNode }) => (
  <motion.div
    className="space-y-2"
    initial="hidden"
    animate="show"
    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
  >
    {children}
  </motion.div>
)

interface Step {
  emoji: string
  title: string
  body: ReactNode
}

const STEPS = (onSync: () => void): Step[] => [
  {
    emoji: '🔐',
    title: '為什麼要用「捷徑」？',
    body: (
      <div className="space-y-3 text-sm leading-relaxed">
        <p>
          「健康」App 就像一個<b>上了鎖的房間</b>，網頁做的 App 沒有鑰匙。
        </p>
        <p>
          iPhone 內建的<b>「捷徑」</b>有鑰匙，我們請它當小幫手：每次把最新體重<b>抄一份</b>給好食光。
        </p>
        <div className="flex items-center justify-center gap-3 py-2 text-4xl">
          <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
            ❤️
          </motion.span>
          <motion.span
            animate={{ x: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="text-2xl text-muted"
          >
            →
          </motion.span>
          <motion.span animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            🪄
          </motion.span>
          <motion.span
            animate={{ x: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
            className="text-2xl text-muted"
          >
            →
          </motion.span>
          <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.6, delay: 0.4 }}>
            🍱
          </motion.span>
        </div>
        <p className="rounded-2xl bg-honey-soft p-3 text-xs">
          只要設定一次，大約 3 分鐘。Omron 等體重計如果有同步到「健康」，數據也會一起帶過來。
        </p>
      </div>
    ),
  },
  {
    emoji: '➕',
    title: '新增一個捷徑',
    body: (
      <div className="space-y-3 text-sm leading-relaxed">
        <ol className="list-decimal space-y-2 pl-5">
          <li>打開 iPhone 的「捷徑」App</li>
          <li>點右上角的「＋」</li>
          <li>
            點最上面的名稱，改成：
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-xl bg-white px-3 py-1.5 font-bold shadow-sm">{SHORTCUT_NAME}</span>
              <CopyChip text={SHORTCUT_NAME} />
            </div>
          </li>
        </ol>
        <p className="text-xs text-muted">⚠️ 名字要一模一樣，好食光才叫得到它。</p>
        <Button variant="soft" className="w-full" onClick={() => (window.location.href = 'shortcuts://')}>
          打開「捷徑」App
        </Button>
      </div>
    ),
  },
  {
    emoji: '❤️',
    title: '請它去「健康」拿體重',
    body: (
      <div className="space-y-3 text-sm leading-relaxed">
        <p>點「加入動作」，搜尋「尋找健康樣本」，照下面設定：</p>
        <Blocks>
          <ActionBlock
            icon="❤️"
            color="#ff375f"
            title="尋找健康樣本"
            lines={['類型：體重', '排序方式：開始日期・最新到最舊', '限制：開啟，1 個樣本']}
          />
        </Blocks>
        <p className="text-xs text-muted">
          想要更多？用同樣方式再加「體脂肪率」「步數」「活動能量」各一個。只要體重也完全沒問題。
        </p>
      </div>
    ),
  },
  {
    emoji: '✏️',
    title: '把數字寫成一張小紙條',
    body: (
      <div className="space-y-3 text-sm leading-relaxed">
        <p>加入「文字」動作，貼上這段：</p>
        <div className="rounded-2xl bg-white p-3 text-xs shadow-sm">
          <code className="break-all">{SHORTCUT_TEMPLATE}</code>
          <div className="mt-2">
            <CopyChip text={SHORTCUT_TEMPLATE} label="複製範本" />
          </div>
        </div>
        <p>
          再把 <b>[體重]</b> 刪掉，點一下那個位置，從鍵盤上方選剛剛的「健康樣本」變數：
        </p>
        <Blocks>
          <ActionBlock
            icon="📝"
            color="#e9b44c"
            title="文字"
            lines={[
              <span key="t">
                好食光|體重=<Token>健康樣本</Token>
              </span>,
            ]}
          />
        </Blocks>
        <p className="text-xs text-muted">沒有加的項目（例如步數），整段「|步數=[步數]」刪掉就好。</p>
      </div>
    ),
  },
  {
    emoji: '📋',
    title: '複製起來，完成！',
    body: (
      <div className="space-y-3 text-sm leading-relaxed">
        <p>最後加入「拷貝到剪貼簿」，然後點右上角「完成」。整個捷徑長這樣：</p>
        <Blocks>
          <ActionBlock icon="❤️" color="#ff375f" title="尋找健康樣本" lines={['體重・最新 1 個']} />
          <ActionBlock
            icon="📝"
            color="#e9b44c"
            title="文字"
            lines={[
              <span key="t">
                好食光|體重=<Token>健康樣本</Token>
              </span>,
            ]}
          />
          <ActionBlock icon="📋" color="#5fa8d3" title="拷貝到剪貼簿" />
        </Blocks>
      </div>
    ),
  },
  {
    emoji: '🎉',
    title: '試試看！',
    body: (
      <div className="space-y-3 text-sm leading-relaxed">
        <ol className="list-decimal space-y-2 pl-5">
          <li>按下面的「立即同步」，會跳到捷徑跑一下</li>
          <li>
            跑完點左上角的 <b>◀ 返回</b> 回到好食光
          </li>
          <li>好食光會跳出「貼上」按鈕，點一下就完成</li>
        </ol>
        <Button className="w-full" onClick={onSync}>
          ⚡ 立即同步
        </Button>
        <p className="text-xs text-muted">第一次執行時，iPhone 會問能不能讀取健康資料，請選「允許」。</p>
      </div>
    ),
  },
  {
    emoji: '⏰',
    title: '每天自動跑（選用）',
    body: (
      <div className="space-y-3 text-sm leading-relaxed">
        <p>讓捷徑每天早上自己跑，你打開好食光時點一下「貼上」就好：</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>捷徑 App 下方點「自動化」→「＋」</li>
          <li>選「特定時間」，例如每天早上 8:00</li>
          <li>選「立即執行」，動作選「執行捷徑」→「{SHORTCUT_NAME}」</li>
        </ol>
        <p className="rounded-2xl bg-leaf-soft p-3 text-xs text-leaf-dark">
          建議早上起床量完體重後再同步，數字最準 ⚖️
        </p>
      </div>
    ),
  },
]

function GuideSheet({ step, setStep, onSync }: { step: number | null; setStep: (s: number | null) => void; onSync: () => void }) {
  const steps = STEPS(onSync)
  const [dir, setDir] = useState(1)
  const cur = step ?? 0
  const go = (next: number) => {
    if (next < 0 || next >= steps.length) return
    haptic(6)
    setDir(next > cur ? 1 : -1)
    setStep(next)
  }
  const s = steps[cur]

  return (
    <Sheet open={step !== null} onClose={() => setStep(null)} title="連結 Apple 健康">
      <div className="mb-4 flex justify-center gap-1.5">
        {steps.map((_, i) => (
          <button key={i} onClick={() => go(i)} aria-label={`第 ${i + 1} 步`} className="relative h-2 w-2 rounded-full bg-ink/10">
            {i === cur && <motion.span layoutId="guide-dot" transition={spring} className="absolute -inset-0.5 rounded-full bg-leaf" />}
          </button>
        ))}
      </div>

      <div className="relative min-h-[360px] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={cur}
            custom={dir}
            initial={{ x: dir * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: dir * -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 34 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(cur + 1)
              else if (info.offset.x > 60) go(cur - 1)
            }}
            className="touch-pan-y"
          >
            <div className="mb-3 flex items-center gap-3">
              <motion.span
                key={s.emoji}
                initial={{ scale: 0, rotate: -40 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 13, delay: 0.05 }}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-card"
              >
                {s.emoji}
              </motion.span>
              <div>
                <div className="text-xs text-muted">
                  步驟 {cur + 1} / {steps.length}
                </div>
                <div className="text-lg font-bold">{s.title}</div>
              </div>
            </div>
            {s.body}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex gap-3">
        {cur > 0 && (
          <Button variant="soft" onClick={() => go(cur - 1)}>
            上一步
          </Button>
        )}
        <Button className="flex-1" onClick={() => (cur < steps.length - 1 ? go(cur + 1) : setStep(null))}>
          {cur < steps.length - 1 ? '下一步' : '完成'}
        </Button>
      </div>
    </Sheet>
  )
}

/* ───────────── 貼上 ───────────── */

const METRICS: { key: keyof HealthData; label: string; emoji: string; unit: string }[] = [
  { key: 'weight', label: '體重', emoji: '⚖️', unit: 'kg' },
  { key: 'bodyFat', label: '體脂', emoji: '💪', unit: '%' },
  { key: 'steps', label: '步數', emoji: '👟', unit: '步' },
  { key: 'activeKcal', label: '活動', emoji: '🔥', unit: 'kcal' },
]

function Burst() {
  const pieces = ['✨', '🎉', '💚', '⭐', '✨', '🍀', '💫', '🎊']
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      {pieces.map((p, i) => {
        const angle = (i / pieces.length) * Math.PI * 2
        return (
          <motion.span
            key={i}
            className="absolute text-xl"
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ x: Math.cos(angle) * 110, y: Math.sin(angle) * 80, scale: [0, 1.2, 0.8], opacity: [1, 1, 0] }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            {p}
          </motion.span>
        )
      })}
    </div>
  )
}

function PasteSheet({ open, onClose, onHelp }: { open: boolean; onClose: () => void; onHelp: () => void }) {
  const [result, setResult] = useState<HealthData | null>(null)
  const [error, setError] = useState('')
  const [manualText, setManualText] = useState('')
  const [showText, setShowText] = useState(false)
  const toast = useToast()
  const closeTimer = useRef<number>()

  useEffect(() => {
    if (open) {
      setResult(null)
      setError('')
      setManualText('')
      setShowText(false)
    }
    return () => window.clearTimeout(closeTimer.current)
  }, [open])

  const apply = async (text: string) => {
    const data = parseHealthText(text)
    if (!data) {
      haptic([30, 40, 30])
      setError('剪貼簿裡沒有找到健康數據，捷徑可能還沒設定好')
      return
    }
    await saveBody(data, 'health')
    await db.prefs.put({ key: PREF_SETUP, value: true })
    haptic([10, 40, 10, 40, 20])
    setError('')
    setResult(data)
    closeTimer.current = window.setTimeout(() => {
      onClose()
      toast('已同步健康數據 ✓')
    }, 2200)
  }

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      await apply(text)
    } catch {
      setShowText(true)
      setError('沒辦法自動讀取剪貼簿，請在下面的框框長按「貼上」')
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={result ? '同步完成！' : '歡迎回來 👋'}>
      <AnimatePresence mode="wait" initial={false}>
        {result ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring}
            className="relative grid grid-cols-2 gap-3 py-2"
          >
            <Burst />
            {METRICS.filter((m) => result[m.key] !== undefined).map((m, i) => (
              <motion.div
                key={m.key}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.1 + i * 0.08 }}
                className="rounded-3xl bg-white p-4 text-center shadow-card"
              >
                <div className="text-2xl">{m.emoji}</div>
                <div className="mt-1 text-2xl font-bold tabular-nums">
                  {m.key === 'weight' || m.key === 'bodyFat' ? result[m.key] : <CountUp value={result[m.key]!} />}
                  <span className="ml-1 text-xs font-normal text-muted">{m.unit}</span>
                </div>
                <div className="text-xs text-muted">{m.label}</div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="ask" exit={{ opacity: 0, scale: 0.95 }} className="space-y-3">
            <p className="text-sm text-muted">捷徑已經把數據複製好了，點下面的按鈕帶進好食光：</p>
            <motion.button
              type="button"
              onClick={pasteFromClipboard}
              whileTap={{ scale: 0.94 }}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ scale: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' } }}
              className="w-full rounded-3xl bg-leaf py-5 text-lg font-bold text-white shadow-card"
            >
              📋 貼上健康數據
            </motion.button>
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: 1, x: [0, -8, 8, -4, 4, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl bg-tomato-soft p-3 text-sm text-tomato"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            {showText && (
              <div className="space-y-2">
                <textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="在這裡長按 → 貼上"
                  rows={2}
                  className="w-full rounded-2xl bg-white p-3 text-sm shadow-card outline-none ring-leaf/40 focus:ring-2"
                />
                <Button variant="soft" className="w-full" disabled={!manualText.trim()} onClick={() => apply(manualText)}>
                  確定
                </Button>
              </div>
            )}
            <button type="button" onClick={onHelp} className="w-full py-2 text-xs text-muted underline">
              捷徑還沒設定？看教學
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Sheet>
  )
}

/* ───────────── 手動輸入 ───────────── */

function ManualSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const latest = useLiveQuery(() => db.body.orderBy('date').reverse().first(), [])
  const [weight, setWeight] = useState('')
  const [fat, setFat] = useState('')
  const toast = useToast()

  useEffect(() => {
    if (open) {
      setWeight(latest?.weight ? String(latest.weight) : '')
      setFat(latest?.bodyFat ? String(latest.bodyFat) : '')
    }
    // 只在打開時帶入上次的數字（不跟著資料變動覆蓋使用者正在輸入的內容）
  }, [open])

  const w = parseFloat(weight)
  const f = parseFloat(fat)
  const valid = w >= 20 && w <= 300 && (!fat || (f >= 2 && f <= 70))

  return (
    <Sheet open={open} onClose={onClose} title="記錄體重">
      <div className="space-y-3">
        {[
          { label: '⚖️ 體重', unit: 'kg', value: weight, set: setWeight, placeholder: '例如 62.5' },
          { label: '💪 體脂（選填）', unit: '%', value: fat, set: setFat, placeholder: '例如 25' },
        ].map((f) => (
          <label key={f.label} className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-card">
            <span className="font-medium">{f.label}</span>
            <span className="flex items-center gap-2">
              <input
                inputMode="decimal"
                value={f.value}
                onChange={(e) => f.set(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder={f.placeholder}
                className="w-24 rounded-xl bg-cream px-3 py-2 text-right font-bold tabular-nums outline-none ring-leaf/40 focus:ring-2"
              />
              <span className="w-6 text-xs text-muted">{f.unit}</span>
            </span>
          </label>
        ))}
        <Button
          className="w-full"
          disabled={!valid}
          onClick={async () => {
            await saveBody({ weight: Math.round(w * 10) / 10, ...(fat ? { bodyFat: f } : {}) }, 'manual')
            haptic([10, 30, 10])
            onClose()
            toast('已記錄體重 ✓')
          }}
        >
          儲存
        </Button>
        {isIOS() && <p className="text-center text-xs text-muted">用 iPhone？可以設定捷徑，自動從「健康」帶入</p>}
      </div>
    </Sheet>
  )
}
