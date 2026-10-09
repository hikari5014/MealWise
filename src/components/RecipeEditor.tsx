import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { CUISINES, KINDS } from '../data/cuisine'
import { ingredientTags, AVOID_ITEM_MAP } from '../data/avoid'
import { haptic, spring } from '../lib/feedback'
import {
  guessSection,
  newRecipeId,
  normalizeRecipe,
  parseRecipeJson,
  RECIPE_JSON_PROMPT,
  RECIPE_JSON_TEMPLATE,
  saveCustomRecipe,
} from '../lib/recipeStore'
import { MEAL_LABEL, MEAL_SLOTS, SECTION_LABEL, SECTION_ORDER, type MealSlot, type Recipe, type Section } from '../types'
import { Icon } from './Icon'
import { RecipePhoto } from './RecipePhoto'
import { Button, Segmented, Sheet, Tap, useToast } from './ui'

const Ctx = createContext<(recipe?: Recipe) => void>(() => {})

export const useRecipeEditor = () => useContext(Ctx)

export function RecipeEditorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; recipe?: Recipe }>({ open: false })
  return (
    <Ctx.Provider value={(recipe) => setState({ open: true, recipe })}>
      {children}
      <RecipeEditor open={state.open} recipe={state.recipe} onClose={() => setState({ open: false })} />
    </Ctx.Provider>
  )
}

interface Draft {
  name: string
  photoUrl: string
  meals: MealSlot[]
  cuisine: string
  kind: string
  minutes: string
  vegetarian: boolean
  tags: string
  kcal: string
  protein: string
  carbs: string
  fat: string
  fiber: string
  ingredients: { name: string; qty: string; unit: string; section: Section }[]
  steps: string
}

const emptyDraft = (): Draft => ({
  name: '',
  photoUrl: '',
  meals: ['lunch', 'dinner'],
  cuisine: '',
  kind: '',
  minutes: '20',
  vegetarian: false,
  tags: '',
  kcal: '',
  protein: '',
  carbs: '',
  fat: '',
  fiber: '',
  ingredients: [{ name: '', qty: '', unit: 'g', section: 'produce' }],
  steps: '',
})

const fromRecipe = (r: Recipe): Draft => ({
  name: r.name,
  photoUrl: r.photoUrl ?? '',
  meals: r.meals,
  cuisine: r.cuisine ?? '',
  kind: r.kind ?? '',
  minutes: String(r.minutes),
  vegetarian: r.vegetarian,
  tags: r.tags.join('、'),
  kcal: String(r.nutrition.kcal),
  protein: String(r.nutrition.protein),
  carbs: String(r.nutrition.carbs),
  fat: String(r.nutrition.fat),
  fiber: String(r.nutrition.fiber),
  ingredients: r.ingredients.map((i) => ({ name: i.name, qty: String(i.qty), unit: i.unit, section: i.section })),
  steps: r.steps.join('\n'),
})

