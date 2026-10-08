import { motion, type TargetAndTransition } from 'framer-motion'
import type { CSSProperties } from 'react'
import type { IconName } from '../lib/icons'

export type IconMotion = 'none' | 'bounce' | 'wiggle' | 'spin' | 'pulse' | 'pop' | 'float'

const LOOPS: Record<Exclude<IconMotion, 'none'>, TargetAndTransition> = {
  bounce: { y: [0, -4, 0], transition: { repeat: Infinity, duration: 1.4, ease: 'easeInOut' } },
  wiggle: { rotate: [0, -14, 12, -6, 0], transition: { repeat: Infinity, repeatDelay: 2.2, duration: 0.6 } },
  spin: { rotate: 360, transition: { repeat: Infinity, duration: 1, ease: 'linear' } },
  pulse: { scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' } },
  pop: { scale: [0.4, 1.25, 1], transition: { type: 'spring', stiffness: 500, damping: 12 } },
  float: { y: [0, -3, 0], rotate: [0, 3, 0], transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' } },
}

/**
 * Google Material Symbols（可變字型）
 * - fill：0 → 1 會平滑地「填滿」，用在選取狀態
 * - weight：線條粗細，按下或選取時加粗
 * - motion：循環的小動畫
 */
export function Icon({
  name,
  size = 22,
  fill = false,
  weight = 400,
  grade = 0,
  motion: m = 'none',
  className = '',
  style,
  label,
}: {
  name: IconName
  size?: number
  fill?: boolean
  weight?: number
  grade?: number
  motion?: IconMotion
  className?: string
  style?: CSSProperties
  /** 有意義的圖示才給文字說明；純裝飾就留空 */
  label?: string
}) {
  return (
    <motion.span
      key={m === 'pop' ? name : undefined}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`material-symbols-rounded inline-block select-none leading-none ${className}`}
      style={{
        fontSize: size,
        width: size,
        height: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${Math.min(48, Math.max(20, size))}`,
        ...style,
      }}
      animate={m === 'none' ? undefined : LOOPS[m]}
    >
      {name}
    </motion.span>
  )
}
