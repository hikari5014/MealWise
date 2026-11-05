import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { db } from '../db'
import { haptic, spring } from '../lib/feedback'
import { useBody } from '../lib/hooks'
import {
  ACTIVITY,
  bmiLabel,
  defaultSpec,
  DEFAULT_PROTEIN,
  MEAL_PATTERNS,
  PACES,
  PRESETS,
  PROTEIN_LEVELS,
  mealShares,
  useNeeds,
  type BodySpec,
  type Needs,
  type PresetId,
} from '../lib/nutrition'
import { GOAL_LABEL, MEAL_LABEL, type Goal, type MealSlot, type Profile } from '../types'
import { CountUp } from './Ring'
import { Food } from './Food'
import { Icon } from './Icon'
import { Button, Card, Sheet, Tap, useToast } from './ui'

const P = 'rgb(var(--tomato))'
const C = 'rgb(var(--honey))'
const F = 'rgb(var(--sky))'
const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack']

/** 「我的」頁的營養需求卡：目前目標＋比例圓環，點開互動計算 */
export function NeedsCard({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false)
  const m = profile.macros
  const carbs = m ? Math.max(0, Math.round((profile.kcal - m.protein * 4 - m.fat * 9) / 4)) : 0
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 font-bold">
          <Food id="scale" size={24} />
          營養需求
        </h2>
        <Button variant="soft" className="px-3 py-1.5 text-xs" onClick={() => setOpen(true)}>
          {profile.body ? '調整' : '用身體數據計算'}
        </Button>
      </div>
      {m ? (
        <Tap press={0.98} onClick={() => setOpen(true)} className="flex w-full items-center gap-4 text-left">
          <Donut size={96} protein={m.protein} carbs={carbs} fat={m.fat} kcal={profile.kcal} small />
          <div className="flex-1 space-y-1.5 text-sm">
            <Legend color={P} label="蛋白質" g={m.protein} />
            <Legend color={C} label="碳水" g={carbs} />
            <Legend color={F} label="脂肪" g={m.fat} />
            <p className="pt-0.5 text-[11px] text-muted">
              {PRESETS.find((x) => x.id === profile.body?.preset)?.label ?? '自訂'}・{MEAL_PATTERNS.find((x) => x.id === (profile.body?.meals ?? 'three'))!.label}
            </p>
          </div>
        </Tap>
      ) : (
        <p className="text-sm text-muted">填身高、體重、活動量和目標，自動算出每天需要的熱量和三大營養素，排菜單時會照這個挑料理。</p>
      )}
      <NeedsSheet open={open} onClose={() => setOpen(false)} profile={profile} />
    </Card>
  )
}

function Legend({ color, label, g }: { color: string; label: string; g: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      <span className="flex-1 text-muted">{label}</span>
      <b className="tabular-nums">{g}</b>
      <span className="text-xs text-muted">g</span>
    </div>
  )
}

