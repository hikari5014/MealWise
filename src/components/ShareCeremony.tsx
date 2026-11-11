// 分享圖卡的「截圖儀式」：快門閃光 → 圖卡像拍立得一樣彈出來、灑彩紙 → 分享／儲存
import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { haptic } from '../lib/feedback'
import { Icon } from './Icon'
import { Tap, useToast } from './ui'

interface Req {
  make: () => Promise<Blob>
  name: string
  title: string
  /** 圖卡上方的一句話，例如「訓練成果出爐！」 */
  headline: string
  sub?: string
}

const Ctx = createContext<(r: Req) => void>(() => {})
/** 叫出分享儀式：present({ make, name, title, headline }) */
export const useShareCeremony = () => useContext(Ctx)

const CONFETTI = ['--leaf', '--honey', '--tomato', '--sky', '--rose', '--leaf-dark']

export function ShareCeremonyProvider({ children }: { children: ReactNode }) {
  const toast = useToast()
  const [req, setReq] = useState<Req | null>(null)
  const [flash, setFlash] = useState(0)
  const [url, setUrl] = useState<string | null>(null)
  const file = useRef<File | null>(null)
  const [done, setDone] = useState<'shared' | 'saved' | null>(null)

  const close = useCallback(() => {
    setReq(null)
    setUrl((u) => {
      if (u) URL.revokeObjectURL(u)
      return null
    })
    file.current = null
    setDone(null)
  }, [])

  const present = useCallback(
    (r: Req) => {
      // 快門：閃一下白光＋震動，同時在背景把圖卡畫好
      haptic([12, 40, 24])
      setFlash((n) => n + 1)
      setReq(r)
      setDone(null)
      const started = Date.now()
      r.make()
        .then(async (blob) => {
          // 至少讓閃光跑完，圖卡才彈出來
          const wait = 420 - (Date.now() - started)
          if (wait > 0) await new Promise((res) => setTimeout(res, wait))
          file.current = new File([blob], `${r.name}.png`, { type: 'image/png' })
          setUrl(URL.createObjectURL(blob))
          haptic([8, 30, 8, 30, 16])
        })
        .catch(() => {
          setReq(null)
          toast('圖片做不出來，再試一次')
        })
    },
    [toast],
  )

  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url])

  const canShare = !!file.current && !!navigator.canShare?.({ files: [file.current] })
  const share = async () => {
    const f = file.current
    if (!f || !req) return
    haptic(8)
    try {
      await navigator.share({ files: [f], title: req.title })
      setDone('shared')
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') save()
    }
  }
  const save = () => {
    const f = file.current
    if (!f) return
    haptic(8)
    const a = document.createElement('a')
    a.href = URL.createObjectURL(f)
    a.download = f.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 4000)
    setDone('saved')
  }

  // 彩紙：每次打開固定一組位置
  const pieces = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        x: (Math.random() - 0.5) * 340,
        y: -120 - Math.random() * 260,
        r: (Math.random() - 0.5) * 540,
        s: 6 + Math.random() * 8,
        c: CONFETTI[i % CONFETTI.length],
        d: Math.random() * 0.15,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flash],
  )

  return (
    <Ctx.Provider value={present}>
      {children}
      <AnimatePresence>
        {req && (
          <motion.div
            key="ceremony"
            role="dialog"
            aria-modal="true"
            aria-label="分享圖卡"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex flex-col items-center bg-black/80 px-6 pb-[calc(20px+env(safe-area-inset-bottom))] pt-[calc(16px+env(safe-area-inset-top))] backdrop-blur-md"
          >
            <Tap aria-label="關閉" onClick={close} style={{ background: 'rgba(255,255,255,0.15)' }}
              className="absolute right-4 top-[calc(12px+env(safe-area-inset-top))] grid h-10 w-10 place-items-center rounded-full text-white">
              <Icon name="close" size={22} />
            </Tap>

            {url ? (
              <>
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-8 text-center text-white">
                  <div className="text-2xl font-bold">{req.headline}</div>
                  {req.sub && <div className="mt-1 text-sm opacity-70">{req.sub}</div>}
                </motion.div>

                <div className="relative mt-4 flex min-h-0 w-full flex-1 items-center justify-center">
                  {/* 彩紙從圖卡中間噴出來 */}
                  <div className="pointer-events-none absolute left-1/2 top-1/2">
                    {pieces.map((p, i) => (
                      <motion.span
                        key={i}
                        className="absolute rounded-sm"
                        style={{ width: p.s, height: p.s * 1.6, background: `rgb(var(${p.c}))` }}
                        initial={{ x: 0, y: 0, opacity: 0, rotate: 0 }}
                        animate={{ x: p.x, y: [0, p.y, p.y + 520], opacity: [0, 1, 1, 0], rotate: p.r }}
                        transition={{ duration: 1.9, delay: 0.1 + p.d, ease: [0.2, 0.7, 0.3, 1], times: [0, 0.35, 1] }}
                      />
                    ))}
                  </div>
                  <motion.img
                    src={url}
                    alt="分享圖卡預覽"
                    draggable={false}
                    initial={{ scale: 1.25, rotate: -9, y: 60, opacity: 0 }}
                    animate={{ scale: 1, rotate: -2, y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    whileTap={{ scale: 0.98, rotate: 0 }}
                    className="max-h-full max-w-full rounded-3xl object-contain shadow-2xl "
                    style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.55)' }}
                  />
                </div>

                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-5 w-full max-w-sm space-y-2">
                  {canShare && (
                    <Tap press={0.96} onClick={share} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf py-3.5 text-base font-bold text-on-leaf shadow-card">
                      <Icon name="share" size={22} />
                      {done === 'shared' ? '再分享一次' : '分享出去'}
                    </Tap>
                  )}
                  <Tap
                    press={0.96}
                    onClick={save}
                    style={canShare ? { background: 'rgba(255,255,255,0.15)' } : undefined}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium ${canShare ? 'text-white' : 'bg-leaf text-base font-bold text-on-leaf'}`}
                  >
                    <Icon name={done === 'saved' ? 'check' : 'download'} size={20} />
                    {done === 'saved' ? '已下載' : '下載圖片'}
                  </Tap>
                  {canShare && <p className="text-center text-[11px] text-white/60">想存到相簿：按「分享出去」再選「儲存影像」</p>}
                </motion.div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-white">
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.9 }}>
                  <Icon name="photo_camera" size={44} fill />
                </motion.span>
                <span className="text-sm opacity-80">喀擦！圖卡製作中…</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {/* 快門閃光：蓋在最上面，很快淡掉 */}
      <AnimatePresence>
        {flash > 0 && (
          <motion.div
            key={flash}
            className="pointer-events-none fixed inset-0 z-[70]"
            style={{ background: '#fff' }}
            initial={{ opacity: 0.95 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            onAnimationComplete={() => setFlash(0)}
          />
        )}
      </AnimatePresence>
    </Ctx.Provider>
  )
}
