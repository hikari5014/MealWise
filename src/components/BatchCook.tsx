import { AnimatePresence, motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { RECIPE_MAP } from '../data/recipes'
import { db } from '../db'
import { proteinTip, scale, STORAGE_LABEL, storageFor, storageOf, vegTip } from '../lib/batch'
import {
  assignPortions,
  batchFriendly,
  buildBatchFlow,
  EQUIPMENT,
  equipmentOf,
  fmtClock,
  type BatchFlow,
  type BatchSession,
} from '../lib/batchSession'
import { addDays, fromKey, monthDay, todayKey, weekdayLabel } from '../lib/date'
import { haptic, spring } from '../lib/feedback'
import { actions, useChecks, useProfile } from '../lib/hooks'
import { formatQty, recipesFor, tasteScore } from '../lib/meal'
import { useRecipesVersion } from '../lib/recipeStore'
import { MEAL_LABEL, SECTION_IMAGE, SECTION_LABEL, type MealSlot, type Profile, type Recipe } from '../types'
import { Food } from './Food'
import { Icon } from './Icon'
import { useRecipeDetail } from './RecipeDetail'
import { RecipePhoto } from './RecipePhoto'
import { Button, CheckButton, Segmented, Sheet, Tap, useToast } from './ui'
import { Art } from './Art'
import { usePantryPlan } from './PantryPlan'

const STORAGE_STYLE = {
  fridge: 'bg-sky-soft text-sky',
  freezer: 'bg-[#e4e8fb] text-[#5f6fd3]',
  fresh: 'bg-honey-soft text-[#a07a20]',
} as const

const dayLabel = (d: string) => `${monthDay(d)}（${weekdayLabel(d)}）`

interface Ctx {
  start: (recipeIds?: string[]) => void
  open: (id: string) => void
}
const BatchCookCtx = createContext<Ctx>({ start: () => {}, open: () => {} })
export const useBatchCook = () => useContext(BatchCookCtx)

/** 一次備餐：選好幾道菜 → 自動分配到各餐 → 從採買、備料、開火順序到分裝的完整流程 */
export function BatchCookProvider({ children }: { children: ReactNode }) {
  const profile = useProfile()
  const [wizard, setWizard] = useState<{ ids: string[] } | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const value = useMemo<Ctx>(() => ({ start: (ids = []) => setWizard({ ids }), open: setSessionId }), [])
  return (
    <BatchCookCtx.Provider value={value}>
      {children}
      {profile && (
        <BatchWizard
          open={!!wizard}
          initial={wizard?.ids ?? []}
          profile={profile}
          onClose={() => setWizard(null)}
          onCreated={(id) => {
            setWizard(null)
            window.setTimeout(() => setSessionId(id), 380)
          }}
        />
      )}
      <BatchFlowSheet id={sessionId} onClose={() => setSessionId(null)} />
    </BatchCookCtx.Provider>
  )
}

/* ───────── 第一步：選菜、第二步：分配 ───────── */

type Filter = 'good' | 'main' | 'soup' | 'side' | 'all'

function BatchWizard({
  open,
  initial,
  profile,
  onClose,
  onCreated,
}: {
  open: boolean
  initial: string[]
  profile: Profile
  onClose: () => void
  onCreated: (id: string) => void
}) {
  const toast = useToast()
  useRecipesVersion()
  const today = todayKey()
  const [step, setStep] = useState<'pick' | 'assign'>('pick')
  const [picks, setPicks] = useState<Record<string, number>>({})
  const [filter, setFilter] = useState<Filter>('good')
  const [query, setQuery] = useState('')
  const [prepDay, setPrepDay] = useState(today)
  const [startDate, setStartDate] = useState(addDays(today, 1))
  const [meals, setMeals] = useState<MealSlot[]>(['lunch', 'dinner'])
  const [replace, setReplace] = useState(false)

  useEffect(() => {
    if (!open) return
    setStep('pick')
    setPicks(Object.fromEntries(initial.map((id) => [id, 3])))
    setFilter('good')
    setQuery('')
    setPrepDay(today)
    setStartDate(addDays(today, 1))
    setMeals(['lunch', 'dinner'])
    setReplace(false)
  }, [open])

  const pool = useMemo(
    () =>
      recipesFor(null, profile)
        .filter((r) => !r.tags.includes('蛋白飲') && r.kind !== 'drink')
        .map((r) => ({
          r,
          ok: batchFriendly(r).ok,
          s: tasteScore(r, profile) + (r.meals.some((m) => m === 'lunch' || m === 'dinner') ? 3 : 0) + (r.nutrition.protein >= 20 ? 1 : 0),
        }))
        .sort((a, b) => Number(b.ok) - Number(a.ok) || b.s - a.s),
    [profile, open],
  )
  const q = query.trim()
  const list = pool.filter(({ r, ok }) => {
    if (q) return r.name.includes(q) || r.tags.some((t) => t.includes(q))
    if (filter === 'good') return ok
    if (filter === 'soup') return r.kind === 'soup'
    if (filter === 'side') return r.kind === 'salad' || r.tags.includes('配菜') || r.nutrition.kcal < 200
    if (filter === 'main') return ok && r.nutrition.protein >= 20
    return true
  })

  const chosen = Object.entries(picks).filter(([, n]) => n > 0)
  const totalPortions = chosen.reduce((s, [, n]) => s + n, 0)
  const set = (id: string, n: number) => {
    haptic(6)
    setPicks((p) => ({ ...p, [id]: Math.max(0, Math.min(14, n)) }))
  }

  /** 幫我配一組：燉/蒸/烤/煎各挑一道，偏好的優先 */
  const suggest = () => {
    haptic([8, 30, 8])
    const good = pool.filter((x) => x.ok && x.r.meals.some((m) => m === 'lunch' || m === 'dinner'))
    const used = new Set<string>()
    const out: Record<string, number> = {}
    const want: [ReturnType<typeof equipmentOf>[], number][] = [
      [['pot'], 3],
      [['oven', 'cooker'], 3],
      [['pan'], 3],
      [['cold', 'pan', 'cooker'], 2],
    ]
    for (const [eqs, n] of want) {
      const cand = good.filter((x) => !used.has(x.r.id) && eqs.includes(equipmentOf(x.r))).slice(0, 8)
      if (!cand.length) continue
      const pick = cand[Math.floor(Math.random() * cand.length)].r
      used.add(pick.id)
      out[pick.id] = n
    }
    setPicks(out)
  }

  // 第二步要知道哪些餐已經排了
  const range = useMemo(() => Array.from({ length: 24 }, (_, i) => addDays(prepDay, i)), [prepDay])
  const existing = useLiveQuery(() => db.plans.where('date').anyOf(range).toArray(), [range.join()]) ?? []
  const items = chosen.map(([recipeId, portions]) => ({ recipeId, portions }))
  const assignments = useMemo(
    () =>
      step === 'assign'
        ? assignPortions(items, startDate, meals, (d, m) => !replace && existing.some((p) => p.date === d && p.meal === m))
        : [],
    [step, JSON.stringify(items), startDate, meals.join(), existing.length, replace],
  )

  const create = async (addToPlan: boolean) => {
    const id = `bs-${Date.now().toString(36)}`
    let planIds: number[] = []
    let replaced: typeof existing = []
    if (addToPlan && replace) {
      replaced = existing.filter((p) => assignments.some((a) => a.date === p.date && a.meal === p.meal))
      await db.plans.bulkDelete(replaced.map((p) => p.id!))
    }
    if (addToPlan && assignments.length) {
      planIds = (await db.plans.bulkAdd(
        assignments.map((a) => ({ date: a.date, meal: a.meal, recipeId: a.recipeId })),
        { allKeys: true },
      )) as number[]
    }
    const session: BatchSession = {
      id,
      name: `${dayLabel(prepDay)}備餐`,
      createdAt: Date.now(),
      prepDay,
      items,
      assignments,
      planIds,
      servings: profile.servings,
    }
    await db.batches.put(session)
    haptic([10, 40, 10, 40, 20])
    if (planIds.length)
      toast(`排進菜單 ${planIds.length} 餐${replaced.length ? `（取代 ${replaced.length} 餐）` : ''}`, async () => {
        await db.plans.bulkDelete(planIds)
        await db.plans.bulkPut(replaced)
        await db.batches.update(id, { planIds: [] })
      })
    onCreated(id)
  }

  const filters: { id: Filter; label: string }[] = [
    { id: 'good', label: '適合備餐' },
    { id: 'main', label: '高蛋白主菜' },
    { id: 'soup', label: '湯' },
    { id: 'side', label: '配菜' },
    { id: 'all', label: '全部' },
  ]

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {step === 'assign' && (
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => setStep('pick')} aria-label="上一步" className="-ml-1 text-muted">
              <Icon name="arrow_back" size={22} />
            </motion.button>
          )}
          一次備餐
          <span className="ml-auto text-xs font-normal text-muted">{step === 'pick' ? '1／2 選菜' : '2／2 分配'}</span>
        </div>
      }
    >
      {step === 'pick' ? (
        <div className="space-y-3">
          <p className="text-xs text-muted">選幾道菜、決定各做幾餐，接下來會幫你排好採買、備料、開火順序和分裝。</p>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋菜名"
              className="min-w-0 flex-1 rounded-2xl bg-white px-4 py-2.5 text-sm shadow-card outline-none ring-leaf/40 focus:ring-2"
            />
            <Button variant="soft" className="flex items-center gap-1 px-3 text-sm" onClick={suggest}>
              <Icon name="auto_awesome" size={18} />
              幫我配
            </Button>
          </div>
          {!q && (
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5">
              {filters.map((f) => (
                <Tap
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs transition-colors ${
                    filter === f.id ? 'bg-leaf text-white' : 'bg-leaf-soft/60 text-leaf-dark'
                  }`}
                >
                  {f.label}
                </Tap>
              ))}
            </div>
          )}
          <ul className="space-y-2 pb-20">
            {list.slice(0, 60).map(({ r, ok }) => (
              <PickRow key={r.id} recipe={r} ok={ok} n={picks[r.id] ?? 0} onChange={(n) => set(r.id, n)} />
            ))}
            {!list.length && <li className="py-8 text-center text-sm text-muted">沒有符合的菜</li>}
          </ul>
          <div className="sticky bottom-0 -mx-5 bg-gradient-to-t from-cream via-cream to-transparent px-5 pb-1 pt-4">
            <Button className="w-full" disabled={!chosen.length} onClick={() => setStep('assign')}>
              {chosen.length ? `下一步：${chosen.length} 道、共 ${totalPortions} 餐` : '先選幾道菜'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Choice label="哪天煮">
            {Array.from({ length: 7 }, (_, i) => addDays(today, i)).map((d) => (
              <Chip
                key={d}
                active={d === prepDay}
                onClick={() => {
                  setPrepDay(d)
                  if (startDate < d) setStartDate(addDays(d, 1))
                }}
              >
                {i18nDay(d, today)}
              </Chip>
            ))}
          </Choice>
          <Choice label="從哪天開始吃">
            {[0, 1, 2].map((i) => addDays(prepDay, i)).map((d) => (
              <Chip key={d} active={d === startDate} onClick={() => setStartDate(d)}>
                {i18nDay(d, today)}
              </Chip>
            ))}
          </Choice>
          <Choice label="排在哪幾餐">
            {(['breakfast', 'lunch', 'dinner'] as MealSlot[]).map((m) => (
              <Chip
                key={m}
                active={meals.includes(m)}
                onClick={() => setMeals((cur) => (cur.includes(m) ? (cur.length > 1 ? cur.filter((x) => x !== m) : cur) : [...cur, m]))}
              >
                {MEAL_LABEL[m]}
              </Chip>
            ))}
          </Choice>
          <Choice label="已經排了菜的餐">
            <Chip active={!replace} onClick={() => setReplace(false)}>
              保留，往後排
            </Chip>
            <Chip active={replace} onClick={() => setReplace(true)}>
              換成備餐的菜
            </Chip>
          </Choice>
          <div className="rounded-3xl bg-white p-4 shadow-card">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-bold">分配結果</span>
              <span className="text-[11px] text-muted">放不久的排前面</span>
            </div>
            {assignments[0] && assignments[0].date > addDays(startDate, 1) && (
              <p className="mb-2 rounded-xl bg-honey-soft px-2.5 py-1.5 text-xs text-[#a07a20]">
                {dayLabel(startDate)}到{dayLabel(addDays(assignments[0].date, -1))}都已經排了菜，所以從 {dayLabel(assignments[0].date)} 開始。想取代就選上面的「換成備餐的菜」。
              </p>
            )}
            <ul className="space-y-1.5">
              {[...new Set(assignments.map((a) => a.date))].map((date) => (
                <li key={date} className="flex gap-2 text-sm">
                  <span className="w-[86px] shrink-0 text-xs leading-6 text-muted">{dayLabel(date)}</span>
                  <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                    {assignments
                      .filter((a) => a.date === date)
                      .map((a) => {
                        const r = RECIPE_MAP[a.recipeId]
                        const st = storageFor(storageOf(r), Math.round((fromKey(date).getTime() - fromKey(prepDay).getTime()) / 86400000))
                        return (
                          <motion.span
                            key={a.meal}
                            layout
                            transition={spring}
                            className={`max-w-full truncate rounded-full px-2 py-0.5 text-xs ${STORAGE_STYLE[st]}`}
                          >
                            {MEAL_LABEL[a.meal]}・{r.name}
                          </motion.span>
                        )
                      })}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              {(['fridge', 'freezer', 'fresh'] as const).map((s) => (
                <span key={s} className={`rounded-full px-2 py-0.5 ${STORAGE_STYLE[s]}`}>
                  {STORAGE_LABEL[s]}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Button className="w-full" onClick={() => create(true)}>
              排進菜單，看完整流程
            </Button>
            <Button variant="ghost" className="w-full text-sm" onClick={() => create(false)}>
              只看流程，先不排進菜單
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  )
}

const i18nDay = (d: string, today: string) =>
  d === today ? `今天 ${monthDay(d)}` : d === addDays(today, 1) ? `明天 ${monthDay(d)}` : `${weekdayLabel(d)} ${monthDay(d)}`

function Choice({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 px-1 text-sm font-medium">{label}</div>
      <div className="-mx-5 flex gap-1.5 overflow-x-auto px-5">{children}</div>
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={() => {
        haptic(6)
        onClick()
      }}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition-colors ${active ? 'bg-leaf text-white' : 'bg-white text-ink shadow-card'}`}
    >
      {children}
    </motion.button>
  )
}

function PickRow({ recipe, ok, n, onChange }: { recipe: Recipe; ok: boolean; n: number; onChange: (n: number) => void }) {
  const s = storageOf(recipe)
  const eq = EQUIPMENT[equipmentOf(recipe)]
  return (
    <motion.li
      layout
      transition={spring}
      className={`flex items-center gap-3 rounded-2xl p-2 pr-2.5 shadow-card transition-colors ${n ? 'bg-leaf-soft' : 'bg-white'}`}
    >
      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
        <RecipePhoto recipe={recipe} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{recipe.name}</div>
        <div className="flex flex-wrap items-center gap-x-1.5 text-[11px] text-muted">
          <span className="flex items-center gap-0.5">
            <Icon name={eq.icon} size={12} />
            {eq.label}
          </span>
          <span>·</span>
          {ok ? (
            <span>
              冷藏 {s.fridgeDays} 天{s.freezeWeeks ? '・可冷凍' : ''}
            </span>
          ) : (
            <span className="text-[#a07a20]">建議當天現做</span>
          )}
        </div>
        <div className="text-[11px] text-muted">
          {recipe.nutrition.kcal} kcal・蛋白質 {recipe.nutrition.protein}g
        </div>
      </div>
      {n === 0 ? (
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => onChange(3)}
          aria-label={`加入${recipe.name}`}
          className="grid h-9 w-9 place-items-center rounded-full bg-leaf text-white"
        >
          <Icon name="add" size={22} weight={600} />
        </motion.button>
      ) : (
        <div className="flex items-center gap-1">
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => onChange(n - 1)} aria-label="少一餐" className="grid h-8 w-8 place-items-center rounded-full bg-white">
            <Icon name="remove" size={18} />
          </motion.button>
          <motion.span key={n} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="w-9 text-center text-sm font-bold tabular-nums">
            {n}餐
          </motion.span>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => onChange(n + 1)} aria-label="多一餐" className="grid h-8 w-8 place-items-center rounded-full bg-white">
            <Icon name="add" size={18} />
          </motion.button>
        </div>
      )}
    </motion.li>
  )
}

/* ───────── 完整流程 ───────── */

type FlowTab = 'shop' | 'mise' | 'cook' | 'pack'

const flowKeys = (f: BatchFlow) => ({
  shop: f.shopping.flatMap((g) => g.items.map((i) => `shop:${i.key}`)),
  mise: [...f.mise.veg.map((v) => `v:${v.key}`), ...f.mise.protein.map((p) => `p:${p.key}`), ...f.mise.other.map((o) => `o:${o}`)],
  cook: f.steps.map((s) => `step:${s.key}`),
  pack: f.containers.map((c) => `box:${c.date}:${c.meal}:${c.recipe.id}`),
})

export function batchText(s: BatchSession, f: BatchFlow) {
  const lines = [`【${s.name}】${s.items.length} 道菜・約 ${Math.round(f.totalMinutes / 10) * 10} 分鐘`, '', '■ 採買']
  for (const g of f.shopping) lines.push(`${SECTION_LABEL[g.section]}：${g.items.map((i) => `${i.name} ${formatQty(i.qty, i.unit)}`).join('、')}`)
  lines.push('', '■ 開火順序')
  for (const st of f.steps) lines.push(`${fmtClock(st.at)} ${st.title}${st.parallel ? '（同時進行）' : ''}`)
  lines.push('', '■ 分裝')
  for (const c of f.containers) lines.push(`${dayLabel(c.date)} ${MEAL_LABEL[c.meal]}：${c.recipe.name}（${STORAGE_LABEL[c.storage]}）`)
  return lines.join('\n')
}

function BatchFlowSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const session = useLiveQuery(() => (id ? db.batches.get(id) : undefined), [id])
  const [tab, setTab] = useState<FlowTab>('shop')
  useEffect(() => {
    if (id) setTab('shop')
  }, [id])
  return (
    <Sheet open={!!id && !!session} onClose={onClose} title={session?.name ?? '一次備餐'}>
      {session && <FlowBody session={session} tab={tab} setTab={setTab} onClose={onClose} />}
    </Sheet>
  )
}

