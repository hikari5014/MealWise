/** 輕觸震動回饋（支援的手機才會震） */
export const haptic = (pattern: number | number[] = 10) => {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // 不支援就算了
  }
}

export const spring = { type: 'spring', stiffness: 420, damping: 32 } as const
export const softSpring = { type: 'spring', stiffness: 260, damping: 28 } as const
