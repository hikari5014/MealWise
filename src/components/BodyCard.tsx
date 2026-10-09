import { motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { monthDay, todayKey } from '../lib/date'
import { haptic, spring } from '../lib/feedback'
import { isIOS, weightChange } from '../lib/health'
import { useBody } from '../lib/hooks'
import type { BodyRecord } from '../types'
import { Food } from './Food'
import { PREF_SETUP, PREF_TIP_DISMISSED, useHealth } from './HealthSync'
import { Icon } from './Icon'
import { CountUp } from './Ring'
import { Button, Card, Tap } from './ui'

const usePrefValue = (key: string) => useLiveQuery(() => db.prefs.get(key).then((p) => p?.value ?? null), [key])

/** 體重折線（會畫出來的動畫） */
function Sparkline({ records }: { records: BodyRecord[] }) {
  const ws = records.filter((r) => r.weight !== undefined)
  if (ws.length < 2) return null
  const W = 280
  const H = 64
  const vals = ws.map((r) => r.weight!)
  const min = Math.min(...vals) - 0.5
  const max = Math.max(...vals) + 0.5
  const pts = ws.map((r, i) => [(i / (ws.length - 1)) * W, H - ((r.weight! - min) / (max - min)) * H] as const)
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]
  return (
    <svg viewBox={`-6 -6 ${W + 12} ${H + 12}`} className="mt-2 h-auto w-full">
      <motion.path
        d={d}
        fill="none"
        style={{ stroke: 'rgb(var(--leaf))' }}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />
      <motion.circle
        cx={last[0]}
        cy={last[1]}
        r={5}
        style={{ fill: 'rgb(var(--leaf))' }}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.5, 1] }}
        transition={{ delay: 0.85, duration: 0.4 }}
      />
    </svg>
  )
}

/** 「我的」頁：身體數據 */
export function BodyCard() {
  const records = useBody(30)
  const health = useHealth()
  const setup = usePrefValue(PREF_SETUP)
  const ios = isIOS()
  const latest = [...records].reverse().find((r) => r.weight !== undefined)
  const fat = [...records].reverse().find((r) => r.bodyFat !== undefined)?.bodyFat
  const change = weightChange(records)

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 font-bold">
          <Food id="scale" size={24} />
          身體數據
        </h2>
        {ios && (
          <Tap type="button" onClick={() => health.openGuide(0)} className="text-xs text-leaf-dark underline">
            {setup ? '捷徑教學' : '連結 Apple 健康'}
          </Tap>
        )}
      </div>

      {latest ? (
        <>
          <div className="flex items-end gap-5">
            <div>
              <div className="text-3xl font-bold tabular-nums">
                {latest.weight}
                <span className="ml-1 text-sm font-normal text-muted">kg</span>
              </div>
              <div className="text-xs text-muted">
                {monthDay(latest.date)}・{latest.source === 'health' ? '來自健康' : '手動輸入'}
              </div>
            </div>
            {fat !== undefined && (
              <div>
                <div className="text-xl font-bold tabular-nums">
                  {fat}
                  <span className="ml-0.5 text-xs font-normal text-muted">%</span>
                </div>
                <div className="text-xs text-muted">體脂</div>
              </div>
            )}
            {change !== undefined && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 14, delay: 0.3 }}
                className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${
                  change <= 0 ? 'bg-leaf-soft text-leaf-dark' : 'bg-honey-soft text-ink'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Icon name={change > 0 ? 'trending_up' : change < 0 ? 'trending_down' : 'trending_flat'} size={16} weight={600} />
                  {Math.abs(change)} kg
                </span>
              </motion.div>
            )}
          </div>
          <Sparkline records={records} />
        </>
      ) : (
        <p className="py-3 text-sm text-muted">還沒有體重紀錄，同步或手動記一筆吧！</p>
      )}

      <div className="mt-3 flex gap-2">
        {ios && (
          <Button
            className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm"
            onClick={setup ? health.sync : () => health.openGuide(0)}
          >
            <Icon name="sync" size={18} />
            從健康同步
          </Button>
        )}
        <Button variant="soft" className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm" onClick={health.openManual}>
          <Icon name="edit" size={18} />
          手動記錄
        </Button>
      </div>
    </Card>
  )
}

