import { AnimatePresence, motion } from 'framer-motion'
import jsQR from 'jsqr'
import QRCode from 'qrcode'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { RECIPE_MAP } from '../data/recipes'
import { db } from '../db'
import { addDays, monthDay, todayKey, weekStart, weekdayLabel } from '../lib/date'
import { haptic, spring } from '../lib/feedback'
import { useProfile } from '../lib/hooks'
import { decodePlan, encodePlan, extractCode, shareUrl, toPlanEntries, type SharedPlan } from '../lib/share'
import { MEAL_LABEL, MEAL_SLOTS, type PlanEntry } from '../types'
import { Food } from './Food'
import { Icon } from './Icon'
import { RecipePhoto } from './RecipePhoto'
import { Button, Segmented, Sheet, useToast } from './ui'
import { Art } from './Art'

interface ShareTarget {
  weekStart: string
  day: string
}

interface Ctx {
  openShare: (target: ShareTarget) => void
  openScanner: () => void
}

const ShareCtx = createContext<Ctx>({ openShare: () => {}, openScanner: () => {} })

export const useShare = () => useContext(ShareCtx)

export function ShareProvider({ children, onImported }: { children: ReactNode; onImported: () => void }) {
  const [target, setTarget] = useState<ShareTarget | null>(null)
  const [scanning, setScanning] = useState(false)
  const [incoming, setIncoming] = useState<SharedPlan | null>(null)
  const toast = useToast()

  // 用連結（或 iPhone 相機）打開時，網址會帶著分享碼
  useEffect(() => {
    const check = async () => {
      const code = extractCode(location.hash)
      if (!code) return
      history.replaceState(null, '', location.pathname + location.search)
      const plan = await decodePlan(code)
      if (plan) setIncoming(plan)
      else toast('這個分享連結好像壞掉了')
    }
    check()
    window.addEventListener('hashchange', check)
    return () => window.removeEventListener('hashchange', check)
  }, [toast])

  return (
    <ShareCtx.Provider value={{ openShare: setTarget, openScanner: () => setScanning(true) }}>
      {children}
      <ShareSheet target={target} onClose={() => setTarget(null)} />
      <AnimatePresence>
        {scanning && (
          <Scanner
            key="scanner"
            onClose={() => setScanning(false)}
            onResult={(plan) => {
              setScanning(false)
              setIncoming(plan)
            }}
          />
        )}
      </AnimatePresence>
      <ImportSheet
        plan={incoming}
        onClose={() => setIncoming(null)}
        onDone={() => {
          setIncoming(null)
          onImported()
        }}
      />
    </ShareCtx.Provider>
  )
}

/* ───────────── 分享：產生 QR Code ───────────── */

