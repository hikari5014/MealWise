import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { RECIPE_MAP } from '../data/recipes'
import { recipesFor } from '../lib/meal'
import { MEAL_LABEL, type MealSlot, type Profile, type Recipe } from '../types'
import { RecipeThumb, useRecipeDetail } from './RecipeDetail'
import { listContainer, listItem, Sheet } from './ui'

/** 挑選食譜的底部視窗（含「最近吃過」快速選） */
export function RecipePicker({
  open,
  onClose,
  meal,
  profile,
  recent = [],
  onPick,
  title,
}: {
  open: boolean
  onClose: () => void
  meal: MealSlot | null
  profile?: Profile
  recent?: string[]
  onPick: (recipe: Recipe) => void
  title?: string
}) {
  const [query, setQuery] = useState('')
  const [allMeals, setAllMeals] = useState(false)
  const list = useMemo(() => {
    const base = recipesFor(allMeals ? null : meal, profile)
    const q = query.trim()
    return q ? base.filter((r) => r.name.includes(q) || r.tags.some((t) => t.includes(q))) : base
  }, [meal, profile, query, allMeals])
  const recentRecipes = recent.map((id) => RECIPE_MAP[id]).filter(Boolean).slice(0, 6)

  const close = () => {
    setQuery('')
    setAllMeals(false)
    onClose()
  }

  return (
    <Sheet open={open} onClose={close} title={title ?? (meal ? `選擇${MEAL_LABEL[meal]}` : '選擇食譜')}>
      {recentRecipes.length > 0 && !query && (
        <div className="mb-4">
          <div className="mb-2 text-xs font-medium text-muted">最近吃過・點一下就好</div>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
            {recentRecipes.map((r) => (
              <motion.button
                key={r.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  onPick(r)
                  close()
                }}
                className="flex shrink-0 items-center gap-2 rounded-2xl bg-white py-2 pl-2 pr-3 text-sm shadow-card"
              >
                <span className="grid h-8 w-8 place-items-center rounded-xl text-lg" style={{ backgroundColor: r.color }}>
                  {r.emoji}
                </span>
                {r.name}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="sticky top-0 z-10 -mx-5 bg-cream px-5 pb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋食譜或標籤，例如：高蛋白"
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm shadow-card outline-none ring-leaf/40 focus:ring-2"
        />
        {meal && (
          <label className="mt-2 flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" checked={allMeals} onChange={(e) => setAllMeals(e.target.checked)} className="accent-leaf" />
            顯示所有餐別的食譜
          </label>
        )}
      </div>

      <motion.ul variants={listContainer} initial="hidden" animate="show" className="space-y-2">
        {list.map((r) => (
          <PickerRow
            key={r.id}
            recipe={r}
            onPick={() => {
              onPick(r)
              close()
            }}
          />
        ))}
        {list.length === 0 && <li className="py-10 text-center text-sm text-muted">找不到符合的食譜 🥲</li>}
      </motion.ul>
    </Sheet>
  )
}

function PickerRow({ recipe, onPick }: { recipe: Recipe; onPick: () => void }) {
  const openDetail = useRecipeDetail()
  const layoutId = `picker-${recipe.id}`
  return (
    <motion.li variants={listItem} className="flex items-center gap-3 rounded-2xl bg-white p-2 pr-3 shadow-card">
      <button onClick={() => openDetail(recipe.id, layoutId)} aria-label={`查看${recipe.name}`}>
        <RecipeThumb recipe={recipe} layoutId={layoutId} />
      </button>
      <button className="min-w-0 flex-1 text-left" onClick={onPick}>
        <div className="truncate font-medium">{recipe.name}</div>
        <div className="text-xs text-muted">
          {recipe.nutrition.kcal} kcal・蛋白質 {recipe.nutrition.protein}g・{recipe.minutes} 分
        </div>
      </button>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onPick}
        aria-label={`加入${recipe.name}`}
        className="grid h-9 w-9 place-items-center rounded-full bg-leaf-soft text-xl text-leaf-dark"
      >
        +
      </motion.button>
    </motion.li>
  )
}
