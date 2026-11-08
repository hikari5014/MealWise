// 掃器材「運動結束畫面」的 QR Code：顯示數據、選這台是什麼器材，按一下就記錄
import { useEffect, useState } from 'react'
import { EXERCISE_MAP } from '../data/exercises'
import { haptic } from '../lib/feedback'
import { getBindings, rememberMachine } from '../lib/machines'
import { alreadyRecorded, guessExercise, recordMachineResult, type MachineResult } from '../lib/machineResult'
import { ExerciseAnim } from './ExerciseLibrary'
import { Icon } from './Icon'
import { Button, Sheet, Tap, useToast } from './ui'

const MACHINES = ['elliptical-trainer', 'jogging-treadmill', 'cx-incline-walk', 'bicycling-stationary', 'cx-stair-climber', 'rowing-stationary', 'cx-ski-erg', 'cx-assault-bike']

const keyOf = (r: MachineResult) => `result:${r.brand}:${r.serial ?? r.typeCode ?? ''}`

export function MachineResultSheet({ result, workoutId, onClose }: { result: MachineResult | null; workoutId?: number; onClose: (saved: boolean) => void }) {
  const toast = useToast()
  const [ex, setEx] = useState('elliptical-trainer')
  const [known, setKnown] = useState(false)
  const [dup, setDup] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!result) return
    let alive = true
    ;(async () => {
      const b = (await getBindings())[keyOf(result)]
      const remembered = b?.ids.find((id) => EXERCISE_MAP[id])
      if (!alive) return
      setKnown(!!remembered)
      setEx(remembered ?? guessExercise(result))
      setDup(await alreadyRecorded(result))
    })()
    return () => {
      alive = false
    }
  }, [result?.id])

  if (!result) return null
  const stats: [string, string | undefined][] = [
    ['時間', `${result.min} 分`],
    ['消耗', result.kcal ? `${result.kcal} kcal` : undefined],
    ['平均心率', result.hr ? `${result.hr} bpm` : undefined],
    ['距離', result.km ? `${result.km} km` : undefined],
    ['阻力等級', result.level ? String(result.level) : undefined],
    ['平均功率', result.watts ? `${Math.round(result.watts)} W` : undefined],
    ['強度', result.mets ? `${result.mets} MET` : undefined],
  ]
  const save = async () => {
    setBusy(true)
    try {
      await rememberMachine(keyOf(result), ex, EXERCISE_MAP[ex]?.zh)
      await recordMachineResult(result, ex, workoutId)
      haptic([10, 40, 10, 40, 20])
      toast(`已記錄 ${EXERCISE_MAP[ex]?.zh}：${result.min} 分${result.kcal ? `・${result.kcal} kcal` : ''}`)
      onClose(true)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Sheet open={!!result} onClose={() => onClose(false)} title="器材的運動結果">
      <div className="space-y-3 pb-4">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="rounded-full bg-leaf-soft px-2 py-0.5 text-leaf-dark">{result.brand}</span>
          {result.start && <span className="text-muted">{new Date(result.start).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })} 開始</span>}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {stats
            .filter(([, v]) => v)
            .map(([l, v]) => (
              <div key={l} className="rounded-2xl bg-card px-2 py-2 text-center shadow-card">
                <div className="text-[11px] text-muted">{l}</div>
                <div className="font-bold tabular-nums">{v}</div>
              </div>
            ))}
        </div>
        {dup && (
          <p className="flex items-start gap-1 rounded-2xl bg-honey-soft px-3 py-2 text-xs text-honey-ink">
            <Icon name="info" size={16} fill />
            這次運動已經記錄過了，再記一次會重複。
          </p>
        )}
        <div className="px-1 text-sm font-bold">這台是什麼器材？{known && <span className="ml-1 text-[11px] font-normal text-leaf-dark">上次記住的</span>}</div>
        <div className="grid grid-cols-4 gap-2">
          {MACHINES.filter((id) => EXERCISE_MAP[id]).map((id) => (
            <Tap key={id} press={0.95} onClick={() => setEx(id)} className={`overflow-hidden rounded-2xl text-center transition-colors ${ex === id ? 'bg-leaf text-on-leaf ring-2 ring-leaf' : 'bg-card shadow-card'}`}>
              <ExerciseAnim ex={EXERCISE_MAP[id]} play={false} className="aspect-[4/3] w-full" />
              <div className="truncate px-1 py-1 text-[11px]">{EXERCISE_MAP[id].zh}</div>
            </Tap>
          ))}
        </div>
        <p className="px-1 text-[11px] text-muted">選一次就會記住這台，下次掃同一台會自動選好。</p>
        <Button className="flex w-full items-center justify-center gap-1.5" disabled={busy} onClick={save}>
          <Icon name="check_circle" size={20} fill />
          {workoutId ? '加進這次訓練' : '記錄這次運動'}
        </Button>
      </div>
    </Sheet>
  )
}
