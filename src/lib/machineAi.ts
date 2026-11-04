// 拍照辨識器材：照片縮小後送到雲端小程式（identify-machine），請 AI 從動作庫挑出這台能做的動作
import { EXERCISES } from '../data/exercises'
import { supabase } from './cloud'

const MACHINE_EQUIP = new Set(['machine', 'cable', 'smith', 'cardio', 'other'])

/** 縮到長邊 1024px 的 JPEG，回傳 base64（不含開頭） */
export async function shrinkPhoto(file: Blob, max = 1024): Promise<string> {
  const bmp = await createImageBitmap(file)
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * s)
  c.height = Math.round(bmp.height * s)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  bmp.close()
  return c.toDataURL('image/jpeg', 0.8).split(',')[1]
}

export interface MachineGuess {
  machine: string
  confidence: 'high' | 'medium' | 'low'
  exerciseIds: string[]
}

export async function identifyMachine(file: Blob): Promise<MachineGuess> {
  const image = await shrinkPhoto(file)
  const candidates = EXERCISES.filter((e) => MACHINE_EQUIP.has(e.equip)).map((e) => ({ id: e.id, zh: e.zh, en: e.en }))
  const { data, error } = await supabase.functions.invoke('identify-machine', { body: { image, mediaType: 'image/jpeg', candidates } })
  if (error) {
    // 取出小程式回的錯誤碼
    const body = await (error as { context?: Response }).context?.json?.().catch(() => null)
    throw new Error(body?.error ?? error.message)
  }
  return data as MachineGuess
}

export const aiErrorText = (e: unknown) => {
  const m = String((e as Error)?.message ?? e)
  if (/no_key/.test(m)) return '拍照辨識還沒開通（管理員要先在後台設定 AI 金鑰）'
  if (/401|jwt|auth/i.test(m)) return '拍照辨識要先登入會員'
  if (/refused/.test(m)) return '這張照片沒辦法辨識，換個角度再拍一次'
  if (/fetch|network/i.test(m)) return '連不上伺服器，請確認網路'
  return `辨識失敗：${m}`
}
