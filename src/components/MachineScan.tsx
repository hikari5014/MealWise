import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
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
import { aiErrorText, identifyMachine } from '../lib/machineAi'
import { identifyLocal, localModelCached, type LocalGuess } from '../lib/machineLocal'
import { nfcSupported, readNfc, writeNfc } from '../lib/nfc'
import { parseMachineResult, type MachineResult } from '../lib/machineResult'
import { MachineResultSheet } from './MachineResult'
import { appUrl, getSession } from '../lib/cloud'
import { ExerciseAnim, ExerciseLibrary } from './ExerciseLibrary'
import { Icon } from './Icon'
import { QrScanner } from './Share'
import { Button, Sheet, Tap, useToast } from './ui'

type Mode = 'menu' | 'qr' | 'nfc' | 'photo'

interface Found {
  /** 空字串＝拍照辨識的結果，不記住 */
  key: string
  via?: 'qr' | 'nfc' | 'photo'
  confidence?: 'high' | 'medium' | 'low'
  text: string
  rule?: MachineRule
  brand?: string
  binding?: MachineBinding
}

/**
 * 掃器材 QR Code 加入動作：
 * 認得的直接列出這台能做的動作；沒看過的讓使用者選一次，之後就記住。
 */
export function MachineScan({ open, onClose, onAdd, workoutId }: { open: boolean; onClose: () => void; onAdd: (ex: Exercise) => void; workoutId?: number }) {
  const toast = useToast()
  const [mode, setMode] = useState<Mode>('menu')
  const scanning = mode === 'qr'
  const setScanning = (v: boolean) => setMode(v ? 'qr' : 'menu')
  const [found, setFound] = useState<Found | null>(null)
  const [picking, setPicking] = useState(false)
  const [busy, setBusy] = useState('')
  /** 手機小模型猜的幾種器材（null＝還沒拍） */
  const [guesses, setGuesses] = useState<LocalGuess[] | null>(null)
  const photo = useRef<File | null>(null)
  const [err, setErr] = useState('')
  /** 掃到的是器材「運動結束畫面」的 QR Code */
  const [result, setResult] = useState<MachineResult | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const nfcAbort = useRef<AbortController | null>(null)

  useEffect(() => {
    if (open) {
      setFound(null)
      setMode('menu')
      setErr('')
      setBusy('')
      setGuesses(null)
    } else nfcAbort.current?.abort()
  }, [open])

  const close = () => {
    nfcAbort.current?.abort()
    setMode('menu')
    setFound(null)
    setPicking(false)
    onClose()
  }

  const startNfc = async () => {
    setErr('')
    setMode('nfc')
    const ac = new AbortController()
    nfcAbort.current = ac
    try {
      const text = await readNfc(ac.signal)
      haptic([8, 30, 8])
      const r = await onText(text)
      ac.abort()
      if (typeof r === 'string') {
        setErr(r)
        setMode('menu')
      } else r()
      setFound((f) => (f ? { ...f, via: 'nfc' } : f))
    } catch (e) {
      if (ac.signal.aborted) return
      ac.abort()
      // 回到選單，再按一次就能重新感應
      setMode('menu')
      setErr(/NotAllowed|permission/i.test(String(e)) ? '要允許使用 NFC 才能讀貼紙' : '讀不到貼紙，再按一次「感應 NFC 貼紙」並靠近一點')
    }
  }

  /** 先用手機上的小模型（免費、不用登入）；猜的都不對再交給雲端 AI */
  const onPhoto = async (file?: File) => {
    if (!file) return
    if (fileRef.current) fileRef.current.value = ''
    photo.current = file
    setErr('')
    setGuesses(null)
    setMode('photo')
    setBusy(localModelCached() ? '正在看這是什麼器材…' : '第一次使用，下載辨識模型中…')
    try {
      const g = await identifyLocal(file, (pct) => setBusy(`第一次使用，下載辨識模型中… ${pct}%（約 30 MB，只要一次）`))
      haptic(8)
      setGuesses(g)
    } catch {
      setErr('手機上的辨識沒辦法用，可以改用 AI 仔細看')
      setGuesses([])
    } finally {
      setBusy('')
    }
  }

  const pickGuess = (g: LocalGuess) => {
    haptic([8, 30, 8])
    setFound({ key: '', via: 'photo', text: g.rule.name, rule: g.rule })
  }

  const askCloud = async () => {
    const file = photo.current
    if (!file) return
    setErr('')
    setBusy('AI 正在仔細看這是什麼器材…')
    try {
      const g = await identifyMachine(file)
      haptic([8, 30, 8])
      setFound({
        key: '',
        via: 'photo',
        text: g.machine,
        confidence: g.confidence,
        rule: { id: 'ai', name: g.machine || '認不出來的器材', match: '', exercises: g.exerciseIds },
      })
    } catch (e) {
      setErr(aiErrorText(e))
    } finally {
      setBusy('')
    }
  }

  const onText = useCallback(
    async (text: string): Promise<(() => void) | string> => {
      const res = parseMachineResult(text)
      if (res)
        return () => {
          setScanning(false)
          setResult(res)
        }
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
        setFound({ key, text, binding, via: 'qr', ...m })
      }
    },
    [onAdd, onClose],
  )

  const choose = async (ex: Exercise) => {
    if (!found) return
    haptic([8, 30, 8])
    if (found.key) await rememberMachine(found.key, ex.id, found.binding?.name ?? found.rule?.name)
    onAdd(ex)
    close()
  }

  const ids = found ? [...new Set([...(found.binding?.ids ?? []), ...(found.rule?.exercises ?? [])])].filter((id) => EXERCISE_MAP[id]) : []
  const title = found?.binding?.name ?? found?.rule?.name ?? (found ? '沒看過的器材' : '')
  const known = ids.length > 0

  return (
    <>
      <AnimatePresence>{open && scanning && <QrScanner title="掃描器材上的 QR Code" onClose={close} onText={onText} />}</AnimatePresence>

      <Sheet open={open && !found && !result && mode !== 'qr'} onClose={close} title="辨識器材">
        <div className="space-y-2 pb-6">
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0] ?? undefined)} />
          {busy || mode === 'nfc' ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} className="grid h-16 w-16 place-items-center rounded-full bg-leaf-soft text-leaf-dark">
                <Icon name={mode === 'nfc' ? 'nfc' : 'photo_camera'} size={34} />
              </motion.span>
              <p className="text-sm">{busy || '把手機背面靠近器材上的 NFC 貼紙'}</p>
              {err && <p className="text-sm text-tomato">{err}</p>}
              <Tap onClick={() => { nfcAbort.current?.abort(); setMode('menu'); setErr(''); setGuesses(null) }} className="text-xs text-muted underline">
                取消
              </Tap>
            </div>
          ) : mode === 'photo' && guesses ? (
            <div className="space-y-2">
              {guesses.length ? (
                <p className="px-1 text-sm text-muted">最像的是這幾種，點對的那一個：</p>
              ) : (
                <p className="rounded-2xl bg-honey-soft px-3 py-2 text-sm text-honey-ink">認不太出來，可以換個角度再拍，或請 AI 仔細看。</p>
              )}
              {guesses.map((g, i) => (
                <Tap key={g.rule.id} press={0.98} onClick={() => pickGuess(g)} className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-card">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${i === 0 ? 'bg-leaf text-on-leaf' : 'bg-cream text-muted'}`}>{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{g.rule.name}</span>
                    <span className="block text-[11px] text-muted">{g.rule.exercises.length} 個動作</span>
                  </span>
                  <span className="h-1.5 w-16 overflow-hidden rounded-full bg-cream">
                    <span className="block h-full rounded-full bg-leaf" style={{ width: `${Math.max(8, Math.round((g.score / guesses[0].score) * 100))}%` }} />
                  </span>
                </Tap>
              ))}
              <Button
                variant="soft"
                className="flex w-full items-center justify-center gap-1.5"
                disabled={!getSession()}
                onClick={askCloud}
              >
                <Icon name="auto_awesome" size={18} />
                {guesses.length ? '都不是，請 AI 仔細看' : '請 AI 仔細看'}
              </Button>
              {!getSession() && <p className="px-1 text-center text-[11px] text-muted">AI 仔細看要先登入會員（「我的」頁）</p>}
              {err && <p className="px-1 text-sm text-tomato">{err}</p>}
              <div className="flex justify-between px-1 pt-1 text-xs">
                <Tap onClick={() => fileRef.current?.click()} className="flex items-center gap-1 py-1 text-leaf-dark">
                  <Icon name="photo_camera" size={16} />
                  再拍一張
                </Tap>
                <Tap onClick={() => { setMode('menu'); setGuesses(null); setErr('') }} className="py-1 text-muted">
                  換別的方式
                </Tap>
              </div>
            </div>
          ) : (
            <>
              <MethodButton icon="qr_code_scanner" title="掃 QR Code" sub="器材上的 QR Code；運動結束畫面的 QR Code 也能掃，直接記錄數據" onClick={() => setMode('qr')} />
              <MethodButton
                icon="nfc"
                title="感應 NFC 貼紙"
                sub={nfcSupported() ? '手機靠近器材上的 NFC 貼紙' : 'iPhone 的網頁還不能讀 NFC，Android 的 Chrome 才可以'}
                disabled={!nfcSupported()}
                onClick={startNfc}
              />
              <MethodButton
                icon="photo_camera"
                title="拍照辨識"
                sub="拍一張器材的照片，手機上直接認，不用登入、不用網路"
                onClick={() => fileRef.current?.click()}
              />
              {err && <p className="px-1 pt-1 text-sm text-tomato">{err}</p>}
            </>
          )}
        </div>
      </Sheet>

      <Sheet open={open && !!found} onClose={close} title={title}>
        {found && (
          <div className="space-y-3 pb-6">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {found.brand && <span className="rounded-full bg-leaf-soft px-2 py-0.5 text-leaf-dark">{found.brand}</span>}
              {found.binding && <span className="rounded-full bg-honey-soft px-2 py-0.5 text-honey-ink">你教過這台</span>}
              {found.via === 'photo' && (
                <span className="rounded-full bg-sky-soft px-2 py-0.5 text-sky">AI 辨識{found.confidence === 'high' ? '・很有把握' : found.confidence === 'medium' ? '・大概是' : '・不太確定'}</span>
              )}
              <span className="min-w-0 flex-1 truncate text-muted">{found.text}</span>
            </div>

            {known ? (
              <p className="px-1 text-sm text-muted">
                {found.via === 'photo' ? '選要做的動作。認錯了就從動作庫選。' : '選要做的動作，下次掃這台會把你選的排在最前面。'}
              </p>
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
                  setMode('menu')
                  setGuesses(null)
                }}
                className="flex items-center gap-1 py-1 text-muted"
              >
                <Icon name="refresh" size={16} />
                換個方式再試
              </Tap>
              {found.key && ids.length > 0 && nfcSupported() && (
                <Tap
                  onClick={async () => {
                    toast('把空白 NFC 貼紙靠近手機背面')
                    try {
                      const url = found.key.startsWith('nfc:') ? null : `${appUrl()}#machine=${encodeURIComponent(found.key).slice(0, 180)}`
                      if (!url) return toast('這張貼紙已經認得了')
                      await writeNfc(url)
                      for (const id of [...ids].reverse()) await rememberMachine(machineKey(url), id, title)
                      toast('寫好了，之後感應這張貼紙就認得這台')
                    } catch {
                      toast('寫入失敗，再試一次')
                    }
                  }}
                  className="flex items-center gap-1 py-1 text-leaf-dark"
                >
                  <Icon name="nfc" size={16} />
                  寫進 NFC 貼紙
                </Tap>
              )}
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

      <MachineResultSheet
        result={open ? result : null}
        workoutId={workoutId}
        onClose={() => {
          setResult(null)
          close()
        }}
      />

      <ExerciseLibrary open={picking} onClose={() => setPicking(false)} onPick={choose} pickLabel="就是這台" />
    </>
  )
}

function MethodButton({ icon, title, sub, onClick, disabled }: { icon: 'qr_code_scanner' | 'nfc' | 'photo_camera'; title: string; sub: string; onClick: () => void; disabled?: boolean }) {
  return (
    <Tap press={0.98} disabled={disabled} onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-card disabled:opacity-50">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-leaf-soft text-leaf-dark">
        <Icon name={icon} size={24} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{title}</span>
        <span className="block text-[11px] text-muted">{sub}</span>
      </span>
      <Icon name="chevron_right" size={20} className="text-muted" />
    </Tap>
  )
}
