import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { BodyCard } from '../components/BodyCard'
import { DietPlanCard, DietPlanSheet } from '../components/DietPlan'
import { TasteCard, TasteSheet } from '../components/Taste'
import { Icon } from '../components/Icon'
import { AboutCard } from '../components/Update'
import { Button, Card, Sheet, Tap, useToast } from '../components/ui'
import { db } from '../db'
import { addDays, todayKey, weekdayLabel } from '../lib/date'
import { useLiveQuery } from 'dexie-react-hooks'
import { useLogs } from '../lib/hooks'
import { macroTargets, sumNutrition } from '../lib/meal'
import { summarizeAvoid } from '../data/avoid'
import { GOAL_LABEL, type Profile } from '../types'
import type { IconName } from '../lib/icons'
import Onboarding from './Onboarding'

export default function Me({ profile }: { profile: Profile }) {
  const [editing, setEditing] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [planSheet, setPlanSheet] = useState(false)
  const [tasteSheet, setTasteSheet] = useState(false)
  const toast = useToast()
  const today = todayKey()
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)), [today])
  const logs = useLogs(days)
  const water = useLiveQuery(() => db.water.where('date').anyOf(days).toArray(), [days.join()]) ?? []
  const targets = macroTargets(profile)

  const daily = days.map((d) => ({
    date: d,
    n: sumNutrition(logs.filter((l) => l.date === d)),
    water: water.find((w) => w.date === d)?.ml ?? 0,
  }))
  const logged = daily.filter((d) => d.n.kcal > 0)
  const avg = (fn: (d: (typeof daily)[number]) => number, list = logged) =>
    list.length ? Math.round(list.reduce((s, d) => s + fn(d), 0) / list.length) : 0
  const maxKcal = Math.max(profile.kcal * 1.2, ...daily.map((d) => d.n.kcal))

  const tips: { icon: IconName; text: string }[] = []
  if (logged.length >= 2) {
    if (avg((d) => d.n.protein) < targets.protein * 0.8) tips.push({ icon: 'egg', text: '蛋白質常常不太夠，可以多加一顆蛋或一杯豆漿' })
    if (avg((d) => d.n.fiber) < 20) tips.push({ icon: 'nutrition', text: '纖維偏少，多一份蔬菜或水果吧' })
    if (avg((d) => d.water, daily) < profile.waterMl * 0.7) tips.push({ icon: 'water_drop', text: '最近喝水比較少，記得補水' })
  }

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <h1 className="text-2xl font-bold">我的</h1>
      </header>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-bold">{profile.name || '好食光的你'}</div>
            <div className="text-sm text-muted">{GOAL_LABEL[profile.goal]}</div>
          </div>
          <Button variant="soft" className="px-3 py-2 text-sm" onClick={() => setEditing(true)}>
            修改需求
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            ['熱量', `${profile.kcal}`, 'kcal'],
            ['喝水', `${profile.waterMl}`, 'ml'],
            ['份量', `${profile.servings}`, '人'],
          ].map(([l, v, u]) => (
            <div key={l} className="rounded-2xl bg-cream py-2">
              <div className="font-bold tabular-nums">{v}</div>
              <div className="text-[11px] text-muted">
                {l}（{u}）
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-muted">
          {profile.vegetarian ? '蛋奶素・' : ''}
          {profile.avoid.length ? `避開：${summarizeAvoid(profile.avoid).join('、')}` : '沒有忌口'}
        </div>
      </Card>

      <DietPlanCard profile={profile} onOpen={() => setPlanSheet(true)} />
      <TasteCard profile={profile} onOpen={() => setTasteSheet(true)} />

      <BodyCard />

      <Card>
        <h2 className="mb-3 font-bold">近 7 天熱量</h2>
        <div className="relative flex h-36 items-end gap-2">
          <div
            className="absolute inset-x-0 border-t border-dashed border-leaf/50"
            style={{ bottom: `${(profile.kcal / maxKcal) * 100}%` }}
          />
          {daily.map((d, i) => (
            <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <motion.div
                className={`w-full rounded-t-lg ${d.n.kcal > profile.kcal * 1.05 ? 'bg-tomato' : 'bg-leaf'}`}
                initial={{ height: 0 }}
                animate={{ height: `${(d.n.kcal / maxKcal) * 100}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 18, delay: i * 0.04 }}
              />
              <span className={`text-[11px] ${d.date === today ? 'font-bold text-leaf' : 'text-muted'}`}>{weekdayLabel(d.date)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <div className="font-bold tabular-nums">{avg((d) => d.n.kcal)}</div>
            <div className="text-[11px] text-muted">平均 kcal</div>
          </div>
          <div>
            <div className="font-bold tabular-nums">{avg((d) => d.n.protein)}g</div>
            <div className="text-[11px] text-muted">平均蛋白質</div>
          </div>
          <div>
            <div className="font-bold tabular-nums">{avg((d) => d.water, daily)}</div>
            <div className="text-[11px] text-muted">平均喝水 ml</div>
          </div>
        </div>
      </Card>

      {tips.length > 0 && (
        <Card className="space-y-2 bg-honey-soft">
          <h2 className="flex items-center gap-1.5 font-bold">
            <Icon name="lightbulb" size={20} fill className="text-honey" />
            小提醒
          </h2>
          {tips.map((t) => (
            <p key={t.text} className="flex items-center gap-2 text-sm">
              <Icon name={t.icon} size={20} fill className="text-honey" motion="float" />
              {t.text}
            </p>
          ))}
        </Card>
      )}

      <AboutCard />
      <TasteSheet open={tasteSheet} onClose={() => setTasteSheet(false)} profile={profile} />
      <DietPlanSheet open={planSheet} onClose={() => setPlanSheet(false)} profile={profile} />

      <div className="space-y-2 pt-2 text-center text-xs text-muted">
        <p className="flex items-center justify-center gap-1">
          <Icon name="lock" size={14} />
          資料只存在這台裝置上，不會上傳。
        </p>
        <Tap className="underline" onClick={() => setConfirmReset(true)}>
          清除所有資料
        </Tap>
      </div>

      <Sheet open={editing} onClose={() => setEditing(false)}>
        <div className="-mx-5">
          <Onboarding
            initial={profile}
            onDone={() => {
              setEditing(false)
              toast('已更新你的需求')
            }}
          />
        </div>
      </Sheet>

      <Sheet open={confirmReset} onClose={() => setConfirmReset(false)} title="確定要清除嗎？">
        <p className="mb-4 text-sm text-muted">菜單、記錄、清單和設定都會刪除，無法復原。</p>
        <div className="flex gap-3">
          <Button variant="soft" className="flex-1" onClick={() => setConfirmReset(false)}>
            取消
          </Button>
          <Button
            className="flex-1 !bg-tomato"
            onClick={async () => {
              await Promise.all(db.tables.map((t) => t.clear()))
              setConfirmReset(false)
            }}
          >
            清除
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
