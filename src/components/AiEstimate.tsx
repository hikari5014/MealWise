import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { db } from '../db'
import { haptic, spring } from '../lib/feedback'
import { MEAL_LABEL, type MealSlot, type Nutrition } from '../types'
import { Icon } from './Icon'
import { Button, Sheet, Tap, useToast } from './ui'
import { Art } from './Art'

export const buildPrompt = (desc: string) => `你是一位營養師。請根據我附上的照片（以及描述），估算這一餐「每一樣」食物的熱量與營養素。

拆分規則：
1. 照片裡有好幾樣食物或飲料時，每一樣分開一行，不要合計。
2. 便當、自助餐、餐盤、合菜：把裡面的每一道菜都分開，例如主菜（排骨、雞腿）、每一樣配菜（滷蛋、青菜、豆干、酸菜）、白飯或麵、湯，各一行。
3. 同一道菜裡的醬汁、配料算在那道菜裡；看不清楚的小配菜可以合併成「其他配菜」一行。
4. 依照照片裡實際的份量估算（例如便當的飯通常約 1 碗、一格配菜約 1/3 碗）；看不出來時以台灣常見的一人份估算。

餐點描述：${desc.trim() || '（無，請看照片）'}

請「只」回覆下面格式，一樣食物一行，數字用整數，不要加其他文字、編號或單位：
好食光|名稱=食物名稱|份量=約多少|熱量=0|蛋白質=0|碳水=0|脂肪=0|纖維=0
好食光|名稱=食物名稱|份量=約多少|熱量=0|蛋白質=0|碳水=0|脂肪=0|纖維=0`

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
  // 份量（例如「約 1/3 碗」）接在名稱後面
  const amount = text.match(/份量\s*[=:：]\s*["']?([^|"',}]+)/)?.[1]?.trim()
  return {
    name: name && amount && !/^(無|-|不明)$/.test(amount) ? `${name}（${amount}）` : name,
    nutrition: {
      kcal: out.kcal,
      protein: out.protein ?? 0,
      carbs: out.carbs ?? 0,
      fat: out.fat ?? 0,
      fiber: out.fiber ?? 0,
    },
  }
}

/** 解析好幾樣：每一行「好食光|…」各算一樣；JSON 陣列也可以；都沒有就當成一樣 */
export function parseEstimates(raw: string): { name?: string; nutrition: Nutrition }[] {
  const lines = raw.split(/\r?\n/).filter((l) => /好食光\s*\|/.test(l))
  if (lines.length) return lines.map(parseEstimate).filter((x): x is NonNullable<typeof x> => !!x)
  try {
    const j = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1))
    if (Array.isArray(j)) {
      const out = j.map((o) => parseEstimate(JSON.stringify(o))).filter((x): x is NonNullable<typeof x> => !!x)
      if (out.length) return out
    }
  } catch {
    /* 不是 JSON */
  }
  const one = parseEstimate(raw)
  return one ? [one] : []
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
  preCopied = false,
}: {
  open: boolean
  onClose: () => void
  date: string
  meal: MealSlot | null
  /** 打開前已經自動複製好提示詞了（快速 AI 記錄） */
  preCopied?: boolean
}) {
  const toast = useToast()
  const [desc, setDesc] = useState('')
  const [copied, setCopied] = useState(false)
  const [reply, setReply] = useState('')
  const [items, setItems] = useState<{ name: string; nutrition: Nutrition }[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setDesc('')
      setCopied(preCopied)
      setReply('')
      setItems(null)
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
    const parsed = parseEstimates(text)
    if (!parsed.length) {
      haptic([30, 40, 30])
      setError('看不懂這段回覆，確認有包含「熱量=數字」')
      return
    }
    haptic([10, 30, 10])
    setError('')
    setItems(parsed.map((x, i) => ({ name: x.name || (parsed.length > 1 ? `第 ${i + 1} 樣` : desc.trim() || '外食'), nutrition: x.nutrition })))
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
    if (!items?.length || !meal) return
    const now = Date.now()
    const ids = (await db.logs.bulkAdd(
      items.map((it, i) => ({ date, meal, recipeId: '', custom: { name: it.name, nutrition: it.nutrition }, portion: 1, createdAt: now + i })),
      { allKeys: true },
    )) as number[]
    haptic([10, 40, 10, 40, 20])
    onClose()
    toast(items.length > 1 ? `已記錄 ${items.length} 樣` : `已記錄 ${items[0].name}`, () => db.logs.bulkDelete(ids))
  }
  const setItem = (i: number, patch: Partial<{ name: string; nutrition: Nutrition }>) =>
    setItems((list) => list && list.map((x, k) => (k === i ? { ...x, ...patch } : x)))
  const total = (items ?? []).reduce((t, x) => t + x.nutrition.kcal, 0)

  return (
    <Sheet open={open} onClose={onClose} title={meal ? `${MEAL_LABEL[meal]}：外食・大餐` : '外食・大餐'}>
      <AnimatePresence mode="wait" initial={false}>
        {items ? (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={spring} className="space-y-3">
            {items.length > 1 && (
              <div className="flex items-baseline justify-between px-1 text-sm">
                <span className="font-bold">AI 拆成 {items.length} 樣</span>
                <span className="tabular-nums text-muted">合計 {total} kcal</span>
              </div>
            )}
            <AnimatePresence initial={false}>
              {items.map((it, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ ...spring, delay: Math.min(i, 6) * 0.04 }}
                  className="space-y-2 rounded-3xl bg-card p-3 shadow-card"
                >
                  <div className="flex items-center gap-2">
                    <input
                      value={it.name}
                      onChange={(e) => setItem(i, { name: e.target.value })}
                      className="min-w-0 flex-1 rounded-xl bg-cream px-3 py-2 font-bold outline-none ring-leaf/40 focus:ring-2"
                    />
                    {items.length > 1 && (
                      <Tap aria-label={`拿掉${it.name}`} onClick={() => setItems(items.filter((_, k) => k !== i))} className="grid h-8 w-8 place-items-center rounded-full text-muted">
                        <Icon name="delete" size={18} />
                      </Tap>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {FIELDS.map((f) => (
                      <label key={f.key} className="rounded-xl bg-cream px-1 py-1.5 text-center">
                        <input
                          inputMode="numeric"
                          value={it.nutrition[f.key]}
                          onChange={(e) => setItem(i, { nutrition: { ...it.nutrition, [f.key]: Number(e.target.value.replace(/\D/g, '')) || 0 } })}
                          className="w-full bg-transparent text-center font-bold tabular-nums outline-none"
                        />
                        <div className="text-[10px] text-muted">
                          {f.label} {f.unit}
                        </div>
                      </label>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <p className="text-xs text-muted">名稱和數字都可以點來修改；不要的那樣按垃圾桶拿掉。AI 估算只是大概。</p>
            <div className="flex gap-3">
              <Button variant="soft" onClick={() => setItems(null)}>
                重來
              </Button>
              <Button className="flex flex-1 items-center justify-center gap-1.5" onClick={save} disabled={!items.length}>
                <Icon name="check_circle" size={20} fill />
                {items.length > 1 ? `記錄這 ${items.length} 樣` : '記錄這一餐'}
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
              onChange={(e) => {
                setDesc(e.target.value)
                setCopied(false)
              }}
              placeholder="例如：火鍋吃到飽，吃了兩盤肉"
              className="w-full rounded-2xl bg-card px-4 py-3 text-sm shadow-card outline-none ring-leaf/40 focus:ring-2"
            />

            {preCopied && copied && (
              <p className="flex items-center gap-1.5 rounded-2xl bg-leaf-soft px-3 py-2 text-sm text-leaf-dark">
                <Icon name="check_circle" size={18} fill />
                提示詞已經複製好了，直接去 AI 貼上、附上照片
              </p>
            )}
            <StepTitle n={2} text="複製提示詞，和照片一起貼給 AI" />
            <Button variant={copied ? 'soft' : 'primary'} className="flex w-full items-center justify-center gap-2" onClick={copyPrompt}>
              <Icon name={copied ? 'check' : 'content_copy'} size={20} motion={copied ? 'pop' : 'none'} />
              {copied ? '已複製，去貼給 AI 吧' : '複製提示詞'}
            </Button>
            <details className="rounded-2xl bg-card p-3 text-xs text-muted shadow-sm">
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
              className="w-full rounded-2xl bg-card p-3 text-sm shadow-card outline-none ring-leaf/40 focus:ring-2"
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
                      setItems([{ name: desc.trim() || p.label, nutrition: p.n }])
                    }}
                    className="rounded-2xl bg-card py-3 text-center shadow-sm"
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
      <span className="grid h-6 w-6 place-items-center rounded-full bg-leaf text-xs text-on-leaf">{n}</span>
      {text}
    </div>
  )
}
