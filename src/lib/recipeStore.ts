import { createContext, useContext } from 'react'
import { CUISINES, KINDS, type Cuisine, type Kind } from '../data/cuisine'
import type { FoodImage } from '../data/foodImages'
import { db } from '../db'
import { SECTION_LABEL, type Ingredient, type MealSlot, type Recipe, type Section, type Taste } from '../types'

/** 自訂食譜一變動就換一個值，讓有快取的畫面知道要重算 */
export const RecipesVersion = createContext('')
export const useRecipesVersion = () => useContext(RecipesVersion)

export const newRecipeId = () => `u-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export const saveCustomRecipe = (r: Recipe) => db.recipes.put({ ...r, custom: true, createdAt: r.createdAt ?? Date.now() })
export const deleteCustomRecipe = (id: string) => db.recipes.delete(id)

/* ───────────── 貼上 JSON ───────────── */

export const RECIPE_JSON_TEMPLATE = `{
  "name": "番茄雞胸義大利麵",
  "meals": ["午餐", "晚餐"],
  "minutes": 20,
  "cuisine": "西式",
  "kind": "麵食",
  "tags": ["高蛋白"],
  "vegetarian": false,
  "photo": "https://example.com/pasta.jpg",
  "nutrition": { "kcal": 520, "protein": 35, "carbs": 60, "fat": 12, "fiber": 6 },
  "ingredients": [
    { "name": "雞胸肉", "qty": 150, "unit": "g", "section": "肉類海鮮" },
    { "name": "全麥義大利麵", "qty": 80, "unit": "g", "section": "米麵主食" },
    { "name": "牛番茄", "qty": 1, "unit": "顆", "section": "蔬菜水果" }
  ],
  "steps": ["義大利麵煮熟", "雞胸切丁煎熟", "加番茄煮成醬，拌入麵條"],
  "prep": [{ "task": "雞胸切丁醃好", "keep": "冷藏 2 天" }]
}`

/** 給 AI 的提示詞：把任何食譜（網址、文字、截圖）轉成上面的格式 */
export const RECIPE_JSON_PROMPT = `請把我接下來提供的食譜（文字、網址內容或截圖）整理成下面的 JSON 格式，只回覆 JSON，不要其他文字。
- 份量與營養都以「1 人份」計算，營養素用整數（公克／大卡）
- meals 從「早餐、午餐、晚餐、點心」挑；cuisine 從「台式、中式、日式、韓式、泰越東南亞、西式、地中海、美墨、其他」挑
- kind 從「飯類、麵食、沙拉涼拌、湯品、吐司捲餅、盤餐配菜、飲品、小點心」挑
- ingredients 的 section 從「蔬菜水果、肉類海鮮、蛋豆乳製品、米麵主食、調味乾貨」挑
- 沒有照片網址就省略 photo

