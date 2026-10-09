import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { db } from '../db'
import { addDays, todayKey } from '../lib/date'
import { EAT_KINDS, eatNutrition, itemImage, eatScore, eatToRecipe, useEatOut, type EatBrand, type EatData, type EatItem, type EatKind } from '../lib/eatout'
import { haptic, spring } from '../lib/feedback'
import { saveCustomRecipe } from '../lib/recipeStore'
import { MEAL_LABEL, MEAL_SLOTS, type MealSlot } from '../types'
import { Food } from './Food'
import { Icon } from './Icon'
import { Button, Segmented, Sheet, Tap, useToast } from './ui'

const nowMeal = (): MealSlot => {
  const h = new Date().getHours()
  return h < 10 ? 'breakfast' : h < 14 ? 'lunch' : h < 17 ? 'snack' : 'dinner'
}

type Sort = 'best' | 'kcal' | 'protein'
type Quick = 'protein' | 'lowcarb' | 'light'
const QUICK: { id: Quick; label: string; test: (it: EatItem) => boolean }[] = [
  { id: 'protein', label: '高蛋白 20g+', test: (it) => (it.p ?? 0) >= 20 },
  { id: 'lowcarb', label: '低碳 20g 以下', test: (it) => it.c !== undefined && it.c <= 20 },
  { id: 'light', label: '500 大卡以下', test: (it) => it.k <= 500 },
]

