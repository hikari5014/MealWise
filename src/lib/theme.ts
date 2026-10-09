import { useEffect, useState } from 'react'

/** 外觀：淺色、深色（Apple Watch Nike 風格）、跟著手機設定 */
export type ThemePref = 'light' | 'dark' | 'system'
const KEY = 'mealwise-theme'
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

export const getThemePref = (): ThemePref => {
  try {
    return (localStorage.getItem(KEY) as ThemePref) || 'light'
  } catch {
    return 'light'
  }
}

const isDark = (pref: ThemePref) => pref === 'dark' || (pref === 'system' && media().matches)

export function applyTheme(pref: ThemePref) {
  const dark = isDark(pref)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#000000' : '#f7f3ec')
}

const listeners = new Set<() => void>()

export function setThemePref(pref: ThemePref) {
  try {
    localStorage.setItem(KEY, pref)
  } catch {
    /* 無痕模式存不了也沒關係 */
  }
  applyTheme(pref)
  listeners.forEach((f) => f())
}

export function useTheme() {
  const [pref, setPref] = useState(getThemePref)
  const [dark, setDark] = useState(() => isDark(getThemePref()))
  useEffect(() => {
    const sync = () => {
      const p = getThemePref()
      setPref(p)
      setDark(isDark(p))
      applyTheme(p)
    }
    listeners.add(sync)
    const m = media()
    m.addEventListener('change', sync)
    return () => {
      listeners.delete(sync)
      m.removeEventListener('change', sync)
    }
  }, [])
  return { pref, dark, setPref: setThemePref }
}
