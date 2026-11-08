import { describe, expect, it, vi } from 'vitest'

vi.mock('../db', () => ({ db: {} }))
vi.mock('./cloud', () => ({ getSession: () => null, supabase: {} }))

const { dedupeRows } = await import('./sync')

describe('同步送出前去除重複', () => {
  it('同一筆有資料又有刪除記號：留資料', () => {
    const out = dedupeRows([
      { tbl: 'days', key: '2026-11-08', deleted: false, data: { a: 1 } },
      { tbl: 'days', key: '2026-11-08', deleted: true, data: null },
    ])
    expect(out).toHaveLength(1)
    expect(out[0].deleted).toBe(false)
  })
  it('刪除記號在前也一樣留資料', () => {
    const out = dedupeRows([
      { tbl: 'water', key: 'x', deleted: true },
      { tbl: 'water', key: 'x', deleted: false },
    ])
    expect(out).toEqual([{ tbl: 'water', key: 'x', deleted: false }])
  })
  it('不同表、不同鑰匙都保留', () => {
    expect(
      dedupeRows([
        { tbl: 'days', key: 'a', deleted: false },
        { tbl: 'water', key: 'a', deleted: false },
        { tbl: 'days', key: 'b', deleted: true },
      ]),
    ).toHaveLength(3)
  })
})