export function NeedsSheet({ open, onClose, profile }: { open: boolean; onClose: () => void; profile: Profile }) {
  const toast = useToast()
  const records = useBody(60)
  const [s, setS] = useState<BodySpec>(() => defaultSpec(profile))
  const [why, setWhy] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)
  const [summaryVisible, setSummaryVisible] = useState(true)
  useEffect(() => {
    const el = summaryRef.current
    if (!open || !el) return
    const io = new IntersectionObserver(([e]) => setSummaryVisible(e.intersectionRatio > 0.25), { threshold: [0, 0.25, 0.5] })
    io.observe(el)
    return () => io.disconnect()
  }, [open, summaryRef.current])

  // 打開時帶入上次的設定；沒設定過就用最近量的體重、體脂
  useEffect(() => {
    if (!open) return
    const latest = [...records].reverse()
    setS(defaultSpec(profile, latest.find((r) => r.weight)?.weight, latest.find((r) => r.bodyFat)?.bodyFat))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const set = (patch: Partial<BodySpec>) => setS((x) => ({ ...x, ...patch }))
  const { needs: n, errors, ok } = useNeeds(s)
  const preset = PRESETS.find((p) => p.id === s.preset)

  const apply = async () => {
    if (!ok) return toast(errors[0])
    haptic([10, 30, 10])
    await db.profile.update('me', {
      body: s,
      goal: s.goal,
      kcal: n.kcal,
      waterMl: n.water,
      macros: { protein: n.protein, fat: n.fat, fiber: n.fiber },
    })
    onClose()
    toast(`已套用：每天 ${n.kcal} kcal、蛋白質 ${n.protein} g`)
  }

  const choosePreset = (id: PresetId) => {
    haptic(8)
    const p = PRESETS.find((x) => x.id === id)
    set({ preset: id, ...(p ? { goal: p.goal } : {}) })
  }

  return (
    <Sheet open={open} onClose={onClose} title="營養需求計算">
      <div className="space-y-4 pb-20">
        <div ref={summaryRef}>
        <Summary n={n} label={preset ? `${preset.label}（${preset.kcal ? `TDEE ${preset.kcal > 0 ? '+' : '−'} ${Math.abs(preset.kcal)}` : 'TDEE'}）` : `${GOAL_LABEL[s.goal]}・自訂`} activity={ACTIVITY.find((a) => a.id === s.activity)!} />
        </div>
        {/* 往下調整時，頂端一直看得到結果 */}
        <div className="pointer-events-none sticky top-0 z-10 -mt-4 h-0">
          <AnimatePresence>
            {!summaryVisible && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={spring}
                className="flex items-center gap-3 rounded-2xl bg-ink px-4 py-2 text-cream shadow-lg"
              >
                <span className="text-lg font-bold tabular-nums">
                  <CountUp value={n.kcal} />
                  <span className="ml-0.5 text-[10px] font-normal opacity-70">kcal</span>
                </span>
                <span className="ml-auto flex gap-3 text-xs tabular-nums">
                  <span><span style={{ color: P }}>●</span> {n.protein}g</span>
                  <span><span style={{ color: C }}>●</span> {n.carbs}g</span>
                  <span><span style={{ color: F }}>●</span> {n.fat}g</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <BodyInputs s={s} set={set} n={n} errors={errors} />

        <Group title="飲食目標與三大營養素比例">
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <PresetCard key={p.id} on={s.preset === p.id} label={p.label} kcal={p.kcal} ratio={p.ratio} onTap={() => choosePreset(p.id)} />
            ))}
          </div>
          <Tap
            press={0.98}
            onClick={() => choosePreset('custom')}
            className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm transition-colors ${!preset ? 'bg-leaf text-on-leaf' : 'bg-card shadow-card'}`}
          >
            <Icon name="tune" size={18} />
            自訂：依體重算蛋白質
            {!preset && <Icon name="check" size={18} weight={600} className="ml-auto" />}
          </Tap>
          <AnimatePresence initial={false}>
            {!preset && <CustomGoal s={s} set={set} />}
          </AnimatePresence>
          {preset && <p className="px-1 text-[11px] text-muted">{preset.hint}</p>}
        </Group>

        <Group title="餐點分配">
          <Chips value={s.meals ?? 'three'} options={MEAL_PATTERNS.map((m) => ({ id: m.id, label: m.label }))} onChange={(meals) => set({ meals })} />
        </Group>

        <div className="grid gap-3">
          <div className="rounded-3xl bg-card p-4 shadow-card">
            <h3 className="font-bold">三大營養素熱量比例</h3>
            <p className="text-[11px] text-muted">每天各營養素提供的熱量</p>
            <div className="mt-3 flex items-center gap-4">
              <Donut size={140} protein={n.protein} carbs={n.carbs} fat={n.fat} kcal={n.kcal} />
              <div className="flex-1 space-y-2 text-sm">
                <Legend color={P} label="蛋白質" g={n.protein} />
                <Legend color={C} label="碳水" g={n.carbs} />
                <Legend color={F} label="脂肪" g={n.fat} />
              </div>
            </div>
          </div>
          <MealBreakdown n={n} spec={s} />
        </div>

        <div className="rounded-3xl bg-honey-soft p-4 text-[12px] leading-relaxed text-ink/80">
          <div className="mb-1 flex items-center gap-1 font-bold text-honey-ink">
            <Icon name="lightbulb" size={16} fill />
            實務小提醒
          </div>
          公式算出來的每日消耗是<b>起點</b>，不是標準答案。建議先照這個吃 <b>2 週</b>，觀察體重變化：
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            <li>減脂但體重完全沒動 → 每日目標再少 100–200 kcal，優先從碳水或脂肪減</li>
            <li>增肌但體重沒上升 → 每日再多 100–200 kcal，優先加碳水</li>
            <li>一週掉超過 1 kg、常常餓到沒力 → 加回 100–200 kcal</li>
          </ul>
          這樣計畫會越來越貼近你真實的新陳代謝。
        </div>

        <div className="rounded-3xl bg-card p-4 shadow-card">
          <Tap press={0.98} onClick={() => setWhy(!why)} className="flex w-full items-center gap-1 text-left text-sm font-bold">
            <Icon name="menu_book" size={18} className="text-leaf-dark" />
            怎麼算的？
            <motion.span animate={{ rotate: why ? 180 : 0 }} className="ml-auto grid text-muted">
              <Icon name="expand_more" size={20} />
            </motion.span>
          </Tap>
          <AnimatePresence initial={false}>
            {why && (
              <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="list-disc space-y-1 overflow-hidden pl-4 pt-2 text-xs leading-relaxed text-ink/75">
                <li>
                  基礎代謝 <b>{n.bmr}</b> kcal：躺著不動一天也會用掉的熱量（{n.method === 'katch' ? '有體脂，用 Katch-McArdle 公式看去脂體重' : '用 Mifflin-St Jeor 公式看性別、年齡、身高、體重'}）
                </li>
                <li>
                  每日總消耗 <b>{n.tdee}</b> kcal＝基礎代謝 × 活動係數 {ACTIVITY.find((a) => a.id === s.activity)!.factor}
                </li>
                <li>每日目標＝每日總消耗 {preset ? (preset.kcal ? `${preset.kcal > 0 ? '+' : '−'} ${Math.abs(preset.kcal)}` : '') : s.goal === 'maintain' ? '' : `${PACES[s.goal].find((p) => p.id === s.pace)!.kcal}`} kcal</li>
                <li>{preset ? `三大營養素照比例分：蛋白質 ${Math.round(preset.ratio[0] * 100)}%、碳水 ${Math.round(preset.ratio[1] * 100)}%、脂肪 ${Math.round(preset.ratio[2] * 100)}%` : `蛋白質＝體重 × ${s.proteinPerKg ?? DEFAULT_PROTEIN[s.goal]} g；脂肪每公斤 0.9 g（限制在總熱量 20–30%）；剩下的熱量全部給碳水`}</li>
                <li>1 g 蛋白質、碳水各 4 kcal，1 g 脂肪 9 kcal</li>
                <li>活動係數只算平常生活；有運動的那天，首頁會另外加上運動消耗，算出當天的熱量赤字</li>
                <li>運動日依「飲食計劃」多加的熱量，會自動加在碳水上</li>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <div className="sticky bottom-0 -mx-5 bg-gradient-to-t from-cream via-cream to-transparent px-5 pb-1 pt-4">
          <Button className="w-full" onClick={apply}>
            套用到我的目標
          </Button>
        </div>
      </div>
    </Sheet>
  )
}

/* ───────── 總覽 ───────── */

function Summary({ n, label, activity }: { n: Needs; label: string; activity: (typeof ACTIVITY)[number] }) {
  const parts = [
    { name: '蛋白質', g: n.protein, k: n.protein * 4, color: P },
    { name: '碳水', g: n.carbs, k: n.carbs * 4, color: C },
    { name: '脂肪', g: n.fat, k: n.fat * 9, color: F },
  ]
  const sum = parts.reduce((t, p) => t + p.k, 0) || 1
  return (
    <div className="rounded-3xl bg-leaf-soft p-4">
      <div className="text-xs text-leaf-dark">每日目標攝取</div>
      <div className="flex items-end gap-1">
        <span className="text-4xl font-bold tabular-nums">
          <CountUp value={n.kcal} />
        </span>
        <span className="pb-1 text-sm text-muted">kcal</span>
      </div>
      <div className="text-[11px] text-muted">{label}</div>
      {n.adjusted.map((t) => (
        <p key={t} className="mt-1 flex items-start gap-1 text-[11px] text-honey-ink">
          <Icon name="info" size={14} fill />
          {t}
        </p>
      ))}
      {n.floored && (
        <p className="mt-1 flex items-start gap-1 text-[11px] text-tomato">
          <Icon name="warning" size={14} fill />
          吃太少會掉肌肉、代謝變慢，已拉到安全下限
        </p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Mini label="每日總消耗" value={n.tdee} hint={`${activity.label}活動 ×${activity.factor}`} />
        <Mini label="基礎代謝" value={n.bmr} hint="躺著不動的消耗" />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {parts.map((p) => (
          <div key={p.name} className="rounded-2xl bg-card/80 px-2.5 py-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                {p.name}
              </span>
              <span className="text-muted">{Math.round((p.k / sum) * 100)}%</span>
            </div>
            <div className="mt-0.5 text-lg font-bold tabular-nums">
              <CountUp value={p.g} />
              <span className="ml-0.5 text-[10px] font-normal text-muted">g</span>
            </div>
            <div className="text-[10px] tabular-nums text-muted">{Math.round(p.k)} kcal</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Mini({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-2xl bg-card/80 px-3 py-2">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="text-lg font-bold tabular-nums">
        <CountUp value={value} />
        <span className="ml-0.5 text-[10px] font-normal text-muted">kcal</span>
      </div>
      <div className="text-[10px] text-muted">{hint}</div>
    </div>
  )
}

/* ───────── 圖表 ───────── */

/** 三大營養素熱量比例圓環（拖拉時會滑順變化） */
export function Donut({ size, protein, carbs, fat, kcal, small = false }: { size: number; protein: number; carbs: number; fat: number; kcal: number; small?: boolean }) {
  const parts = [
    { k: protein * 4, color: P },
    { k: carbs * 4, color: C },
    { k: fat * 9, color: F },
  ]
  const sum = parts.reduce((t, p) => t + p.k, 0) || 1
  const r = 40
  const len = 2 * Math.PI * r
  const gap = 3
  let at = 0
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        {parts.map((p, i) => {
          const seg = (p.k / sum) * len
          const offset = -at
          at += seg
          return (
            <motion.circle
              key={i}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              strokeWidth={small ? 12 : 10}
              strokeLinecap="round"
              style={{ stroke: p.color }}
              initial={false}
              animate={{ strokeDasharray: `${Math.max(0, seg - gap)} ${len}`, strokeDashoffset: offset }}
              transition={spring}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          {!small && <div className="text-[10px] text-muted">每日目標</div>}
          <div className={`font-bold tabular-nums ${small ? 'text-base' : 'text-xl'}`}>
            <CountUp value={kcal} />
          </div>
          <div className="text-[10px] text-muted">kcal</div>
        </div>
      </div>
    </div>
  )
}

/** 各餐建議：長條圖＋明細表 */
function MealBreakdown({ n, spec }: { n: Needs; spec: BodySpec }) {
  const shares = mealShares(spec)
  const rows = SLOTS.filter((m) => shares[m] > 0).map((m) => ({
    meal: m,
    share: shares[m],
    kcal: Math.round(n.kcal * shares[m]),
    p: Math.round(n.protein * shares[m]),
    c: Math.round(n.carbs * shares[m]),
    f: Math.round(n.fat * shares[m]),
  }))
  const max = Math.max(...rows.flatMap((r) => [r.p, r.c, r.f]), 1)
  const top = Math.ceil(max / 20) * 20
  return (
    <div className="rounded-3xl bg-card p-4 shadow-card">
      <h3 className="font-bold">各餐三大營養素建議</h3>
      <p className="text-[11px] text-muted">依餐點分配比例拆解（g）</p>
      <div className="mt-3 flex h-36 items-end gap-3 border-b border-ink/10 pb-0.5">
        {rows.map((r) => (
          <div key={r.meal} className="flex h-full flex-1 items-end justify-center gap-1">
            {[
              [r.p, P],
              [r.c, C],
              [r.f, F],
            ].map(([v, color], i) => (
              <div key={i} className="relative flex h-full w-3.5 items-end">
                <motion.div
                  className="w-full rounded-t-md"
                  style={{ background: color as string }}
                  initial={false}
                  animate={{ height: `${((v as number) / top) * 100}%` }}
                  transition={spring}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-3">
        {rows.map((r) => (
          <div key={r.meal} className="flex-1 text-center text-[11px] text-muted">
            {MEAL_LABEL[r.meal]}
          </div>
        ))}
      </div>

      <table className="mt-4 w-full text-[12px] tabular-nums">
        <thead>
          <tr className="text-left text-[10px] text-muted">
            <th className="pb-1.5 font-normal">餐別</th>
            <th className="pb-1.5 text-right font-normal">熱量</th>
            <th className="pb-1.5 text-right font-normal" style={{ color: P }}>
              蛋白
            </th>
            <th className="pb-1.5 text-right font-normal" style={{ color: C }}>
              碳水
            </th>
            <th className="pb-1.5 text-right font-normal" style={{ color: F }}>
              脂肪
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.meal} className="border-t border-ink/5">
              <td className="py-1.5">
                {MEAL_LABEL[r.meal]}
                <span className="ml-1 text-[10px] text-muted">{Math.round(r.share * 100)}%</span>
              </td>
              <td className="py-1.5 text-right">{r.kcal}</td>
              <td className="py-1.5 text-right">{r.p} g</td>
              <td className="py-1.5 text-right">{r.c} g</td>
              <td className="py-1.5 text-right">{r.f} g</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ───────── 輸入元件 ───────── */

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="px-1 text-sm font-bold">{title}</h3>
      {children}
    </section>
  )
}

function Chips<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1.5">
      {options.map((o) => (
        <Tap
          key={o.id}
          onClick={() => {
            haptic(6)
            onChange(o.id)
          }}
          className={`flex-1 rounded-2xl px-2 py-2 text-sm transition-colors ${value === o.id ? 'bg-ink text-cream' : 'bg-card shadow-card'}`}
        >
          {o.label}
        </Tap>
      ))}
    </div>
  )
}

/** 拖拉滑桿：數字跟著跳，旁邊也能 ± 微調 */
function Slider({ label, unit, value, min, max, step, onChange, empty }: { label: string; unit: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; empty?: string }) {
  const pct = ((Math.min(max, Math.max(min, value)) - min) / (max - min)) * 100
  const nudge = (d: number) => {
    haptic(4)
    onChange(Math.min(max, Math.max(min, +(value + d).toFixed(1))))
  }
  return (
    <div className="rounded-2xl bg-card px-3 pb-2 pt-2 shadow-card">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] text-muted">{label}</span>
        <span className="text-base font-bold tabular-nums">
          {value || !empty ? value : <span className="text-xs font-normal text-muted">{empty}</span>}
          {(value || !empty) && <span className="ml-0.5 text-[10px] font-normal text-muted">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="range mt-1 w-full"
        style={{ ['--pct' as string]: `${pct}%` }}
      />
      <div className="flex justify-between">
        <Tap onClick={() => nudge(-step)} aria-label={`減少${label}`} className="grid h-6 w-8 place-items-center rounded-lg text-muted">
          <Icon name="remove" size={14} />
        </Tap>
        <Tap onClick={() => nudge(step)} aria-label={`增加${label}`} className="grid h-6 w-8 place-items-center rounded-lg text-muted">
          <Icon name="add" size={14} />
        </Tap>
      </div>
    </div>
  )
}

/** 活動量：5 格滑桿，下方顯示說明 */
function ActivityPicker({ value, onChange }: { value: BodySpec['activity']; onChange: (v: BodySpec['activity']) => void }) {
  const i = ACTIVITY.findIndex((a) => a.id === value)
  const a = ACTIVITY[i]
  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      <div className="flex gap-1">
        {ACTIVITY.map((x, k) => (
          <Tap
            key={x.id}
            onClick={() => {
              haptic(6)
              onChange(x.id)
            }}
            aria-label={x.label}
            className="relative flex h-9 flex-1 items-end justify-center"
          >
            <motion.span
              className={`w-full rounded-lg transition-colors ${k <= i ? 'bg-leaf' : 'bg-ink/10'}`}
              initial={false}
              animate={{ scaleY: k <= i ? 1 : 0.85 }}
              style={{ height: `${30 + k * 17}%`, originY: 1 }}
              transition={spring}
            />
          </Tap>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={a.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-bold">{a.label}</span>
          <span className="text-[11px] text-muted">{a.hint}</span>
          <span className="ml-auto text-[11px] tabular-nums text-muted">×{a.factor}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function PresetCard({ on, label, kcal, ratio, onTap }: { on: boolean; label: string; kcal: number; ratio: [number, number, number]; onTap: () => void }) {
  return (
    <Tap press={0.97} onClick={onTap} className={`rounded-2xl p-2.5 text-left transition-colors ${on ? 'bg-leaf-soft ring-2 ring-leaf' : 'bg-card shadow-card'}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold">{label}</span>
        {on && <Icon name="check_circle" size={16} fill className="text-leaf" />}
      </div>
      <div className="text-[10px] tabular-nums text-muted">{kcal ? `${kcal > 0 ? '+' : '−'}${Math.abs(kcal)} kcal` : '維持熱量'}</div>
      <div className="mt-1.5 flex h-1.5 overflow-hidden rounded-full">
        {ratio.map((r, i) => (
          <span key={i} style={{ width: `${r * 100}%`, background: [P, C, F][i] }} />
        ))}
      </div>
      <div className="mt-1 text-[10px] tabular-nums text-muted">
        蛋 {Math.round(ratio[0] * 100)}・碳 {Math.round(ratio[1] * 100)}・脂 {Math.round(ratio[2] * 100)}
      </div>
    </Tap>
  )
}

