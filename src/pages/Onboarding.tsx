import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { AvoidPicker } from '../components/AvoidPicker'
import { Button } from '../components/ui'
import { db } from '../db'
import { haptic, spring } from '../lib/feedback'
import { suggestKcal } from '../lib/meal'
import { GOAL_LABEL, type Goal, type Profile } from '../types'

const GOALS: { value: Goal; emoji: string; hint: string }[] = [
  { value: 'lose', emoji: '🌿', hint: '少一點熱量、多一點蛋白質' },
  { value: 'maintain', emoji: '⚖️', hint: '營養均衡、吃得開心' },
  { value: 'gain', emoji: '💪', hint: '多一點熱量與蛋白質' },
]

const DEFAULT: Profile = {
  id: 'me',
  name: '',
  goal: 'maintain',
  kcal: suggestKcal('maintain'),
  waterMl: 2000,
  vegetarian: false,
  avoid: [],
  servings: 1,
}

/** 首次設定（3 步驟），也用在「修改需求」 */
export default function Onboarding({ initial, onDone }: { initial?: Profile; onDone?: () => void }) {
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [p, setP] = useState<Profile>(initial ?? DEFAULT)
  const set = (patch: Partial<Profile>) => setP((cur) => ({ ...cur, ...patch }))

  const go = (next: number) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  const finish = async () => {
    haptic([10, 40, 10, 40, 20])
    await db.profile.put(p)
    onDone?.()
  }

  const steps = [
    <div key="goal" className="space-y-4">
      <h2 className="text-xl font-bold">想要怎麼吃？</h2>
      <input
        value={p.name}
        onChange={(e) => set({ name: e.target.value })}
        placeholder="怎麼稱呼你？（可不填）"
        className="w-full rounded-2xl bg-white px-4 py-3 shadow-card outline-none ring-leaf/40 focus:ring-2"
      />
      {GOALS.map((g) => {
        const active = p.goal === g.value
        return (
          <motion.button
            key={g.value}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              haptic(8)
              set({ goal: g.value, kcal: suggestKcal(g.value) })
            }}
            className={`relative flex w-full items-center gap-4 rounded-3xl p-4 text-left shadow-card transition-colors ${
              active ? 'bg-leaf text-white' : 'bg-white'
            }`}
          >
            <span className="text-3xl">{g.emoji}</span>
            <span>
              <span className="block font-bold">{GOAL_LABEL[g.value]}</span>
              <span className={`text-sm ${active ? 'text-white/80' : 'text-muted'}`}>{g.hint}</span>
            </span>
          </motion.button>
        )
      })}
    </div>,

    <div key="diet" className="space-y-4">
      <h2 className="text-xl font-bold">有什麼不吃的嗎？</h2>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          haptic(8)
          set({ vegetarian: !p.vegetarian })
        }}
        className={`flex w-full items-center justify-between rounded-3xl p-4 shadow-card transition-colors ${
          p.vegetarian ? 'bg-leaf text-white' : 'bg-white'
        }`}
      >
        <span className="font-bold">🥬 我吃素（蛋奶素）</span>
        <span>{p.vegetarian ? '是' : '否'}</span>
      </motion.button>
      <div>
        <div className="mb-2 text-sm text-muted">過敏或不想吃的（點分類可以細選）</div>
        <AvoidPicker profile={p} onChange={(avoid) => set({ avoid })} />
      </div>
    </div>,

    <div key="amount" className="space-y-4">
      <h2 className="text-xl font-bold">每天的目標</h2>
      <Stepper label="🔥 熱量" unit="kcal" value={p.kcal} step={100} min={1000} max={4000} onChange={(kcal) => set({ kcal })} />
      <Stepper label="💧 喝水" unit="ml" value={p.waterMl} step={250} min={1000} max={5000} onChange={(waterMl) => set({ waterMl })} />
      <Stepper label="🍽 幾人份" unit="人" value={p.servings} step={1} min={1} max={8} onChange={(servings) => set({ servings })} />
      <p className="px-1 text-xs text-muted">「幾人份」會用來計算採購清單的份量。之後都可以在「我的」裡修改。</p>
    </div>,
  ]

  return (
    <div
      className={`mx-auto flex max-w-lg flex-col px-5 ${
        initial ? 'pb-2 pt-2' : 'min-h-dvh pb-[calc(24px+env(safe-area-inset-bottom))] pt-[calc(24px+env(safe-area-inset-top))]'
      }`}
    >
      {!initial && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="text-4xl">🍱</div>
          <h1 className="mt-2 text-2xl font-bold">歡迎來到好食光</h1>
          <p className="text-sm text-muted">花 30 秒告訴我你的需求，之後就交給我。</p>
        </motion.div>
      )}

      <div className="mb-6 flex gap-2">
        {steps.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
            <motion.div className="h-full bg-leaf" initial={false} animate={{ width: i <= step ? '100%' : '0%' }} transition={spring} />
          </div>
        ))}
      </div>

      <div className="relative flex-1">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <Button variant="soft" onClick={() => go(step - 1)}>
            上一步
          </Button>
        )}
        <Button className="flex-1" onClick={() => (step < steps.length - 1 ? go(step + 1) : finish())}>
          {step < steps.length - 1 ? '下一步' : initial ? '儲存' : '開始使用 🎉'}
        </Button>
      </div>
    </div>
  )
}

function Stepper({
  label,
  unit,
  value,
  step,
  min,
  max,
  onChange,
}: {
  label: string
  unit: string
  value: number
  step: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  const change = (d: number) => {
    const next = Math.min(max, Math.max(min, value + d))
    if (next !== value) {
      haptic(6)
      onChange(next)
    }
  }
  return (
    <div className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-card">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => change(-step)}
          aria-label={`減少${label}`}
          className="grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-lg"
        >
          −
        </motion.button>
        <div className="w-20 overflow-hidden text-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.14 }}
              className="inline-block font-bold tabular-nums"
            >
              {value}
            </motion.span>
          </AnimatePresence>
          <span className="ml-1 text-xs text-muted">{unit}</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => change(step)}
          aria-label={`增加${label}`}
          className="grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-lg"
        >
          ＋
        </motion.button>
      </div>
    </div>
  )
}
