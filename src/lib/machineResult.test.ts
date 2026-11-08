import { describe, expect, it, vi } from 'vitest'

vi.mock('../db', () => ({ db: {} }))
vi.mock('./hooks', () => ({ saveMark: async () => {} }))
const { parseMachineResult, guessExercise, toSet } = await import('./machineResult')

const HALO =
  'https://halo.fitness/q?t=c&r=eyJpZCI6IjU0YTQyOGI3LTdjMzYtNDk5Mi1hMWRmLTBmMTI5YzI0YjE0ZiIsImJzIjoiUE1IMTE0NzIwIiwidCI6IjEzMiIsImR0IjoiMjAyNi0xMS0wNFQyMzoxNDo1MSswMDowMCIsImV0IjoiMTgwNyIsImMiOiIyNTkiLCJkYyI6eyJ1IjoiMSIsInYiOiIxMzEzLjAxNjcifSwiYXMiOnsidSI6IjAiLCJ2IjoiNDMuNTk3NyJ9LCJhbCI6IjMuOTQyNCIsImFociI6IjE1NSIsImFtIjoiNjUiLCJhdyI6IjExOSIsImFyIjoiMC4wIiwiYXNwbSI6IjAuMCIsImFzbCI6IjAuMCJ9'

describe('Halo Fitness 運動結果 QR Code', () => {
  it('解析實際掃到的內容', () => {
    const r = parseMachineResult(HALO)!
    expect(r).toMatchObject({ serial: 'PMH114720', typeCode: '132', min: 30.1, kcal: 259, hr: 155, mets: 6.5, watts: 119, level: 3.9, km: 1.31 })
    expect(r.start).toBe(Date.parse('2026-11-04T23:14:51Z'))
    expect(r.rpm).toBeUndefined()
    expect(r.spm).toBeUndefined()
  })
  it('種類代碼 132 是登階機', () => {
    expect(guessExercise(parseMachineResult(HALO)!)).toBe('cx-stair-climber')
  })
  it('不認得的代碼：沒有步頻、轉速時猜滑步機', () => {
    expect(guessExercise({ ...parseMachineResult(HALO)!, typeCode: '999' })).toBe('elliptical-trainer')
  })
  it('變成一段已完成的有氧', () => {
    expect(toSet(parseMachineResult(HALO)!)).toEqual({ w: 0, r: 30.1, done: true, km: 1.31, kcal: 259, hr: 155, lvl: 3.9 })
  })
  it('其他網址、壞掉的資料不認', () => {
    expect(parseMachineResult('https://example.com/q?r=abc')).toBeNull()
    expect(parseMachineResult('https://halo.fitness/q?t=c&r=%%%')).toBeNull()
    expect(parseMachineResult('不是網址')).toBeNull()
  })
})
