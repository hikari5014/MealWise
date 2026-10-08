import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { CheckButton, Segmented } from '../components/ui'
import { Food } from '../components/Food'
import { Icon } from '../components/Icon'
import { todayKey, weekDays, weekStart } from '../lib/date'
import { spring } from '../lib/feedback'
import { actions, useChecks, usePlans } from '../lib/hooks'
import { buildShopping, formatQty } from '../lib/meal'
import { SECTION_IMAGE, SECTION_LABEL, SECTION_ORDER, type PlanEntry, type Profile } from '../types'
import { WeekSwitcher } from './Plan'
import { WeekPrepView } from '../components/WeekPrep'

export default function Lists({ profile }: { profile: Profile }) {
  const [view, setView] = useState<'shop' | 'prep'>('shop')
  const [start, setStart] = useState(weekStart(todayKey()))
  const days = useMemo(() => weekDays(start), [start])
  const plans = usePlans(days)

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <h1 className="text-2xl font-bold">清單</h1>
        <p className="text-xs text-muted">依照菜單自動產生・{profile.servings} 人份</p>
      </header>
      <Segmented
        id="lists"
        value={view}
        onChange={setView}
        options={[
          { value: 'shop', label: '採購清單', icon: 'shopping_cart' },
          { value: 'prep', label: '一週備餐', icon: 'skillet' },
        ]}
      />
      <WeekSwitcher start={start} onChange={setStart} />
      {plans.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted">
          <div className="mb-2 flex justify-center">
            <Food id="basket" size={80} float />
          </div>
          這週還沒有菜單，排好菜單後清單會自動出現
        </div>
      ) : (
        <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {view === 'shop' ? (
            <Shopping weekKey={start} plans={plans} servings={profile.servings} />
          ) : (
            <WeekPrepView weekKey={start} plans={plans} servings={profile.servings} />
          )}
        </motion.div>
      )}
    </div>
  )
}

function Progress({ done, total, doneText }: { done: number; total: number; doneText: string }) {
  const all = total > 0 && done === total
  return (
    <div className="rounded-3xl bg-white p-4 shadow-card">
      <div className="mb-2 flex justify-between text-sm">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={all ? 'done' : 'todo'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="font-medium"
          >
            {all ? (
              <span className="flex items-center gap-1.5 text-leaf-dark">
                <Icon name="celebration" size={20} fill motion="wiggle" />
                {doneText}
              </span>
            ) : (
              '進度'
            )}
          </motion.span>
        </AnimatePresence>
        <span className="tabular-nums text-muted">
          {done} / {total}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-ink/5">
        <motion.div
          className="h-full rounded-full bg-leaf"
          animate={{ width: `${total ? (done / total) * 100 : 0}%` }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        />
      </div>
    </div>
  )
}

function Shopping({ weekKey, plans, servings }: { weekKey: string; plans: PlanEntry[]; servings: number }) {
  const prefix = `shop|${weekKey}|`
  const checks = useChecks(prefix)
  const items = buildShopping(plans, servings)
  const done = items.filter((i) => checks.has(prefix + i.key)).length

  return (
    <div className="space-y-4">
      <Progress done={done} total={items.length} doneText="全部買齊了！" />
      {SECTION_ORDER.map((section) => {
        const group = items
          .filter((i) => i.section === section)
          .sort((a, b) => Number(checks.has(prefix + a.key)) - Number(checks.has(prefix + b.key)))
        if (!group.length) return null
        return (
          <section key={section}>
            <h2 className="mb-2 flex items-center gap-1.5 px-1 text-sm font-bold">
              <Food id={SECTION_IMAGE[section]} size={22} />
              {SECTION_LABEL[section]}
            </h2>
            <ul className="space-y-2">
              {group.map((item) => {
                const key = prefix + item.key
                const checked = checks.has(key)
                return (
                  <motion.li
                    key={item.key}
                    layout
                    transition={spring}
                    onClick={() => actions.toggleCheck(key, !checked)}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl p-3 shadow-card transition-colors ${
                      checked ? 'bg-white/50' : 'bg-white'
                    }`}
                  >
                    <CheckButton checked={checked} onToggle={() => actions.toggleCheck(key, !checked)} size={26} />
                    <div className="min-w-0 flex-1">
                      <div className="relative inline-block font-medium">
                        <span className={checked ? 'text-muted' : ''}>{item.name}</span>
                        <motion.span
                          className="absolute left-0 top-1/2 h-[2px] w-full origin-left bg-muted"
                          initial={false}
                          animate={{ scaleX: checked ? 1 : 0 }}
                          transition={{ duration: 0.22 }}
                        />
                      </div>
                      <div className="truncate text-xs text-muted">{item.from.join('、')}</div>
                    </div>
                    <span className={`text-sm tabular-nums ${checked ? 'text-muted' : 'font-medium'}`}>
                      {formatQty(item.qty, item.unit)}
                    </span>
                  </motion.li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
