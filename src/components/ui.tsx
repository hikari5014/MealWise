import { AnimatePresence, motion, useDragControls, type HTMLMotionProps } from 'framer-motion'
import { createContext, forwardRef, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { haptic, spring } from '../lib/feedback'
import type { IconName } from '../lib/icons'
import { Icon } from './Icon'

/*
 * ── 全站的點擊回饋規則 ──
 * 所有可以點的東西都用 <Tap>（或下面的 <Button>），不要直接寫 <Tap>。
 * 這樣按下去一定會微縮、放開回彈、輕微震動；npm run build 會檢查有沒有漏掉。
 * 需要特殊動畫時可以用 motion.button，但一定要給 whileTap。
 */
export type TapProps = HTMLMotionProps<'button'> & {
  /** 按下時縮到多少，預設 0.94；很寬的列表列可以用 0.98 */
  press?: number
  /** 點擊時是否輕震，預設會 */
  feedback?: boolean
}

export const Tap = forwardRef<HTMLButtonElement, TapProps>(function Tap(
  { press = 0.94, feedback = true, onClick, type = 'button', disabled, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: press }}
      transition={spring}
      onClick={(e) => {
        if (feedback) haptic(5)
        onClick?.(e)
      }}
      {...rest}
    />
  )
})

/* ── 按鈕：按下微縮、放開回彈 ── */
type BtnProps = HTMLMotionProps<'button'> & { variant?: 'primary' | 'soft' | 'ghost' }

export function Button({ variant = 'primary', className = '', onClick, ...rest }: BtnProps) {
  const styles = {
    primary: 'bg-leaf text-white shadow-card',
    soft: 'bg-leaf-soft text-leaf-dark',
    ghost: 'bg-transparent text-muted',
  }[variant]
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={spring}
      className={`rounded-2xl px-4 py-3 font-medium disabled:opacity-40 ${styles} ${className}`}
      onClick={(e) => {
        haptic(8)
        onClick?.(e)
      }}
      {...rest}
    />
  )
}

/* ── 打勾按鈕：勾勾畫出 + 彈跳 ── */
export function CheckButton({ checked, onToggle, size = 32 }: { checked: boolean; onToggle: () => void; size?: number }) {
  return (
    <motion.button
      aria-label={checked ? '取消完成' : '標記完成'}
      aria-pressed={checked}
      onClick={(e) => {
        e.stopPropagation()
        haptic(checked ? 6 : [10, 30, 14])
        onToggle()
      }}
      whileTap={{ scale: 0.85 }}
      animate={{ scale: checked ? [1, 1.18, 1] : 1, backgroundColor: checked ? '#5b8c5a' : 'rgba(255,255,255,0.92)' }}
      transition={{ duration: 0.32 }}
      className="grid shrink-0 place-items-center rounded-full border-2 border-leaf"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6}>
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          fill="none"
          stroke="white"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.28, ease: 'easeOut', delay: checked ? 0.06 : 0 }}
        />
      </svg>
    </motion.button>
  )
}

/* ── 底部彈出視窗：可往下拖曳關閉 ── */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
}) {
  const controls = useDragControls()
  // 自己管理「關閉後多久移除」，不依賴 AnimatePresence 等待內部所有動畫結束
  // （內容裡有巢狀動畫時，它偶爾會卡住，留下一層看不見卻擋住點擊的遮罩）
  const [mounted, setMounted] = useState(open)
  useEffect(() => {
    if (open) {
      setMounted(true)
      return
    }
    const t = window.setTimeout(() => setMounted(false), 360)
    return () => window.clearTimeout(t)
  }, [open])
  if (!mounted) return null

  return (
    <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <motion.div
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[88dvh] max-w-lg flex-col rounded-t-3xl bg-cream pb-[env(safe-area-inset-bottom)] shadow-2xl"
        initial={{ y: '100%' }}
        animate={{ y: open ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        drag="y"
        dragControls={controls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100 || info.velocity.y > 500) onClose()
        }}
      >
        <div
          className="flex cursor-grab touch-none flex-col items-center px-5 pb-2 pt-3"
          onPointerDown={(e) => controls.start(e)}
        >
          <div className="h-1.5 w-10 rounded-full bg-ink/15" />
          {title && <div className="mt-3 w-full text-lg font-bold">{title}</div>}
        </div>
        <div className="overflow-y-auto px-5 pb-6">{children}</div>
      </motion.div>
    </div>
  )
}

/* ── 提示條：可「復原」 ── */
interface ToastItem {
  id: number
  text: string
  undo?: () => void
  actionLabel?: string
}

type ShowToast = (text: string, action?: () => void, actionLabel?: string, duration?: number) => void

const ToastCtx = createContext<ShowToast>(() => {})

export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null)
  const timer = useRef<number>()
  const show = useCallback<ShowToast>((text, undo, actionLabel, duration = 3200) => {
    window.clearTimeout(timer.current)
    setToast({ id: Date.now(), text, undo, actionLabel })
    timer.current = window.setTimeout(() => setToast(null), duration)
  }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom))] z-50 flex justify-center px-4">
        <AnimatePresence mode="popLayout">
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ y: 24, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.98 }}
              transition={spring}
              className="pointer-events-auto flex items-center gap-4 rounded-2xl bg-ink px-4 py-3 text-sm text-cream shadow-xl"
            >
              <span>{toast.text}</span>
              {toast.undo && (
                <Tap
                  className="font-bold text-honey"
                  onClick={() => {
                    haptic(8)
                    toast.undo?.()
                    setToast(null)
                  }}
                >
                  {toast.actionLabel ?? '復原'}
                </Tap>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}

/* ── 分段切換（有滑動底色） ── */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  id,
}: {
  value: T
  options: { value: T; label: string; icon?: IconName }[]
  onChange: (v: T) => void
  id: string
}) {
  return (
    <div className="flex rounded-2xl bg-ink/5 p-1">
      {options.map((o) => (
        <Tap
          key={o.value}
          onClick={() => {
            haptic(6)
            onChange(o.value)
          }}
          className={`relative flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
            value === o.value ? 'text-ink' : 'text-muted'
          }`}
        >
          {value === o.value && (
            <motion.span layoutId={`seg-${id}`} transition={spring} className="absolute inset-0 rounded-xl bg-white shadow-card" />
          )}
          <span className="relative flex items-center justify-center gap-1.5">
            {o.icon && <Icon name={o.icon} size={18} fill={value === o.value} weight={value === o.value ? 600 : 400} />}
            {o.label}
          </span>
        </Tap>
      ))}
    </div>
  )
}

/* ── 卡片 ── */
export function Card({ className = '', ...rest }: HTMLMotionProps<'div'>) {
  return <motion.div className={`rounded-3xl bg-white p-4 shadow-card ${className}`} {...rest} />
}

/* ── 列表依序淡入 ── */
export const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}
export const listItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 34 } },
}
