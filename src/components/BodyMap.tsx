import { motion } from 'framer-motion'
import Model, { type IExerciseData } from 'react-body-highlighter'

/** 正面＋背面人體圖；data 裡同一肌群出現越多次顏色越深 */
export function BodyMap({ data, colors, height = 170, labels = true }: { data: IExerciseData[]; colors: string[]; height?: number; labels?: boolean }) {
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
          <Model type={type} data={data} highlightedColors={colors} bodyColor="#e6dfd3" style={{ height, width: height * 0.5 }} svgStyle={{ height: '100%', width: '100%' }} />
          {labels && <span className="mt-1 text-[10px] text-muted">{type === 'anterior' ? '正面' : '背面'}</span>}
        </motion.div>
      ))}
    </div>
  )
}

export const LOAD_COLORS = ['#f1c27d', '#e07a5f']
export const WEEK_COLORS = ['#cfe3c9', '#8fbf88', '#4f7f4e']
