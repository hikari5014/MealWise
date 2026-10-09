import { Food } from './Food'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { db } from '../db'
import {
  FASTING_LABEL,
  fmtTime,
  getPlan,
  MEAL_RULE_ICON,
  MEAL_RULE_IMAGE,
  MEAL_RULE_LABEL,
  ruleDescription,
  type DietPlan,
  type Fasting,
  type MealDecision,
  type MealRule,
  type ResolvedDay,
} from '../lib/dietPlan'
import { haptic, spring } from '../lib/feedback'
import { saveMark } from '../lib/hooks'
import { MEAL_LABEL, MEAL_SLOTS, type Profile } from '../types'
import { Icon } from './Icon'
import { Button, Card, Sheet, Tap, useToast } from './ui'

const RULE_STYLE: Record<MealDecision['rule'], string> = {
  normal: 'bg-ink/5 text-muted',
  lowCarb: 'bg-leaf-soft text-leaf-dark',
  shake: 'bg-sky-soft text-sky',
  light: 'bg-honey-soft text-honey-ink',
  skip: 'bg-ink/10 text-ink/60',
  feast: 'bg-tomato text-white',
}

/** 每餐規則的小標籤 */
export function RuleBadge({ decision, compact = false }: { decision: MealDecision; compact?: boolean }) {
  if (decision.rule === 'normal') return null
  return (
    <motion.span
      key={decision.rule}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 16 }}
      title={decision.reason}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${RULE_STYLE[decision.rule]}`}
    >
      <Icon name={MEAL_RULE_ICON[decision.rule]} size={13} fill />
      {MEAL_RULE_LABEL[decision.rule]}
      {!compact && decision.reason && decision.rule !== 'feast' && <span className="opacity-70">・{decision.reason}</span>}
    </motion.span>
  )
}

/* ───────────── 斷食狀態（每分鐘更新） ───────────── */

const useNowMinutes = () => {
  const get = () => {
    const d = new Date()
    return d.getHours() * 60 + d.getMinutes()
  }
  const [now, setNow] = useState(get)
  useEffect(() => {
    const t = window.setInterval(() => setNow(get()), 30_000)
    return () => window.clearInterval(t)
  }, [])
  return now
}

const dur = (min: number) => {
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return h ? `${h} 小時 ${m} 分` : `${m} 分鐘`
}

function FastingStatus({ day }: { day: ResolvedDay }) {
  const now = useNowMinutes()
  if (day.fastDay) {
    return <StatusRow icon="no_meals" tone="ink" title="今天是禁食日" sub="多喝水，身體不舒服就吃點東西" />
  }
  const w = day.window
  const after = day.eatAfter
  // 今天最早可以吃的時間
  const start = Math.max(w?.start ?? 0, after && after < 1440 ? after : 0)
  const end = w?.end ?? 1440
  if (!w && !after) return null
  if (now < start) {
    const total = start - (w ? w.end - 1440 : 0)
    const progress = total > 0 ? 1 - (start - now) / total : 0
    return (
      <StatusRow
        icon="hourglass_top"
        tone="sky"
        title={`斷食中，${dur(start - now)}後可以吃`}
        sub={`${fmtTime(start)} 開始進食${after && after > (w?.start ?? 0) ? '（大餐後延後）' : ''}`}
        progress={Math.min(1, Math.max(0, progress))}
      />
    )
  }
  if (now <= end) {
    return (
      <StatusRow
        icon="restaurant"
        tone="leaf"
        title={`進食時段，還剩 ${dur(end - now)}`}
        sub={`${fmtTime(start)}–${fmtTime(end)}`}
        progress={(now - start) / Math.max(1, end - start)}
      />
    )
  }
  return (
    <StatusRow
      icon="bedtime"
      tone="sky"
      title="今天的進食時段結束了"
      sub={after && after >= 1440 ? `大餐後要等到明天 ${fmtTime(after)}` : `明天 ${fmtTime(w?.start ?? 0)} 再開始`}
    />
  )
}

function StatusRow({
  icon,
  title,
  sub,
  tone,
  progress,
}: {
  icon: Parameters<typeof Icon>[0]['name']
  title: string
  sub: string
  tone: 'sky' | 'leaf' | 'ink'
  progress?: number
}) {
  const color = { sky: 'rgb(var(--sky))', leaf: 'rgb(var(--leaf))', ink: 'rgb(var(--ink))' }[tone]
  return (
    <div className="mt-3 rounded-2xl bg-cream p-3">
      <div className="flex items-center gap-2">
        <span style={{ color }}>
          <Icon name={icon} size={22} fill motion={icon === 'hourglass_top' ? 'wiggle' : 'none'} />
        </span>
        <div className="flex-1">
          <div className="text-sm font-bold">{title}</div>
          <div className="text-xs text-muted">{sub}</div>
        </div>
      </div>
      {progress !== undefined && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/5">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'spring', stiffness: 60, damping: 16 }}
          />
        </div>
      )}
    </div>
  )
}

/* ───────────── 「今天」頁：今天的計劃 ───────────── */

export function TodayPlanCard({ day, onOpenSettings }: { day: ResolvedDay; onOpenSettings: () => void }) {
  const toast = useToast()
  const special = MEAL_SLOTS.filter((m) => day.meals[m].rule !== 'normal')
  return (
    <Card>
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={async () => {
            haptic(8)
            await saveMark(day.date, { training: !day.training })
            toast(day.training ? '改成休息日' : '改成運動日')
          }}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            day.training ? 'bg-leaf text-on-leaf' : 'bg-ink/5 text-muted'
          }`}
        >
          <Icon name={day.training ? 'directions_run' : 'bedtime'} size={18} fill={day.training} motion={day.training ? 'bounce' : 'none'} />
          {day.training ? '運動日' : '休息日'}
        </motion.button>
        {day.feastMeal && (
          <span className="flex items-center gap-1 rounded-full bg-tomato px-3 py-1.5 text-sm font-medium text-white">
            <Icon name="celebration" size={18} fill motion="wiggle" />
            {MEAL_LABEL[day.feastMeal]}大餐
          </span>
        )}
        <span className="ml-auto text-xs tabular-nums text-muted">目標 {day.kcal} kcal</span>
        <motion.button whileTap={{ scale: 0.88 }} onClick={onOpenSettings} aria-label="飲食計劃設定" className="text-muted">
          <Icon name="tune" size={22} />
        </motion.button>
      </div>
      <FastingStatus day={day} />
      {special.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {special.map((m) => (
            <span key={m} className="flex items-center gap-1 text-xs">
              <span className="text-muted">{MEAL_LABEL[m]}</span>
              <RuleBadge decision={day.meals[m]} compact />
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}

/* ───────────── 「我的」頁：飲食計劃卡片 ───────────── */

export function DietPlanCard({ profile, onOpen }: { profile: Profile; onOpen: () => void }) {
  return (
    <Card>
      <Tap press={0.97} onClick={onOpen} className="flex w-full items-center gap-3 text-left">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-leaf-soft text-leaf-dark">
          <Icon name="tune" size={24} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">飲食計劃</span>
          <span className="block truncate text-xs text-muted">{ruleDescription(getPlan(profile))}</span>
        </span>
        <Icon name="chevron_right" size={22} className="text-muted" />
      </Tap>
    </Card>
  )
}

/* ───────────── 設定 ───────────── */

const RULES: MealRule[] = ['normal', 'lowCarb', 'shake', 'light', 'skip']
const FASTINGS: Fasting[] = ['none', '14:10', '16:8', '18:6', '20:4', 'omad']
const WEEK = ['日', '一', '二', '三', '四', '五', '六']
const POST_FAST = [0, 12, 14, 16, 18, 24]

function Chip({ on, onClick, children, tone = 'leaf' }: { on: boolean; onClick: () => void; children: React.ReactNode; tone?: 'leaf' | 'tomato' }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      animate={{ scale: on ? [1, 1.08, 1] : 1 }}
      transition={{ duration: 0.25 }}
      onClick={() => {
        haptic(6)
        onClick()
      }}
      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-colors ${
        on ? (tone === 'leaf' ? 'bg-leaf text-on-leaf' : 'bg-tomato text-on-leaf') : 'bg-card text-ink shadow-sm'
      }`}
    >
      {children}
    </motion.button>
  )
}

function Toggle({ on, onChange, label, sub }: { on: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <Tap
      type="button"
      onClick={() => {
        haptic(8)
        onChange(!on)
      }}
      className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-sm"
    >
      <span className="flex-1">
        <span className="block text-sm font-medium">{label}</span>
        {sub && <span className="block text-xs text-muted">{sub}</span>}
      </span>
      <span className={`relative h-7 w-12 rounded-full transition-colors ${on ? 'bg-leaf' : 'bg-ink/15'}`}>
        <motion.span
          className="absolute top-1 h-5 w-5 rounded-full bg-card shadow"
          animate={{ left: on ? 24 : 4 }}
          transition={spring}
        />
      </span>
    </Tap>
  )
}

function Section({ icon, title, children }: { icon: Parameters<typeof Icon>[0]['name']; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-1.5 text-sm font-bold">
        <Icon name={icon} size={18} fill className="text-leaf" />
        {title}
      </h3>
      {children}
    </section>
  )
}

export function DietPlanSheet({ open, onClose, profile }: { open: boolean; onClose: () => void; profile: Profile }) {
  const toast = useToast()
  const [plan, setPlan] = useState<DietPlan>(getPlan(profile))

  useEffect(() => {
    if (open) setPlan(getPlan(profile))
  }, [open, profile])

  const set = (patch: Partial<DietPlan>) => setPlan((p) => ({ ...p, ...patch }))

  const save = async () => {
    await db.profile.update('me', { plan })
    haptic([10, 30, 10])
    onClose()
    toast('飲食計劃已更新')
  }

  return (
    <Sheet open={open} onClose={onClose} title="飲食計劃">
      <div className="space-y-6">
        <Section icon="hourglass_top" title="間歇性斷食">
          <div className="flex flex-wrap gap-2">
            {FASTINGS.map((f) => (
              <Chip key={f} on={plan.fasting === f} onClick={() => set({ fasting: f })}>
                {FASTING_LABEL[f]}
              </Chip>
            ))}
          </div>
          <AnimatePresence initial={false}>
            {plan.fasting !== 'none' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between rounded-2xl bg-card p-3 shadow-sm">
                  <span className="text-sm">進食時段從</span>
                  <span className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => set({ windowStart: Math.max(0, plan.windowStart - 30) })}
                      className="grid h-8 w-8 place-items-center rounded-full bg-ink/5"
                      aria-label="提早半小時"
                    >
                      <Icon name="remove" size={18} />
                    </motion.button>
                    <span className="w-14 text-center font-bold tabular-nums">{fmtTime(plan.windowStart)}</span>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => set({ windowStart: Math.min(22 * 60, plan.windowStart + 30) })}
                      className="grid h-8 w-8 place-items-center rounded-full bg-ink/5"
                      aria-label="延後半小時"
                    >
                      <Icon name="add" size={18} />
                    </motion.button>
                  </span>
                </div>
                <p className="mt-1 px-1 text-xs text-muted">在進食時段以外的餐，會自動標成「不吃」。</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        <Section icon="restaurant" title="每一餐想怎麼吃">
          <div className="space-y-2">
            {MEAL_SLOTS.map((m) => (
              <div key={m} className="rounded-2xl bg-card p-3 shadow-sm">
                <div className="mb-2 text-sm font-medium">{MEAL_LABEL[m]}</div>
                <div className="flex flex-wrap gap-1.5">
                  {RULES.map((r) => (
                    <Chip key={r} on={plan.meals[m] === r} onClick={() => set({ meals: { ...plan.meals, [m]: r } })}>
                      <Food id={MEAL_RULE_IMAGE[r]} size={20} />
                      {MEAL_RULE_LABEL[r]}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="px-1 text-xs text-muted">快速挑選和推薦會照這裡挑食譜，例如「蛋白飲」只排蛋白飲、「不吃澱粉」只排低醣料理。</p>
        </Section>

        <Section icon="fitness_center" title="運動日">
          <div className="flex justify-between gap-1">
            {WEEK.map((w, i) => {
              const on = plan.trainingDays.includes(i)
              return (
                <motion.button
                  key={w}
                  whileTap={{ scale: 0.85 }}
                  animate={{ y: on ? -2 : 0 }}
                  onClick={() => {
                    haptic(6)
                    set({ trainingDays: on ? plan.trainingDays.filter((d) => d !== i) : [...plan.trainingDays, i] })
                  }}
                  className={`grid h-10 w-10 place-items-center rounded-full text-sm font-medium transition-colors ${
                    on ? 'bg-leaf text-on-leaf shadow-card' : 'bg-card shadow-sm'
                  }`}
                >
                  {w}
                </motion.button>
              )
            })}
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-card p-3 shadow-sm">
            <span className="text-sm">運動日多吃</span>
            <span className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => set({ trainingKcal: Math.max(0, plan.trainingKcal - 50) })}
                className="grid h-8 w-8 place-items-center rounded-full bg-ink/5"
                aria-label="減少"
              >
                <Icon name="remove" size={18} />
              </motion.button>
              <span className="w-20 text-center font-bold tabular-nums">+{plan.trainingKcal} kcal</span>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => set({ trainingKcal: Math.min(1000, plan.trainingKcal + 50) })}
                className="grid h-8 w-8 place-items-center rounded-full bg-ink/5"
                aria-label="增加"
              >
                <Icon name="add" size={18} />
              </motion.button>
            </span>
          </div>
          <Toggle
            on={plan.carbCycling}
            onChange={(carbCycling) => set({ carbCycling })}
            label="碳循環"
            sub="運動日正常吃澱粉，休息日的午晚餐不吃澱粉"
          />
        </Section>

        <Section icon="celebration" title="大餐日規則">
          <p className="px-1 text-xs text-muted">在「菜單 → 月曆」標記哪天有大餐，這些規則就會自動套用。</p>
          <Toggle
            on={plan.feast.dayLight}
            onChange={(dayLight) => set({ feast: { ...plan.feast, dayLight } })}
            label="大餐當天其他餐吃清淡"
          />
          <Toggle
            on={plan.feast.preLowCarb}
            onChange={(preLowCarb) => set({ feast: { ...plan.feast, preLowCarb } })}
            label="大餐之前的餐不吃澱粉"
          />
          <div className="rounded-2xl bg-card p-3 shadow-sm">
            <div className="mb-2 text-sm">大餐後至少間隔</div>
            <div className="flex flex-wrap gap-1.5">
              {POST_FAST.map((h) => (
                <Chip
                  key={h}
                  tone="tomato"
                  on={plan.feast.postFastHours === h}
                  onClick={() => set({ feast: { ...plan.feast, postFastHours: h } })}
                >
                  {h ? `${h} 小時` : '不限制'}
                </Chip>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">例如晚餐大餐 + 16 小時：隔天 10:30 以後才吃第一餐。</p>
          </div>
        </Section>

        <Button className="w-full" onClick={save}>
          儲存計劃
        </Button>
        <p className="pb-2 text-center text-[11px] text-muted">
          斷食與禁食不適合每個人。懷孕、哺乳、糖尿病或有飲食疾患請先諮詢醫師。
        </p>
      </div>
    </Sheet>
  )
}
