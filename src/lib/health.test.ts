import { describe, expect, it } from 'vitest'
import { parseHealthText } from './health'

describe('解析捷徑複製的健康資料', () => {
  it('標準格式', () => {
    expect(parseHealthText('好食光|體重=72.5 kg|體脂=25.6%|步數=8000|活動=350 kcal')).toEqual({ weight: 72.5, bodyFat: 25.6, steps: 8000, activeKcal: 350 })
  })
  it('體脂是比例（0.256）', () => {
    expect(parseHealthText('好食光|體重=72.5|體脂=0.256')?.bodyFat).toBe(25.6)
  })
  it('體重是磅會換成公斤', () => {
    expect(parseHealthText('好食光|體重=160 lb')?.weight).toBe(72.6)
  })
  it('活動能量是千焦會換成大卡', () => {
    expect(parseHealthText('好食光|活動=1464 kJ')?.activeKcal).toBe(350)
  })
  it('捷徑給了好幾個值時取第一個', () => {
    expect(parseHealthText('好食光|體重=72.5\n72.9\n73.4|步數=1,234')?.weight).toBe(72.5)
  })
})