function RecipeEditor({ open, recipe, onClose }: { open: boolean; recipe?: Recipe; onClose: () => void }) {
  const toast = useToast()
  const [mode, setMode] = useState<'form' | 'json'>('form')
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [error, setError] = useState('')
  const [json, setJson] = useState('')
  const [parsed, setParsed] = useState<Recipe[]>([])

  useEffect(() => {
    if (open) {
      setMode('form')
      setDraft(recipe ? fromRecipe(recipe) : emptyDraft())
      setError('')
      setJson('')
      setParsed([])
    }
  }, [open, recipe])

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const setIng = (i: number, patch: Partial<Draft['ingredients'][number]>) =>
    set({ ingredients: draft.ingredients.map((x, k) => (k === i ? { ...x, ...patch } : x)) })

  const buildFromDraft = (): Recipe =>
    normalizeRecipe(
      {
        name: draft.name,
        photo: draft.photoUrl,
        meals: draft.meals,
        cuisine: draft.cuisine,
        kind: draft.kind,
        minutes: draft.minutes,
        vegetarian: draft.vegetarian,
        tags: draft.tags,
        nutrition: { kcal: draft.kcal, protein: draft.protein, carbs: draft.carbs, fat: draft.fat, fiber: draft.fiber },
        ingredients: draft.ingredients.filter((x) => x.name.trim()).map((x) => ({ ...x, qty: x.qty || 1 })),
        steps: draft.steps,
        prep: recipe?.prep ?? [],
      },
      recipe?.id ?? newRecipeId(),
    )

  const fail = (e: unknown) => {
    haptic([30, 40, 30])
    setError(e instanceof Error ? e.message : String(e))
  }

  const saveForm = async () => {
    try {
      const r = buildFromDraft()
      await saveCustomRecipe({ ...r, createdAt: recipe?.createdAt })
      haptic([10, 40, 10, 40, 20])
      onClose()
      toast(recipe ? `已更新「${r.name}」` : `已新增「${r.name}」`)
    } catch (e) {
      fail(e)
    }
  }

  const parse = (text = json) => {
    try {
      setParsed(parseRecipeJson(text))
      setError('')
      haptic([8, 24, 8])
    } catch (e) {
      setParsed([])
      fail(e)
    }
  }

  const saveJson = async () => {
    const now = Date.now()
    await Promise.all(parsed.map((r, i) => saveCustomRecipe({ ...r, createdAt: now + i })))
    haptic([10, 40, 10, 40, 20])
    onClose()
    toast(`已新增 ${parsed.length} 道食譜`)
  }

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text)
      haptic(8)
      toast(msg)
    } catch {
      setError('沒辦法自動複製')
    }
  }

  const preview: Recipe | null = (() => {
    try {
      return draft.name && draft.kcal ? buildFromDraft() : null
    } catch {
      return null
    }
  })()

  return (
    <Sheet open={open} onClose={onClose} title={recipe ? '編輯食譜' : '新增食譜'}>
      <div className="space-y-4">
        {!recipe && (
          <Segmented
            id="editor-mode"
            value={mode}
            onChange={(m) => {
              setMode(m)
              setError('')
            }}
            options={[
              { value: 'form', label: '手動輸入', icon: 'edit' },
              { value: 'json', label: '貼上 JSON', icon: 'data_object' },
            ]}
          />
        )}

        <AnimatePresence mode="wait" initial={false}>
          {mode === 'form' ? (
            <motion.div key="form" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
              {/* 照片預覽 */}
              <div className="relative h-36 overflow-hidden rounded-3xl bg-card shadow-card">
                {preview ? (
                  <RecipePhoto key={draft.photoUrl} recipe={preview} />
                ) : (
                  <div className="grid h-full place-items-center text-sm text-muted">填好名稱和熱量就會出現預覽</div>
                )}
                {preview && (
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-3 text-lg font-bold text-white">
                    {preview.name}
                  </div>
                )}
              </div>

              <Field label="食譜名稱">
                <input value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="例如：番茄雞胸義大利麵" className={inputCls} />
              </Field>
              <Field label="圖片網址（選填，不會上傳圖片）">
                <input
                  value={draft.photoUrl}
                  onChange={(e) => set({ photoUrl: e.target.value.trim() })}
                  placeholder="https://…jpg"
                  inputMode="url"
                  className={inputCls}
                />
              </Field>

              <Field label="適合哪一餐">
                <Chips
                  options={MEAL_SLOTS.map((m) => ({ id: m, label: MEAL_LABEL[m] }))}
                  value={draft.meals}
                  onToggle={(m) => set({ meals: draft.meals.includes(m) ? draft.meals.filter((x) => x !== m) : [...draft.meals, m] })}
                />
              </Field>
              <Field label="料理國家">
                <Chips
                  options={CUISINES.map((c) => ({ id: c.id, label: c.label }))}
                  value={[draft.cuisine]}
                  onToggle={(c) => set({ cuisine: draft.cuisine === c ? '' : c })}
                />
              </Field>
              <Field label="菜色類型">
                <Chips
                  options={KINDS.map((k) => ({ id: k.id, label: k.label }))}
                  value={[draft.kind]}
                  onToggle={(k) => set({ kind: draft.kind === k ? '' : k })}
                />
              </Field>

              <Field label="營養（1 人份）">
                <div className="grid grid-cols-5 gap-2">
                  {(
                    [
                      ['kcal', '熱量', 'kcal'],
                      ['protein', '蛋白質', 'g'],
                      ['carbs', '碳水', 'g'],
                      ['fat', '脂肪', 'g'],
                      ['fiber', '纖維', 'g'],
                    ] as const
                  ).map(([k, label, unit]) => (
                    <label key={k} className="rounded-2xl bg-card p-2 text-center shadow-sm">
                      <input
                        inputMode="numeric"
                        value={draft[k]}
                        onChange={(e) => set({ [k]: e.target.value.replace(/[^\d.]/g, '') })}
                        placeholder="0"
                        className="w-full bg-transparent text-center font-bold tabular-nums outline-none"
                      />
                      <span className="text-[10px] text-muted">
                        {label}
                        <br />
                        {unit}
                      </span>
                    </label>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="時間（分鐘）">
                  <input
                    inputMode="numeric"
                    value={draft.minutes}
                    onChange={(e) => set({ minutes: e.target.value.replace(/\D/g, '') })}
                    className={inputCls}
                  />
                </Field>
                <Field label="素食">
                  <Tap
                    type="button"
                    onClick={() => set({ vegetarian: !draft.vegetarian })}
                    className={`w-full rounded-2xl px-4 py-3 text-left shadow-sm transition-colors ${draft.vegetarian ? 'bg-leaf text-on-leaf' : 'bg-card'}`}
                  >
                    {draft.vegetarian ? '是（蛋奶素）' : '否'}
                  </Tap>
                </Field>
              </div>

              <Field label="食材">
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {draft.ingredients.map((ing, i) => {
                      const tags = ing.name.trim() ? ingredientTags(ing.name.trim()) : []
                      return (
                        <motion.div
                          key={i}
                          layout
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={spring}
                          className="rounded-2xl bg-card p-2 shadow-sm"
                        >
                          <div className="flex gap-2">
                            <input
                              value={ing.name}
                              onChange={(e) => setIng(i, { name: e.target.value })}
                              onBlur={(e) => e.target.value.trim() && setIng(i, { section: guessSection(e.target.value) })}
                              placeholder="食材"
                              className="min-w-0 flex-[3] rounded-xl bg-cream px-3 py-2 outline-none"
                            />
                            <input
                              value={ing.qty}
                              inputMode="decimal"
                              onChange={(e) => setIng(i, { qty: e.target.value.replace(/[^\d.]/g, '') })}
                              placeholder="份量"
                              className="w-16 rounded-xl bg-cream px-2 py-2 text-center outline-none"
                            />
                            <input
                              value={ing.unit}
                              onChange={(e) => setIng(i, { unit: e.target.value })}
                              className="w-12 rounded-xl bg-cream px-2 py-2 text-center outline-none"
                            />
                            <Tap
                              type="button"
                              aria-label="刪除食材"
                              onClick={() => set({ ingredients: draft.ingredients.filter((_, k) => k !== i) })}
                              className="grid w-8 place-items-center text-muted"
                            >
                              <Icon name="close" size={18} />
                            </Tap>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1">
                            <select
                              value={ing.section}
                              onChange={(e) => setIng(i, { section: e.target.value as Section })}
                              className="rounded-lg bg-cream px-2 py-1 text-xs outline-none"
                            >
                              {SECTION_ORDER.map((s) => (
                                <option key={s} value={s}>
                                  {SECTION_LABEL[s]}
                                </option>
                              ))}
                            </select>
                            {tags.map((t) => (
                              <span key={t} className="rounded-full bg-tomato-soft px-2 py-0.5 text-[10px] text-tomato">
                                含{AVOID_ITEM_MAP[t]?.label}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                  <Tap
                    type="button"
                    onClick={() => set({ ingredients: [...draft.ingredients, { name: '', qty: '', unit: 'g', section: 'produce' }] })}
                    className="flex w-full items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-ink/10 py-2 text-sm text-muted"
                  >
                    <Icon name="add" size={18} />
                    加一樣食材
                  </Tap>
                </div>
              </Field>

              <Field label="步驟（一行一步）">
                <textarea
                  value={draft.steps}
                  onChange={(e) => set({ steps: e.target.value })}
                  rows={4}
                  placeholder={'雞胸切丁\n下鍋煎熟\n加醬汁拌勻'}
                  className={inputCls}
                />
              </Field>
              <Field label="標籤（用頓號或逗號分隔，選填）">
                <input value={draft.tags} onChange={(e) => set({ tags: e.target.value })} placeholder="高蛋白、快速" className={inputCls} />
              </Field>

              <ErrorText error={error} />
              <Button className="flex w-full items-center justify-center gap-2" onClick={saveForm}>
                <Icon name="check_circle" size={20} fill />
                {recipe ? '儲存修改' : '新增食譜'}
              </Button>
            </motion.div>
          ) : (
            <motion.div key="json" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="space-y-3">
              <p className="text-sm text-muted">
                貼上固定格式的 JSON 文字，可以一次新增一道或好幾道。看到喜歡的網路食譜，也可以把「給 AI 的提示詞」連同食譜丟給 AI，請它轉成這個格式。
              </p>
              <div className="flex gap-2">
                <Button variant="soft" className="flex flex-1 items-center justify-center gap-1.5 text-sm" onClick={() => copy(RECIPE_JSON_TEMPLATE, '已複製 JSON 範本')}>
                  <Icon name="content_copy" size={18} />
                  複製範本
                </Button>
                <Button variant="soft" className="flex flex-1 items-center justify-center gap-1.5 text-sm" onClick={() => copy(RECIPE_JSON_PROMPT, '已複製給 AI 的提示詞')}>
                  <Icon name="smart_toy" size={18} />
                  給 AI 的提示詞
                </Button>
              </div>
              <textarea
                value={json}
                onChange={(e) => {
                  setJson(e.target.value)
                  setParsed([])
                }}
                rows={8}
                placeholder={RECIPE_JSON_TEMPLATE}
                className={`${inputCls} font-mono text-xs`}
                spellCheck={false}
              />
              <div className="flex gap-2">
                <Button
                  variant="soft"
                  className="flex items-center justify-center gap-1.5"
                  onClick={async () => {
                    try {
                      const t = await navigator.clipboard.readText()
                      setJson(t)
                      parse(t)
                    } catch {
                      setError('沒辦法讀取剪貼簿，請在框框裡長按「貼上」')
                    }
                  }}
                >
                  <Icon name="content_paste" size={18} />
                  貼上
                </Button>
                <Button className="flex flex-1 items-center justify-center gap-1.5" disabled={!json.trim()} onClick={() => parse()}>
                  <Icon name="visibility" size={18} />
                  檢查並預覽
                </Button>
              </div>
              <ErrorText error={error} />
              <AnimatePresence>
                {parsed.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                    {parsed.map((r, i) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 18, delay: i * 0.06 }}
                        className="relative flex h-20 items-end overflow-hidden rounded-2xl shadow-card"
                      >
                        <RecipePhoto recipe={r} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="relative p-3 text-white">
                          <div className="font-bold">{r.name}</div>
                          <div className="text-[11px] opacity-85">
                            {r.nutrition.kcal} kcal・{r.ingredients.length} 樣食材・{r.steps.length} 個步驟
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <Button className="flex w-full items-center justify-center gap-2" onClick={saveJson}>
                      <Icon name="check_circle" size={20} fill />
                      加入 {parsed.length} 道食譜
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Sheet>
  )
}

const inputCls = 'w-full rounded-2xl bg-card px-4 py-3 shadow-sm outline-none ring-leaf/40 focus:ring-2'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="block px-1 text-xs font-medium text-muted">{label}</span>
      {children}
    </div>
  )
}

function Chips<T extends string>({ options, value, onToggle }: { options: { id: T; label: string }[]; value: string[]; onToggle: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = value.includes(o.id)
        return (
          <motion.button
            key={o.id}
            type="button"
            whileTap={{ scale: 0.9 }}
            animate={{ scale: on ? [1, 1.08, 1] : 1 }}
            onClick={(e) => {
              e.preventDefault()
              haptic(6)
              onToggle(o.id)
            }}
            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${on ? 'bg-leaf text-on-leaf' : 'bg-card shadow-sm'}`}
          >
            {o.label}
          </motion.button>
        )
      })}
    </div>
  )
}

function ErrorText({ error }: { error: string }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, x: [0, -8, 8, -4, 4, 0] }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1.5 rounded-2xl bg-tomato-soft p-3 text-sm text-tomato"
        >
          <Icon name="error" size={18} fill />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

