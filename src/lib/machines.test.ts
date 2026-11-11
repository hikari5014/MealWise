import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../db', () => ({ db: {} }))
const { matchMachine } = await import('./machines')
const { EXERCISE_MAP } = await import('../data/exercises')
const data = JSON.parse(readFileSync(new URL('../../public/machines.json', import.meta.url), 'utf8'))

describe('器材 QR Code 比對', () => {
  it('Life Fitness LFconnect 側平舉機（sslr）', () => {
    const m = matchMachine('https://lfconnect.com/q?t=s&m=sslr', data)
    expect(m.rule?.id).toBe('lateral-raise')
    expect(m.rule?.exercises[0]).toBe('mx-lateral-raise')
  })
  it('規則裡的每個動作都存在', () => {
    for (const r of data.rules) for (const id of r.exercises) expect(EXERCISE_MAP[id], `${r.id} → ${id}`).toBeTruthy()
  })
  it('sslr 不會誤配到其他字', () => {
    expect(matchMachine('https://example.com/classlrx', data).rule?.id).not.toBe('lateral-raise')
  })
})
