import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { RECIPE_MAP } from '../data/recipes'
import { Icon } from './Icon'
import { photoCredit, RecipePhoto } from './RecipePhoto'
import { useRecipeEditor } from './RecipeEditor'
import { useToast } from './ui'
import { useProfile } from '../lib/hooks'
import { deleteCustomRecipe, getTaste, saveCustomRecipe, toggleDislike, toggleFavorite } from '../lib/recipeStore'
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

/** 食譜照片縮圖（與詳細頁共用動畫） */
export function RecipeThumb({ recipe, layoutId, size = 48 }: { recipe: Recipe; layoutId: string; size?: number }) {
  return (
    <motion.div
      layoutId={layoutId}
      transition={softSpring}
      className="relative shrink-0 overflow-hidden rounded-2xl"
      style={{ width: size, height: size }}
    >
      <RecipePhoto recipe={recipe} />
    </motion.div>
  )
}

/**
 * 列表項目右半邊的照片背景：往左淡出成白色，文字留在左邊乾淨好讀。
 * 父層需要 relative + overflow-hidden。
 */
export function RowPhoto({ recipe, layoutId, dim = false }: { recipe: Recipe; layoutId?: string; dim?: boolean }) {
  return (
    <motion.div
      layoutId={layoutId}
      transition={softSpring}
      className="pointer-events-none absolute inset-y-0 right-0 w-[55%] overflow-hidden"
      style={{
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,.55) 35%, #000 70%)',
        maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,.55) 35%, #000 70%)',
      }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ filter: dim ? 'grayscale(0.7) brightness(1.05)' : 'grayscale(0) brightness(1)' }}
        transition={{ duration: 0.4 }}
      >
        <RecipePhoto recipe={recipe} />
      </motion.div>
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
  const profile = useProfile()
  const taste = getTaste(profile)
  const fav = taste.favorites.includes(recipe.id)
  const disliked = taste.dislikes.includes(recipe.id)
  const openEditor = useRecipeEditor()
  const toast = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)
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
          className="relative h-80 overflow-hidden rounded-b-[40px]"
        >
          <RecipePhoto recipe={recipe} size="lg" zoom />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/25" />
          <motion.button
            whileTap={{ scale: 0.9 }}
            aria-label="關閉"
            onClick={onClose}
            className="absolute left-4 top-[calc(16px+env(safe-area-inset-top))] grid h-10 w-10 place-items-center rounded-full bg-white/85 shadow-card backdrop-blur"
          >
            <Icon name="arrow_back" size={22} weight={500} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.8 }}
            animate={fav ? { scale: [1, 1.35, 0.9, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 0.5 }}
            aria-label={fav ? '取消最愛' : '加入最愛'}
            aria-pressed={fav}
            onClick={() => {
              haptic(fav ? 6 : [10, 30, 14])
              toggleFavorite(recipe.id)
              if (!fav) toast('加入最愛，排菜單時會優先挑')
            }}
            className={`absolute right-4 top-[calc(16px+env(safe-area-inset-top))] grid h-10 w-10 place-items-center rounded-full shadow-card backdrop-blur ${
              fav ? 'bg-tomato text-white' : 'bg-white/85 text-tomato'
            }`}
          >
            <Icon name="favorite" size={22} fill={fav} />
          </motion.button>
          <motion.div
            className="absolute inset-x-5 bottom-5 text-white"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.15, ...softSpring } }}
            exit={{ opacity: 0 }}
          >
            <h1 className="text-[28px] font-bold leading-tight drop-shadow">{recipe.name}</h1>
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 backdrop-blur">
                <Icon name="timer" size={14} /> {recipe.minutes} 分鐘
              </span>
              <span className="rounded-full bg-white/20 px-2.5 py-1 backdrop-blur">
                {recipe.meals.map((m) => MEAL_LABEL[m]).join('・')}
              </span>
              {recipe.tags.map((t) => (
                <span key={t} className="rounded-full bg-white/20 px-2.5 py-1 backdrop-blur">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="space-y-6 p-5 pb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.12, ...softSpring } }}
          exit={{ opacity: 0, y: 12 }}
        >
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

          {recipe.ingredients.length > 0 && (
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
          )}

          {recipe.steps.length > 0 && (
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
          )}

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
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                haptic(8)
                toggleDislike(recipe.id)
                toast(disliked ? '已恢復這道食譜' : '之後排菜單不會再出現這道')
              }}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs shadow-sm ${disliked ? 'bg-ink text-cream' : 'bg-white text-muted'}`}
            >
              <Icon name="thumb_down" size={15} fill={disliked} />
              {disliked ? '已設為不想吃' : '不想吃這道'}
            </motion.button>
            {recipe.custom && (
              <>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    onClose()
                    openEditor(recipe)
                  }}
                  className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs text-leaf-dark shadow-sm"
                >
                  <Icon name="edit" size={15} />
                  編輯
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  animate={confirmDelete ? { x: [0, -4, 4, 0] } : {}}
                  onClick={async () => {
                    if (!confirmDelete) {
                      setConfirmDelete(true)
                      haptic(10)
                      return
                    }
                    await deleteCustomRecipe(recipe.id)
                    onClose()
                    toast(`已刪除「${recipe.name}」`, () => saveCustomRecipe(recipe))
                  }}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs shadow-sm ${
                    confirmDelete ? 'bg-tomato text-white' : 'bg-white text-tomato'
                  }`}
                >
                  <Icon name="delete" size={15} />
                  {confirmDelete ? '再點一次確定刪除' : '刪除'}
                </motion.button>
              </>
            )}
          </div>
          <p className="text-xs text-muted">營養數值為估算，僅供參考。{recipe.custom ? '這是你自己新增的食譜。' : ''}</p>
          {recipe.sourceUrl && (
            <p className="flex flex-wrap items-center gap-1 text-[11px] text-muted">
              <Icon name="info" size={14} />
              營養依品牌標示（1 份），口味或配方更新可能略有不同・
              <a href={recipe.sourceUrl} target="_blank" rel="noreferrer" className="underline">
                資料來源
              </a>
            </p>
          )}
          <PhotoCreditLine id={recipe.photoOf ?? recipe.id} illustrative={!!recipe.photoOf} />
        </motion.div>
      </motion.div>
    </div>
  )
}

const LICENSE_LABEL = { cc0: 'CC0 公眾領域', pdm: '公眾領域', by: 'CC BY' } as const

function PhotoCreditLine({ id, illustrative = false }: { id: string; illustrative?: boolean }) {
  const c = photoCredit(id)
  if (!c) return null
  return (
    <p className="flex flex-wrap items-center gap-1 text-[11px] text-muted">
      <Icon name="image" size={14} />
      {illustrative ? '示意照片（非品牌產品）：' : '照片：'}
      <a href={c.landingUrl} target="_blank" rel="noreferrer" className="underline">
        {c.creator || c.title || '來源'}
      </a>
      <span>
        （{c.source}・
        <a href={c.licenseUrl} target="_blank" rel="noreferrer" className="underline">
          {LICENSE_LABEL[c.license]}
          {c.license === 'by' && c.licenseVersion ? ` ${c.licenseVersion}` : ''}
        </a>
        ）
      </span>
    </p>
  )
}
