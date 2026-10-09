import { AnimatePresence, motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ALL_COMP_MAP, PANTRY_GROUPS, type Comp } from '../data/composer'
import { db } from '../db'
import { STORAGE_LABEL, storageOf } from '../lib/batch'
import type { BatchSession } from '../lib/batchSession'
import { addDays, monthDay, todayKey, weekdayLabel } from '../lib/date'
import { haptic, spring } from '../lib/feedback'
import { usePref, useProfile } from '../lib/hooks'
import { formatQty } from '../lib/meal'
import { AMOUNTS, HAVE, planFromPantry, type Pantry } from '../lib/pantry'
import { useRecipesVersion } from '../lib/recipeStore'
import { MEAL_LABEL, SECTION_LABEL, type MealSlot, type Profile } from '../types'
import { Art } from './Art'
import { useBatchCook } from './BatchCook'
import { Food } from './Food'
import { Icon } from './Icon'
import { IngredientPicker } from './IngredientPicker'
import { useRecipeDetail } from './RecipeDetail'
import { RecipePhoto } from './RecipePhoto'
import { Button, Segmented, Sheet, Tap, useToast } from './ui'

const Ctx = createContext<() => void>(() => {})
export const usePantryPlan = () => useContext(Ctx)

/** 冰箱排餐：輸入家裡有的食材 → 推一週怎麼吃、哪些一次備好、哪些每天換、還要買什麼 */
export function PantryPlanProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const profile = useProfile()
  return (
    <Ctx.Provider value={() => setOpen(true)}>
      {children}
      {profile && <PantrySheet open={open} onClose={() => setOpen(false)} profile={profile} />}
    </Ctx.Provider>
  )
}

/** 調味料、油、乾貨只記「有沒有」 */
const isHaveOnly = (c: Comp) => c.part === 'flavor' || /oil/.test(c.id) || (c.group === 'other' && c.section === 'pantry')

type Mode = 'off' | 'batch' | 'fresh'
const MODE_LABEL: Record<Mode, string> = { off: '不排', batch: '一次備好', fresh: '每天現做' }
const dayLabel = (d: string) => `${monthDay(d)}（${weekdayLabel(d)}）`