function ShareSheet({ target, onClose }: { target: ShareTarget | null; onClose: () => void }) {
  const profile = useProfile()
  const toast = useToast()
  const [range, setRange] = useState<'week' | 'day'>('week')
  const [title, setTitle] = useState('')
  const [svg, setSvg] = useState('')
  const [url, setUrl] = useState('')
  const [count, setCount] = useState(0)
  const open = target !== null

  useEffect(() => {
    if (open) {
      setRange('week')
      setTitle(`${profile?.name || '我'}的一週菜單`)
    }
  }, [open, profile?.name])

  useEffect(() => {
    if (!target) return
    let cancelled = false
    const start = range === 'week' ? target.weekStart : target.day
    const days = range === 'week' ? 7 : 1
    const dates = Array.from({ length: days }, (_, i) => addDays(start, i))
    ;(async () => {
      const plans = await db.plans.where('date').anyOf(dates).toArray()
      const code = await encodePlan({ title, by: profile?.name ?? '', start, days, plans })
      const link = shareUrl(code)
      const qr = await QRCode.toString(link, {
        type: 'svg',
        errorCorrectionLevel: 'Q',
        margin: 0,
        color: { dark: '#2f2a24', light: '#ffffff00' },
      })
      if (!cancelled) {
        setCount(plans.length)
        setUrl(link)
        setSvg(qr)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [target, range, title, profile?.name])

  const shareLink = async () => {
    haptic(8)
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `${title}｜用好食光打開這份菜單`, url })
        return
      } catch {
        // 使用者取消就算了
        return
      }
    }
    await navigator.clipboard?.writeText(url).catch(() => {})
    toast('已複製分享連結')
  }

  const saveImage = async () => {
    haptic(8)
    const blob = await renderShareCard(title, url, count)
    const file = new File([blob], '好食光菜單.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title })
        return
      } catch {
        return
      }
    }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = file.name
    a.click()
    URL.revokeObjectURL(a.href)
    toast('已存成圖片')
  }

  return (
    <Sheet open={open} onClose={onClose} title="分享飲食計劃">
      <div className="space-y-4">
        <Segmented
          id="share-range"
          value={range}
          onChange={setRange}
          options={[
            { value: 'week', label: '這一週', icon: 'calendar_month' },
            { value: 'day', label: target ? `${monthDay(target.day)} 這天` : '這一天', icon: 'event' },
          ]}
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 30))}
          placeholder="幫這份菜單取個名字"
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm shadow-card outline-none ring-leaf/40 focus:ring-2"
        />

        <div className="relative mx-auto aspect-square w-64 rounded-[32px] bg-white p-5 shadow-card">
          <AnimatePresence mode="popLayout" initial={false}>
            {svg && count > 0 && (
              <motion.div
                key={svg}
                className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                initial={{ opacity: 0, scale: 0.85, clipPath: 'circle(0% at 50% 50%)' }}
                animate={{ opacity: 1, scale: 1, clipPath: 'circle(75% at 50% 50%)' }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            )}
          </AnimatePresence>
          {count > 0 && (
            <motion.div
              className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-white shadow"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 14, delay: 0.3 }}
            >
              <Food id="bento" size={40} />
            </motion.div>
          )}
          {count === 0 && (
            <div className="grid h-full place-items-center text-center text-sm text-muted">
              <div>
                <Art name="empty-plan" width={120} />
                <p className="mt-2">這段時間還沒有排菜單</p>
              </div>
            </div>
          )}
        </div>
        <p className="text-center text-xs text-muted">
          {count > 0 ? `共 ${count} 餐・朋友打開好食光，點「掃描」對準這個 QR Code` : '先排好菜單再分享吧'}
        </p>

        <div className="flex gap-3">
          <Button variant="soft" className="flex flex-1 items-center justify-center gap-1.5" disabled={!count} onClick={saveImage}>
            <Icon name="download" size={20} />
            存成圖片
          </Button>
          <Button className="flex flex-1 items-center justify-center gap-1.5" disabled={!count} onClick={shareLink}>
            <Icon name="share" size={20} />
            分享連結
          </Button>
        </div>
      </div>
    </Sheet>
  )
}

/** 產生一張可以傳給朋友的 QR Code 圖卡 */
async function renderShareCard(title: string, url: string, count: number) {
  const W = 1080
  const H = 1350
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#f7f3ec'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.roundRect(120, 300, 840, 840, 64)
  ctx.fill()
  const qr = document.createElement('canvas')
  await QRCode.toCanvas(qr, url, { errorCorrectionLevel: 'Q', margin: 0, width: 700, color: { dark: '#2f2a24', light: '#ffffff' } })
  ctx.drawImage(qr, 190, 370, 700, 700)
  const font = '"Noto Sans TC", system-ui, sans-serif'
  ctx.fillStyle = '#2f2a24'
  ctx.textAlign = 'center'
  ctx.font = `700 64px ${font}`
  ctx.fillText(title, W / 2, 170)
  ctx.fillStyle = '#8a8178'
  ctx.font = `400 36px ${font}`
  ctx.fillText(`共 ${count} 餐`, W / 2, 235)
  ctx.fillStyle = '#5b8c5a'
  ctx.font = `700 40px ${font}`
  ctx.fillText('好食光 MealWise', W / 2, 1230)
  ctx.fillStyle = '#8a8178'
  ctx.font = `400 30px ${font}`
  ctx.fillText('打開好食光，點「掃描」就能加入這份菜單', W / 2, 1285)
  return new Promise<Blob>((res) => c.toBlob((b) => res(b!), 'image/png'))
}

/* ───────────── 掃描：相機讀 QR Code ───────────── */

const readQr = (source: CanvasImageSource, w: number, h: number, canvas: HTMLCanvasElement, thorough = false) => {
  const scale = Math.min(1, (thorough ? 1024 : 520) / Math.max(w, h))
  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
  return jsQR(img.data, img.width, img.height, { inversionAttempts: thorough ? 'attemptBoth' : 'dontInvert' })?.data ?? null
}

