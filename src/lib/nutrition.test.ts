import { describe, expect, it } from 'vitest'
import { calcEnergy, calcNeeds, defaultSpec, resolveFfm, validateSpec, type BodySpec } from './nutrition'

const base: BodySpec = { ...defaultSpec(), sex: 'male', age: 30, height: 175, weight: 75, activity: 'moderate', goal: 'maintain', pace: 'normal', preset: 'custom' }

describe('去脂體重', () => {
  it('直接填的最優先', () => {
    expect(resolveFfm({ ...base, ffm: 60, bodyFat: 30, smm: 20 })).toEqual({ ffm: 60, source: 'ffm' })
  })
  it('用體重和體脂率反推：FFM = 體重 ×（1 − 體脂率）', () => {
    expect(resolveFfm({ ...base, bodyFat: 20 })).toEqual({ ffm: 60, source: 'bodyFat' })
  })
  it('只有骨骼肌重時推估', () => {
    const f = resolveFfm({ ...base, smm: 33.6 })!
    expect(f.source).toBe('smm')
    expect(f.ffm).toBeCloseTo(60, 5)
  })
  it('都沒有就回傳 undefined', () => {
    expect(resolveFfm(base)).toBeUndefined()
  })
  it('不合理的去脂體重（比體重重）不採用', () => {
    expect(resolveFfm({ ...base, ffm: 80, bodyFat: 20 })?.source).toBe('bodyFat')
  })
})

describe('基礎代謝與每日總消耗', () => {
  it('有去脂體重用 Katch-McArdle：370 + 21.6 × FFM', () => {
    const e = calcEnergy({ ...base, bodyFat: 20 })
    expect(e.method).toBe('katch')
    expect(e.bmr).toBeCloseTo(370 + 21.6 * 60, 5)
    expect(e.tdee).toBeCloseTo(e.bmr * 1.55, 5)
  })
  it('沒有體組成用 Mifflin-St Jeor', () => {
    const e = calcEnergy(base)
    expect(e.method).toBe('mifflin')
    expect(e.bmr).toBeCloseTo(10 * 75 + 6.25 * 175 - 5 * 30 + 5, 5)
  })
  it('女性 Mifflin 減 161', () => {
    expect(calcEnergy({ ...base, sex: 'female' }).bmr).toBeCloseTo(10 * 75 + 6.25 * 175 - 5 * 30 - 161, 5)
  })
})

describe('目標熱量', () => {
  const tdee = (s: BodySpec) => calcNeeds(s).tdee
  it('維持：0 調整', () => {
    const n = calcNeeds(base)
    expect(n.delta).toBe(0)
    expect(Math.abs(n.kcal - tdee(base))).toBeLessThanOrEqual(10)
  })
  it('增肌：+200～+300', () => {
    for (const pace of ['slow', 'normal', 'fast'] as const) {
      const d = calcNeeds({ ...base, goal: 'gain', pace }).delta
      expect(d).toBeGreaterThanOrEqual(200)
      expect(d).toBeLessThanOrEqual(300)
    }
  })
  it('減脂：−300～−500', () => {
    for (const pace of ['slow', 'normal', 'fast'] as const) {
      const d = calcNeeds({ ...base, goal: 'lose', pace }).delta
      expect(d).toBeLessThanOrEqual(-300)
      expect(d).toBeGreaterThanOrEqual(-500)
    }
  })
  it('身體重組：0～−150，蛋白質比維持高', () => {
    for (const pace of ['slow', 'normal', 'fast'] as const) {
      const d = calcNeeds({ ...base, goal: 'recomp', pace }).delta
      expect(d).toBeLessThanOrEqual(0)
      expect(d).toBeGreaterThanOrEqual(-150)
    }
    expect(calcNeeds({ ...base, goal: 'recomp' }).protein).toBeGreaterThan(calcNeeds(base).protein)
  })
  it('熱量不會低於安全下限', () => {
    const n = calcNeeds({ ...base, sex: 'female', weight: 40, height: 150, age: 60, activity: 'sedentary', goal: 'lose', pace: 'fast' })
    expect(n.kcal).toBeGreaterThanOrEqual(1200)
    expect(n.floored).toBe(true)
  })
})