function PantrySheet({ open, onClose, profile }: { open: boolean; onClose: () => void; profile: Profile }) {
  useRecipesVersion()
  const toast = useToast()
  const batchCook = useBatchCook()
  const openDetail = useRecipeDetail()
  const [pantry, setPantry] = usePref<Pantry>('pantry', {})
  const [step, setStep] = useState<'fridge' | 'how' | 'result'>('fridge')
  const today = todayKey()
  const [start, setStart] = useState(addDays(today, 1))
  const [days, setDays] = useState(7)
  const [modes, setModes] = useState<Record<MealSlot, Mode>>({ breakfast: 'off', lunch: 'batch', dinner: 'fresh', snack: 'off' })
  const [seed, setSeed] = useState(1)
  const [tab, setTab] = useState<'menu' | 'shop'>('menu')

  useEffect(() => {
    if (open) {
      setStep(Object.keys(pantry).length ? 'how' : 'fridge')
      setTab('menu')
    }
  }, [open])

  const range = useMemo(() => Array.from({ length: days }, (_, i) => addDays(start, i)), [start, days])
  const occupied = useLiveQuery(() => db.plans.where('date').anyOf(range).toArray(), [range.join()]) ?? []
  const meals = (m: Mode) => (['breakfast', 'lunch', 'dinner'] as MealSlot[]).filter((x) => modes[x] === m)
  const result = useMemo(
    () =>
      step === 'result'
        ? planFromPantry(pantry, profile, { start, days, batchMeals: meals('batch'), freshMeals: meals('fresh'), servings: profile.servings, seed, occupied })
        : null,
    [step, pantry, profile, start, days, modes, seed, occupied.length],
  )

  const owned = Object.keys(pantry).filter((k) => pantry[k] > 0 && ALL_COMP_MAP[k])
  const toggle = (c: Comp) => {
    const next = { ...pantry }
    if (next[c.id]) delete next[c.id]
    else next[c.id] = isHaveOnly(c) ? HAVE : 4
    setPantry(next)
    return true
  }

  const apply = async () => {
    if (!result) return
    const ids = (await db.plans.bulkAdd(
      result.plans.map((p) => ({ date: p.date, meal: p.meal, recipeId: p.recipeId })),
      { allKeys: true },
    )) as number[]
    haptic([10, 40, 10, 40, 20])
    let sessionId: string | null = null
    if (result.batch.length) {
      sessionId = `bs-${Date.now().toString(36)}`
      const batchPlans = result.plans.map((p, i) => ({ ...p, id: ids[i] })).filter((p) => p.kind === 'batch')
      const session: BatchSession = {
        id: sessionId,
        name: `${dayLabel(start > today ? addDays(start, -1) : today)}備餐（冰箱食材）`,
        createdAt: Date.now(),
        prepDay: start > today ? addDays(start, -1) : today,
        items: result.batch.map((b) => ({ recipeId: b.recipe.id, portions: b.portions })),
        assignments: batchPlans.map((p) => ({ date: p.date, meal: p.meal, recipeId: p.recipeId })),
        planIds: batchPlans.map((p) => p.id),
        servings: profile.servings,
      }
      await db.batches.put(session)
    }
    onClose()
    toast(`排進菜單 ${ids.length} 餐`, async () => {
      await db.plans.bulkDelete(ids)
      if (sessionId) await db.batches.delete(sessionId)
    })
    if (sessionId) window.setTimeout(() => batchCook.open(sessionId!), 420)
  }

  const copyShopping = async () => {
    if (!result) return
    const text = ['【要補買】', ...result.shopping.map((s) => `${s.name} ${formatQty(s.qty, s.unit)}${s.reason === 'more' ? '（家裡可能不夠）' : ''}`)].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      toast('已複製補買清單')
    } catch {
      toast('沒辦法複製')
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {step !== 'fridge' && (
            <Tap onClick={() => setStep(step === 'result' ? 'how' : 'fridge')} aria-label="上一步" className="-ml-1 text-muted">
              <Icon name="arrow_back" size={22} />
            </Tap>
          )}
          用冰箱食材排一週
          <span className="ml-auto text-xs font-normal text-muted">
            {step === 'fridge' ? '1／3 家裡有什麼' : step === 'how' ? '2／3 怎麼吃' : '3／3 結果'}
          </span>
        </div>
      }
    >
      {step === 'fridge' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-3xl bg-gradient-to-br from-leaf-soft to-honey-soft p-3">
            <Art name="empty-shopping" width={64} className="!mx-0 shrink-0" float={false} />
            <p className="text-xs leading-relaxed text-ink/80">點分類勾選家裡現有的食材，再選大約有多少。會記住，下次只要改有變動的就好。</p>
          </div>
          <IngredientPicker groups={PANTRY_GROUPS} limits={false} items={pantry} blocked={() => false} onToggle={toggle} />
          <AnimatePresence initial={false}>
            {owned.length > 0 && (
              <motion.section key="list" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mb-1.5 flex items-center px-1">
                  <span className="text-sm font-bold">家裡有 {owned.length} 樣</span>
                  <Tap onClick={() => setPantry({})} className="ml-auto text-xs text-muted">
                    全部清空
                  </Tap>
                </div>
                <ul className="space-y-1.5 pb-20">
                  <AnimatePresence initial={false}>
                    {owned.map((id) => {
                      const c = ALL_COMP_MAP[id]
                      return (
                        <motion.li
                          key={id}
                          layout
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 24, transition: { duration: 0.15 } }}
                          transition={spring}
                          className="flex items-center gap-2 rounded-2xl bg-white px-2.5 py-1.5 shadow-card"
                        >
                          <Food id={c.image} size={26} />
                          <span className="min-w-0 flex-1 truncate text-sm">{c.name}</span>
                          {pantry[id] >= HAVE ? (
                            <span className="rounded-full bg-leaf-soft px-2 py-0.5 text-[11px] text-leaf-dark">有</span>
                          ) : (
                            <span className="flex gap-1">
                              {AMOUNTS.map((a) => (
                                <Tap
                                  key={a.value}
                                  onClick={() => setPantry({ ...pantry, [id]: a.value })}
                                  className={`rounded-full px-2 py-0.5 text-[11px] transition-colors ${pantry[id] === a.value ? 'bg-leaf text-white' : 'bg-cream text-muted'}`}
                                >
                                  {a.label}
                                </Tap>
                              ))}
                            </span>
                          )}
                          <Tap onClick={() => toggle(c)} aria-label={`移除${c.name}`} className="grid h-7 w-7 place-items-center text-muted">
                            <Icon name="close" size={16} />
                          </Tap>
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>
              </motion.section>
            )}
          </AnimatePresence>
          <div className="sticky bottom-0 -mx-5 bg-gradient-to-t from-cream via-cream to-transparent px-5 pb-1 pt-4">
            <Button className="w-full" disabled={!owned.length} onClick={() => setStep('how')}>
              {owned.length ? `下一步：用這 ${owned.length} 樣來排` : '先選家裡有的食材'}
            </Button>
          </div>
        </div>
      )}

      {step === 'how' && (
        <div className="space-y-4">
          <Tap press={0.98} onClick={() => setStep('fridge')} className="flex w-full items-center gap-2 rounded-2xl bg-white p-3 text-left shadow-card">
            <span className="flex -space-x-2">
              {owned.slice(0, 6).map((id) => (
                <span key={id} className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-cream">
                  <Food id={ALL_COMP_MAP[id].image} size={22} />
                </span>
              ))}
            </span>
            <span className="flex-1 text-sm">家裡有 {owned.length} 樣</span>
            <span className="text-xs text-leaf-dark">修改</span>
          </Tap>
          <Row label="從哪天開始">
            {[0, 1, 2].map((i) => addDays(today, i)).map((d, i) => (
              <Chip key={d} on={d === start} onClick={() => setStart(d)}>
                {['今天', '明天', '後天'][i]} {monthDay(d)}
              </Chip>
            ))}
          </Row>
          <Row label="排幾天">
            {[3, 5, 7].map((n) => (
              <Chip key={n} on={n === days} onClick={() => setDays(n)}>
                {n} 天
              </Chip>
            ))}
          </Row>
          <div>
            <div className="mb-1.5 px-1 text-sm font-medium">每一餐怎麼吃</div>
            <div className="space-y-2">
              {(['breakfast', 'lunch', 'dinner'] as MealSlot[]).map((m) => (
                <div key={m} className="flex items-center gap-2 rounded-2xl bg-white p-2 pl-3 shadow-card">
                  <span className="w-10 text-sm">{MEAL_LABEL[m]}</span>
                  <div className="flex flex-1 gap-1">
                    {(['off', 'batch', 'fresh'] as Mode[]).map((mode) => (
                      <Tap
                        key={mode}
                        onClick={() => setModes({ ...modes, [m]: mode })}
                        className={`relative flex-1 rounded-xl py-1.5 text-xs transition-colors ${modes[m] === mode ? 'text-white' : 'text-muted'}`}
                      >
                        {modes[m] === mode && (
                          <motion.span layoutId={`mode-${m}`} transition={spring} className={`absolute inset-0 rounded-xl ${mode === 'off' ? 'bg-ink/40' : mode === 'batch' ? 'bg-leaf' : 'bg-honey'}`} />
                        )}
                        <span className="relative">{MODE_LABEL[mode]}</span>
                      </Tap>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-1.5 px-1 text-[11px] text-muted">「一次備好」＝一次煮好分裝，像帶便當；「每天現做」＝每天換菜色、現煮。已經排了菜的餐不會動。</p>
          </div>
          <Button className="w-full" disabled={!meals('batch').length && !meals('fresh').length} onClick={() => setStep('result')}>
            幫我排
          </Button>
        </div>
      )}

      {step === 'result' && result && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-gradient-to-br from-leaf-soft to-honey-soft p-4">
            <div className="font-bold">
              排了 {result.plans.length}／{result.slots} 餐
              {result.plans.length < result.slots && <span className="ml-1 text-xs font-normal text-[#a07a20]">食材不太夠，剩下的餐可以補買或自己排</span>}
            </div>
            <div className="mt-0.5 text-xs text-ink/70">
              用到家裡 {result.used.length} 樣食材・要補買 {result.shopping.length} 樣
            </div>
          </div>
          <Segmented
            id="pantry-tab"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'menu', label: '菜單', icon: 'restaurant_menu' },
              { value: 'shop', label: `要補買 ${result.shopping.length}`, icon: 'shopping_cart' },
            ]}
          />
          <motion.div key={`${tab}-${seed}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {tab === 'menu' ? (
              <>
                {result.batch.length > 0 && (
                  <Section title="一次備好・分次吃" sub="同一天一起煮好分裝，冰起來慢慢吃" image="step-pack">
                    {result.batch.map((b) => {
                      const st = storageOf(b.recipe)
                      return (
                        <DishRow
                          key={b.recipe.id}
                          recipe={b.recipe}
                          onOpen={() => openDetail(b.recipe.id, `pp-${b.recipe.id}`)}
                          title={`${b.recipe.name} ×${b.portions} 份`}
                          sub={`家裡有 ${b.cov.have.length}/${b.cov.have.length + b.cov.missing.length} 樣・${STORAGE_LABEL.fridge} ${st.fridgeDays} 天${st.freezeWeeks ? '、可冷凍' : ''}`}
                        />
                      )
                    })}
                  </Section>
                )}
                {result.fresh.length > 0 && (
                  <Section title="每天現做・天天換" sub="快手菜為主，容易壞的食材排前面先用掉" image="method-pan">
                    {result.fresh.map((f) => (
                      <DishRow
                        key={f.recipe.id}
                        recipe={f.recipe}
                        onOpen={() => openDetail(f.recipe.id, `pp-${f.recipe.id}`)}
                        title={f.recipe.name}
                        sub={`${f.days.map((d) => weekdayLabel(d)).join('、')}・${f.recipe.minutes} 分鐘・家裡有 ${f.cov.have.length}/${f.cov.have.length + f.cov.missing.length} 樣`}
                      />
                    ))}
                  </Section>
                )}
                <section>
                  <h3 className="mb-2 px-1 text-sm font-bold">每天吃什麼</h3>
                  <ul className="space-y-1">
                    {[...new Set(result.plans.map((p) => p.date))].map((d) => (
                      <li key={d} className="flex gap-2 rounded-2xl bg-white px-3 py-2 text-xs shadow-card">
                        <span className="w-[74px] shrink-0 text-muted">{dayLabel(d)}</span>
                        <span className="flex min-w-0 flex-1 flex-wrap gap-1">
                          {result.plans
                            .filter((p) => p.date === d)
                            .map((p) => (
                              <span key={p.meal} className={`truncate rounded-full px-2 py-0.5 ${p.kind === 'batch' ? 'bg-leaf-soft text-leaf-dark' : 'bg-honey-soft text-[#a07a20]'}`}>
                                {MEAL_LABEL[p.meal]}・{(p.kind === 'batch' ? result.batch.find((b) => b.recipe.id === p.recipeId)?.recipe : result.fresh.find((f) => f.recipe.id === p.recipeId)?.recipe)?.name}
                              </span>
                            ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
                {result.unused.length > 0 && (
                  <p className="px-1 text-xs text-muted">
                    沒用到：{result.unused.map((id) => ALL_COMP_MAP[id]?.name).join('、')}（可以按「換一組」試試，或用「組合料理」自己配一道）
                  </p>
                )}
              </>
            ) : (
              <>
                {result.shopping.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted">
                    <Art name="done-quickpick" width={120} />
                    家裡的食材就夠了，不用補買
                  </div>
                ) : (
                  (['missing', 'more'] as const).map((reason) => {
                    const list = result.shopping.filter((s) => s.reason === reason)
                    if (!list.length) return null
                    return (
                      <section key={reason} className="rounded-3xl bg-white p-4 shadow-card">
                        <h3 className="mb-2 text-sm font-bold">{reason === 'missing' ? '家裡沒有，要買' : '家裡有，但可能不夠'}</h3>
                        <ul className="space-y-2">
                          {list.map((s) => (
                            <li key={s.name + s.unit} className="flex items-start gap-2 text-sm">
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-leaf" />
                              <span className="min-w-0 flex-1">
                                {s.name}
                                <span className="block truncate text-[11px] text-muted">
                                  {SECTION_LABEL[s.section]}・{s.from.join('、')}
                                </span>
                              </span>
                              <span className="shrink-0 tabular-nums text-muted">{formatQty(s.qty, s.unit)}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )
                  })
                )}
                {result.shopping.length > 0 && (
                  <Button variant="soft" className="flex w-full items-center justify-center gap-1.5" onClick={copyShopping}>
                    <Icon name="content_copy" size={18} />
                    複製補買清單
                  </Button>
                )}
              </>
            )}
          </motion.div>
          <div className="sticky bottom-0 -mx-5 flex gap-2 bg-gradient-to-t from-cream via-cream to-transparent px-5 pb-1 pt-4">
            <Button variant="soft" className="flex items-center gap-1 px-4" onClick={() => setSeed((s) => s + 1)}>
              <Icon name="refresh" size={18} />
              換一組
            </Button>
            <Button className="flex-1" disabled={!result.plans.length} onClick={apply}>
              {result.batch.length ? '排進菜單＋開始備餐' : '排進菜單'}
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 px-1 text-sm font-medium">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <Tap onClick={onClick} className={`rounded-full px-3 py-1.5 text-xs transition-colors ${on ? 'bg-leaf text-white' : 'bg-white shadow-card'}`}>
      {children}
    </Tap>
  )
}

function Section({ title, sub, image, children }: { title: string; sub: string; image: Parameters<typeof Food>[0]['id']; children: ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2 px-1">
        <Food id={image} size={30} />
        <div>
          <div className="text-sm font-bold">{title}</div>
          <div className="text-[11px] text-muted">{sub}</div>
        </div>
      </div>
      <ul className="space-y-2">{children}</ul>
    </section>
  )
}

function DishRow({ recipe, title, sub, onOpen }: { recipe: Parameters<typeof RecipePhoto>[0]['recipe']; title: string; sub: string; onOpen: () => void }) {
  return (
    <li>
      <Tap press={0.98} onClick={onOpen} className="flex w-full items-center gap-3 rounded-2xl bg-white p-2 pr-3 text-left shadow-card">
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
          <RecipePhoto recipe={recipe} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{title}</span>
          <span className="block truncate text-[11px] text-muted">{sub}</span>
        </span>
        <Icon name="chevron_right" size={18} className="text-muted" />
      </Tap>
    </li>
  )
}
