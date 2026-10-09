import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

/** 數字平滑跳動 */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const mv = useMotionValue(value)
  const rounded = useTransform(mv, (v) => Math.round(v))
  const [text, setText] = useState(Math.round(value))
  useEffect(() => rounded.on('change', setText), [rounded])
  useEffect(() => {
    const c = animate(mv, value, { duration: 0.6, ease: [0.22, 1, 0.36, 1] })
    return c.stop
  }, [mv, value])
  return <span className={className}>{text}</span>
}

/** 熱量圓環 */
export function Ring({
  value,
  target,
  size = 148,
  stroke = 14,
  color = 'rgb(var(--leaf))',
  children,
}: {
  value: number
  target: number
  size?: number
  stroke?: number
  color?: string
  children?: React.ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const ratio = target > 0 ? Math.min(value / target, 1) : 0
  const over = value > target * 1.05
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-ink/5" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          style={{ stroke: over ? 'rgb(var(--tomato))' : color }}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - ratio) }}
          transition={{ type: 'spring', stiffness: 60, damping: 16 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}

/** 營養素橫條 */
export function MacroBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const ratio = target > 0 ? Math.min(value / target, 1) : 0
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-medium tabular-nums">
          {Math.round(value)}
          <span className="text-muted"> / {target}g</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink/5">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        />
      </div>
    </div>
  )
}
