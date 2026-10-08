import { motion } from 'framer-motion'
import type { FoodImage } from '../data/foodImages'

const base = import.meta.env.BASE_URL

export const foodSrc = (id: FoodImage) => `${base}food/${id}.webp`

/** 食物圖片（透明背景）；float 會輕輕飄動 */
export function Food({
  id,
  size = 32,
  float = false,
  className = '',
  alt = '',
}: {
  id: FoodImage
  size?: number
  float?: boolean
  className?: string
  alt?: string
}) {
  return (
    <motion.img
      src={foodSrc(id)}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      loading="lazy"
      decoding="async"
      className={`pointer-events-none inline-block select-none object-contain ${className}`}
      style={{ width: size, height: size }}
      animate={float ? { y: [0, -3, 0], rotate: [0, 2, 0] } : undefined}
      transition={float ? { repeat: Infinity, duration: 3.2, ease: 'easeInOut' } : undefined}
    />
  )
}