function FlowBody({ session, tab, setTab, onClose }: { session: BatchSession; tab: FlowTab; setTab: (t: FlowTab) => void; onClose: () => void }) {
  useRecipesVersion()
  const toast = useToast()
  const prefix = `bs|${session.id}|`
  const checks = useChecks(prefix)
  const flow = useMemo(() => buildBatchFlow(session), [session])
  const keys = flowKeys(flow)
  const all = [...keys.shop, ...keys.mise, ...keys.cook, ...keys.pack]
  const done = all.filter((k) => checks.has(prefix + k)).length
  const people = session.servings ?? 1
  const doneOf = (t: FlowTab) => keys[t].filter((k) => checks.has(prefix + k)).length

  const step = (k: string) => ({
    checked: checks.has(prefix + k),
    toggle: () => {
      haptic(8)
      actions.toggleCheck(prefix + k, !checks.has(prefix + k))
    },
  })

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(batchText(session, flow))
      haptic([8, 20, 8])
      toast('已複製，可以貼到備忘錄或傳給家人')
    } catch {
      toast('沒辦法複製')
    }
  }

  const remove = async () => {
    const plans = (await db.plans.bulkGet(session.planIds)).filter((p): p is NonNullable<typeof p> => !!p)
    await db.batches.delete(session.id)
    await db.plans.bulkDelete(session.planIds)
    onClose()
    toast(plans.length ? `已刪除，並移除菜單上的 ${plans.length} 餐` : '已刪除這次備餐', async () => {
      await db.batches.put(session)
      await db.plans.bulkPut(plans)
    })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-gradient-to-br from-leaf-soft to-honey-soft p-4">
        <div className="flex items-center gap-3">
          <Art name="banner-batch" width={84} className="!mx-0 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-bold">
              {session.items.length} 道菜・{flow.containers.length * people} 盒
            </div>
            <div className="text-xs text-ink/70">
              約 {Math.round(flow.totalMinutes / 10) * 10} 分鐘{people > 1 ? `・每餐 ${people} 人份` : ''}
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.88 }} onClick={copy} aria-label="複製流程" className="grid h-10 w-10 place-items-center rounded-full bg-white/80">
            <Icon name="content_copy" size={20} />
          </motion.button>
        </div>
        <div className="mt-3 flex -space-x-2">
          {session.items.map((it) => {
            const r = RECIPE_MAP[it.recipeId]
            if (!r) return null
            return (
              <span key={it.recipeId} className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white">
                <RecipePhoto recipe={r} />
              </span>
            )
          })}
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/60">
          <motion.div
            className="h-full rounded-full bg-leaf"
            animate={{ width: `${all.length ? (done / all.length) * 100 : 0}%` }}
            transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          />
        </div>
      </div>

      <Segmented
        id="flow-tab"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'shop', label: `採買 ${doneOf('shop')}/${keys.shop.length}` },
          { value: 'mise', label: '備料' },
          { value: 'cook', label: '開火' },
          { value: 'pack', label: '分裝' },
        ]}
      />

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
        {tab === 'shop' &&
          flow.shopping.map((g) => (
            <section key={g.section} className="rounded-3xl bg-white p-4 shadow-card">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold">
                <Food id={SECTION_IMAGE[g.section]} size={22} />
                {SECTION_LABEL[g.section]}
              </h3>
              <ul className="space-y-2.5">
                {g.items.map((i) => (
                  <CheckRow key={i.key} {...step(`shop:${i.key}`)} title={i.name} right={formatQty(i.qty, i.unit)} sub={i.from.join('、')} />
                ))}
              </ul>
            </section>
          ))}

        {tab === 'mise' && (
          <>
            <p className="px-1 text-xs text-muted">開火前一次處理完：同一種菜一起洗切、生熟砧板分開，處理好的分盤放，下鍋時順手拿。</p>
            {flow.mise.veg.length > 0 && (
              <Group title="蔬菜一次洗切" icon="eco">
                {flow.mise.veg.map((v) => (
                  <CheckRow
                    key={v.key}
                    {...step(`v:${v.key}`)}
                    title={`${v.name} ${formatQty(v.qty, v.unit)}`}
                    sub={`${vegTip(v.name)}${v.from.length > 1 ? `・用在 ${v.from.join('、')}` : ''}`}
                  />
                ))}
              </Group>
            )}
            {flow.mise.protein.length > 0 && (
              <Group title="肉類海鮮" icon="restaurant">
                {flow.mise.protein.map((p) => (
                  <CheckRow
                    key={p.key}
                    {...step(`p:${p.key}`)}
                    title={`${p.name} ${formatQty(p.qty, p.unit)}`}
                    sub={proteinTip(p.name, p.qty, p.unit, p.from.length)}
                  />
                ))}
              </Group>
            )}
            {flow.mise.other.length > 0 && (
              <Group title="各道菜的前置" icon="format_list_bulleted">
                {flow.mise.other.map((o) => (
                  <CheckRow key={o} {...step(`o:${o}`)} title={o} />
                ))}
              </Group>
            )}
          </>
        )}

        {tab === 'cook' && <Timeline flow={flow} session={session} step={step} />}

        {tab === 'pack' && (
          <>
            <p className="px-1 text-xs text-muted">盒子貼上「日期＋菜名」。冷凍的盒子吃前一晚移到冷藏退冰。</p>
            {[...new Set(flow.containers.map((c) => c.date))].map((date) => (
              <section key={date}>
                <h3 className="mb-2 px-1 text-sm font-bold">{dayLabel(date)}</h3>
                <ul className="space-y-2">
                  {flow.containers
                    .filter((c) => c.date === date)
                    .map((c) => {
                      const s = step(`box:${c.date}:${c.meal}:${c.recipe.id}`)
                      return (
                        <li key={c.meal + c.recipe.id} className="flex items-center gap-3 rounded-2xl bg-white p-2 pr-3 shadow-card">
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                            <RecipePhoto recipe={c.recipe} />
                          </span>
                          <div className="min-w-0 flex-1" onClick={s.toggle}>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted">{MEAL_LABEL[c.meal]}</span>
                              <span className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STORAGE_STYLE[c.storage]}`}>
                                {c.storage !== 'fresh' && <Food id={c.storage === 'freezer' ? 'store-freezer' : 'store-fridge'} size={14} />}
                                {STORAGE_LABEL[c.storage]}
                                {people > 1 ? ` ×${people}` : ''}
                              </span>
                            </div>
                            <div className={`truncate text-sm font-medium ${s.checked ? 'text-muted line-through' : ''}`}>{c.recipe.name}</div>
                            {c.thawOn && <div className="text-[11px] text-[#5f6fd3]">{dayLabel(c.thawOn)}晚上移到冷藏退冰</div>}
                            {c.storage === 'fresh' && <div className="text-[11px] text-[#a07a20]">這道放不久，食材先備好，當天再煮</div>}
                          </div>
                          <CheckButton checked={s.checked} onToggle={s.toggle} size={26} />
                        </li>
                      )
                    })}
                </ul>
              </section>
            ))}
            <ul className="space-y-2 rounded-3xl bg-white p-4 text-xs leading-relaxed shadow-card">
              {session.items.map((it) => {
                const r = RECIPE_MAP[it.recipeId]
                if (!r) return null
                const st = storageOf(r)
                return (
                  <li key={it.recipeId}>
                    <span className="font-medium text-ink">{r.name}</span>
                    <span className="text-muted">・加熱：{st.reheat}</span>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </motion.div>

      <Tap press={0.97} onClick={remove} className="flex w-full items-center justify-center gap-1 py-2 text-xs text-muted">
        <Icon name="delete" size={16} />
        刪除這次備餐{session.planIds.length ? '（連同排進菜單的餐）' : ''}
      </Tap>
    </div>
  )
}

function Timeline({ flow, session, step }: { flow: BatchFlow; session: BatchSession; step: (k: string) => { checked: boolean; toggle: () => void } }) {
  const openDetail = useRecipeDetail()
  const [openId, setOpenId] = useState<string | null>(null)
  const people = session.servings ?? 1
  return (
    <div>
      <p className="mb-3 px-1 text-xs text-muted">左邊是從開始算起的時間。標「同時」的交給電鍋、烤箱、燉鍋自己跑，你繼續做下一件事。</p>
      <ol className="relative space-y-3 before:absolute before:bottom-4 before:left-[57px] before:top-4 before:w-0.5 before:bg-ink/10">
        {flow.steps.map((st, i) => {
          const s = step(`step:${st.key}`)
          const recipe = st.recipeId ? RECIPE_MAP[st.recipeId] : undefined
          const portions = recipe ? (session.items.find((x) => x.recipeId === recipe.id)?.portions ?? 1) * people : 1
          const expanded = openId === st.key
          return (
            <motion.li
              key={st.key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: Math.min(i, 10) * 0.03 }}
              className="relative flex gap-2"
            >
              <span className="w-8 shrink-0 pt-2.5 text-right text-[11px] tabular-nums text-muted">{fmtClock(st.at)}</span>
              <span
                className={`relative z-10 mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                  s.checked ? 'bg-leaf text-white' : st.parallel ? 'bg-honey-soft text-[#a07a20]' : 'bg-white text-leaf-dark shadow-card'
                }`}
              >
                {s.checked || !st.image ? <Icon name={s.checked ? 'check' : st.icon} size={18} weight={600} /> : <Food id={st.image} size={28} />}
              </span>
              <div className={`min-w-0 flex-1 rounded-2xl p-3 shadow-card transition-colors ${s.checked ? 'bg-white/50' : 'bg-white'}`}>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1" onClick={s.toggle}>
                    <div className={`text-sm font-medium ${s.checked ? 'text-muted line-through' : ''}`}>{st.title}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-muted">
                      <Icon name="timer" size={12} />約 {st.minutes} 分
                      {st.parallel && <span className="rounded-full bg-honey-soft px-1.5 text-[#a07a20]">同時</span>}
                    </div>
                    {st.detail && <div className="mt-1 text-xs text-muted">{st.detail}</div>}
                  </div>
                  <CheckButton checked={s.checked} onToggle={s.toggle} size={24} />
                </div>
                {recipe && (
                  <>
                    <div className="mt-2 flex gap-3 text-xs text-leaf-dark">
                      <Tap onClick={() => setOpenId(expanded ? null : st.key)} className="flex items-center gap-0.5">
                        <motion.span animate={{ rotate: expanded ? 180 : 0 }}>
                          <Icon name="expand_more" size={16} />
                        </motion.span>
                        {expanded ? '收起做法' : `${portions} 份的材料與做法`}
                      </Tap>
                      <Tap onClick={() => openDetail(recipe.id, `flow-${recipe.id}`)} className="flex items-center gap-0.5">
                        <Icon name="menu_book" size={14} />
                        食譜
                      </Tap>
                    </div>
                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 rounded-xl bg-cream p-2.5 text-xs leading-relaxed">
                            <div className="mb-1 text-muted">
                              {scale(recipe.ingredients, portions)
                                .map((g) => `${g.name} ${formatQty(g.qty, g.unit)}`)
                                .join('、')}
                            </div>
                            <ol className="list-decimal space-y-0.5 pl-4">
                              {recipe.steps.map((t) => (
                                <li key={t}>{t}</li>
                              ))}
                            </ol>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}

function Group({ title, icon, children }: { title: string; icon: Parameters<typeof Icon>[0]['name']; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-card">
      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold">
        <Icon name={icon} size={18} className="text-leaf-dark" />
        {title}
      </h3>
      <ul className="space-y-2.5">{children}</ul>
    </section>
  )
}

function CheckRow({ checked, toggle, title, sub, right }: { checked: boolean; toggle: () => void; title: string; sub?: string; right?: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="pt-0.5">
        <CheckButton checked={checked} onToggle={toggle} size={24} />
      </div>
      <div className="min-w-0 flex-1" onClick={toggle}>
        <div className={`text-sm font-medium transition-colors ${checked ? 'text-muted line-through' : ''}`}>{title}</div>
        {sub && <div className="text-xs text-muted">{sub}</div>}
      </div>
      {right && <span className={`shrink-0 text-sm tabular-nums ${checked ? 'text-muted' : 'font-medium'}`}>{right}</span>}
    </li>
  )
}

/** 清單頁：一次備餐的入口與紀錄 */
export function BatchSessions() {
  const { start, open } = useBatchCook()
  const openPantry = usePantryPlan()
  useRecipesVersion()
  const sessions = useLiveQuery(() => db.batches.orderBy('createdAt').reverse().limit(6).toArray()) ?? []
  return (
    <section className="space-y-2">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => start()}
        className="block w-full overflow-hidden rounded-3xl bg-gradient-to-br from-leaf-soft to-honey-soft p-4 text-left shadow-card"
      >
        <Art name="banner-batch" width={280} />
        <span className="mt-3 flex items-center gap-3">
          <span className="flex-1">
            <span className="block font-bold">開始一次備餐</span>
            <span className="block text-xs text-ink/70">選幾道菜 → 自動排好採買、備料、開火順序、分裝</span>
          </span>
          <span className="flex items-center gap-0.5 rounded-full bg-leaf px-3 py-1.5 text-sm font-medium text-white">
            開始
            <Icon name="chevron_right" size={18} />
          </span>
        </span>
      </motion.button>
      <Tap press={0.98} onClick={openPantry} className="flex w-full items-center gap-3 rounded-3xl bg-white p-3 text-left shadow-card">
        <Art name="empty-shopping" width={56} className="!mx-0 shrink-0" float={false} />
        <span className="flex-1">
          <span className="block font-bold">用冰箱食材排一週</span>
          <span className="block text-xs text-muted">輸入家裡有的 → 推薦菜色、哪些一次備好、哪些天天換、還缺什麼</span>
        </span>
        <Icon name="chevron_right" size={20} className="text-muted" />
      </Tap>
      {sessions.map((s) => (
        <motion.button
          key={s.id}
          layout
          whileTap={{ scale: 0.98 }}
          onClick={() => open(s.id)}
          className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-card"
        >
          <span className="flex -space-x-3">
            {s.items.slice(0, 3).map((it) => {
              const r = RECIPE_MAP[it.recipeId]
              return r ? (
                <span key={it.recipeId} className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white">
                  <RecipePhoto recipe={r} />
                </span>
              ) : null
            })}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{s.name}</span>
            <span className="block truncate text-xs text-muted">
              {s.items
                .map((it) => RECIPE_MAP[it.recipeId]?.name)
                .filter(Boolean)
                .join('、')}
            </span>
          </span>
          <Icon name="chevron_right" size={20} className="text-muted" />
        </motion.button>
      ))}
    </section>
  )
}
