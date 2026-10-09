import { motion } from 'framer-motion'
import Model, { type IExerciseData } from 'react-body-highlighter'
import { useTheme } from '../lib/theme'

/** 正面＋背面人體圖；data 裡同一肌群出現越多次顏色越深 */
export function BodyMap({ data, colors, height = 170, labels = true }: { data: IExerciseData[]; colors: 'load' | 'week'; height?: number; labels?: boolean }) {
  const { dark } = useTheme()
  const palette = colors === 'load' ? (dark ? LOAD_DARK : LOAD_COLORS) : dark ? WEEK_DARK : WEEK_COLORS
  return (
    <div className="flex justify-center gap-4">
      {(['anterior', 'posterior'] as const).map((type, i) => (
        <motion.div
          key={type}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22, delay: i * 0.08 }}
          className="flex flex-col items-center"
        >
          <Model type={type} data={data} highlightedColors={palette} bodyColor={dark ? '#2c2c2e' : '#e6dfd3'} style={{ height, width: height * 0.5 }} svgStyle={{ height: '100%', width: '100%' }} />
          {labels && <span className="mt-1 text-[10px] text-muted">{type === 'anterior' ? '正面' : '背面'}</span>}
        </motion.div>
      ))}
    </div>
  )
}

export const LOAD_COLORS = ['#f1c27d', '#e07a5f']
export const LOAD_DARK = ['#ffd60a', '#ff6b4a']
export const WEEK_COLORS = ['#cfe3c9', '#8fbf88', '#4f7f4e']
export const WEEK_DARK = ['#3d5a12', '#7fbf1f', '#bef23c']

/** 圖例用的顏色（跟著主題） */
export function useBodyPalette(kind: 'load' | 'week') {
  const { dark } = useTheme()
  return kind === 'load' ? (dark ? LOAD_DARK : LOAD_COLORS) : dark ? WEEK_DARK : WEEK_COLORS
}