/** 「今天」頁：提醒卡 */
export function HealthTip() {
  const health = useHealth()
  const setup = usePrefValue(PREF_SETUP)
  const dismissed = usePrefValue(PREF_TIP_DISMISSED)
  const today = useLiveQuery(() => db.body.get(todayKey()), [])
  const ios = isIOS()

  // 還在讀取設定，先不顯示，避免閃一下
  if (setup === undefined || dismissed === undefined) return null

  let content: React.ReactNode = null

  if (today && (today.weight !== undefined || today.steps !== undefined)) {
    content = (
      <motion.div key="today" className="flex items-center gap-3 rounded-3xl bg-card px-4 py-3 shadow-card">
        <motion.span
          initial={{ rotate: -30, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 12 }}
          className="grid place-items-center text-leaf"
        >
          <Icon name="favorite" size={26} fill motion="pulse" />
        </motion.span>
        <div className="flex flex-1 flex-wrap gap-x-4 text-sm">
          {today.weight !== undefined && (
            <span className="flex items-center gap-1">
              <Icon name="monitor_weight" size={18} className="text-leaf" /> <b className="tabular-nums">{today.weight}</b> kg
            </span>
          )}
          {today.steps !== undefined && (
            <span className="flex items-center gap-1">
              <Icon name="directions_walk" size={18} className="text-sky" />
              <b className="tabular-nums">
                <CountUp value={today.steps} />
              </b>
              步
            </span>
          )}
          {today.activeKcal !== undefined && (
            <span className="flex items-center gap-1">
              <Icon name="local_fire_department" size={18} className="text-tomato" fill />
              <b className="tabular-nums">{today.activeKcal}</b> kcal
            </span>
          )}
        </div>
        {ios && setup ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.85, rotate: 180 }}
            onClick={health.sync}
            aria-label="重新同步"
            className="grid h-8 w-8 place-items-center rounded-full bg-leaf-soft text-leaf-dark"
          >
            <Icon name="sync" size={18} />
          </motion.button>
        ) : null}
      </motion.div>
    )
  } else if (ios && setup) {
    content = (
      <motion.div key="sync" className="flex items-center gap-3 rounded-3xl bg-leaf-soft px-4 py-3">
        <motion.span
          animate={{ rotate: [0, -12, 12, -6, 0] }}
          transition={{ repeat: Infinity, repeatDelay: 2.5, duration: 0.6 }}
          className="grid place-items-center"
        >
          <Food id="scale" size={30} />
        </motion.span>
        <div className="flex-1 text-sm text-leaf-dark">今天還沒同步體重</div>
        <Tap type="button" onClick={health.openPaste} className="text-xs text-leaf-dark underline">
          貼上
        </Tap>
        <Button className="px-3 py-1.5 text-sm" onClick={health.sync}>
          同步
        </Button>
      </motion.div>
    )
  } else if (!setup && !dismissed) {
    content = (
      <motion.div key="tip" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-soft to-leaf-soft p-4">
        <motion.span
          className="absolute -right-3 -top-3 opacity-25"
          animate={{ rotate: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <Food id="scale" size={90} />
        </motion.span>
        <div className="relative">
          <div className="flex items-center gap-1.5 font-bold">
            <Icon name={ios ? 'auto_awesome' : 'monitor_weight'} size={20} fill className="text-honey" motion="pulse" />
            {ios ? '讓體重自己跑進來' : '記錄一下體重吧'}
          </div>
          <p className="mt-1 text-sm text-ink/70">
            {ios
              ? '用 iPhone 的「捷徑」把「健康」裡的體重、體脂帶進好食光，Omron 體重計的數據也能一起來。'
              : '記下體重，好食光會幫你看變化趨勢。'}
          </p>
          <div className="mt-3 flex gap-2">
            <Button className="px-4 py-2 text-sm" onClick={ios ? () => health.openGuide(0) : health.openManual}>
              {ios ? '教我設定' : '記錄體重'}
            </Button>
            <Button
              variant="ghost"
              className="px-3 py-2 text-sm"
              onClick={() => {
                haptic(6)
                db.prefs.put({ key: PREF_TIP_DISMISSED, value: true })
              }}
            >
              之後再說
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  if (!content) return null
  return (
    <motion.div
      key={(content as { key?: string }).key}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={spring}
    >
      {content}
    </motion.div>
  )
}
