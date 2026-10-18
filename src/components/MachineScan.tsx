import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { EXERCISE_MAP, type Exercise } from '../data/exercises'
import { haptic, spring } from '../lib/feedback'
import {
  forgetMachine,
  getBindings,
  loadMachines,
  machineKey,
  matchMachine,
  ownExerciseCode,
  rememberMachine,
  type MachineBinding,
  type MachineRule,
} from '../lib/machines'
import { EQUIP_LABEL } from '../lib/workout'
import { ExerciseAnim, ExerciseLibrary } from './ExerciseLibrary'
import { Icon } from './Icon'
import { QrScanner } from './Share'
import { Button, Sheet, Tap, useToast } from './ui'

interface Found {
  key: string
  text: string
  rule?: MachineRule
  brand?: string
  binding?: MachineBinding
}

/**
 * 掃器材 QR Code 加入動作：
 * 認得的直接列出這台能做的動作；沒看過的讓使用者選一次，之後就記住。
 */
export function MachineScan({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (ex: Exercise) => void }) {
  const toast = useToast()
  const [scanning, setScanning] = useState(false)
  const [found, setFound] = useState<Found | null>(null)
  const [picking, setPicking] = useState(false)

  useEffect(() => {
    if (open) {
      setFound(null)
      setScanning(true)
    }
  }, [open])

  const close = () => {
    setScanning(false)
    setFound(null)
    setPicking(false)
    onClose()
  }

  const onText = useCallback(
    async (text: string): Promise<(() => void) | string> => {
      const own = ownExerciseCode(text)
      if (own && EXERCISE_MAP[own]) {
        const ex = EXERCISE_MAP[own]
        return () => {
          onAdd(ex)
          setScanning(false)
          onClose()
        }
      }
      if (!text.trim()) return '讀不到內容，再對準一次'
      const key = machineKey(text)
      const binding = (await getBindings())[key]
      const data = await loadMachines().catch(() => null)
      const m = data ? matchMachine(text, data) : {}
      return () => {
        setScanning(false)
        setFound({ key, text, binding, ...m })
      }
    },
    [onAdd, onClose],
  )

  const choose = async (ex: Exercise) => {
    if (!found) return
    haptic([8, 30, 8])
    await rememberMachine(found.key, ex.id, found.binding?.name ?? found.rule?.name)
    onAdd(ex)
    close()
  }

  const ids = found ? [...new Set([...(found.binding?.ids ?? []), ...(found.rule?.exercises ?? [])])].filter((id) => EXERCISE_MAP[id]) : []
  const title = found?.binding?.name ?? found?.rule?.name ?? (found ? '沒看過的器材' : '')
  const known = ids.length > 0

  return (
    <>
      <AnimatePresence>{open && scanning && <QrScanner title="掃描器材上的 QR Code" onClose={close} onText={onText} />}</AnimatePresence>

      <Sheet open={open && !!found} onClose={close} title={title}>
        {found && (
          <div className="space-y-3 pb-6">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {found.brand && <span className="rounded-full bg-leaf-soft px-2 py-0.5 text-leaf-dark">{found.brand}</span>}
              {found.binding && <span className="rounded-full bg-honey-soft px-2 py-0.5 text-honey-ink">你教過這台</span>}
              <span className="min-w-0 flex-1 truncate text-muted">{found.text}</span>
            </div>

            {known ? (
              <p className="px-1 text-sm text-muted">選要做的動作，下次掃這台會把你選的排在最前面。</p>
            ) : (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-honey-soft/70 p-4 text-sm">
                <div className="mb-1 flex items-center gap-1.5 font-bold text-honey-ink">
                  <Icon name="lightbulb" size={18} fill />
                  第一次掃到這台
                </div>
                從動作庫選它是什麼動作，教一次就會記住；之後再掃同一台就直接跳出來。
              </motion.div>
            )}

            <ul className="space-y-2">
              {ids.map((id, i) => {
                const ex = EXERCISE_MAP[id]
                return (
                  <motion.li key={id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: Math.min(i, 8) * 0.03 }}>
                    <Tap press={0.98} onClick={() => choose(ex)} className="flex w-full items-center gap-3 rounded-2xl bg-card p-2 text-left shadow-card">
                      <ExerciseAnim ex={ex} play={false} className="h-12 w-16 shrink-0 rounded-xl" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{ex.zh}</span>
                        <span className="block truncate text-[11px] text-muted">{EQUIP_LABEL[ex.equip]}</span>
                      </span>
                      {found.binding?.ids[0] === id && <span className="rounded-full bg-leaf px-2 py-0.5 text-[10px] font-bold text-on-leaf">上次</span>}
                      <Icon name="add_circle" size={22} className="text-leaf" />
                    </Tap>
                  </motion.li>
                )
              })}
            </ul>

            <Button variant={known ? 'soft' : 'primary'} className="flex w-full items-center justify-center gap-1.5" onClick={() => setPicking(true)}>
              <Icon name="search" size={18} />
              {known ? '這台還能做別的動作' : '從動作庫選'}
            </Button>
            <div className="flex justify-between px-1 text-xs">
              <Tap
                onClick={() => {
                  setFound(null)
                  setScanning(true)
                }}
                className="flex items-center gap-1 py-1 text-muted"
              >
                <Icon name="qr_code_scanner" size={16} />
                重新掃描
              </Tap>
              {found.binding && (
                <Tap
                  onClick={async () => {
                    await forgetMachine(found.key)
                    toast('已忘記這台器材')
                    setFound({ ...found, binding: undefined })
                  }}
                  className="py-1 text-tomato"
                >
                  忘記這台
                </Tap>
              )}
            </div>
          </div>
        )}
      </Sheet>

      <ExerciseLibrary open={picking} onClose={() => setPicking(false)} onPick={choose} pickLabel="就是這台" />
    </>
  )
}