describe('三大營養素', () => {
  it('蛋白質依每公斤體重', () => {
    expect(calcNeeds({ ...base, proteinPerKg: 2 }).protein).toBe(150)
  })
  it('脂肪在總熱量 20–30% 之間', () => {
    for (const goal of ['lose', 'maintain', 'gain', 'recomp'] as const) {
      const n = calcNeeds({ ...base, goal })
      expect(n.pct.fat).toBeGreaterThanOrEqual(19)
      expect(n.pct.fat).toBeLessThanOrEqual(31)
    }
  })
  it('三樣加起來約等於目標熱量、百分比約 100', () => {
    const n = calcNeeds({ ...base, bodyFat: 18 })
    expect(Math.abs(n.protein * 4 + n.carbs * 4 + n.fat * 9 - n.kcal)).toBeLessThan(15)
    expect(n.pct.protein + n.pct.carbs + n.pct.fat).toBeGreaterThanOrEqual(99)
    expect(n.pct.protein + n.pct.carbs + n.pct.fat).toBeLessThanOrEqual(101)
  })
  it('邊界：熱量很低、蛋白質很高時，碳水不會是負數', () => {
    const n = calcNeeds({ ...base, sex: 'female', weight: 60, height: 165, age: 70, activity: 'sedentary', goal: 'lose', pace: 'fast', proteinPerKg: 3 })
    expect(n.carbs).toBeGreaterThanOrEqual(0)
    expect(n.adjusted.length).toBeGreaterThan(0)
  })
  it('邊界：碳水太少時先降脂肪', () => {
    const n = calcNeeds({ ...base, sex: 'female', weight: 90, height: 155, age: 55, activity: 'sedentary', goal: 'lose', pace: 'fast', proteinPerKg: 2.2 })
    expect(n.carbs).toBeGreaterThanOrEqual(0)
    if (n.adjusted.length) expect(n.adjusted[0]).toContain('脂肪')
  })
})

describe('只填部分數據', () => {
  it('只填體重也算得出來，並標示哪些是估算的', () => {
    const n = calcNeeds({ ...base, age: 0, height: 0 })
    expect(n.kcal).toBeGreaterThan(1000)
    expect(n.assumed).toEqual(['年齡', '身高'])
  })
  it('有去脂體重時不需要年齡', () => {
    expect(calcNeeds({ ...base, age: 0, bodyFat: 20 }).assumed).toEqual([])
  })
  it('沒填的年齡、身高不算輸入錯誤', () => {
    expect(validateSpec({ ...base, age: 0, height: 0 })).toEqual([])
  })
})

describe('輸入檢查', () => {
  it('合理的輸入沒有問題', () => {
    expect(validateSpec(base)).toEqual([])
  })
  it('非正數、不合理的數字會被擋下', () => {
    expect(validateSpec({ ...base, weight: 0 }).length).toBe(1)
    expect(validateSpec({ ...base, weight: -5 }).length).toBe(1)
    expect(validateSpec({ ...base, height: Number.NaN }).length).toBe(1)
    expect(validateSpec({ ...base, bodyFat: 0 }).length).toBe(1)
    expect(validateSpec({ ...base, smm: 90 }).length).toBe(1)
    expect(validateSpec({ ...base, ffm: 80 }).length).toBe(1)
  })
  it('輸入有問題時計算也不會壞掉（不會出現 NaN 或負數）', () => {
    const n = calcNeeds({ ...base, bodyFat: -10, smm: -3 })
    for (const v of [n.bmr, n.tdee, n.kcal, n.protein, n.carbs, n.fat]) {
      expect(Number.isFinite(v)).toBe(true)
      expect(v).toBeGreaterThanOrEqual(0)
    }
  })
})
