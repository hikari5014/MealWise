import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { useEffect, useState } from 'react'
import { AVOID_GROUPS, type AvoidGroup, type AvoidItem } from '../data/avoid'
import { RECIPES } from '../data/recipes'
import { haptic } from '../lib/feedback'
import { fitsProfile } from '../lib/meal'
import type { Profile } from '../types'
import { Food } from './Food'
import { Icon } from './Icon'
import { CountUp } from './Ring'
import { Tap } from './ui'

const COLS = 3
const bouncy = { type: 'spring', stiffness: 520, damping: 14 } as const

/** 過敏／不想吃：先選大分類，再跳出細項 */
export function AvoidPicker({ profile, onChange }: { profile: Profile; onChange: (avoid: string[]) => void }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const selected = new Set(profile.avoid)
  const openIndex = AVOID_GROUPS.findIndex((g) => g.id === openId)
  const openGroup = AVOID_GROUPS[openIndex]
  const remaining = RECIPES.filter((r) => fitsProfile(r, profile)).length

  const toggleItem = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange([...next])
  }

  const setGroup = (group: AvoidGroup, on: boolean) => {
    const next = new Set(selected)
    group.items.forEach((i) => (on ? next.add(i.id) : next.delete(i.id)))
    onChange([...next])
  }

  // 面板要出現在被點那一列的下方
  const rows: AvoidGroup[][] = []
  for (let i = 0; i < AVOID_GROUPS.length; i += COLS) rows.push(AVOID_GROUPS.slice(i, i + COLS))
  const openRow = openIndex >= 0 ? Math.floor(openIndex / COLS) : -1

  return (
    <div>
      <div className="space-y-2">
        {rows.map((row, r) => (
          <div key={r}>
            <div className="grid grid-cols-3 gap-2">
              {row.map((g) => (
                <GroupTile
                  key={g.id}
                  group={g}
                  count={g.items.filter((i) => selected.has(i.id)).length}
                  open={g.id === openId}
                  onTap={() => {
                    if (g.items.length === 1) {
                      haptic([8, 30, 8])
                      toggleItem(g.items[0].id)
                      setOpenId(null)
                    } else {
                      haptic(10)
                      setOpenId(openId === g.id ? null : g.id)
                    }
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
                  <DetailPanel
                    key={openGroup.id}
                    group={openGroup}
                    column={openIndex % COLS}
                    selected={selected}
                    onToggle={toggleItem}
                    onAll={(on) => setGroup(openGroup, on)}
                    onClose={() => setOpenId(null)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <motion.p layout className="mt-3 px-1 text-xs text-muted">
        {selected.size > 0 ? (
          <>
            已避開 <b className="text-tomato">{selected.size}</b> 種食材，還有{' '}
            <b className="text-leaf-dark">
              <CountUp value={remaining} />
            </b>{' '}
            道食譜可以選
          </>
        ) : (
          '點分類可以再細選，例如海鮮只避開蝦子和螃蟹'
        )}
      </motion.p>
    </div>
  )
}

function GroupTile({ group, count, open, onTap }: { group: AvoidGroup; count: number; open: boolean; onTap: () => void }) {
  const controls = useAnimationControls()
  const all = count === group.items.length
  const some = count > 0 && !all

  // 數量改變時，圖片跳一下
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
      aria-expanded={group.items.length > 1 ? open : undefined}
      aria-pressed={group.items.length === 1 ? all : undefined}
      className={`relative flex flex-col items-center gap-1 rounded-3xl py-3 shadow-card transition-colors ${
        all ? 'bg-tomato text-white' : some ? 'bg-tomato-soft' : 'bg-white'
      } ${open ? 'ring-2 ring-tomato/60' : ''}`}
    >
      <motion.span animate={controls} className="grid place-items-center">
        <Food id={group.image} size={40} />
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
            className={`absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[11px] font-bold shadow ${
              all ? 'bg-white text-tomato' : 'bg-tomato text-white'
            }`}
          >
            {all ? group.items.length === 1 ? <Icon name="close" size={14} weight={700} /> : '全' : count}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

function DetailPanel({
  group,
  column,
  selected,
  onToggle,
  onAll,
  onClose,
}: {
  group: AvoidGroup
  column: number
  selected: Set<string>
  onToggle: (id: string) => void
  onAll: (on: boolean) => void
  onClose: () => void
}) {
  const allOn = group.items.every((i) => selected.has(i.id))
  return (
    <div className="relative pb-1 pt-3">
      {/* 指向被點的分類的小三角 */}
      <motion.span
        className="absolute top-1 h-4 w-4 -translate-x-1/2 rotate-45 rounded-sm bg-tomato-soft"
        initial={false}
        animate={{ left: `${((column + 0.5) / COLS) * 100}%` }}
        transition={bouncy}
      />
      <div className="relative rounded-3xl bg-tomato-soft p-3">
        <div className="mb-3 flex items-center gap-2">
          <motion.span
            className="grid place-items-center"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ ...bouncy, delay: 0.05 }}
          >
            <Food id={group.image} size={30} />
          </motion.span>
          <span className="font-bold">哪些{group.label}不吃？</span>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              haptic(allOn ? 8 : [10, 30, 10, 30, 10])
              onAll(!allOn)
            }}
            className={`ml-auto rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              allOn ? 'bg-tomato text-white' : 'bg-white text-tomato'
            }`}
          >
            {allOn ? '全部取消' : '全部都不吃'}
          </motion.button>
        </div>
        <motion.div
          className="flex flex-wrap gap-2"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: 0.06 } } }}
        >
          {group.items.map((item) => (
            <ItemChip key={item.id} item={item} on={selected.has(item.id)} onToggle={() => onToggle(item.id)} />
          ))}
        </motion.div>
        <Tap press={0.97} type="button" onClick={onClose} className="mt-3 w-full text-center text-xs text-muted">
          完成
        </Tap>
      </div>
    </div>
  )
}

function ItemChip({ item, on, onToggle }: { item: AvoidItem; on: boolean; onToggle: () => void }) {
  const controls = useAnimationControls()
  return (
    <motion.button
      type="button"
      variants={{
        hidden: { opacity: 0, scale: 0.3, y: 14, rotate: -10 },
        show: { opacity: 1, scale: 1, y: 0, rotate: 0, transition: bouncy },
      }}
      whileTap={{ scale: 0.88 }}
      aria-pressed={on}
      onClick={() => {
        haptic(on ? 6 : [8, 24, 8])
        controls.start({ scale: [1, 1.4, 0.9, 1.1, 1], rotate: on ? [0, 0] : [0, -15, 12, -6, 0], transition: { duration: 0.5 } })
        onToggle()
      }}
      className={`flex items-center gap-1.5 rounded-full py-2 pl-2 pr-3 text-sm shadow-sm transition-colors duration-200 ${
        on ? 'bg-tomato text-white' : 'bg-white'
      }`}
    >
      <motion.span animate={controls} className="grid place-items-center">
        <Food id={item.image} size={26} />
      </motion.span>
      <span>{item.label}</span>
      <AnimatePresence initial={false}>
        {on && (
          <motion.span
            key="x"
            initial={{ width: 0, opacity: 0, scale: 0 }}
            animate={{ width: 'auto', opacity: 1, scale: 1 }}
            exit={{ width: 0, opacity: 0, scale: 0 }}
            transition={bouncy}
            className="grid overflow-hidden"
          >
            <Icon name="close" size={16} weight={700} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
