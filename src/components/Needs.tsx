import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { db } from '../db'
import { haptic, spring } from '../lib/feedback'
import { useBody } from '../lib/hooks'
import {
  ACTIVITY,
  bmiLabel,
  calcNeeds,
  defaultSpec,
  DEFAULT_PROTEIN,
  PACES,
  PROTEIN_LEVELS,
  type BodySpec,
} from '../lib/nutrition'
import { GOAL_LABEL, type Goal, type Profile } from '../types'
import { Food } from './Food'
import { Icon } from './Icon'
import { Button, Card, Sheet, Tap, useToast } from './ui'

/** 「我的」頁的營養需求卡：顯示目前目標，點開用身體數據重新計算 */
export function NeedsCard({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false)
  const m = profile.macros
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 font-bold">
          <Food id="scale" size={24} />
          營養需求
        </h2>
        <Button variant="soft" className="px-3 py-1.5 text-xs" onClick={() => setOpen(true)}>
          {profile.body ? '重新計算' : '用身體數據計算'}
        </Button>
      </div>
      {m ? (
        <>
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <Cell label="熱量" value={profile.kcal} unit="kcal" />
            <Cell label="蛋白質" value={m.protein} unit="g" />
            <Cell label="脂肪" value={m.fat} unit="g" />
            <Cell label="纖維" value={m.fiber} unit="g" />
          </div>
          <p className="mt-2 text-[11px] text-muted">
            依 {profile.body!.height} cm・{profile.body!.weight} kg・{ACTIVITY.find((a) => a.id === profile.body!.activity)?.label}活動量計算；碳水會依當天熱量自動補足，排菜單時會挑熱量和蛋白質剛好的料理
          </p>
        </>
      ) : (
        <p className="text-sm text-muted">填身高、體重、活動量和目標，自動算出你每天需要的熱量和蛋白質，排菜單時會照這個挑料理。</p>
      )}
      <NeedsSheet open={open} onClose={() => setOpen(false)} profile={profile} />
    </Card>
  )
}

function Cell({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-2xl bg-cream py-2">
      <div className="text-sm font-bold tabular-nums">{value}</div>
      <div className="text-[10px] text-muted">
        {label}（{unit}）
      </div>
    </div>
  )
}

