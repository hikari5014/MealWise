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
  { id: 'convenience', label: '便利商店', image: 'eo-rice-ball' },
  { id: 'fastfood', label: '速食', image: 'eo-hamburger' },
  { id: 'cafe', label: '咖啡早午餐', image: 'eo-hot-beverage' },
  { id: 'asian', label: '中日式連鎖', image: 'eo-bento-box' },
  { id: 'drink', label: '手搖飲', image: 'eo-bubble-tea' },
  { id: 'generic', label: '一般小吃', image: 'eo-dumpling' },
]
export const KIND_IMAGE = Object.fromEntries(EAT_KINDS.map((k) => [k.id, k.image])) as Record<EatKind, FoodImage>

/** 外食品項一律用可愛的 icon（Fluent Emoji 3D）；順序有意義，先比較具體的 */
const NAME_IMAGE: [RegExp, FoodImage][] = [
  [/飯糰|手卷|飯卷/, 'eo-rice-ball'],
  [/三明治|潛艇|帕尼尼|吐司/, 'eo-sandwich'],
  [/大亨堡|熱狗|香腸/, 'eo-hot-dog'],
  [/漢堡|堡/, 'eo-hamburger'],
  [/披薩|比薩|pizza/i, 'eo-pizza'],
  [/捲餅|墨西哥|墨式/, 'eo-burrito'],
  [/塔可/, 'eo-taco'],
  [/蛋餅|潤餅|餡餅|蔥油餅|抓餅/, 'eo-stuffed-flatbread'],
  [/霜淇淋/, 'eo-soft-ice-cream'],
  [/冰淇淋|冰棒|雪糕|聖代|冰沙/, 'eo-ice-cream'],
  [/珍珠|波霸|奶茶|奶綠|鮮奶茶/, 'eo-bubble-tea'],
  [/咖啡|拿鐵|美式|卡布|摩卡|濃縮|瑪奇朵/, 'eo-hot-beverage'],
  [/豆漿|豆乳|牛奶|鮮奶|優酪|優格|乳/, 'eo-glass-of-milk'],
  [/茶/, 'eo-teacup-without-handle'],
  [/果汁|可樂|汽水|氣泡|飲|露|蘇打/, 'eo-cup-with-straw'],
  [/布丁|奶酪/, 'eo-custard'],
  [/甜甜圈/, 'eo-doughnut'],
  [/鬆餅/, 'eo-pancakes'],
  [/格子|比利時/, 'eo-waffle'],
  [/派|塔/, 'eo-pie'],
  [/蛋糕|千層|慕斯|捲|泡芙|蛋塔/, 'eo-shortcake'],
  [/可頌/, 'eo-croissant'],
  [/貝果/, 'eo-bagel'],
  [/餅乾|曲奇/, 'eo-cookie'],
  [/巧克力/, 'eo-chocolate-bar'],
  [/麵包|軟法|法國|饅頭|司康|馬芬/, 'eo-bread'],
  [/薯/, 'eo-french-fries'],
  [/包$|包子|饅頭/, 'eo-dumpling'],
  [/粽/, 'eo-rice-ball'],
  [/串|燒烤|烤肉/, 'eo-oden'],
  [/雞|棒腿/, 'eo-poultry-leg'],
  [/培根|火腿/, 'bacon'],
  [/魚|鯖|鯛|鮭|鱈|鮪/, 'fish'],
  [/豆花|仙草|愛玉|芋圓/, 'eo-custard'],
  [/豆腐|豆干/, 'eo-oden'],
  [/泡菜/, 'eo-green-salad'],
  [/燒餅|油條|蘿蔔糕|粿|土司/, 'eo-bread'],
  [/米漿/, 'eo-glass-of-milk'],
  [/洋芋片/, 'eo-french-fries'],
  [/栗子/, 'chestnut'],
  [/車輪餅|紅豆|大餅/, 'eo-moon-cake'],
  [/壽司|握壽司|生魚片/, 'eo-sushi'],
  [/咖哩/, 'eo-curry-rice'],
  [/便當|餐盒|盒餐/, 'eo-bento-box'],
  [/義大利麵|焗烤|通心粉|筆管|千層麵/, 'eo-spaghetti'],
  [/關東煮|黑輪|甜不辣|魚板|丸|米血/, 'eo-oden'],
  [/水餃|鍋貼|餃|包子|燒賣|湯包|小籠/, 'eo-dumpling'],
  [/丼|飯/, 'eo-cooked-rice'],
  [/粥|麵|粉|拉麵|烏龍/, 'eo-steaming-bowl'],
  [/湯|鍋|羹/, 'eo-pot-of-food'],
  [/沙拉|生菜|蔬/, 'eo-green-salad'],
  [/地瓜/, 'eo-roasted-sweet-potato'],
  [/蝦/, 'eo-fried-shrimp'],
  [/蛋/, 'eo-egg'],
  [/蘋果/, 'eo-red-apple'],
  [/香蕉/, 'eo-banana'],
  [/葡萄/, 'eo-grapes'],
  [/西瓜/, 'eo-watermelon'],
  [/莓/, 'eo-strawberry'],
  [/橘|柑|柳橙|橙/, 'eo-tangerine'],
  [/罐頭/, 'eo-canned-food'],
  [/月餅|酥/, 'eo-moon-cake'],
  [/肉|排|牛|豬|雞|鴨|羊/, 'eo-meat-on-bone'],
  [/麻糬|糰子|湯圓/, 'eo-dango'],
]

const KIND_FALLBACK: Record<EatKind, FoodImage> = {
  convenience: 'eo-takeout-box',
  fastfood: 'eo-hamburger',
  cafe: 'eo-hot-beverage',
  asian: 'eo-bento-box',
  drink: 'eo-bubble-tea',
  generic: 'eo-shallow-pan-of-food',
}

/** 依品名找 icon，找不到看分類，再找不到用店家類型 */
export const itemImage = (it: EatItem, brand?: EatBrand): FoodImage =>
  NAME_IMAGE.find(([re]) => re.test(it.n))?.[1] ??
  (it.cat ? NAME_IMAGE.find(([re]) => re.test(it.cat!))?.[1] : undefined) ??
  KIND_FALLBACK[brand?.kind ?? 'fastfood']

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