/** 外食天地：連鎖餐廳、便利商店、一般小吃的營養資料 */
export function EatOutBrowser({ onPick, compact = false }: { onPick: (it: EatItem, brand: EatBrand | undefined, data: EatData) => void; compact?: boolean }) {
  const { data, error, retry } = useEatOut()
  const [kind, setKind] = useState<EatKind | 'all'>('all')
  const [brand, setBrand] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('best')
  const [quick, setQuick] = useState<Quick[]>([])
  const [limit, setLimit] = useState(40)

  const brandMap = useMemo(() => Object.fromEntries((data?.brands ?? []).map((b) => [b.id, b])), [data])
  const brands = (data?.brands ?? []).filter((b) => kind === 'all' || b.kind === kind)
  const q = query.trim()
  const list = useMemo(() => {
    if (!data) return []
    const out = data.items.filter((it) => {
      const b = brandMap[it.b]
      if (brand ? it.b !== brand : kind !== 'all' && b?.kind !== kind) return false
      if (q && !`${it.n}${it.cat ?? ''}${b?.name ?? ''}`.includes(q)) return false
      return quick.every((k) => QUICK.find((x) => x.id === k)!.test(it))
    })
    return out.sort((a, b) => (sort === 'kcal' ? a.k - b.k : sort === 'protein' ? (b.p ?? -1) - (a.p ?? -1) : eatScore(b) - eatScore(a)))
  }, [data, brandMap, brand, kind, q, quick, sort])

  if (error && !data)
    return (
      <div className="space-y-3 py-10 text-center text-sm text-muted">
        <Icon name="error" size={36} className="text-tomato" />
        <p>外食資料下載失敗，請確認網路後再試一次</p>
        <Button variant="soft" onClick={retry}>
          再試一次
        </Button>
      </div>
    )
  if (!data)
    return (
      <div className="py-12 text-center text-sm text-muted">
        <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} className="inline-block">
          <Icon name="sync" size={28} />
        </motion.span>
        <p className="mt-2">載入外食資料…</p>
      </div>
    )

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setLimit(40)
        }}
        placeholder="搜尋品項或店家，例如 雞胸、拿鐵、全家"
        className="w-full rounded-2xl bg-card px-4 py-3 text-sm shadow-card outline-none ring-leaf/40 focus:ring-2"
      />
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
        {[{ id: 'all' as const, label: '全部', image: 'basket' as const }, ...EAT_KINDS.filter((k) => data.brands.some((b) => b.kind === k.id))].map((k) => (
          <Tap
            key={k.id}
            onClick={() => {
              setKind(k.id)
              setBrand(null)
              setLimit(40)
            }}
            className={`flex shrink-0 items-center gap-1 rounded-full py-1 pl-1.5 pr-3 text-sm transition-colors ${kind === k.id ? 'bg-ink text-cream' : 'bg-card text-muted shadow-card'}`}
          >
            <Food id={k.image} size={22} />
            {k.label}
          </Tap>
        ))}
      </div>
      {brands.length > 1 && (
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4">
          {brands.map((b) => (
            <Tap
              key={b.id}
              onClick={() => {
                setBrand(brand === b.id ? null : b.id)
                setLimit(40)
              }}
              className={`shrink-0 rounded-full px-3 py-1 text-xs transition-colors ${brand === b.id ? 'bg-leaf text-on-leaf' : 'bg-leaf-soft/60 text-leaf-dark'}`}
            >
              {b.name}
              <span className="ml-1 opacity-60">{b.count}</span>
            </Tap>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {QUICK.map((x) => {
          const on = quick.includes(x.id)
          return (
            <Tap
              key={x.id}
              onClick={() => setQuick(on ? quick.filter((k) => k !== x.id) : [...quick, x.id])}
              className={`flex items-center gap-0.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${on ? 'border-leaf bg-leaf-soft text-leaf-dark' : 'border-ink/10 text-muted'}`}
            >
              {on && <Icon name="check" size={13} weight={600} />}
              {x.label}
            </Tap>
          )
        })}
      </div>
      <Segmented
        id={compact ? 'eat-sort-c' : 'eat-sort'}
        value={sort}
        onChange={setSort}
        options={[
          { value: 'best', label: '推薦' },
          { value: 'kcal', label: '熱量低' },
          { value: 'protein', label: '蛋白質高' },
        ]}
      />
      <p className="px-1 text-[11px] text-muted">
        共 {list.length} 項・資料來自各品牌官方公布與衛福部開放資料{data.updatedAt ? `・更新於 ${data.updatedAt}` : ''}
      </p>
      <ul className="space-y-2">
        {list.slice(0, limit).map((it, i) => (
          <motion.li key={it.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: Math.min(i, 12) * 0.02 }}>
            <ItemRow it={it} brand={brandMap[it.b]} onTap={() => onPick(it, brandMap[it.b], data)} />
          </motion.li>
        ))}
      </ul>
      {list.length > limit && (
        <Button variant="soft" className="w-full" onClick={() => setLimit(limit + 60)}>
          再顯示 {Math.min(60, list.length - limit)} 項
        </Button>
      )}
      {!list.length && <p className="py-8 text-center text-sm text-muted">找不到符合的品項</p>}
    </div>
  )
}

function ItemRow({ it, brand, onTap }: { it: EatItem; brand?: EatBrand; onTap: () => void }) {
  return (
    <Tap press={0.98} onClick={onTap} className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-card">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cream">
        <Food id={itemImage(it, brand)} size={30} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{it.n}</span>
        <span className="block truncate text-[11px] text-muted">
          {brand?.name}
          {it.s ? `・${it.s}` : ''}
        </span>
        <span className="mt-0.5 flex gap-2 text-[11px] tabular-nums text-ink/70">
          {it.ko ? (
            <span className="text-muted">官方只公布熱量{it.f !== undefined ? `・脂肪 ${it.f}g` : ''}</span>
          ) : (
            <>
              <span>蛋白 {it.p}g</span>
              <span>碳水 {it.c}g</span>
              <span>脂肪 {it.f}g</span>
            </>
          )}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-base font-bold tabular-nums">{Math.round(it.k)}</span>
        <span className="block text-[10px] text-muted">kcal</span>
      </span>
    </Tap>
  )
}

/** 點品項：看詳細營養、記錄到今天或排進菜單 */
export function EatItemSheet({
  item,
  brand,
  onClose,
  defaultDate,
  defaultMeal,
  logOnly = false,
}: {
  item: EatItem | null
  brand?: EatBrand
  onClose: () => void
  defaultDate?: string
  defaultMeal?: MealSlot
  logOnly?: boolean
}) {
  const toast = useToast()
  const today = todayKey()
  const [meal, setMeal] = useState<MealSlot>(defaultMeal ?? nowMeal())
  const [date, setDate] = useState(defaultDate ?? today)
  const [last, setLast] = useState<string | null>(null)
  if (item && last !== item.id) {
    setLast(item.id)
    setMeal(defaultMeal ?? nowMeal())
    setDate(defaultDate ?? today)
  }

  const log = async () => {
    if (!item) return
    const n = eatNutrition(item)
    const name = brand && brand.kind !== 'generic' ? `${brand.name} ${item.n}` : item.n
    const id = (await db.logs.add({ date, meal, recipeId: '', custom: { name, nutrition: n }, portion: 1, createdAt: Date.now() })) as number
    haptic([10, 40, 10, 40, 20])
    onClose()
    toast(`已記錄 ${name}`, () => db.logs.delete(id))
  }
  const plan = async () => {
    if (!item) return
    const r = eatToRecipe(item, brand)
    await saveCustomRecipe(r)
    const id = (await db.plans.add({ date, meal, recipeId: r.id })) as number
    haptic([8, 24, 8])
    onClose()
    toast(`已排進${date === today ? '今天' : '明天'}${MEAL_LABEL[meal]}`, () => db.plans.delete(id))
  }

  return (
    <Sheet open={!!item} onClose={onClose} title={item ? item.n : ''}>
      {item && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-cream">
              <Food id={itemImage(item, brand)} size={40} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-medium">{brand?.name}</div>
              <div className="text-xs text-muted">
                {item.cat ? `${item.cat}・` : ''}
                {item.s ?? '1 份'}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 rounded-3xl bg-card p-3 text-center shadow-card">
            {(
              [
                ['熱量', Math.round(item.k), 'kcal'],
                ['蛋白質', item.p ?? '—', 'g'],
                ['碳水', item.c ?? '—', 'g'],
                ['脂肪', item.f ?? '—', 'g'],
              ] as const
            ).map(([l, v, u]) => (
              <div key={l}>
                <div className="text-lg font-bold tabular-nums">{v}</div>
                <div className="text-[10px] text-muted">
                  {l} {u}
                </div>
              </div>
            ))}
          </div>
          {item.ko && <p className="px-1 text-xs text-honey-ink">這家只公布熱量，記錄時蛋白質、碳水、脂肪會算 0；想算準一點可以用「AI 估算」。</p>}
          {(item.fi !== undefined || item.su !== undefined || item.na !== undefined) && (
            <div className="flex flex-wrap gap-2 px-1 text-xs text-muted">
              {item.fi !== undefined && <span>膳食纖維 {item.fi}g</span>}
              {item.su !== undefined && <span>糖 {item.su}g</span>}
              {item.na !== undefined && <span className={item.na >= 1000 ? 'text-tomato' : ''}>鈉 {item.na}mg{item.na >= 1000 ? '（偏高）' : ''}</span>}
            </div>
          )}
          <div>
            <div className="mb-1.5 px-1 text-sm font-medium">哪一餐</div>
            <div className="flex gap-1.5">
              {!logOnly &&
                [today, addDays(today, 1)].map((d) => (
                  <Tap key={d} onClick={() => setDate(d)} className={`rounded-full px-3 py-1.5 text-xs ${date === d ? 'bg-ink text-cream' : 'bg-card shadow-card'}`}>
                    {d === today ? '今天' : '明天'}
                  </Tap>
                ))}
              {MEAL_SLOTS.map((m) => (
                <Tap key={m} onClick={() => setMeal(m)} className={`rounded-full px-3 py-1.5 text-xs ${meal === m ? 'bg-leaf text-on-leaf' : 'bg-card shadow-card'}`}>
                  {MEAL_LABEL[m]}
                </Tap>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {(logOnly || date === today) && (
              <Button className="flex flex-1 items-center justify-center gap-1.5" onClick={log}>
                <Icon name="check_circle" size={18} />
                記錄已經吃了
              </Button>
            )}
            {!logOnly && (
              <Button variant={date === today ? 'soft' : 'primary'} className="flex flex-1 items-center justify-center gap-1.5" onClick={plan}>
                <Icon name="playlist_add" size={18} />
                排進菜單
              </Button>
            )}
          </div>
          {(item.src ?? brand?.source) && (
            <a href={item.src ?? brand?.source} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-1 text-[11px] text-muted underline">
              <Icon name="open_in_new" size={13} />
              資料來源：{brand?.kind === 'generic' ? '衛福部食品營養成分資料庫' : `${brand?.name ?? ''}官方公布`}
              {brand?.fetchedAt ? `（${brand.fetchedAt} 取得）` : ''}
            </a>
          )}
          <p className="px-1 text-[11px] text-muted">實際份量會因門市與季節不同，數字僅供參考。</p>
        </div>
      )}
    </Sheet>
  )
}

/** 菜單頁的「外食天地」分頁 */
export function EatOutView() {
  const [picked, setPicked] = useState<{ it: EatItem; brand?: EatBrand } | null>(null)
  return (
    <>
      <EatOutBrowser onPick={(it, brand) => setPicked({ it, brand })} />
      <EatItemSheet item={picked?.it ?? null} brand={picked?.brand} onClose={() => setPicked(null)} />
    </>
  )
}

/** 今天頁「吃了別的」：從外食天地挑一個記錄 */
const PickerCtx = createContext<(o: { date: string; meal: MealSlot }) => void>(() => {})
export const useEatOutPicker = () => useContext(PickerCtx)

export function EatOutPickerProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<{ date: string; meal: MealSlot } | null>(null)
  const [picked, setPicked] = useState<{ it: EatItem; brand?: EatBrand } | null>(null)
  return (
    <PickerCtx.Provider value={setTarget}>
      {children}
      <Sheet open={!!target} onClose={() => setTarget(null)} title={target ? `外食天地・${MEAL_LABEL[target.meal]}` : ''}>
        <AnimatePresence initial={false}>{target && <EatOutBrowser compact onPick={(it, brand) => setPicked({ it, brand })} />}</AnimatePresence>
      </Sheet>
      <EatItemSheet
        item={picked?.it ?? null}
        brand={picked?.brand}
        defaultDate={target?.date}
        defaultMeal={target?.meal}
        logOnly
        onClose={() => {
          setPicked(null)
          setTarget(null)
        }}
      />
    </PickerCtx.Provider>
  )
}