export function NeedsSheet({ open, onClose, profile }: { open: boolean; onClose: () => void; profile: Profile }) {
  const toast = useToast()
  const records = useBody(60)
  const [s, setS] = useState<BodySpec>(() => defaultSpec(profile))
  const [why, setWhy] = useState(false)

  // 打開時帶入上次的設定；沒設定過就用最近量的體重、體脂
  useEffect(() => {
    if (!open) return
    const latest = [...records].reverse()
    setS(defaultSpec(profile, latest.find((r) => r.weight)?.weight, latest.find((r) => r.bodyFat)?.bodyFat))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const set = (patch: Partial<BodySpec>) => setS((x) => ({ ...x, ...patch }))
  const n = calcNeeds(s)
  const perKg = s.proteinPerKg ?? DEFAULT_PROTEIN[s.goal]

  const apply = async () => {
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

  return (
    <Sheet open={open} onClose={onClose} title="營養需求計算">
      <div className="space-y-4 pb-20">
        <Group title="基本資料">
          <Chips
            value={s.sex}
            options={[
              { id: 'female', label: '女生' },
              { id: 'male', label: '男生' },
            ]}
            onChange={(sex) => set({ sex })}
          />
          <div className="grid grid-cols-2 gap-2">
            <Num label="年齡" unit="歲" value={s.age} step={1} min={12} max={90} onChange={(age) => set({ age })} />
            <Num label="身高" unit="cm" value={s.height} step={1} min={120} max={220} onChange={(height) => set({ height })} />
            <Num label="體重" unit="kg" value={s.weight} step={0.5} min={30} max={200} onChange={(weight) => set({ weight })} />
            <Num label="體脂（可不填）" unit="%" value={s.bodyFat ?? 0} step={0.5} min={0} max={60} onChange={(v) => set({ bodyFat: v || undefined })} />
          </div>
          <p className="text-[11px] text-muted">
            BMI {n.bmi}（{bmiLabel(n.bmi)}）{s.bodyFat ? '・有體脂會算得更準' : '・知道體脂的話填上會更準'}
          </p>
        </Group>

        <Group title="平常活動量">
          <div className="space-y-1.5">
            {ACTIVITY.map((a) => (
              <Option key={a.id} on={s.activity === a.id} onTap={() => set({ activity: a.id })} label={a.label} hint={a.hint} />
            ))}
          </div>
        </Group>

        <Group title="目標">
          <Chips
            value={s.goal}
            options={(['lose', 'maintain', 'gain'] as Goal[]).map((g) => ({ id: g, label: GOAL_LABEL[g] }))}
            onChange={(goal) => set({ goal, proteinPerKg: undefined })}
          />
          <AnimatePresence initial={false}>
            {s.goal !== 'maintain' && (
              <motion.div key={s.goal} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="grid grid-cols-3 gap-1.5 overflow-hidden">
                {PACES[s.goal].map((p) => (
                  <Tap
                    key={p.id}
                    onClick={() => set({ pace: p.id })}
                    className={`rounded-2xl px-2 py-2 text-center transition-colors ${s.pace === p.id ? 'bg-leaf text-on-leaf' : 'bg-card shadow-card'}`}
                  >
                    <div className="text-sm font-medium">{p.label}</div>
                    <div className={`text-[10px] ${s.pace === p.id ? 'opacity-80' : 'text-muted'}`}>{p.hint}</div>
                  </Tap>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Group>

        <Group title={`蛋白質：每公斤體重 ${perKg} g`}>
          <div className="flex gap-1.5">
            {PROTEIN_LEVELS.map((v) => (
              <Tap
                key={v}
                onClick={() => set({ proteinPerKg: v })}
                className={`flex-1 rounded-xl py-1.5 text-xs tabular-nums transition-colors ${perKg === v ? 'bg-leaf text-on-leaf' : 'bg-card shadow-card'}`}
              >
                {v}
              </Tap>
            ))}
          </div>
          <p className="text-[11px] text-muted">一般人 1.2–1.4；有在重訓、減脂想保住肌肉建議 1.6–2.2</p>
        </Group>

        <motion.div layout transition={spring} className="rounded-3xl bg-leaf-soft p-4">
          <div className="text-xs text-leaf-dark">你每天大約需要</div>
          <div className="mt-1 flex items-end gap-1">
            <motion.span key={n.kcal} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="text-3xl font-bold tabular-nums">
              {n.kcal}
            </motion.span>
            <span className="pb-1 text-sm text-muted">kcal</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
            <Macro label="蛋白質" value={n.protein} color="rgb(var(--tomato))" />
            <Macro label="碳水" value={n.carbs} color="rgb(var(--honey))" />
            <Macro label="脂肪" value={n.fat} color="rgb(var(--sky))" />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted">
            <span>纖維 {n.fiber} g</span>
            <span>喝水 {n.water} ml</span>
          </div>
          {n.floored && (
            <p className="mt-2 flex items-start gap-1 text-[11px] text-tomato">
              <Icon name="warning" size={14} fill />
              吃太少會掉肌肉、代謝變慢，已幫你拉到安全下限
            </p>
          )}
          <Tap press={0.98} onClick={() => setWhy(!why)} className="mt-2 flex w-full items-center gap-1 text-left text-[11px] text-leaf-dark">
            怎麼算的？
            <motion.span animate={{ rotate: why ? 180 : 0 }} className="grid">
              <Icon name="expand_more" size={16} />
            </motion.span>
          </Tap>
          <AnimatePresence initial={false}>
            {why && (
              <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="list-disc space-y-1 overflow-hidden pl-4 pt-1 text-[11px] leading-relaxed text-ink/75">
                <li>
                  躺著不動一天就會用掉約 <b>{n.bmr}</b> kcal（基礎代謝，{n.method === 'katch' ? '用去脂體重算' : '用身高體重年齡算'}）
                </li>
                <li>
                  加上活動量，一天大約消耗 <b>{n.tdee}</b> kcal
                </li>
                <li>{s.goal === 'maintain' ? '維持體重就吃差不多的量' : s.goal === 'lose' ? `減脂每天少吃一些：${PACES.lose.find((p) => p.id === s.pace)!.kcal} kcal` : `增肌每天多吃一些：+${PACES.gain.find((p) => p.id === s.pace)!.kcal} kcal`}</li>
                <li>
                  蛋白質＝體重 × {perKg} g{n.bmi >= 30 ? '（體重偏高時用標準體重算）' : ''}；脂肪約佔 27%；剩下的給碳水
                </li>
                <li>運動日會依「飲食計劃」多加的熱量，自動加在碳水上</li>
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="sticky bottom-0 -mx-5 bg-gradient-to-t from-cream via-cream to-transparent px-5 pb-1 pt-4">
          <Button className="w-full" onClick={apply}>
            套用到我的目標
          </Button>
        </div>
      </div>
    </Sheet>
  )
}

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
          className={`flex-1 rounded-2xl py-2 text-sm transition-colors ${value === o.id ? 'bg-ink text-cream' : 'bg-card shadow-card'}`}
        >
          {o.label}
        </Tap>
      ))}
    </div>
  )
}

function Option({ on, onTap, label, hint }: { on: boolean; onTap: () => void; label: string; hint: string }) {
  return (
    <Tap
      press={0.98}
      onClick={() => {
        haptic(6)
        onTap()
      }}
      className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left transition-colors ${on ? 'bg-leaf text-on-leaf' : 'bg-card shadow-card'}`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className={`text-[11px] ${on ? 'opacity-80' : 'text-muted'}`}>{hint}</span>
      {on && <Icon name="check" size={18} weight={600} className="ml-auto" />}
    </Tap>
  )
}

function Num({ label, unit, value, step, min, max, onChange }: { label: string; unit: string; value: number; step: number; min: number; max: number; onChange: (v: number) => void }) {
  const clamp = (v: number) => Math.min(max, Math.max(min, +v.toFixed(1)))
  return (
    <div className="rounded-2xl bg-card px-2 py-1.5 shadow-card">
      <div className="px-1 text-[10px] text-muted">{label}</div>
      <div className="flex items-center">
        <Tap onClick={() => onChange(clamp(value - step))} aria-label={`減少${label}`} className="grid h-8 w-8 place-items-center text-muted">
          <Icon name="remove" size={16} />
        </Tap>
        <input
          inputMode="decimal"
          aria-label={label}
          value={value || ''}
          placeholder="—"
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            onChange(Number.isFinite(v) ? Math.min(max, v) : 0)
          }}
          onBlur={() => value && onChange(clamp(value))}
          className="w-full min-w-0 bg-transparent text-center text-base font-bold tabular-nums outline-none"
        />
        <span className="text-[10px] text-muted">{unit}</span>
        <Tap onClick={() => onChange(clamp(value + step))} aria-label={`增加${label}`} className="grid h-8 w-8 place-items-center text-muted">
          <Icon name="add" size={16} />
        </Tap>
      </div>
    </div>
  )
}

function Macro({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl bg-card/80 py-2">
      <div className="text-base font-bold tabular-nums" style={{ color }}>
        {value}
        <span className="ml-0.5 text-[10px] font-normal text-muted">g</span>
      </div>
      <div className="text-[10px] text-muted">{label}</div>
    </div>
  )
}
