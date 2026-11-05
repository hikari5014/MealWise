// 首頁「今日熱量收支」：每日總消耗＋今天運動額外消耗 − 吃進去的＝熱量赤字
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { calcEnergy, goalDelta } from '../lib/nutrition'
import { exerciseBurn } from '../lib/workout'
import type { Profile } from '../types'
import { Icon } from './Icon'
import { CountUp } from './Ring'
import { Card, Tap } from './ui'

export function EnergyBalanceCard({ profile, date, eaten, training, onSetup }: { profile: Profile; date: string; eaten: number; training: boolean; onSetup: () => void }) {
  const workouts = useLiveQuery(() => db.workouts.where('date').equals(date).toArray(), [date]) ?? []
  const latest = useLiveQuery(() => db.body.orderBy('date').reverse().filter((r) => !!r.weight).first(), [])
  const body = profile.body
  if (!body) {
    if (!training && !workouts.length) return null
    return (
      <Card className="flex items-center gap-3">
        <Icon name="local_fire_department" size={26} fill className="text-tomato" />
        <p className="flex-1 text-sm">填好身體數據，運動日會自動算出運動消耗和熱量赤字。</p>
        <Tap onClick={onSetup} className="shrink-0 rounded-full bg-leaf px-3 py-1.5 text-xs text-on-leaf">
          去設定
        </Tap>
      </Card>
    )
  }
  const weight = latest?.weight ?? body.weight
  const e = calcEnergy({ ...body, weight })
  const ex = exerciseBurn(workouts, weight, e.bmr)
  const burn = Math.round(e.tdee + ex.kcal)
  const balance = burn - Math.round(eaten)
  const goal = -goalDelta(body) // 目標赤字（正數＝要少吃）
  const deficit = balance >= 0
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 font-bold">
          <Icon name="local_fire_department" size={22} fill className="text-tomato" />
          今日熱量收支
        </h2>
        {training && <span className="rounded-full bg-tomato-soft px-2 py-0.5 text-[11px] text-tomato">運動日</span>}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1 text-center">
        <Box label="消耗" value={burn} sub={ex.kcal ? `含運動 ${ex.kcal}` : '日常消耗'} />
        <span className="text-muted">−</span>
        <Box label="吃進" value={Math.round(eaten)} sub="已記錄" />
        <span className="text-muted">=</span>
        <Box label={deficit ? '熱量赤字' : '熱量盈餘'} value={Math.abs(balance)} sub={deficit ? '吃得比用得少' : '吃得比用得多'} tone={deficit ? 'text-leaf-dark' : 'text-tomato'} />
      </div>
      <div className="rounded-2xl bg-cream px-3 py-2 text-[12px] leading-relaxed">
        {ex.kcal > 0 ? (
          <p>
            <Icon name="fitness_center" size={15} className="mr-1 align-[-3px] text-tomato" />
            今天運動 {ex.min} 分鐘，額外消耗約 <b>{ex.kcal}</b> kcal
            {ex.cardioKcal > 0 && ex.strengthKcal > 0 && <span className="text-muted">（有氧 {ex.cardioKcal}・重訓 {ex.strengthKcal}）</span>}
          </p>
        ) : training ? (
          <div className="flex items-center gap-1.5 text-muted">
            <Icon name="fitness_center" size={16} />
            今天是運動日，記錄訓練後會自動加上運動消耗
          </div>
        ) : null}
        <div className="text-muted">
          {goal > 0 ? `目標每天赤字約 ${goal} kcal` : goal < 0 ? `目標每天盈餘約 ${-goal} kcal` : '目標是熱量平衡'}
          {balance - goal >= 0 ? `・今天還可以吃 ${balance - goal} kcal，仍然達到目標` : `・已經超過目標 ${goal - balance} kcal`}
        </div>
      </div>
      <p className="text-[10px] text-muted">消耗＝每日總消耗 {Math.round(e.tdee)}（基礎代謝 {Math.round(e.bmr)} × 活動 {e.factor}）＋ 運動額外消耗；都是估算值。</p>
    </Card>
  )
}

function Box({ label, value, sub, tone = '' }: { label: string; value: number; sub: string; tone?: string }) {
  return (
    <div className="rounded-2xl bg-cream px-1 py-2">
      <div className="text-[11px] text-muted">{label}</div>
      <div className={`text-lg font-bold tabular-nums ${tone}`}>
        <CountUp value={value} />
      </div>
      <div className="truncate text-[10px] text-muted">{sub}</div>
    </div>
  )
}
