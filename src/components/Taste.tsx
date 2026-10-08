import { AnimatePresence, motion } from 'framer-motion'
import { CUISINES, KINDS, type Cuisine, type Kind } from '../data/cuisine'
import { RECIPE_MAP, RECIPES } from '../data/recipes'
import { haptic } from '../lib/feedback'
import { fitsProfile } from '../lib/meal'
import { getTaste, toggleDislike, toggleFavorite, updateTaste } from '../lib/recipeStore'
import type { Profile } from '../types'
import { Food } from './Food'
import { Icon } from './Icon'
import { RecipePhoto } from './RecipePhoto'
import { Card, Sheet } from './ui'

/** 「我的」頁：口味偏好卡片 */
export function TasteCard({ profile, onOpen }: { profile: Profile; onOpen: () => void }) {
  const t = getTaste(profile)
  const summary = [
    t.cuisines.length ? CUISINES.filter((c) => t.cuisines.includes(c.id)).map((c) => c.label).join('、') : '',
    t.favorites.length ? `${t.favorites.length} 道最愛` : '',
  ]
    .filter(Boolean)
    .join('・')
  return (
    <Card>
      <button onClick={onOpen} className="flex w-full items-center gap-3 text-left">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-tomato-soft text-tomato">
          <Icon name="favorite" size={24} fill />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">口味偏好</span>
          <span className="block truncate text-xs text-muted">{summary || '選喜歡的料理，排菜單時會優先挑'}</span>
        </span>
        <Icon name="chevron_right" size={22} className="text-muted" />
      </button>
    </Card>
  )
}

function Tile({ on, label, image, onClick }: { on: boolean; label: string; image: Parameters<typeof Food>[0]['id']; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      animate={on ? { y: [0, -6, 0] } : { y: 0 }}
      transition={{ duration: 0.35 }}
      onClick={() => {
        haptic(on ? 6 : [8, 24, 8])
        onClick()
      }}
      aria-pressed={on}
      className={`relative flex flex-col items-center gap-1 rounded-3xl py-3 shadow-card transition-colors ${
        on ? 'bg-leaf text-white' : 'bg-white'
      }`}
    >
      <motion.span animate={on ? { rotate: [0, -12, 10, 0], scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.45 }}>
        <Food id={image} size={36} />
      </motion.span>
      <span className="text-xs font-medium">{label}</span>
      <AnimatePresence>
        {on && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 14 }}
            className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-white text-tomato shadow"
          >
            <Icon name="favorite" size={15} fill />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export function TasteSheet({ open, onClose, profile }: { open: boolean; onClose: () => void; profile: Profile }) {
  const t = getTaste(profile)
  const toggleCuisine = (c: Cuisine) =>
    updateTaste((x) => ({ ...x, cuisines: x.cuisines.includes(c) ? x.cuisines.filter((y) => y !== c) : [...x.cuisines, c] }))
  const toggleKind = (k: Kind) =>
    updateTaste((x) => ({ ...x, kinds: x.kinds.includes(k) ? x.kinds.filter((y) => y !== k) : [...x.kinds, k] }))
  const matching = RECIPES.filter(
    (r) => fitsProfile(r, profile) && ((r.cuisine && t.cuisines.includes(r.cuisine)) || (r.kind && t.kinds.includes(r.kind))),
  ).length

  return (
    <Sheet open={open} onClose={onClose} title="口味偏好">
      <div className="space-y-5">
        <p className="text-sm text-muted">選你喜歡的，快速挑選和推薦就會優先出現這些，不用每次自己想。</p>

        <section>
          <h3 className="mb-2 text-sm font-bold">喜歡哪些國家的料理？</h3>
          <div className="grid grid-cols-3 gap-2">
            {CUISINES.map((c) => (
              <Tile key={c.id} on={t.cuisines.includes(c.id)} label={c.label} image={c.image} onClick={() => toggleCuisine(c.id)} />
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-bold">喜歡哪種菜色？</h3>
          <div className="grid grid-cols-4 gap-2">
            {KINDS.map((k) => (
              <Tile key={k.id} on={t.kinds.includes(k.id)} label={k.label} image={k.image} onClick={() => toggleKind(k.id)} />
            ))}
          </div>
        </section>

        {(t.cuisines.length > 0 || t.kinds.length > 0) && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-leaf-soft p-3 text-xs text-leaf-dark">
            有 <b>{matching}</b> 道食譜符合你的喜好，排菜單時會優先出現。
          </motion.p>
        )}

        <RecipeList
          title="我的最愛"
          icon="favorite"
          ids={t.favorites}
          empty="在食譜頁點愛心，就會出現在這裡"
          onRemove={(id) => toggleFavorite(id)}
        />
        <RecipeList
          title="不想再看到"
          icon="thumb_down"
          ids={t.dislikes}
          empty="在食譜頁點「不想吃」，排菜單就不會再出現"
          onRemove={(id) => toggleDislike(id)}
          removeLabel="恢復"
        />
      </div>
    </Sheet>
  )
}

function RecipeList({
  title,
  icon,
  ids,
  empty,
  onRemove,
  removeLabel = '移除',
}: {
  title: string
  icon: 'favorite' | 'thumb_down'
  ids: string[]
  empty: string
  onRemove: (id: string) => void
  removeLabel?: string
}) {
  const list = ids.map((id) => RECIPE_MAP[id]).filter(Boolean)
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold">
        <Icon name={icon} size={18} fill className={icon === 'favorite' ? 'text-tomato' : 'text-muted'} />
        {title}
        <span className="text-xs font-normal text-muted">{list.length || ''}</span>
      </h3>
      {list.length === 0 ? (
        <p className="text-xs text-muted">{empty}</p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {list.map((r) => (
              <motion.li
                key={r.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 rounded-2xl bg-white p-2 pr-3 shadow-sm"
              >
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
                  <RecipePhoto recipe={r} />
                </span>
                <span className="flex-1 truncate text-sm">{r.name}</span>
                <button onClick={() => onRemove(r.id)} className="text-xs text-muted underline">
                  {removeLabel}
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  )
}
