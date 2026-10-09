import { useEffect, useState } from 'react'
import type { FoodImage } from '../data/foodImages'
import type { MealSlot, Nutrition, Recipe } from '../types'

/** 外食天地：資料在 public/eatout/data.json，由 scripts/build-eatout.mjs 產生，GitHub Actions 每天更新 */
export type EatKind = 'fastfood' | 'cafe' | 'asian' | 'drink' | 'convenience' | 'generic'

export interface EatBrand {
  id: string
  name: string
  kind: EatKind
  site?: string
  source?: string
  fetchedAt?: string
  count: number
  kcalOnly?: boolean
}

/** 為了檔案小，欄位用縮寫 */
export interface EatItem {
  id: string
  b: string
  n: string
  k: number
  /** 只公布熱量的品項沒有 p、c */
  p?: number
  c?: number
  f?: number
  /** 只有熱量 */
  ko?: 1
  cat?: string
  s?: string
  fi?: number
  su?: number
  na?: number
  src?: string
}

export interface EatData {
  version: number
  updatedAt: string | null
  brands: EatBrand[]
  items: EatItem[]
}

export const EAT_KINDS: { id: EatKind; label: string; image: FoodImage }[] = [
  { id: 'convenience', label: '便利商店', image: 'rice-ball' },
  { id: 'fastfood', label: '速食', image: 'meal-lunch' },
  { id: 'cafe', label: '咖啡早午餐', image: 'meal-breakfast' },
  { id: 'asian', label: '中日式連鎖', image: 'bento' },
  { id: 'drink', label: '手搖飲', image: 'cup-straw' },
  { id: 'generic', label: '一般小吃', image: 'dumpling' },
]
export const KIND_IMAGE = Object.fromEntries(EAT_KINDS.map((k) => [k.id, k.image])) as Record<EatKind, FoodImage>

const NAME_IMAGE: [RegExp, FoodImage][] = [
  [/飯糰|飯卷/, 'rice-ball'],
  [/沙拉|生菜/, 'salad'],
  [/雞蛋|茶葉蛋|溫泉蛋|水煮蛋|蛋餅|荷包蛋/, 'egg'],
  [/雞/, 'chicken-breast'],
  [/鮭|鯛|鱈|鯖|鮪|魚/, 'salmon'],
  [/蝦/, 'prawn'],
  [/牛/, 'beef-slices'],
  [/豬|排骨|肉/, 'pork-loin'],
  [/豆腐|豆干/, 'tofu-firm'],
  [/豆漿/, 'soy-milk'],
  [/地瓜/, 'sweet-potato'],
  [/水餃|鍋貼|餃/, 'dumpling'],
  [/便當|丼|飯/, 'rice'],
  [/麵|粉/, 'noodle-bowl'],
  [/漢堡|堡/, 'meal-lunch'],
  [/三明治|吐司|貝果|麵包|可頌/, 'bread'],
  [/薯/, 'potato'],
  [/優格|優酪/, 'yogurt'],
  [/咖啡|拿鐵|美式|茶|飲|奶|汁|可樂/, 'cup-straw'],
]

/** 依品名猜一張圖，猜不到用店家類型的圖 */
export const itemImage = (it: EatItem, brand?: EatBrand): FoodImage =>
  NAME_IMAGE.find(([re]) => re.test(it.n))?.[1] ?? KIND_IMAGE[brand?.kind ?? 'fastfood']

let memo: Promise<EatData> | null = null

/** 有網路拿最新（Service Worker 會先試網路、4 秒內沒回應就用上次存的） */
export function loadEatOut(force = false): Promise<EatData> {
  if (!memo || force) {
    memo = fetch(`${import.meta.env.BASE_URL}eatout/data.json`, { cache: force ? 'reload' : 'no-cache' })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json() as Promise<EatData>
      })
      .catch((e) => {
        memo = null
        throw e
      })
  }
  return memo
}

export function useEatOut() {
  const [data, setData] = useState<EatData | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    let alive = true
    loadEatOut()
      .then((d) => alive && setData(d))
      .catch(() => alive && setError(true))
    return () => {
      alive = false
    }
  }, [])
  return { data, error, retry: () => loadEatOut(true).then(setData, () => setError(true)) }
}

export const eatNutrition = (it: EatItem): Nutrition => ({ kcal: Math.round(it.k), protein: it.p ?? 0, carbs: it.c ?? 0, fat: it.f ?? 0, fiber: it.fi ?? 0 })

const guessMeals = (it: EatItem, brand?: EatBrand): MealSlot[] => {
  const t = `${it.cat ?? ''}${it.n}`
  if (brand?.kind === 'drink' || /飲|茶|咖啡|拿鐵|奶|果汁|湯|甜點|蛋糕|優格/.test(t)) return ['breakfast', 'snack']
  if (/早餐|吐司|蛋餅|三明治|貝果|飯糰|麵包/.test(t)) return ['breakfast', 'lunch']
  return ['lunch', 'dinner']
}

/** 排進菜單時，把品項變成一筆「食譜」（沒有食材與做法），存進我的食譜才能離線也查得到 */
export function eatToRecipe(it: EatItem, brand?: EatBrand): Recipe {
  return {
    id: `eo-${it.id}`,
    name: brand && brand.kind !== 'generic' ? `${brand.name} ${it.n}` : it.n,
    image: itemImage(it, brand),
    color: '#fbe7d6',
    meals: guessMeals(it, brand),
    minutes: 0,
    tags: ['外食', ...(brand ? [brand.name] : []), ...(it.cat ? [it.cat] : [])],
    vegetarian: false,
    ingredients: [],
    steps: [],
    prep: [],
    nutrition: eatNutrition(it),
    eatout: { brandId: it.b, brand: brand?.name ?? '', serving: it.s, source: it.src ?? brand?.source, sodium: it.na, sugar: it.su },
    custom: true,
  }
}

/** 推薦分數：蛋白質多、熱量合理的在前面 */
export const eatScore = (it: EatItem) => (it.ko ? 0.05 : ((it.p ?? 0) * 4) / Math.max(it.k, 60)) + (it.k >= 250 && it.k <= 650 ? 0.15 : 0)