/** 自訂：選目標、速度、每公斤蛋白質 */
function CustomGoal({ s, set }: { s: BodySpec; set: (p: Partial<BodySpec>) => void }) {
  const perKg = s.proteinPerKg ?? DEFAULT_PROTEIN[s.goal]
  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-2 overflow-hidden">
      <Chips value={s.goal} options={(['lose', 'maintain', 'recomp', 'gain'] as Goal[]).map((g) => ({ id: g, label: GOAL_LABEL[g] }))} onChange={(goal) => set({ goal, proteinPerKg: undefined })} />
      <p className="px-1 text-[11px] text-muted">{GOAL_HINT[s.goal]}</p>
      {s.goal !== 'maintain' && (
        <div className="grid grid-cols-3 gap-1.5">
          {PACES[s.goal].map((p) => (
            <Tap key={p.id} onClick={() => set({ pace: p.id })} className={`rounded-2xl px-2 py-2 text-center transition-colors ${s.pace === p.id ? 'bg-leaf text-on-leaf' : 'bg-card shadow-card'}`}>
              <div className="text-sm font-medium">{p.label}</div>
              <div className={`text-[10px] ${s.pace === p.id ? 'opacity-80' : 'text-muted'}`}>{p.hint}</div>
            </Tap>
          ))}
        </div>
      )}
      <div className="text-[11px] text-muted">蛋白質：每公斤體重 {perKg} g</div>
      <div className="flex gap-1.5">
        {PROTEIN_LEVELS.map((v) => (
          <Tap key={v} onClick={() => set({ proteinPerKg: v })} className={`flex-1 rounded-xl py-1.5 text-xs tabular-nums transition-colors ${perKg === v ? 'bg-leaf text-on-leaf' : 'bg-card shadow-card'}`}>
            {v}
          </Tap>
        ))}
      </div>
    </motion.div>
  )
}