function Scanner({ onClose, onResult }: { onClose: () => void; onResult: (plan: SharedPlan) => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const canvas = useRef<HTMLCanvasElement>(document.createElement('canvas'))
  const fileInput = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<'starting' | 'scanning' | 'found' | 'denied'>('starting')
  const [hint, setHint] = useState('')
  const busy = useRef(false)

  const handleText = useCallback(
    async (text: string) => {
      if (busy.current) return
      busy.current = true
      const code = extractCode(text)
      const plan = code ? await decodePlan(code) : null
      if (plan) {
        haptic([12, 40, 12, 40, 20])
        setState('found')
        window.setTimeout(() => onResult(plan), 650)
        return
      }
      haptic([30, 50, 30])
      setHint('這不是好食光的分享碼')
      window.setTimeout(() => {
        setHint('')
        busy.current = false
      }, 1600)
    },
    [onResult],
  )

  useEffect(() => {
    let stream: MediaStream | undefined
    let raf = 0
    let last = 0
    let stopped = false

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      const v = video.current
      if (!v || v.readyState < 2 || busy.current || t - last < 110) return
      last = t
      const text = readQr(v, v.videoWidth, v.videoHeight, canvas.current)
      if (text) handleText(text)
    }

    ;(async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        if (stopped) return stream.getTracks().forEach((t) => t.stop())
        if (video.current) {
          video.current.srcObject = stream
          await video.current.play().catch(() => {})
        }
        setState('scanning')
        raf = requestAnimationFrame(loop)
      } catch {
        setState('denied')
      }
    })()

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [handleText])

  const fromPhoto = async (file: File) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    await img.decode().catch(() => {})
    const text = readQr(img, img.naturalWidth, img.naturalHeight, canvas.current, true)
    URL.revokeObjectURL(img.src)
    if (text) handleText(text)
    else {
      haptic([30, 50, 30])
      setHint('這張照片裡找不到 QR Code')
      window.setTimeout(() => setHint(''), 1800)
    }
  }

  const found = state === 'found'

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <video ref={video} playsInline muted autoPlay className="absolute inset-0 h-full w-full object-cover" />
      {/* 四周變暗，只留中間的框 */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <motion.div
          className="relative aspect-square w-[68vw] max-w-[300px] rounded-[36px]"
          style={{ boxShadow: '0 0 0 100vmax rgba(0,0,0,0.55)' }}
          animate={found ? { scale: [1, 1.06, 0.92], borderRadius: 48 } : { scale: [1, 1.025, 1] }}
          transition={found ? { duration: 0.5 } : { repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        >
          {(['left-0 top-0 border-l-4 border-t-4 rounded-tl-[36px]', 'right-0 top-0 border-r-4 border-t-4 rounded-tr-[36px]', 'left-0 bottom-0 border-l-4 border-b-4 rounded-bl-[36px]', 'right-0 bottom-0 border-r-4 border-b-4 rounded-br-[36px]'] as const).map(
            (pos) => (
              <motion.span
                key={pos}
                className={`absolute h-12 w-12 ${pos}`}
                animate={{ borderColor: found ? '#8fd18e' : '#ffffff' }}
                transition={{ duration: 0.2 }}
              />
            ),
          )}
          {state === 'scanning' && (
            <motion.span
              className="absolute inset-x-6 h-0.5 rounded-full bg-gradient-to-r from-transparent via-[#8fd18e] to-transparent shadow-[0_0_12px_#8fd18e]"
              animate={{ top: ['12%', '88%', '12%'] }}
              transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
            />
          )}
          <AnimatePresence>
            {found && (
              <motion.span
                className="absolute inset-0 grid place-items-center"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 14 }}
              >
                <span className="grid h-20 w-20 place-items-center rounded-full bg-leaf text-white shadow-xl">
                  <Icon name="check" size={48} weight={700} />
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-[calc(16px+env(safe-area-inset-top))]">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onClose}
          aria-label="關閉"
          className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur"
        >
          <Icon name="close" size={24} />
        </motion.button>
        <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
          <Icon name="qr_code_scanner" size={18} />
          掃描好食光菜單
        </div>
        <span className="w-11" />
      </div>

      <div className="absolute inset-x-0 bottom-0 space-y-4 px-6 pb-[calc(28px+env(safe-area-inset-bottom))] text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={hint || state}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, x: hint ? [0, -8, 8, -4, 4, 0] : 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`text-sm ${hint ? 'font-medium text-[#ffb4a2]' : 'text-white/80'}`}
          >
            {hint ||
              (state === 'starting'
                ? '正在打開相機…'
                : state === 'denied'
                  ? '沒辦法使用相機。請到「設定」允許好食光使用相機，或改用相簿裡的照片'
                  : state === 'found'
                    ? '找到了！'
                    : '把 QR Code 放進框框裡')}
          </motion.p>
        </AnimatePresence>
        {state === 'denied' && (
          <div className="flex justify-center">
            <Icon name="no_photography" size={40} className="text-white/60" />
          </div>
        )}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => fileInput.current?.click()}
          className="mx-auto flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-medium backdrop-blur"
        >
          <Icon name="photo_library" size={20} />
          從相簿選擇圖片
        </motion.button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) fromPhoto(f)
            e.target.value = ''
          }}
        />
      </div>
    </motion.div>
  )
}

