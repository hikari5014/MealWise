import { describe, expect, it, vi } from 'vitest'

vi.mock('../db', () => ({ db: {} }))
const { activeMs, endWorkout, pauseWorkout, resumeWorkout, shouldAskIdle, undoneSets, IDLE_ASK_MS } = await import('./workout')
type W = Parameters<typeof activeMs>[0]

const T0 = 1_000_000_000_000
const min = 60_000
const w0: W = {
  date: '2026-11-08',
  startedAt: T0,
  entries: [{ exerciseId: 'x', sets: [{ w: 20, r: 10, done: true }, { w: 20, r: 10, done: false }] }],
}

describe('暫停與結束訓練', () => {
  it('暫停的時間不算進運動時間', () => {
    const p = pauseWorkout(w0, T0 + 10 * min)
    expect(activeMs(p, T0 + 30 * min)).toBe(10 * min)
    const r = resumeWorkout(p, T0 + 25 * min)
    expect(activeMs(r, T0 + 35 * min)).toBe(20 * min)
  })
  it('暫停時正在跑的有氧計時也停下來', () => {
    const p = pauseWorkout({ ...w0, blocks: [{ id: 'b', name: '組合', ms: 1000, lapMs: 0, startedAt: T0 + 5 * min }] }, T0 + 10 * min)
    expect(p.blocks![0].startedAt).toBeUndefined()
    expect(p.blocks![0].ms).toBe(1000 + 5 * min)
  })
  it('暫停中直接結束：結束時間之後不算', () => {
    const p = pauseWorkout(w0, T0 + 10 * min)
    const e = endWorkout(p, { at: T0 + 40 * min })
    expect(e.endedAt).toBe(T0 + 40 * min)
    expect(e.pausedAt).toBeUndefined()
    expect(activeMs(e)).toBe(10 * min)
  })
  it('全部標成完成', () => {
    expect(undoneSets(w0)).toBe(1)
    expect(undoneSets(endWorkout(w0, { markAllDone: true }))).toBe(0)
    expect(undoneSets(endWorkout(w0))).toBe(1)
  })
  it('忘了結束：用最後有動作的時間當結束時間', () => {
    const e = endWorkout({ ...w0, lastActiveAt: T0 + 50 * min }, { at: T0 + 50 * min })
    expect(activeMs(e)).toBe(50 * min)
  })
})

describe('很久沒動作要不要問', () => {
  it('超過時間才問，暫停中、已結束不問', () => {
    const a = { ...w0, lastActiveAt: T0 + 10 * min }
    expect(shouldAskIdle(a, T0 + 10 * min + IDLE_ASK_MS - 1)).toBe(false)
    expect(shouldAskIdle(a, T0 + 10 * min + IDLE_ASK_MS + 1)).toBe(true)
    expect(shouldAskIdle(pauseWorkout(a, T0 + 11 * min), T0 + 300 * min)).toBe(false)
    expect(shouldAskIdle({ ...a, endedAt: T0 + 20 * min }, T0 + 300 * min)).toBe(false)
  })
  it('剛問過就不再問', () => {
    const a = { ...w0, lastActiveAt: T0, idleAskedAt: T0 + 60 * min }
    expect(shouldAskIdle(a, T0 + 70 * min)).toBe(false)
    expect(shouldAskIdle(a, T0 + 60 * min + IDLE_ASK_MS + 1)).toBe(true)
  })
})
