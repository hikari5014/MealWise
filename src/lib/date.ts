const pad = (v: number) => String(v).padStart(2, '0')

export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const fromKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const todayKey = () => toKey(new Date())

export const addDays = (key: string, days: number) => {
  const d = fromKey(key)
  d.setDate(d.getDate() + days)
  return toKey(d)
}

/** 以週一為一週開始 */
export const weekStart = (key: string) => {
  const d = fromKey(key)
  const offset = (d.getDay() + 6) % 7
  return addDays(key, -offset)
}

export const weekDays = (startKey: string) => Array.from({ length: 7 }, (_, i) => addDays(startKey, i))

const WEEKDAY = ['日', '一', '二', '三', '四', '五', '六']

export const weekdayLabel = (key: string) => WEEKDAY[fromKey(key).getDay()]

export const monthDay = (key: string) => {
  const d = fromKey(key)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export const greeting = () => {
  const h = new Date().getHours()
  if (h < 5) return '夜深了'
  if (h < 11) return '早安'
  if (h < 14) return '午安'
  if (h < 18) return '下午好'
  return '晚安'
}