/* ───────────── 匯入預覽 ───────────── */

function ImportSheet({ plan, onClose, onDone }: { plan: SharedPlan | null; onClose: () => void; onDone: () => void }) {
  const toast = useToast()
  const today = todayKey()
  const thisMonday = weekStart(today)
  const [start, setStart] = useState<'today' | 'this' | 'next'>('this')
  const [mode, setMode] = useState<'add' | 'replace'>('add')
  const open = plan !== null

  useEffect(() => {
    if (plan) {
      setStart(plan.days === 7 ? (today === thisMonday ? 'this' : 'next') : 'today')
      setMode('add')
    }
  }, [plan, today, thisMonday])

  const startDate = start === 'today' ? today : start === 'this' ? thisMonday : addDays(thisMonday, 7)
  const days = plan ? Array.from({ length: plan.days }, (_, i) => i) : []

  const confirm = async () => {
    if (!plan) return
    const dates = days.map((d) => addDays(startDate, d))
    const removed: PlanEntry[] = mode === 'replace' ? await db.plans.where('date').anyOf(dates).toArray() : []
    if (removed.length) await db.plans.bulkDelete(removed.map((p) => p.id!))
    const ids = (await db.plans.bulkAdd(toPlanEntries(plan, startDate), { allKeys: true })) as number[]
    haptic([10, 40, 10, 40, 20])
    onDone()
    toast(`已加入 ${ids.length} 餐`, async () => {
      await db.plans.bulkDelete(ids)
      if (removed.length) await db.plans.bulkPut(removed)
    })
  }

  return (
    <Sheet open={open} onClose={onClose} title="收到一份菜單">
      {plan && (
        <div className="space-y-4">
          <motion.div
            className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-card"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={spring}
          >
            <motion.span
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 12, delay: 0.1 }}
            >
              <Art name="share-card" width={60} float={false} />
            </motion.span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-bold">{plan.title}</div>
              <div className="text-xs text-muted">
                {plan.by ? `來自 ${plan.by}・` : ''}
                {plan.days} 天・{plan.entries.length} 餐
              </div>
            </div>
          </motion.div>

          {plan.unknown > 0 && (
            <p className="flex items-center gap-1.5 rounded-2xl bg-honey-soft p-3 text-xs">
              <Icon name="info" size={16} />有 {plan.unknown} 道食譜你的版本還沒有，先略過。可以到「我的」檢查更新。
            </p>
          )}

          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {days.map((d, i) => {
              const dayEntries = plan.entries.filter((e) => e.day === d)
              if (!dayEntries.length) return null
              const date = addDays(startDate, d)
              return (
                <motion.div
                  key={d}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: 0.05 * i }}
                >
                  <div className="mb-1.5 text-xs font-medium text-muted">
                    {monthDay(date)}（{weekdayLabel(date)}）
                  </div>
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                    {MEAL_SLOTS.flatMap((meal) => dayEntries.filter((e) => e.meal === meal)).map((e, k) => {
                      const r = RECIPE_MAP[e.recipeId]
                      return (
                        <div key={k} className="relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl shadow-card">
                          <RecipePhoto recipe={r} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                          <div className="absolute inset-x-2 bottom-1.5 text-white">
                            <div className="text-[10px] opacity-80">{MEAL_LABEL[e.meal]}</div>
                            <div className="truncate text-xs font-bold">{r.name}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted">從哪天開始？</div>
            <Segmented
              id="import-start"
              value={start}
              onChange={setStart}
              options={[
                { value: 'today', label: '今天' },
                { value: 'this', label: '本週一' },
                { value: 'next', label: '下週一' },
              ]}
            />
            <Segmented
              id="import-mode"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'add', label: '加進我的菜單', icon: 'playlist_add' },
                { value: 'replace', label: '取代這幾天', icon: 'sync' },
              ]}
            />
          </div>

          <Button className="flex w-full items-center justify-center gap-2" disabled={!plan.entries.length} onClick={confirm}>
            <Icon name="check_circle" size={20} fill />
            加入菜單
          </Button>
        </div>
      )}
    </Sheet>
  )
}
