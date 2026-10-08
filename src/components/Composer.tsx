import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ingredientTags } from '../data/avoid'
import {
  COMP_MAP,
  comboName,
  comboNutrition,
  comboSteps,
  comboToRecipe,
  METHODS,
  PART_LABEL,
  randomCombo,
  type Combo,
  type Comp,
  type Part,
} from '../data/composer'
import { CUISINE_LABEL } from '../data/cuisine'
import { haptic, spring } from '../lib/feedback'
import { useProfile } from '../lib/hooks'
import { newRecipeId, saveCustomRecipe } from '../lib/recipeStore'
import { Food } from './Food'
import { IngredientPicker } from './IngredientPicker'
import { Icon } from './Icon'
import { useRecipeDetail } from './RecipeDetail'
import { Button, Sheet, useToast } from './ui'

const Ctx = createContext<() => void>(() => {})
export const useComposer = () => useContext(Ctx)

export function ComposerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <Ctx.Provider value={() => setOpen(true)}>
      {children}
      <Composer open={open} onClose={() => setOpen(false)} />
    </Ctx.Provider>
  )
}

const PARTS: Part[] = ['protein', 'veg', 'fruit', 'carb', 'fat', 'flavor']
const START: Combo = { items: {}, method: 'pan' }

/** 料理組合器：挑食材和煮法，自動產生菜名、做法和營養 */
function Composer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const profile = useProfile()
  const toast = useToast()
  const openDetail = useRecipeDetail()
  const [combo, setCombo] = useState<Combo>(START)
  const [customName, setCustomName] = useState<string | null>(null)
  const [showSteps, setShowSteps] = useState(false)

  useEffect(() => {
    if (open) {
      setCombo(START)
      setCustomName(null)
      setShowSteps(false)
    }
  }, [open])

  const avoid = profile?.avoid ?? []
  const blocked = (comp: Comp) => ingredientTags(comp.name).some((t) => avoid.includes(t))
  const n = useMemo(() => comboNutrition(combo), [combo])
  const autoName = useMemo(() => comboName(combo), [combo])
  const steps = useMemo(() => comboSteps(combo), [combo])
  const name = customName ?? autoName
  const selected = Object.keys(combo.items).filter((id) => combo.items[id] > 0)
  const hasMain = selected.some((id) => ['protein', 'veg', 'fruit'].includes(COMP_MAP[id]?.part))
  const preview = useMemo(() => comboToRecipe(combo, 'preview'), [combo])

  /** 超過該類上限就不加，回傳 false 讓畫面播失敗動畫 */
  const toggle = (comp: Comp) => {
    const items = { ...combo.items }
    if (items[comp.id]) delete items[comp.id]
    else {
      const same = Object.keys(items).filter((id) => COMP_MAP[id].part === comp.part)
      if (same.length >= PART_LABEL[comp.part].max) return false
      items[comp.id] = comp.qty
    }
    setCombo({ ...combo, items })
    return true
  }
  const setQty = (comp: Comp, q: number) => {
    haptic(4)
    setCombo((c) => ({ ...c, items: { ...c.items, [comp.id]: Math.max(comp.step, Math.round(q * 100) / 100) } }))
  }
  const setMethod = (method: Combo['method']) => {
    haptic(6)
    setCombo((c) => {
      const m = METHODS.find((x) => x.id === method)!
      const items = { ...c.items }
      // 換煮法時，油量跟著建議值走
      const oilId = Object.keys(items).find((id) => /oil/.test(id))
      if (oilId) {
        if (m.oil) items[oilId] = m.oil
        else delete items[oilId]
      } else if (m.oil && Object.keys(items).length) items['olive-oil'] = m.oil
      return { method, items }
    })
  }

  const shuffle = () => {
    haptic([8, 30, 8])
    const vegetarian = !!profile?.vegetarian
    for (let i = 0; i < 20; i++) {
      const next = randomCombo({ lowCarb: Math.random() < 0.4, vegetarian })
      if (!Object.keys(next.items).some((id) => blocked(COMP_MAP[id]))) {
        setCombo(next)
        setCustomName(null)
        return
      }
    }
  }

  const save = async () => {
    const recipe = comboToRecipe(combo, newRecipeId(), name.trim() || autoName)
    await saveCustomRecipe(recipe)
    haptic([10, 40, 10, 40, 20])
    onClose()
    toast(`已存成「${recipe.name}」`, () => openDetail(recipe.id, `composer-${recipe.id}`), '看食譜')
  }

  return (
    <Sheet open={open} onClose={onClose} title="組合料理">
      <div className="space-y-4">
        {/* 即時預覽 */}
        <motion.div layout className="sticky top-0 z-10 -mx-1 rounded-3xl bg-gradient-to-br from-leaf-soft to-honey-soft p-3 shadow-card">
          <div className="flex items-center gap-3">
            <motion.div key={preview.image} initial={{ scale: 0.5, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
              <Food id={preview.image} size={40} />
            </motion.div>
            <div className="min-w-0 flex-1">
              <input
                value={name}
                onChange={(e) => setCustomName(e.target.value)}
                aria-label="菜名"
                className="w-full bg-transparent text-lg font-bold outline-none"
              />
              <div className="flex flex-wrap gap-1 text-[11px] text-ink/70">
                {preview.cuisine && <span>{CUISINE_LABEL[preview.cuisine]}</span>}
                {preview.tags.slice(1).map((t) => (
                  <span key={t} className="rounded-full bg-white/70 px-1.5">
                    {t}
                  </span>
                ))}
                <span>約 {preview.minutes} 分</span>
              </div>
            </div>
            {customName !== null && (
              <button onClick={() => setCustomName(null)} aria-label="用自動菜名" className="text-ink/50">
                <Icon name="refresh" size={18} />
              </button>
            )}
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1.5 text-center">
            {(
              [
                ['熱量', n.kcal, 'kcal'],
                ['蛋白質', n.protein, 'g'],
                ['碳水', n.carbs, 'g'],
                ['脂肪', n.fat, 'g'],
              ] as const
            ).map(([label, v, u]) => (
              <div key={label} className="rounded-xl bg-white/70 py-1">
                <motion.div key={v} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-sm font-bold tabular-nums">
                  {v}
                  <span className="text-[10px] font-normal text-muted">{u}</span>
                </motion.div>
                <div className="text-[10px] text-muted">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 煮法 */}
        <div>
          <div className="mb-1.5 px-1 text-sm font-bold">煮法</div>
          <div className="grid grid-cols-4 gap-1.5">
            {METHODS.map((m) => (
              <motion.button
                key={m.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMethod(m.id)}
                className={`flex flex-col items-center gap-0.5 rounded-2xl py-2 text-xs transition-colors ${
                  combo.method === m.id ? 'bg-leaf text-white' : 'bg-white shadow-card'
                }`}
              >
                <Icon name={m.icon} size={20} fill={combo.method === m.id} />
                {m.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline gap-2 px-1">
            <span className="text-sm font-bold">食材</span>
            <span className="text-[11px] text-muted">點分類挑選，例如 肉類 → 豬肉 → 五花肉</span>
          </div>
          <IngredientPicker items={combo.items} blocked={blocked} onToggle={toggle} />
        </div>

        <AnimatePresence initial={false}>
          {selected.length > 0 && (
            <motion.section
              key="chosen"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mb-1.5 px-1 text-sm font-bold">已選 {selected.length} 樣・調整份量</div>
              <ul className="space-y-1.5">
                <AnimatePresence initial={false}>
                  {PARTS.flatMap((part) => selected.filter((id) => COMP_MAP[id].part === part)).map((id) => {
                    const comp = COMP_MAP[id]
                    return (
                      <motion.li
                        key={id}
                        layout
                        initial={{ opacity: 0, x: -20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 30, transition: { duration: 0.15 } }}
                        transition={spring}
                        className="flex items-center gap-2 rounded-2xl bg-white px-2.5 py-1.5 text-sm shadow-card"
                      >
                        <Food id={comp.image} size={26} />
                        <span className="min-w-0 flex-1 truncate">
                          {comp.name}
                          <span className="ml-1 text-[10px] text-muted">{PART_LABEL[comp.part].label}</span>
                        </span>
                        <button onClick={() => setQty(comp, combo.items[id] - comp.step)} aria-label="減少" className="grid h-7 w-7 place-items-center rounded-full bg-cream">
                          <Icon name="remove" size={16} />
                        </button>
                        <span className="w-14 text-center text-xs tabular-nums">
                          {combo.items[id]} {comp.unit}
                        </span>
                        <button onClick={() => setQty(comp, combo.items[id] + comp.step)} aria-label="增加" className="grid h-7 w-7 place-items-center rounded-full bg-cream">
                          <Icon name="add" size={16} />
                        </button>
                        <button onClick={() => toggle(comp)} aria-label={`移除${comp.name}`} className="grid h-7 w-7 place-items-center text-muted">
                          <Icon name="close" size={16} />
                        </button>
                      </motion.li>
                    )
                  })}
                </AnimatePresence>
              </ul>
            </motion.section>
          )}
        </AnimatePresence>

        {hasMain && (
          <div className="rounded-3xl bg-white p-4 shadow-card">
            <button onClick={() => setShowSteps(!showSteps)} className="flex w-full items-center gap-2 text-left text-sm font-bold">
              <Icon name="menu_book" size={18} className="text-leaf-dark" />
              自動產生的做法（{steps.length} 步）
              <motion.span animate={{ rotate: showSteps ? 180 : 0 }} className="ml-auto text-muted">
                <Icon name="expand_more" size={20} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {showSteps && (
                <motion.ol
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="list-decimal space-y-1 overflow-hidden pl-5 pt-3 text-sm leading-relaxed"
                >
                  {steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </motion.ol>
              )}
            </AnimatePresence>
          </div>
        )}

        <p className="px-1 text-[11px] text-muted">營養是依常見食材資料估算的大概數字。存檔後可以在食譜頁再修改。</p>

        <div className="sticky bottom-0 -mx-5 flex gap-2 bg-gradient-to-t from-cream via-cream to-transparent px-5 pb-1 pt-4">
          <Button variant="soft" className="flex items-center gap-1 px-4" onClick={shuffle}>
            <Icon name="auto_awesome" size={18} />
            隨機
          </Button>
          <Button className="flex-1" disabled={!hasMain} onClick={save}>
            {hasMain ? '存成我的食譜' : '先選一樣蛋白質、蔬菜或水果'}
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
