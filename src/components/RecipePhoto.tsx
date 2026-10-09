import { motion } from 'framer-motion'
import { useState } from 'react'
import photoCredits from '../data/photoCredits.json'
import type { Recipe } from '../types'
import { Food } from './Food'

const base = import.meta.env.BASE_URL
const credits = photoCredits as Record<string, PhotoCredit>

export interface PhotoCredit {
  title: string
  creator: string
  source: string
  license: 'cc0' | 'pdm' | 'by' | 'own'
  licenseVersion: string
  licenseUrl: string
  landingUrl: string
}

export const photoCredit = (id: string): PhotoCredit | undefined => credits[id]

export const photoSrc = (id: string, size: 'sm' | 'lg') => `${base}photos/${id}-${size}.webp`

/**
 * 食譜照片：填滿父層（父層要 relative + overflow-hidden）。
 * 找不到照片時退回 3D 食物插圖。
 */
export function RecipePhoto({
  recipe,
  size = 'sm',
  className = '',
  zoom = false,
}: {
  recipe: Recipe
  size?: 'sm' | 'lg'
  className?: string
  /** 慢慢放大的 Ken Burns 效果 */
  zoom?: boolean
}) {
  const photoId = recipe.photoOf ?? recipe.id
  const src = recipe.photoUrl ?? (credits[photoId] ? photoSrc(photoId, size) : undefined)
  const [failedSrc, setFailedSrc] = useState<string>()
  const [loaded, setLoaded] = useState(false)
  const failed = !src || failedSrc === src

  if (failed) {
    return (
      <div className={`absolute inset-0 grid place-items-center ${className}`} style={{ backgroundColor: recipe.color }}>
        <Food id={recipe.image} size={size === 'lg' ? 140 : 56} alt={recipe.name} />
      </div>
    )
  }

  return (
    <div className={`absolute inset-0 ${className}`} style={{ backgroundColor: recipe.color }}>
      <motion.img
        src={src}
        referrerPolicy="no-referrer"
        alt={recipe.name}
        draggable={false}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailedSrc(src)}
        className="h-full w-full select-none object-cover"
        initial={false}
        animate={{ opacity: loaded ? 1 : 0, scale: zoom && loaded ? [1, 1.08] : 1 }}
        transition={
          zoom ? { opacity: { duration: 0.35 }, scale: { duration: 14, ease: 'linear', repeat: Infinity, repeatType: 'reverse' } } : { duration: 0.35 }
        }
      />
    </div>
  )
}
