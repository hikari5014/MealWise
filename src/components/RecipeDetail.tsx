import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { RECIPE_MAP } from '../data/recipes'
import { Food } from './Food'
import { Icon } from './Icon'
import { formatQty } from '../lib/meal'
import { haptic, softSpring } from '../lib/feedback'
import { AVOID_ITEM_MAP, recipeAvoidTags } from '../data/avoid'
import { MEAL_LABEL, type Recipe } from '../types'

interface Opened {
  recipe: Recipe
  layoutId: string
}

const Ctx = createContext<(recipeId: string, layoutId: string) => void>(() => {})

export const useRecipeDetail = () => useContext(Ctx)

/** 食譜縮圖（與詳細頁共用動畫） */
export function RecipeThumb({ recipe, layoutId, size = 48 }: { recipe: Recipe; layoutId: string; size?: number }) {
  return (
    <motion.div
      layoutId={layoutId}
      transition={softSpring}
      className="grid shrink-0 place-items-center rounded-2xl"
      style={{ width: size, height: size, backgroundColor: recipe.color }}
    >
      <motion.span layout="position" className="grid place-items-center">
        <Food id={recipe.image} size={Math.round(size * 0.72)} alt={recipe.name} />
      </motion.span>
    </motion.div>
  )
}

export function RecipeDetailProvider({ children }: { children: ReactNode }) {
  const [opened, setOpened] = useState<Opened | null>(null)
  const open = useCallback((recipeId: string, layoutId: string) => {
    const recipe = RECIPE_MAP[recipeId]
    if (recipe) {
      haptic(6)
      setOpened({ recipe, layoutId })
    }
  }, [])

  useEffect(() => {
    if (!opened) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpened(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [opened])

  return (
    <Ctx.Provider value={open}>
      {children}
      <AnimatePresence>
        {opened && <Detail key={opened.layoutId} {...opened} onClose={() => setOpened(null)} />}
      </AnimatePresence>
    </Ctx.Provider>
  )
}

function Detail({ recipe, layoutId, onClose }: Opened & { onClose: () => void }) {
  const n = recipe.nutrition
  return (
    <div className="fixed inset-0 z-40">
      <motion.div
        className="absolute inset-0 bg-ink/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={recipe.name}
        className="absolute inset-0 mx-auto max-w-lg overflow-y-auto bg-cream"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
      >
        <motion.div
          layoutId={layoutId}
          transition={softSpring}
          className="relative grid h-64 place-items-center rounded-b-[40px] pt-[env(safe-area-inset-top)]"
          style={{ backgroundColor: recipe.color }}
        >
          <motion.span layout="position" className="grid place-items-center">
            <Food id={recipe.image} size={150} float alt={recipe.name} />
          </motion.span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            aria-label="關閉"
            onClick={onClose}
            className="absolute left-4 top-[calc(16px+env(safe-area-inset-top))] grid h-10 w-10 place-items-center rounded-full bg-white/80 shadow-card"
          >
            <Icon name="arrow_back" size={22} weight={500} />
          </motion.button>
        </motion.div>

        <motion.div
          className="space-y-6 p-5 pb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.12, ...softSpring } }}
          exit={{ opacity: 0, y: 12 }}
        >
          <div>
            <h1 className="text-2xl font-bold">{recipe.name}</h1>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1">
                <Icon name="timer" size={14} /> {recipe.minutes} 分鐘
              </span>
              <span className="rounded-full bg-white px-3 py-1">{recipe.meals.map((m) => MEAL_LABEL[m]).join('・')}</span>
              {recipe.tags.map((t) => (
                <span key={t} className="rounded-full bg-leaf-soft px-3 py-1 text-leaf-dark">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 rounded-3xl bg-white p-4 text-center shadow-card">
            {[
              ['熱量', n.kcal, 'kcal'],
              ['蛋白質', n.protein, 'g'],
              ['碳水', n.carbs, 'g'],
              ['脂肪', n.fat, 'g'],
              ['纖維', n.fiber, 'g'],
            ].map(([label, v, unit]) => (
              <div key={label}>
                <div className="text-lg font-bold tabular-nums">{v}</div>
                <div className="text-[10px] text-muted">
                  {label}
                  <br />
                  {unit}
                </div>
              </div>
            ))}
          </div>

          <section>
            <h2 className="mb-2 font-bold">食材（1 人份）</h2>
            <ul className="divide-y divide-ink/5 rounded-3xl bg-white px-4 shadow-card">
              {recipe.ingredients.map((ing) => (
                <li key={ing.name} className="flex justify-between py-3 text-sm">
                  <span>{ing.name}</span>
                  <span className="text-muted">{formatQty(ing.qty, ing.unit)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-bold">步驟</h2>
            <ol className="space-y-3">
              {recipe.steps.map((s, idx) => (
                <li key={idx} className="flex gap-3 text-sm leading-relaxed">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          </section>

          {recipe.prep.length > 0 && (
            <section>
              <h2 className="mb-2 font-bold">可以先準備</h2>
              <ul className="space-y-2">
                {recipe.prep.map((p) => (
                  <li key={p.task} className="flex items-center gap-2 rounded-2xl bg-honey-soft px-4 py-3 text-sm">
                    <Icon name="skillet" size={18} className="text-honey" fill />
                    <span>
                      {p.task}
                      <span className="ml-2 text-xs text-muted">{p.keep}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {recipeAvoidTags(recipe).length > 0 && (
            <p className="text-xs text-muted">含：{recipeAvoidTags(recipe).map((t) => AVOID_ITEM_MAP[t]?.label).join('、')}</p>
          )}
          <p className="text-xs text-muted">營養數值為估算，僅供參考。</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
