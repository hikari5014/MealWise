import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { haptic } from '../lib/feedback'
import { CountUp } from './Ring'
import { Sheet, Tap } from './ui'

const AMOUNTS = [150, 250, 350, 500]

/** 飲水杯：點一下 +250ml，長按選其他份量 */
export function WaterCup({ ml, target, onAdd }: { ml: number; target: number; onAdd: (delta: number) => void }) {
  const [open, setOpen] = useState(false)
  const [bubbles, setBubbles] = useState<number[]>([])
  const press = useRef<number>()
  const longPressed = useRef(false)
  const ratio = Math.min(ml / target, 1)

  const add = (delta: number) => {
    haptic(delta > 0 ? [8, 20, 8] : 6)
    onAdd(delta)
    if (delta > 0) {
      const id = Date.now()
      setBubbles((b) => [...b, id])
      window.setTimeout(() => setBubbles((b) => b.filter((x) => x !== id)), 900)
    }
  }

  return (
    <>
      <motion.button
        aria-label="喝了一杯水（長按選份量）"
        whileTap={{ scale: 0.94 }}
        onPointerDown={() => {
          longPressed.current = false
          press.current = window.setTimeout(() => {
            longPressed.current = true
            haptic(16)
            setOpen(true)
          }, 450)
        }}
        onPointerUp={() => window.clearTimeout(press.current)}
        onPointerLeave={() => window.clearTimeout(press.current)}
        onContextMenu={(e) => e.preventDefault()}
        onClick={() => {
          if (!longPressed.current) add(250)
        }}
        className="relative flex select-none items-center gap-4 text-left"
      >
        <div className="relative h-24 w-16 overflow-hidden rounded-b-3xl rounded-t-lg border-[3px] border-sky/60 bg-sky-soft/40">
          <motion.div
            className="absolute inset-x-0 bottom-0"
            initial={false}
            animate={{ height: `${Math.max(ratio * 100, 6)}%` }}
            transition={{ type: 'spring', stiffness: 70, damping: 14 }}
          >
            <svg className="wave absolute -top-2 left-0 h-3 w-[200%]" viewBox="0 0 120 12" preserveAspectRatio="none">
              <path d="M0 6 Q15 0 30 6 T60 6 T90 6 T120 6 V12 H0Z" style={{ fill: 'rgb(var(--sky))' }} />
            </svg>
            <div className="h-full w-full bg-sky" />
          </motion.div>
          <AnimatePresence>
            {bubbles.map((id) => (
              <motion.span
                key={id}
                className="absolute left-1/2 h-2 w-2 rounded-full bg-card/80"
                initial={{ bottom: 4, x: -4, opacity: 1 }}
                animate={{ bottom: 80, x: [-4, 2, -6], opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
              />
            ))}
          </AnimatePresence>
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums">
            <CountUp value={ml} />
            <span className="text-sm font-normal text-muted"> / {target} ml</span>
          </div>
          <div className="text-xs text-muted">點一下 +250ml・長按選份量</div>
        </div>
      </motion.button>

      <Sheet open={open} onClose={() => setOpen(false)} title="喝了多少？">
        <div className="grid grid-cols-2 gap-3">
          {AMOUNTS.map((a) => (
            <motion.button
              key={a}
              whileTap={{ scale: 0.95 }}
              className="rounded-2xl bg-sky-soft py-4 text-lg font-bold text-sky"
              onClick={() => {
                add(a)
                setOpen(false)
              }}
            >
              +{a} ml
            </motion.button>
          ))}
        </div>
        <Tap
          className="mt-4 w-full rounded-2xl py-3 text-sm text-muted"
          disabled={ml <= 0}
          onClick={() => {
            add(-Math.min(250, ml))
            setOpen(false)
          }}
        >
          記錯了，減 250 ml
        </Tap>
      </Sheet>
    </>
  )
}
