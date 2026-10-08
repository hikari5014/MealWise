import { db } from '../db'
import type { BodyRecord } from '../types'
import { todayKey } from './date'

/** 捷徑名稱：使用者在「捷徑」App 裡要取一模一樣的名字 */
export const SHORTCUT_NAME = '好食光同步'

/** 貼在捷徑「文字」動作裡的範本，[ ] 的地方換成健康樣本變數 */
export const SHORTCUT_TEMPLATE = '好食光|體重=[體重]|體脂=[體脂肪率]|步數=[步數]|活動=[活動能量]'

export const isIOS = () =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true

/** 打開「捷徑」App 執行同步捷徑 */
export const runShortcut = () => {
  window.location.href = `shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT_NAME)}`
}

const num = (text: string, keys: string[]) => {
  for (const k of keys) {
    const m = text.match(new RegExp(`${k}[^\\d\\-|]*([\\d.,]+)`, 'i'))
    if (m) {
      const v = parseFloat(m[1].replace(/,/g, ''))
      if (!Number.isNaN(v)) return v
    }
  }
  return undefined
}

export type HealthData = Pick<BodyRecord, 'weight' | 'bodyFat' | 'steps' | 'activeKcal'>

/**
 * 解析捷徑複製過來的文字，例如：
 * 好食光|體重=72.5 kg|體脂=25.6%|步數=8000|活動=350 kcal
 * 只有一個數字時當成體重。
 */
export const parseHealthText = (raw: string): HealthData | null => {
  const text = raw.trim()
  if (!text) return null
  let weight = num(text, ['體重', 'weight'])
  let bodyFat = num(text, ['體脂', 'body ?fat'])
  const steps = num(text, ['步數', 'steps'])
  const activeKcal = num(text, ['活動', 'active'])
  if (weight === undefined && /^[\d.]+\s*(kg|公斤)?$/i.test(text)) weight = parseFloat(text)
  // 健康 App 有時給 0.256 這種比例
  if (bodyFat !== undefined && bodyFat <= 1) bodyFat = Math.round(bodyFat * 1000) / 10
  // 合理範圍檢查，避免貼到奇怪的東西
  if (weight !== undefined && (weight < 20 || weight > 300)) weight = undefined
  if (bodyFat !== undefined && (bodyFat < 2 || bodyFat > 70)) bodyFat = undefined
  const data: HealthData = {}
  if (weight !== undefined) data.weight = Math.round(weight * 10) / 10
  if (bodyFat !== undefined) data.bodyFat = bodyFat
  if (steps !== undefined) data.steps = Math.round(steps)
  if (activeKcal !== undefined) data.activeKcal = Math.round(activeKcal)
  return Object.keys(data).length ? data : null
}

export const saveBody = async (data: HealthData, source: BodyRecord['source'], date = todayKey()) => {
  const cur = await db.body.get(date)
  await db.body.put({ ...cur, ...data, date, source, updatedAt: Date.now() })
}

/** 期間內的體重變化（公斤） */
export const weightChange = (records: BodyRecord[]) => {
  const ws = records.filter((r) => r.weight !== undefined)
  if (ws.length < 2) return undefined
  return Math.round((ws[ws.length - 1].weight! - ws[0].weight!) * 10) / 10
}