${RECIPE_JSON_TEMPLATE}`

const MEAL_WORDS: Record<string, MealSlot> = {
  早餐: 'breakfast',
  breakfast: 'breakfast',
  午餐: 'lunch',
  lunch: 'lunch',
  晚餐: 'dinner',
  dinner: 'dinner',
  點心: 'snack',
  snack: 'snack',
}

const SECTION_BY_LABEL = Object.fromEntries(
  (Object.entries(SECTION_LABEL) as [Section, string][]).flatMap(([k, v]) => [
    [k, k],
    [v, k],
  ]),
) as Record<string, Section>

const findCuisine = (v: unknown): Cuisine | undefined => {
  const s = String(v ?? '').trim()
  return CUISINES.find((c) => c.id === s || c.label === s || c.label.includes(s) || (s && s.includes(c.label)))?.id
}
const findKind = (v: unknown): Kind | undefined => {
  const s = String(v ?? '').trim()
  return KINDS.find((k) => k.id === s || k.label === s || k.label.includes(s))?.id
}

/** 依食材名稱猜它在賣場的哪一區 */
export const guessSection = (name: string): Section => {
  if (/[蝦蟹魚貝蚵肉雞豬牛羊鴨培根火腿香腸]/.test(name) && !/[蛋]/.test(name)) return 'protein'
  if (/[蛋豆腐乳奶起司優格]/.test(name)) return 'dairyEgg'
  if (/[米飯麵粉吐司麵包燕麥餅皮藜麥]/.test(name)) return 'grain'
  if (/[鹽糖醬油醋粉胡椒香料]/.test(name)) return 'pantry'
  return 'produce'
}

const num = (v: unknown, fallback = 0) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/[^\d.]/g, ''))
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

const IMAGE_BY_KIND: Record<Kind, FoodImage> = {
  rice: 'rice',
  noodle: 'spaghetti',
  salad: 'salad',
  soup: 'pot',
  bread: 'bread',
  plate: 'stew',
  drink: 'cup-straw',
  snack: 'apple',
}

const COLORS = ['rgb(var(--honey-soft))', '#e3eedf', '#fbe5de', '#f1ece2', '#e0f0f9']

/** 把一筆（寬鬆的）資料整理成食譜；有問題就丟出看得懂的錯誤 */
export function normalizeRecipe(raw: Record<string, unknown>, id = newRecipeId()): Recipe {
  const name = String(raw.name ?? raw.title ?? raw['名稱'] ?? '').trim()
  if (!name) throw new Error('少了食譜名稱（name）')
  const mealsRaw = Array.isArray(raw.meals) ? raw.meals : String(raw.meals ?? '').split(/[、,，\s]+/)
  const meals = [...new Set(mealsRaw.map((m) => MEAL_WORDS[String(m).trim().toLowerCase()] ?? MEAL_WORDS[String(m).trim()]).filter(Boolean))]
  const n = (raw.nutrition ?? {}) as Record<string, unknown>
  const nutrition = {
    kcal: Math.round(num(n.kcal ?? n['熱量'] ?? raw.kcal)),
    protein: Math.round(num(n.protein ?? n['蛋白質'])),
    carbs: Math.round(num(n.carbs ?? n['碳水'])),
    fat: Math.round(num(n.fat ?? n['脂肪'])),
    fiber: Math.round(num(n.fiber ?? n['纖維'])),
  }
  if (!nutrition.kcal) throw new Error(`「${name}」少了熱量（nutrition.kcal）`)
  const ingredients: Ingredient[] = (Array.isArray(raw.ingredients) ? raw.ingredients : [])
    .map((x) => {
      if (typeof x === 'string') return { name: x.trim(), qty: 1, unit: '份', section: guessSection(x) }
      const o = x as Record<string, unknown>
      const iname = String(o.name ?? '').trim()
      return {
        name: iname,
        qty: num(o.qty ?? o.amount, 1),
        unit: String(o.unit ?? '份').trim() || '份',
        section: SECTION_BY_LABEL[String(o.section ?? '').trim()] ?? guessSection(iname),
      }
    })
    .filter((x) => x.name)
  const steps = (Array.isArray(raw.steps) ? raw.steps : String(raw.steps ?? '').split('\n')).map((s) => String(s).trim()).filter(Boolean)
  const prep = (Array.isArray(raw.prep) ? raw.prep : [])
    .map((p) => {
      const o = p as Record<string, unknown>
      return { task: String(o.task ?? '').trim(), keep: String(o.keep ?? '').trim() }
    })
    .filter((p) => p.task)
  const tags = (Array.isArray(raw.tags) ? raw.tags : String(raw.tags ?? '').split(/[、,，]/)).map((t) => String(t).trim()).filter(Boolean)
  const cuisine = findCuisine(raw.cuisine)
  const kind = findKind(raw.kind)
  const photo = String(raw.photo ?? raw.photoUrl ?? raw.image ?? '').trim()
  return {
    id,
    name,
    image: IMAGE_BY_KIND[kind ?? 'plate'],
    color: COLORS[name.length % COLORS.length],
    meals: meals.length ? meals : ['lunch', 'dinner'],
    minutes: Math.round(num(raw.minutes, 20)) || 20,
    tags,
    vegetarian: raw.vegetarian === true || raw.vegetarian === 'true',
    ingredients,
    steps,
    prep,
    nutrition,
    cuisine,
    kind,
    custom: true,
    photoUrl: /^https?:\/\//.test(photo) ? photo : undefined,
  }
}

/** 解析貼上的 JSON（單一食譜或陣列；可以夾在 ``` 程式碼區塊裡） */
export function parseRecipeJson(text: string): Recipe[] {
  const cleaned = text.replace(/```(?:json)?/gi, '').trim()
  const start = cleaned.search(/[[{]/)
  if (start < 0) throw new Error('找不到 JSON 內容')
  let data: unknown
  try {
    data = JSON.parse(cleaned.slice(start))
  } catch {
    const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'))
    try {
      data = JSON.parse(cleaned.slice(start, end + 1))
    } catch {
      throw new Error('JSON 格式不正確，檢查一下逗號和引號')
    }
  }
  const list = Array.isArray(data) ? data : [data]
  return list.map((x) => normalizeRecipe(x as Record<string, unknown>))
}

/* ───────────── 口味偏好 ───────────── */

export const EMPTY_TASTE: Taste = { cuisines: [], kinds: [], favorites: [], dislikes: [] }

export const getTaste = (p?: { taste?: Taste } | null): Taste => ({ ...EMPTY_TASTE, ...p?.taste })

export const updateTaste = async (fn: (t: Taste) => Taste) => {
  const p = await db.profile.get('me')
  if (!p) return
  await db.profile.update('me', { taste: fn(getTaste(p)) })
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

export const toggleFavorite = (id: string) =>
  updateTaste((t) => ({ ...t, favorites: toggle(t.favorites, id), dislikes: t.dislikes.filter((x) => x !== id) }))

export const toggleDislike = (id: string) =>
  updateTaste((t) => ({ ...t, dislikes: toggle(t.dislikes, id), favorites: t.favorites.filter((x) => x !== id) }))
