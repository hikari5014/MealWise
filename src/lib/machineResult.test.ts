import { describe, expect, it, vi } from 'vitest'

vi.mock('../db', () => ({ db: {} }))
vi.mock('./hooks', () => ({ saveMark: async () => {} }))
const { parseMachineResult, guessExercise, toSet } = await import('./machineResult')

const HALO =
  'https://halo.fitness/q?t=c&r=eyJpZCI6IjU0YTQyOGI3LTdjMzYtNDk5Mi1hMWRmLTBmMTI5YzI0YjE0ZiIsImJzIjoiUE1IMTE0NzIwIiwidCI6IjEzMiIsImR0IjoiMjAyNi0xMS0wNFQyMzoxNDo1MSswMDowMCIsImV0IjoiMTgwNyIsImMiOiIyNTkiLCJkYyI6eyJ1IjoiMSIsInYiOiIxMzEzLjAxNjcifSwiYXMiOnsidSI6IjAiLCJ2IjoiNDMuNTk3NyJ9LCJhbCI6IjMuOTQyNCIsImFociI6IjE1NSIsImFtIjoiNjUiLCJhdyI6IjExOSIsImFyIjoiMC4wIiwiYXNwbSI6IjAuMCIsImFzbCI6IjAuMCJ9'

const HALO2 =
  'https://halo.fitness/q?t=c&r=eyJpZCI6IjRjZWQ0ZjIyLWEwZDMtNGE2NS1iYzFhLThjYWQ1MDRhZTA0ZSIsImJzIjoiUE1IMTE0NzIwIiwidCI6IjEzMiIsImR0IjoiMjAyNi0xMS0xOFQyMjoyNzoyNyswMDowMCIsImV0IjoiMTM4NSIsImMiOiIyMDgiLCJkYyI6eyJ1IjoiMSIsInYiOiIxMDYwLjYxNjcifSwiYXMiOnsidSI6IjAiLCJ2IjoiNDUuOTM1NyJ9LCJhbCI6IjQuMTYxMCIsImFociI6IjEzOSIsImFtIjoiNzEiLCJhdyI6IjEzMiIsImFyIjoiMC4wIiwiYXNwbSI6IjAuMCIsImFzbCI6IjAuMCJ9'

describe('Halo Fitness 運動結果 QR Code', () => {
  it('第二次掃到的登階機：跟螢幕上的數字一致（23:05、208 卡、心率 139、7.1 MET、132 瓦、1,060 步、62 層）', () => {
    const r = parseMachineResult(HALO2)!
    expect(r).toMatchObject({ serial: 'PMH114720', typeCode: '132', min: 23.1, kcal: 208, hr: 139, mets: 7.1, watts: 132, level: 4.2, steps: 1061, floors: 62 })
    expect(r.km).toBeUndefined()
  })
  it('時間是機器的當地時間、而且是結束時間：開始＝22:27:27 往前 1385 秒', () => {
    const r = parseMachineResult(HALO2)!
    expect(r.start).toBe(new Date(2026, 10, 18, 22, 27, 27).getTime() - 1385 * 1000)
  })
  it('第一次掃到的登階機', () => {
    const r = parseMachineResult(HALO)!
    expect(r).toMatchObject({ min: 30.1, kcal: 259, hr: 155, mets: 6.5, watts: 119, level: 3.9, steps: 1313, floors: 77 })
  })
  it('種類代碼 132 是登階機', () => {
    expect(guessExercise(parseMachineResult(HALO)!)).toBe('cx-stair-climber')
  })
  it('不認得的代碼：沒有步頻、轉速時猜滑步機', () => {
    expect(guessExercise({ ...parseMachineResult(HALO)!, typeCode: '999' })).toBe('elliptical-trainer')
  })
  it('變成一段已完成的有氧（登階機記樓層，不記公里）', () => {
    expect(toSet(parseMachineResult(HALO2)!)).toEqual({ w: 0, r: 23.1, done: true, floors: 62, kcal: 208, hr: 139, lvl: 4.2 })
  })
  it('其他網址、壞掉的資料不認', () => {
    expect(parseMachineResult('https://example.com/q?r=abc')).toBeNull()
    expect(parseMachineResult('https://halo.fitness/q?t=c&r=%%%')).toBeNull()
    expect(parseMachineResult('不是網址')).toBeNull()
  })
})
