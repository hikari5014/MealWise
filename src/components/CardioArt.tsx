// 找不到合適實景照片的有氧動作：好食光自己畫的線條插畫＋會動的小人
import { motion } from 'framer-motion'

const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const thin = { ...line, strokeWidth: 1.6 }
const walk = (duration: number) => ({ duration, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' as const })

function StairClimber({ play }: { play: boolean }) {
  const t = walk(0.6)
  return (
    <svg viewBox="0 0 120 90" className="h-full w-full" aria-hidden>
      <defs>
        <clipPath id="stair-well">
          <rect x="34" y="40" width="44" height="42" />
        </clipPath>
      </defs>
      <path d="M26 83 L96 83" {...line} />
      {/* 機台：後方支柱、扶手、螢幕 */}
      <path d="M80 83 L80 20" {...line} />
      <path d="M72 18 L88 15" {...line} strokeWidth={4} />
      <path d="M80 34 L66 36 M80 40 L68 42" {...thin} />
      {/* 一直往下轉的階梯 */}
      <g clipPath="url(#stair-well)">
        <motion.g animate={play ? { x: [0, -10], y: [0, 9] } : undefined} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M${28 + i * 10} ${88 - i * 9} h10 v-9`} {...thin} strokeWidth={2} />
          ))}
        </motion.g>
      </g>
      {/* 小人：手扶扶手，兩腳輪流踩 */}
      <circle cx="57" cy="20" r="4.2" fill="currentColor" />
      <path d="M57 25 L55 45" {...line} />
      <path d="M56.5 29 L63 35 L67 36 M56.5 29 L61 37 L68 42" {...line} strokeWidth={2.2} />
      <motion.path {...line} animate={play ? { d: ['M55 45 L61 53 L58 62', 'M55 45 L57 56 L54 70'] } : undefined} d="M55 45 L61 53 L58 62" transition={t} />
      <motion.path {...line} animate={play ? { d: ['M55 45 L57 56 L54 70', 'M55 45 L61 53 L58 62'] } : undefined} d="M55 45 L57 56 L54 70" transition={t} />
    </svg>
  )
}

function InclineWalk({ play }: { play: boolean }) {
  const t = walk(0.55)
  return (
    <svg viewBox="0 0 120 90" className="h-full w-full" aria-hidden>
      {/* 斜斜的跑步機：跑帶會動 */}
      <path d="M20 80 L94 66" {...line} strokeWidth={5} />
      <motion.path
        d="M22 76 L92 62.5"
        {...thin}
        strokeDasharray="4 6"
        animate={play ? { strokeDashoffset: [0, 20] } : undefined}
        transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
      />
      <path d="M24 80 L26 85 M90 67 L92 85 M20 85 L98 85" {...thin} />
      <path d="M90 66 L86 30" {...line} />
      <path d="M80 28 L94 25" {...line} strokeWidth={4} />
      <path d="M86 40 L74 42" {...thin} />
      <text x="96" y="58" fontSize="9" fill="currentColor" opacity="0.6">
        ↗
      </text>
      {/* 小人往上坡走 */}
      <circle cx="59" cy="22" r="4.2" fill="currentColor" />
      <path d="M59 27 L56.5 46" {...line} />
      <motion.path {...line} animate={play ? { d: ['M58.5 31 L64 39 M58.5 31 L52 38', 'M58.5 31 L53 39 M58.5 31 L64.5 37'] } : undefined} d="M58.5 31 L64 39 M58.5 31 L52 38" transition={t} />
      <motion.path {...line} animate={play ? { d: ['M56.5 46 L62 56 L64 67', 'M56.5 46 L53 57 L48 69'] } : undefined} d="M56.5 46 L62 56 L64 67" transition={t} />
      <motion.path {...line} animate={play ? { d: ['M56.5 46 L53 57 L48 69', 'M56.5 46 L62 56 L64 67'] } : undefined} d="M56.5 46 L53 57 L48 69" transition={t} />
    </svg>
  )
}

function SledPull({ play }: { play: boolean }) {
  const t = { duration: 0.9, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' as const }
  return (
    <svg viewBox="0 0 120 90" className="h-full w-full" aria-hidden>
      {/* 地面線條往右跑，看起來雪橇在前進 */}
      <path d="M8 79 L112 79" {...line} />
      <motion.path
        d="M8 84 L112 84"
        {...thin}
        strokeDasharray="3 9"
        animate={play ? { strokeDashoffset: [0, -24] } : undefined}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
      />
      {/* 雪橇和槓片 */}
      <motion.g animate={play ? { x: [0, 4] } : undefined} transition={t}>
        <path d="M12 78 L40 78 L43 74" {...line} />
        <path d="M18 78 L18 66 M34 78 L34 66 M16 66 L36 66" {...line} strokeWidth={2.2} />
        <circle cx="26" cy="68" r="7" {...line} strokeWidth={2.2} />
        <circle cx="26" cy="68" r="2" fill="currentColor" />
      </motion.g>
      {/* 繩子：一手一手往回拉 */}
      <motion.path {...thin} strokeWidth={1.8} animate={play ? { d: ['M41 74 Q56 70 70 47', 'M45 74 Q60 72 77 49'] } : undefined} d="M41 74 Q56 70 70 47" transition={t} />
      {/* 小人身體往後倒、面向雪橇 */}
      <circle cx="84" cy="24" r="4.2" fill="currentColor" />
      <path d="M83.5 29 L88 49" {...line} />
      <motion.path {...line} strokeWidth={2.2} animate={play ? { d: ['M84.5 33 L77 41 L70 47', 'M84.5 33 L80 44 L77 49'] } : undefined} d="M84.5 33 L77 41 L70 47" transition={t} />
      <path d="M88 49 L81 61 L74 77 M88 49 L94 63 L92 78" {...line} />
    </svg>
  )
}

/** 有插畫的動作 */
export const CARDIO_ART: Record<string, (p: { play: boolean }) => JSX.Element> = {
  'cx-stair-climber': StairClimber,
  'cx-incline-walk': InclineWalk,
  'cx-sled-pull': SledPull,
}
