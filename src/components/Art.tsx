import { motion } from 'framer-motion'

/** Gemini 生成的插圖（public/art），去背後的透明 webp */
export type ArtName =
  | 'onboard-welcome'
  | 'empty-plan'
  | 'empty-shopping'
  | 'empty-favorites'
  | 'empty-myrecipes'
  | 'banner-batch'
  | 'done-quickpick'
  | 'banner-composer'
  | 'share-card'
  | 'ai-estimate'

/** 進場彈出、之後輕輕漂浮 */
export function Art({ name, width = 160, className = '', float = true }: { name: ArtName; width?: number; className?: string; float?: boolean }) {
  return (
    <motion.img
      src={`${import.meta.env.BASE_URL}art/${name}.webp`}
      alt=""
      draggable={false}
      width={width}
      initial={{ opacity: 0, scale: 0.7, y: 10 }}
      animate={float ? { opacity: 1, scale: 1, y: [0, -6, 0] } : { opacity: 1, scale: 1, y: 0 }}
      transition={{
        opacity: { duration: 0.25 },
        scale: { type: 'spring', stiffness: 380, damping: 16 },
        y: float ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 } : { type: 'spring' },
      }}
      className={`pointer-events-none mx-auto select-none ${className}`}
      style={{ width }}
    />
  )
}
