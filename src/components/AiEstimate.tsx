import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { db } from '../db'
import { haptic, spring } from '../lib/feedback'
import { MEAL_LABEL, type MealSlot, type Nutrition } from '../types'
import { Icon } from './Icon'
import { Button, Sheet, useToast } from './ui'
import { Art } from './Art'

const buildPrompt = (desc: string) => `你是一位營養師。請根據我附上的照片（以及描述），估算這一餐吃下去的總熱量與營養素。
如果照片裡有好幾道菜，請合計成一餐；份量不確定時，以台灣常見的一人份估算。
餐點描述：${desc.trim() || '（無，請看照片）'}

請「只」回覆下面這一行，數字用整數，不要加其他文字或單位：
好食光|名稱=料理名稱|熱量=0|蛋白質=0|碳水=0|脂肪=0|纖維=0`

const KEYS: Record<keyof Nutrition, string[]> = {
  kcal: ['熱量', 'kcal', 'calories', '卡路里'],
  protein: ['蛋白質', 'protein'],
  carbs: ['碳水', 'carbs', 'carbohydrate'],
  fat: ['脂肪', 'fat'],
  fiber: ['纖維', 'fiber', 'fibre'],
}

/** 解析 AI 的回覆（好食光|...格式，或 JSON、或一般文字裡的數字） */
export function parseEstimate(raw: string): { name?: string; nutrition: Nutrition } | null {
  const text = raw.replace(/\s+/g, ' ')
  const out: Partial<Nutrition> = {}
  for (const [k, words] of Object.entries(KEYS) as [keyof Nutrition, string[]][]) {
    for (const w of words) {
      const m = text.match(new RegExp(`["']?${w}["']?\\s*[=:：]\\s*["']?(\\d+(?:\\.\\d+)?)`, 'i'))
      if (m) {
        out[k] = Math.round(parseFloat(m[1]))
        break
      }
    }
  }
  if (out.kcal === undefined || out.kcal <= 0 || out.kcal > 6000) return null
  const name = text.match(/名稱\s*[=:：]\s*["']?([^|"',}]+)/)?.[1]?.trim() || text.match(/"name"\s*:\s*"([^"]+)"/i)?.[1]
  return {
    name,
    nutrition: {
      kcal: out.kcal,
      protein: out.protein ?? 0,
      carbs: out.carbs ?? 0,
      fat: out.fat ?? 0,
      fiber: out.fiber ?? 0,
    },
  }
}

const PRESETS: { label: string; kcal: number; n: Nutrition }[] = [
  { label: '簡單外食', kcal: 600, n: { kcal: 600, protein: 25, carbs: 70, fat: 22, fiber: 4 } },
  { label: '一般外食', kcal: 850, n: { kcal: 850, protein: 32, carbs: 95, fat: 35, fiber: 5 } },
  { label: '大餐・聚餐', kcal: 1400, n: { kcal: 1400, protein: 55, carbs: 130, fat: 70, fiber: 6 } },
]

const FIELDS: { key: keyof Nutrition; label: string; unit: string }[] = [
  { key: 'kcal', label: '熱量', unit: 'kcal' },
  { key: 'protein', label: '蛋白質', unit: 'g' },
  { key: 'carbs', label: '碳水', unit: 'g' },
  { key: 'fat', label: '脂肪', unit: 'g' },
  { key: 'fiber', label: '纖維', unit: 'g' },
]

/** 外食／大餐：不必輸入內容，請 AI 從照片估算後貼回來 */
export function AiEstimateSheet({
  open,
  onClose,
  date,
  meal,
}: {
  open: boolean
  onClose: () => void
  date: string
  meal: MealSlot | null
}) {
  const toast = useToast()
  const [desc, setDesc] = useState('')
  const [copied, setCopied] = useState(false)
  const [reply, setReply] = useState('')
  const [result, setResult] = useState<{ name: string; nutrition: Nutrition } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setDesc('')
      setCopied(false)
      setReply('')
      setResult(null)
      setError('')
    }
  }, [open])

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(buildPrompt(desc))
      haptic([8, 20, 8])
      setCopied(true)
    } catch {
      setError('沒辦法自動複製，請長按下方的提示詞手動複製')
    }
  }

  const apply = (text: string) => {
    const parsed = parseEstimate(text)
    if (!parsed) {
      haptic([30, 40, 30])
      setError('看不懂這段回覆，確認有包含「熱量=數字」')
      return
    }
    haptic([10, 30, 10])
    setError('')
    setResult({ name: parsed.name || desc.trim() || '外食', nutrition: parsed.nutrition })
  }

  const pasteReply = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setReply(text)
      apply(text)
    } catch {
      setError('沒辦法讀取剪貼簿，請在框框裡長按「貼上」')
    }
  }

  const save = async () => {
    if (!result || !meal) return
    await db.logs.add({
      date,
      meal,
      recipeId: '',
      custom: { name: result.name, nutrition: result.nutrition },
      portion: 1,
      createdAt: Date.now(),
    })
    haptic([10, 40, 10, 40, 20])
    onClose()
    toast(`已記錄 ${result.name}`)
  }

  return (
    <Sheet open={open} onClose={onClose} title={meal ? `${MEAL_LABEL[meal]}：外食・大餐` : '外食・大餐'}>
      <AnimatePresence mode="wait" initial={false}>
        {result ? (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={spring} className="space-y-3">
            <input
              value={result.name}
              onChange={(e) => setResult({ ...result, name: e.target.value })}
              className="w-full rounded-2xl bg-white px-4 py-3 font-bold shadow-card outline-none ring-leaf/40 focus:ring-2"
            />
            <div className="grid grid-cols-5 gap-2">
              {FIELDS.map((f, i) => (
                <motion.label
                  key={f.key}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 16, delay: i * 0.05 }}
                  className="rounded-2xl bg-white p-2 text-center shadow-card"
                >
                  <input
                    inputMode="numeric"
                    value={result.nutrition[f.key]}
                    onChange={(e) =>
                      setResult({ ...result, nutrition: { ...result.nutrition, [f.key]: Number(e.target.value.replace(/\D/g, '')) || 0 } })
                    }
                    className="w-full bg-transparent text-center text-lg font-bold tabular-nums outline-none"
                  />
                  <div className="text-[10px] text-muted">
                    {f.label}
                    <br />
                    {f.unit}
                  </div>
                </motion.label>
              ))}
            </div>
            <p className="text-xs text-muted">數字可以直接點來修改。AI 估算只是大概，不用太講究。</p>
            <div className="flex gap-3">
              <Button variant="soft" onClick={() => setResult(null)}>
                重來
              </Button>
              <Button className="flex flex-1 items-center justify-center gap-1.5" onClick={save}>
                <Icon name="check_circle" size={20} fill />
                記錄這一餐
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="steps" exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center gap-3 rounded-3xl bg-gradient-to-br from-sky-soft to-leaf-soft p-4">
              <Art name="ai-estimate" width={72} className="!mx-0 shrink-0" />
              <p className="text-sm leading-relaxed">
                不用一樣一樣輸入。拍張照片，連同下面的提示詞丟給 <b>ChatGPT、Claude 或 Gemini</b>，再把它的回覆貼回來就好。
              </p>
            </div>

            <StepTitle n={1} text="簡單描述一下（可不填）" />
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="例如：火鍋吃到飽，吃了兩盤肉"
              className="w-full rounded-2xl bg-white px-4 py-3 text-sm shadow-card outline-none ring-leaf/40 focus:ring-2"
            />

            <StepTitle n={2} text="複製提示詞，和照片一起貼給 AI" />
            <Button variant={copied ? 'soft' : 'primary'} className="flex w-full items-center justify-center gap-2" onClick={copyPrompt}>
              <Icon name={copied ? 'check' : 'content_copy'} size={20} motion={copied ? 'pop' : 'none'} />
              {copied ? '已複製，去貼給 AI 吧' : '複製提示詞'}
            </Button>
            <details className="rounded-2xl bg-white p-3 text-xs text-muted shadow-sm">
              <summary className="cursor-pointer">看提示詞內容</summary>
              <pre className="mt-2 whitespace-pre-wrap font-sans">{buildPrompt(desc)}</pre>
            </details>

            <StepTitle n={3} text="複製 AI 的回覆，貼回這裡" />
            <Button variant="soft" className="flex w-full items-center justify-center gap-2" onClick={pasteReply}>
              <Icon name="content_paste" size={20} />
              貼上 AI 的回覆
            </Button>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onBlur={() => reply.trim() && apply(reply)}
              rows={2}
              placeholder="或在這裡長按貼上"
              className="w-full rounded-2xl bg-white p-3 text-sm shadow-card outline-none ring-leaf/40 focus:ring-2"
            />
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, x: [0, -8, 8, -4, 4, 0] }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl bg-tomato-soft p-3 text-sm text-tomato"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="border-t border-ink/10 pt-3">
              <div className="mb-2 text-xs text-muted">懶得問 AI？直接選一個大概的份量：</div>
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((p) => (
                  <motion.button
                    key={p.label}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      haptic(8)
                      setResult({ name: desc.trim() || p.label, nutrition: p.n })
                    }}
                    className="rounded-2xl bg-white py-3 text-center shadow-sm"
                  >
                    <div className="text-sm font-medium">{p.label}</div>
                    <div className="text-xs tabular-nums text-muted">約 {p.kcal} kcal</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Sheet>
  )
}

function StepTitle({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-bold">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-leaf text-xs text-white">{n}</span>
      {text}
    </div>
  )
}
