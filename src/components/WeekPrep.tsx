import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState, type ReactNode } from 'react'
import { addDays, monthDay, todayKey, weekdayLabel } from '../lib/date'
import { buildWeekPrep, proteinTip, STORAGE_LABEL, vegTip, weekPrepText, type PrepItem } from '../lib/batch'
import { haptic, spring } from '../lib/feedback'
import { actions, useChecks } from '../lib/hooks'
import { formatQty } from '../lib/meal'
import { MEAL_LABEL, type PlanEntry } from '../types'
import { Food } from './Food'
import { Icon } from './Icon'
import { useRecipeDetail } from './RecipeDetail'
import { RecipePhoto } from './RecipePhoto'
import { CheckButton, Segmented, Tap, useToast } from './ui'

const dayLabel = (d: string) => `${monthDay(d)}（${weekdayLabel(d)}）`

const STORAGE_STYLE = {
  fridge: 'bg-sky-soft text-sky',
  freezer: 'bg-frost-soft text-frost',
  fresh: 'bg-honey-soft text-honey-ink',
} as const

/** 「清單」頁：把這週菜單轉成一次備餐的流程 */
export function WeekPrepView({ weekKey, plans, servings }: { weekKey: string; plans: PlanEntry[]; servings: number }) {
  const today = todayKey()
  const weekEnd = addDays(weekKey, 6)
  // 這週已經開始就從今天備；還沒開始就前一天（週日）備
  const defaultDay = today >= weekKey && today <= weekEnd ? today : addDays(weekKey, -1)
  const [prepDay, setPrepDay] = useState(defaultDay)
  const [tab, setTab] = useState<'steps' | 'boxes'>('steps')
  const prefix = `batch|${weekKey}|`
  const checks = useChecks(prefix)
  const toast = useToast()
  const openDetail = useRecipeDetail()
  const w = useMemo(() => buildWeekPrep(plans, prepDay, servings), [plans, prepDay, servings])

  const allKeys = [
    ...w.grains.map((g) => `g:${g.key}`),
    ...w.longCook.map((x) => `l:${x.recipe.id}`),
    ...w.veggies.map((v) => `v:${v.key}`),
    ...w.proteins.map((p) => `p:${p.key}`),
    ...w.ahead.map((a) => `a:${a.recipe.id}:${a.task}`),
    ...w.containers.map((c) => `c:${c.date}:${c.meal}:${c.recipe.id}`),
  ]
  const done = allKeys.filter((k) => checks.has(prefix + k)).length

  if (!w.recipes.length) {
    return <div className="py-12 text-center text-sm text-muted">這段時間沒有要準備的菜色</div>
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(weekPrepText(w, MEAL_LABEL, dayLabel))
      haptic([8, 20, 8])
      toast('已複製備餐清單，可以貼給家人或備忘錄')
    } catch {
      toast('沒辦法複製')
    }
  }

  const step = (k: string) => ({
    checked: checks.has(prefix + k),
    toggle: () => actions.toggleCheck(prefix + k, !checks.has(prefix + k)),
  })

  const options = [addDays(weekKey, -1), ...Array.from({ length: 7 }, (_, i) => addDays(weekKey, i))].filter((d) => d >= today || d === defaultDay)

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-gradient-to-br from-leaf-soft to-honey-soft p-4">
        <div className="flex items-center gap-3">
          <Food id="cooking" size={52} float />
          <div className="flex-1">
            <div className="font-bold">一次備好 {w.containers.length} 盒</div>
            <div className="text-xs text-ink/70">
              {w.recipes.length} 道菜・預估 {Math.round(w.minutes / 10) * 10} 分鐘
              {w.fresh.length ? `・${w.fresh.length} 餐建議當天現做` : ''}
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.88 }} onClick={copy} aria-label="複製備餐清單" className="grid h-10 w-10 place-items-center rounded-full bg-card/80">
            <Icon name="content_copy" size={20} />
          </motion.button>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="text-ink/70">備餐日</span>
          <div className="-mr-4 flex gap-1.5 overflow-x-auto pr-4">
            {options.map((d) => (
              <Tap
                key={d}
                onClick={() => {
                  haptic(6)
                  setPrepDay(d)
                }}
                className={`shrink-0 rounded-full px-2.5 py-1 transition-colors ${d === prepDay ? 'bg-leaf text-on-leaf' : 'bg-card/70'}`}
              >
                {monthDay(d)}（{weekdayLabel(d)}）
              </Tap>
            ))}
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-card/60">
          <motion.div
            className="h-full rounded-full bg-leaf"
            animate={{ width: `${allKeys.length ? (done / allKeys.length) * 100 : 0}%` }}
            transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          />
        </div>
      </div>

      <Segmented
        id="prep-tab"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'steps', label: '備餐步驟', icon: 'skillet' },
          { value: 'boxes', label: '分裝與保存', icon: 'kitchen' },
        ]}
      />

      {tab === 'steps' ? (
        <motion.div key="steps" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {w.grains.length > 0 && (
            <Step n={1} title="先把主食下鍋" sub="電鍋煮飯的時間，正好做其他準備">
              {w.grains.map((g) => (
                <Row key={g.key} {...step(`g:${g.key}`)} title={`${g.name} 共 ${formatQty(g.qty, g.unit)}`} sub={`給 ${g.from.join('、')}`} />
              ))}
            </Step>
          )}
          {w.longCook.length > 0 && (
            <Step n={2} title="燉煮、烤箱同時開工" sub="這些最花時間，先開始">
              {w.longCook.map(({ recipe, count }) => (
                <Row
                  key={recipe.id}
                  {...step(`l:${recipe.id}`)}
                  title={`${recipe.name} ×${count * servings} 份`}
                  sub={`約 ${recipe.minutes} 分鐘・點右邊看一次做多份的做法`}
                  onInfo={() => openDetail(recipe.id, `prep-${recipe.id}`)}
                />
              ))}
            </Step>
          )}
          {w.veggies.length > 0 && (
            <Step n={3} title="一次洗切蔬菜" sub="同一種菜一起處理，省下重複洗砧板的時間">
              {w.veggies.map((v) => (
                <Row key={v.key} {...step(`v:${v.key}`)} title={`${v.name} 共 ${formatQty(v.qty, v.unit)}`} sub={vegTip(v.name)} from={v} />
              ))}
            </Step>
          )}
          {w.proteins.length > 0 && (
            <Step n={4} title="處理肉類海鮮" sub="生熟食分開砧板，處理完立刻冷藏">
              {w.proteins.map((p) => (
                <Row
                  key={p.key}
                  {...step(`p:${p.key}`)}
                  title={`${p.name} 共 ${formatQty(p.qty, p.unit)}`}
                  sub={proteinTip(p.name, p.qty, p.unit, p.from.length)}
                  from={p}
                />
              ))}
            </Step>
          )}
          {w.ahead.length > 0 && (
            <Step n={5} title="其他可以先做的" sub="食譜裡建議提前準備的事">
              {w.ahead.map((a) => (
                <Row key={a.recipe.id + a.task} {...step(`a:${a.recipe.id}:${a.task}`)} title={a.task} sub={`${a.recipe.name}・保存 ${a.keep}`} />
              ))}
            </Step>
          )}
          <p className="px-1 text-xs text-muted">做完後到「分裝與保存」照盒子清單裝盒，冷凍的記得前一晚移到冷藏退冰。</p>
        </motion.div>
      ) : (
        <motion.div key="boxes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex flex-wrap gap-2 text-[11px]">
            {(['fridge', 'freezer', 'fresh'] as const).map((s) => (
              <span key={s} className={`rounded-full px-2 py-0.5 ${STORAGE_STYLE[s]}`}>
                {STORAGE_LABEL[s]}
              </span>
            ))}
            <span className="text-muted">依每道菜可冷藏的天數自動判斷</span>
          </div>
          {[...new Set([...w.containers, ...w.fresh].map((c) => c.date))].sort().map((date) => (
            <section key={date}>
              <h3 className="mb-2 px-1 text-sm font-bold">{dayLabel(date)}</h3>
              <ul className="space-y-2">
                {[...w.containers, ...w.fresh]
                  .filter((c) => c.date === date)
                  .map((c) => {
                    const k = `c:${c.date}:${c.meal}:${c.recipe.id}`
                    const s = step(k)
                    return (
                      <motion.li key={k} layout transition={spring} className="flex items-center gap-3 rounded-2xl bg-card p-2 pr-3 shadow-card">
                        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                          <RecipePhoto recipe={c.recipe} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted">{MEAL_LABEL[c.meal]}</span>
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STORAGE_STYLE[c.storage]}`}>
                              {STORAGE_LABEL[c.storage]}
                            </span>
                          </div>
                          <div className={`truncate text-sm font-medium ${s.checked ? 'text-muted line-through' : ''}`}>{c.recipe.name}</div>
                          {c.thawOn && <div className="text-[11px] text-frost">{dayLabel(c.thawOn)}晚上移到冷藏退冰</div>}
                        </div>
                        {c.storage !== 'fresh' && <CheckButton checked={s.checked} onToggle={s.toggle} size={26} />}
                      </motion.li>
                    )
                  })}
              </ul>
            </section>
          ))}
          <StorageGuide w={w} />
        </motion.div>
      )}
    </div>
  )
}

function StorageGuide({ w }: { w: ReturnType<typeof buildWeekPrep> }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-3xl bg-card p-4 shadow-card">
      <Tap press={0.97} onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 text-left text-sm font-bold">
        <Icon name="lightbulb" size={20} fill className="text-honey" />
        每道菜的保存與加熱
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="ml-auto text-muted">
          <Icon name="expand_more" size={22} />
        </motion.span>
      </Tap>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-3 overflow-hidden pt-3"
          >
            {w.recipes.map(({ recipe, storage }) => (
              <li key={recipe.id} className="text-xs leading-relaxed">
                <div className="font-medium text-ink">{recipe.name}</div>
                <div className="text-muted">
                  {storage.makeFresh
                    ? '不建議預做'
                    : `冷藏 ${storage.fridgeDays} 天${storage.freezeWeeks ? `・冷凍 ${storage.freezeWeeks} 週` : '・不適合冷凍'}`}
                  ・{storage.tip}
                </div>
                <div className="text-muted">加熱：{storage.reheat}</div>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

function Step({ n, title, sub, children }: { n: number; title: string; sub: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <motion.span
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 14, delay: n * 0.05 }}
          className="grid h-7 w-7 place-items-center rounded-full bg-leaf text-sm font-bold text-on-leaf"
        >
          {n}
        </motion.span>
        <div>
          <div className="font-bold">{title}</div>
          <div className="text-[11px] text-muted">{sub}</div>
        </div>
      </div>
      <ul className="space-y-2.5">{children}</ul>
    </section>
  )
}

function Row({
  checked,
  toggle,
  title,
  sub,
  from,
  onInfo,
}: {
  checked: boolean
  toggle: () => void
  title: string
  sub: string
  from?: PrepItem
  onInfo?: () => void
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="pt-0.5">
        <CheckButton checked={checked} onToggle={toggle} size={24} />
      </div>
      <div className="min-w-0 flex-1" onClick={toggle}>
        <div className={`text-sm font-medium transition-colors ${checked ? 'text-muted line-through' : ''}`}>{title}</div>
        <div className="text-xs text-muted">{sub}</div>
        {from && from.from.length > 1 && <div className="truncate text-[11px] text-muted/80">用在：{from.from.join('、')}</div>}
      </div>
      {onInfo && (
        <Tap onClick={onInfo} aria-label="看食譜" className="text-leaf-dark">
          <Icon name="menu_book" size={20} />
        </Tap>
      )}
    </li>
  )
}