const GOAL_HINT: Record<Goal, string> = {
  lose: '少吃一點（每天 −300～−500 kcal），蛋白質拉高保住肌肉',
  maintain: '吃多少用多少，體重維持不變',
  recomp: '熱量差不多平衡（0～−150 kcal），蛋白質拉到最高，一邊減脂一邊長肌肉',
  gain: '每天多吃 200～300 kcal，配合重訓長肌肉',
}

type CompMode = 'none' | 'bodyFat' | 'smm' | 'ffm'
const COMP_OPTIONS: { id: CompMode; label: string }[] = [
  { id: 'bodyFat', label: '體脂率' },
  { id: 'smm', label: '骨骼肌重' },
  { id: 'ffm', label: '去脂體重' },
  { id: 'none', label: '不知道' },
]
const FFM_SOURCE = { ffm: '你填的', bodyFat: '用體重和體脂率算的', smm: '用骨骼肌重推估的' } as const

/** 身體數據：性別、年齡、身高、體重、體組成（擇一）、活動量；首次設定也用這個 */
export function BodyInputs({ s, set, n, errors = [] }: { s: BodySpec; set: (p: Partial<BodySpec>) => void; n: Needs; errors?: string[] }) {
  const current: CompMode = s.ffm !== undefined ? 'ffm' : s.smm !== undefined ? 'smm' : s.bodyFat !== undefined ? 'bodyFat' : 'none'
  const [mode, setMode] = useState<CompMode>(current)
  useEffect(() => setMode(current), [current])
  const choose = (m: CompMode) => {
    setMode(m)
    const r1 = (v: number) => Math.round(v * 10) / 10
    set({
      bodyFat: m === 'bodyFat' ? s.bodyFat ?? (s.sex === 'male' ? 20 : 28) : undefined,
      smm: m === 'smm' ? s.smm ?? r1(s.weight * (s.sex === 'male' ? 0.43 : 0.37)) : undefined,
      ffm: m === 'ffm' ? s.ffm ?? r1(s.weight * (s.sex === 'male' ? 0.8 : 0.72)) : undefined,
    })
  }
  return (
    <div className="space-y-4">
      <Group title="生理性別">
        <Chips
          value={s.sex}
          options={[
            { id: 'male', label: '男性' },
            { id: 'female', label: '女性' },
          ]}
          onChange={(sex) => set({ sex })}
        />
      </Group>
      <div className="grid grid-cols-3 gap-2">
        <Slider label="年齡" unit="歲" value={s.age} min={15} max={80} step={1} empty="不填" onChange={(age) => set({ age })} />
        <Slider label="身高" unit="cm" value={s.height} min={140} max={200} step={1} empty="不填" onChange={(height) => set({ height })} />
        <Slider label="體重" unit="kg" value={s.weight} min={35} max={150} step={0.5} onChange={(weight) => set({ weight })} />
      </div>
      <Group title="體組成（知道哪個填哪個，會算得更準）">
        <Chips value={mode} options={COMP_OPTIONS} onChange={choose} />
        {mode === 'bodyFat' && <Slider label="體脂率" unit="%" value={s.bodyFat ?? 0} min={3} max={60} step={0.5} onChange={(bodyFat) => set({ bodyFat })} />}
        {mode === 'smm' && <Slider label="骨骼肌重（SMM，體組成計上看得到）" unit="kg" value={s.smm ?? 0} min={10} max={70} step={0.1} onChange={(smm) => set({ smm })} />}
        {mode === 'ffm' && <Slider label="去脂體重（FFM）" unit="kg" value={s.ffm ?? 0} min={20} max={110} step={0.1} onChange={(ffm) => set({ ffm })} />}
        <p className="px-1 text-[11px] text-muted">
          BMI {n.bmi}（{bmiLabel(n.bmi)}）
          {n.ffm !== undefined && n.ffmSource
            ? `・去脂體重 ${n.ffm} kg（${FFM_SOURCE[n.ffmSource]}），基礎代謝用 Katch-McArdle 公式`
            : '・不知道體組成也沒關係，改用身高、體重、年齡估算'}
        </p>
      </Group>
      {n.assumed.length > 0 && (
        <p className="-mt-2 flex items-start gap-1 px-1 text-[11px] text-honey-ink">
          <Icon name="info" size={14} fill />
          {n.assumed.join('、')}沒填，先用一般值估算；之後補上會更準
        </p>
      )}
      {errors.length > 0 && (
        <div className="rounded-2xl bg-tomato-soft px-3 py-2 text-[12px] text-tomato">
          {errors.map((e) => (
            <div key={e} className="flex items-start gap-1">
              <Icon name="error" size={14} fill />
              {e}
            </div>
          ))}
        </div>
      )}
      <Group title="日常活動量（不含刻意運動）">
        <ActivityPicker value={s.activity} onChange={(activity) => set({ activity })} />
        <p className="px-1 text-[11px] text-muted">運動的消耗會在有運動的那天另外算，這裡只選平常生活的活動量。</p>
      </Group>
    </div>
  )
}

/** 精簡版結果：首次設定時用 */
export function NeedsMini({ n }: { n: Needs }) {
  return (
    <div className="rounded-3xl bg-leaf-soft p-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-leaf-dark">每日目標攝取</div>
          <div className="text-3xl font-bold tabular-nums">
            <CountUp value={n.kcal} />
            <span className="ml-1 text-sm font-normal text-muted">kcal</span>
          </div>
        </div>
        <div className="text-right text-[11px] leading-5 text-muted">
          基礎代謝 <b className="tabular-nums text-ink">{n.bmr}</b>
          <br />
          每日總消耗 <b className="tabular-nums text-ink">{n.tdee}</b>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
        {(
          [
            ['蛋白質', n.protein, n.pct.protein, P],
            ['碳水', n.carbs, n.pct.carbs, C],
            ['脂肪', n.fat, n.pct.fat, F],
          ] as const
        ).map(([label, g, pct, color]) => (
          <div key={label} className="rounded-2xl bg-card/80 py-1.5">
            <div className="text-[11px] text-muted">
              <span style={{ color }}>●</span> {label} {pct}%
            </div>
            <div className="font-bold tabular-nums">{g} g</div>
          </div>
        ))}
      </div>
    </div>
  )
}
