import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { GROUPS as DEFAULT_GROUPS, PART_LABEL, type Comp, type Group } from '../data/composer'
import { haptic } from '../lib/feedback'
import { Food } from './Food'
import { Icon } from './Icon'

const COLS = 3
const bouncy = { type: 'spring', stiffness: 520, damping: 14 } as const

/**
 * 組合料理的食材挑選：先點大分類（肉類、海鮮、蛋…），
 * 跳出面板後再選細分類（豬肉、雞肉…）裡的食材。
 */
export function IngredientPicker({
  items,
  blocked,
  onToggle,
  groups: GROUPS = DEFAULT_GROUPS,
  limits = true,
}: {
  items: Record<string, number>
  blocked: (c: Comp) => boolean
  /** 回傳 false 代表超過上限、沒有加進去 */
  onToggle: (c: Comp) => boolean
  groups?: Group[]
  /** 是否顯示每類上限（冰箱清單不限） */
  limits?: boolean
}) {
  const [openId, setOpenId] = useState<Group['id'] | null>(null)
  const openIndex = GROUPS.findIndex((g) => g.id === openId)
  const openGroup = GROUPS[openIndex]
  const rows: Group[][] = []
  for (let i = 0; i < GROUPS.length; i += COLS) rows.push(GROUPS.slice(i, i + COLS))
  const openRow = openIndex >= 0 ? Math.floor(openIndex / COLS) : -1

  return (
    <div className="space-y-2">
      {rows.map((row, r) => (
        <div key={r}>
          <div className="grid grid-cols-3 gap-2">
            {row.map((g) => (
              <GroupTile
                key={g.id}
                group={g}
                count={g.subs.flatMap((s) => s.items).filter((x) => items[x.id]).length}
                open={g.id === openId}
                onTap={() => {
                  haptic(10)
                  setOpenId(openId === g.id ? null : g.id)
                }}
              />
            ))}
          </div>
          <AnimatePresence initial={false}>
            {openRow === r && openGroup && (
              <motion.div
                key="panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                className="overflow-hidden"
              >
                <Panel
                  limits={limits}
                  key={openGroup.id}
                  group={openGroup}
                  column={openIndex % COLS}
                  items={items}
                  blocked={blocked}
                  onToggle={onToggle}
                  onClose={() => setOpenId(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

function GroupTile({ group, count, open, onTap }: { group: Group; count: number; open: boolean; onTap: () => void }) {
  const controls = useAnimationControls()
  const [prev, setPrev] = useState(count)
  useEffect(() => {
    if (count !== prev) {
      controls.start({ y: [0, -10, 0], scale: [1, 1.25, 1], rotate: [0, -12, 8, 0], transition: { duration: 0.45 } })
      setPrev(count)
    }
  }, [count, prev, controls])
  return (
    <motion.button
      type="button"
      onClick={onTap}
      whileTap={{ scale: 0.9 }}
      animate={{ y: open ? -2 : 0 }}
      transition={bouncy}
      aria-expanded={open}
      className={`relative flex flex-col items-center gap-1 rounded-3xl py-2.5 shadow-card transition-colors ${
        count ? 'bg-leaf-soft' : 'bg-white'
      } ${open ? 'ring-2 ring-leaf/60' : ''}`}
    >
      <motion.span animate={controls} className="grid place-items-center">
        <Food id={group.image} size={36} />
      </motion.span>
      <span className="text-sm font-medium">{group.label}</span>
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={bouncy}
            className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-leaf px-1.5 text-[11px] font-bold text-white shadow"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

function Panel({
  limits,
  group,
  column,
  items,
  blocked,
  onToggle,
  onClose,
}: {
  limits: boolean
  group: Group
  column: number
  items: Record<string, number>
  blocked: (c: Comp) => boolean
  onToggle: (c: Comp) => boolean
  onClose: () => void
}) {
  // 預設打開「已經有選東西」的細分類
  const [sub, setSub] = useState(() => Math.max(0, group.subs.findIndex((s) => s.items.some((x) => items[x.id]))))
  const [warn, setWarn] = useState<string | null>(null)
  const timer = useRef<number>()
  const limit = PART_LABEL[group.part]

  const fail = () => {
    haptic([30, 40, 30, 40, 30])
    setWarn(`${limit.label}最多選 ${limit.max} 樣，先取消一樣再選`)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setWarn(null), 2400)
  }
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const list = group.subs[sub]?.items ?? []
  return (
    <div className="relative pb-1 pt-3">
      <motion.span
        className="absolute top-1 h-4 w-4 -translate-x-1/2 rotate-45 rounded-sm bg-leaf-soft"
        initial={false}
        animate={{ left: `${((column + 0.5) / COLS) * 100}%` }}
        transition={bouncy}
      />
      <div className="relative rounded-3xl bg-leaf-soft p-3">
        <div className="mb-2 flex items-center gap-2">
          <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ ...bouncy, delay: 0.05 }}>
            <Food id={group.image} size={28} />
          </motion.span>
          <span className="font-bold">{group.label}</span>
          {limits && <span className="text-[11px] text-muted">{limit.label}・{limit.hint}</span>}
          <motion.button whileTap={{ scale: 0.85 }} onClick={onClose} aria-label="收起" className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-white/80">
            <Icon name="expand_more" size={20} className="rotate-180" />
          </motion.button>
        </div>

        <AnimatePresence>
          {warn && (
            <motion.div
              key={warn}
              role="alert"
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: [0, -8, 8, -5, 5, 0] }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20, x: { duration: 0.4 } }}
              className="mb-2 flex items-center gap-1.5 rounded-2xl bg-tomato px-3 py-2 text-xs font-medium text-white shadow"
            >
              <Icon name="warning" size={16} fill />
              {warn}
            </motion.div>
          )}
        </AnimatePresence>

        {group.subs.length > 1 && (
          <div className="-mx-3 mb-2 flex gap-1.5 overflow-x-auto px-3">
            {group.subs.map((s, i) => {
              const n = s.items.filter((x) => items[x.id]).length
              return (
                <motion.button
                  key={s.label}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    haptic(6)
                    setSub(i)
                  }}
                  className={`relative shrink-0 rounded-full px-3 py-1 text-xs transition-colors ${i === sub ? 'text-white' : 'bg-white/80 text-ink'}`}
                >
                  {i === sub && <motion.span layoutId={`sub-pill-${group.id}`} transition={bouncy} className="absolute inset-0 rounded-full bg-leaf" />}
                  <span className="relative">
                    {s.label}
                    {n > 0 && <span className="ml-1 font-bold">{n}</span>}
                  </span>
                </motion.button>
              )
            })}
          </div>
        )}

        <motion.div key={sub} className="grid grid-cols-3 gap-2">
          {list.map((comp, i) => (
            <ItemButton
              key={comp.id}
              comp={comp}
              index={i}
              on={!!items[comp.id]}
              no={blocked(comp)}
              onTap={() => {
                const ok = onToggle(comp)
                if (!ok) fail()
                return ok
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

function ItemButton({ comp, index, on, no, onTap }: { comp: Comp; index: number; on: boolean; no: boolean; onTap: () => boolean }) {
  // 外層負責進場與按壓，內層負責成功彈跳／失敗搖晃，兩種動畫才不會互相蓋掉
  const controls = useAnimationControls()
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.6, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ ...bouncy, delay: index * 0.03 }}
      whileTap={{ scale: 0.88 }}
      onClick={() => {
        const ok = onTap()
        if (ok) {
          haptic(on ? 6 : [8, 24, 8])
          controls.start({ scale: [1, 1.18, 1], rotate: on ? [0, 0] : [0, -8, 6, 0], transition: { duration: 0.35 } })
        } else {
          controls.start({ x: [0, -10, 10, -7, 7, -3, 0], rotate: [0, -4, 4, -2, 0], transition: { duration: 0.45 } })
        }
      }}
      aria-pressed={on}
      className="relative"
    >
      <motion.span
        animate={controls}
        className={`flex flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[11px] leading-tight shadow-card transition-colors ${
          on ? 'bg-leaf text-white' : 'bg-white'
        } ${no && !on ? 'opacity-40' : ''}`}
      >
        <Food id={comp.image} size={30} />
        <span className="line-clamp-2 text-center">{comp.name}</span>
      </motion.span>
      <AnimatePresence>
        {on && (
          <motion.span
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={bouncy}
            className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-white text-leaf shadow"
          >
            <Icon name="check" size={14} weight={700} />
          </motion.span>
        )}
      </AnimatePresence>
      {no && <span className="absolute left-1 top-1 rounded-full bg-tomato px-1 text-[9px] text-white">不吃</span>}
    </motion.button>
  )
}
