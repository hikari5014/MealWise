import { db } from '../db'
import type { BodyRecord } from '../types'
import { todayKey } from './date'

/** 捷徑名稱：使用者在「捷徑」App 裡要取一模一樣的名字 */
export const SHORTCUT_NAME = '好食光同步'

/** 貼在捷徑「文字」動作裡的範本，[ ] 的地方換成健康樣本變數 */
export const SHORTCUT_TEMPLATE = '好食光|體重=[體重]|體脂=[體脂肪率]|步數=[步數]|活動=[活動能量]'

/** 給 iOS 27 捷徑 AI 的一段描述：貼進「描述捷徑」就會自動組好 */
export const HEALTH_AI_PROMPT = `建立一個名為「${SHORTCUT_NAME}」的捷徑，請嚴格照下面做：
1. 用「尋找健康樣本」找「體重」：依「開始日期」排序、「最新的在前」、限制「1」筆，取它的「值」，單位用公斤（kg）。
2. 用「尋找健康樣本」找「體脂肪率」：依「開始日期」排序、「最新的在前」、限制「1」筆，取它的「值」。
3. 用「尋找健康樣本」找「步數」：條件是「開始日期」在「今天」，不要限制筆數，再用「計算統計資料」算「總和」。
4. 用「尋找健康樣本」找「動態能量」：條件是「開始日期」在「今天」，不要限制筆數，再用「計算統計資料」算「總和」，單位用大卡（kcal）。
5. 用「文字」組成一行，格式完全照這樣（等號後面只放數字）：
好食光|體重=第1步的值|體脂=第2步的值|步數=第3步的總和|活動=第4步的總和
6. 用「拷貝到剪貼簿」複製這段文字。`

export const isIOS = () =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true

/** 打開「捷徑」App 執行同步捷徑 */
export const runShortcut = () => {
  window.location.href = `shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT_NAME)}`
}

/** 找「關鍵字=數字」；同一欄有好幾個數字（捷徑給了清單）時取第一個，並記下單位 */
const num = (text: string, keys: string[]) => {
  for (const k of keys) {
    const m = text.match(new RegExp(`${k}[^\\d\\-|]*([\\d.,]+)\\s*([^|\\d\\n]*)`, 'i'))
    if (m) {
      const v = parseFloat(m[1].replace(/,/g, ''))
      if (!Number.isNaN(v)) return { v, unit: m[2].trim().toLowerCase() }
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
  const w = num(text, ['體重', 'weight'])
  // 磅換成公斤
  let weight = w ? (/lb|磅/.test(w.unit) ? w.v * 0.4536 : w.v) : undefined
  let bodyFat = num(text, ['體脂', 'body ?fat'])?.v
  const steps = num(text, ['步數', 'steps'])?.v
  const a = num(text, ['活動', 'active'])
  // 千焦換成大卡
  const activeKcal = a ? (/kj|千焦/.test(a.unit) ? a.v / 4.184 : a.v) : undefined
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
