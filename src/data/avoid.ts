import type { Recipe } from '../types'

export interface AvoidItem {
  id: string
  label: string
  emoji: string
}

export interface AvoidGroup {
  id: string
  label: string
  emoji: string
  items: AvoidItem[]
}

/** 過敏或不想吃的食物：大分類 → 細項 */
export const AVOID_GROUPS: AvoidGroup[] = [
  {
    id: 'seafood',
    label: '海鮮',
    emoji: '🦐',
    items: [
      { id: 'fish', label: '魚類', emoji: '🐟' },
      { id: 'shrimp', label: '蝦子', emoji: '🦐' },
      { id: 'crab', label: '螃蟹', emoji: '🦀' },
      { id: 'shellfish', label: '貝類・牡蠣', emoji: '🦪' },
      { id: 'squid', label: '花枝・魷魚・章魚', emoji: '🦑' },
    ],
  },
  {
    id: 'meat',
    label: '肉類',
    emoji: '🥩',
    items: [
      { id: 'beef', label: '牛肉', emoji: '🐄' },
      { id: 'pork', label: '豬肉', emoji: '🐖' },
      { id: 'chicken', label: '雞肉', emoji: '🐔' },
      { id: 'lamb', label: '羊肉', emoji: '🐑' },
      { id: 'duck', label: '鴨・鵝', emoji: '🦆' },
      { id: 'offal', label: '內臟', emoji: '🫀' },
    ],
  },
  {
    id: 'egg',
    label: '蛋',
    emoji: '🥚',
    items: [{ id: 'egg', label: '蛋', emoji: '🥚' }],
  },
  {
    id: 'dairy',
    label: '乳製品',
    emoji: '🥛',
    items: [
      { id: 'milk', label: '鮮奶', emoji: '🥛' },
      { id: 'cheese', label: '起司', emoji: '🧀' },
      { id: 'yogurt', label: '優格', emoji: '🍶' },
      { id: 'butter', label: '奶油', emoji: '🧈' },
    ],
  },
  {
    id: 'soy',
    label: '黃豆製品',
    emoji: '🫘',
    items: [
      { id: 'tofu', label: '豆腐', emoji: '⬜' },
      { id: 'soymilk', label: '豆漿', emoji: '🥛' },
      { id: 'soysauce', label: '醬油・豆瓣醬', emoji: '🍶' },
      { id: 'miso', label: '味噌', emoji: '🥣' },
      { id: 'edamame', label: '毛豆', emoji: '🫛' },
      { id: 'tempeh', label: '天貝', emoji: '🟫' },
    ],
  },
  {
    id: 'gluten',
    label: '麩質',
    emoji: '🌾',
    items: [
      { id: 'wheat', label: '小麥（麵、麵包、醬油）', emoji: '🍞' },
      { id: 'oats', label: '燕麥', emoji: '🥣' },
    ],
  },
  {
    id: 'nuts',
    label: '堅果種子',
    emoji: '🥜',
    items: [
      { id: 'peanut', label: '花生', emoji: '🥜' },
      { id: 'treenuts', label: '杏仁・核桃・腰果', emoji: '🌰' },
      { id: 'sesame', label: '芝麻', emoji: '⚪' },
    ],
  },
  {
    id: 'aromatics',
    label: '辛香料',
    emoji: '🧄',
    items: [
      { id: 'cilantro', label: '香菜', emoji: '🌿' },
      { id: 'scallion', label: '蔥', emoji: '🌱' },
      { id: 'onion', label: '洋蔥', emoji: '🧅' },
      { id: 'garlic', label: '蒜頭', emoji: '🧄' },
      { id: 'ginger', label: '薑', emoji: '🫚' },
      { id: 'chili', label: '辣', emoji: '🌶️' },
    ],
  },
  {
    id: 'veggies',
    label: '蔬菜',
    emoji: '🥬',
    items: [
      { id: 'mushroom', label: '菇類', emoji: '🍄' },
      { id: 'bellpepper', label: '青椒・甜椒', emoji: '🫑' },
      { id: 'eggplant', label: '茄子', emoji: '🍆' },
      { id: 'bittergourd', label: '苦瓜', emoji: '🥒' },
      { id: 'carrot', label: '紅蘿蔔', emoji: '🥕' },
      { id: 'celery', label: '芹菜', emoji: '🥬' },
      { id: 'tomato', label: '番茄', emoji: '🍅' },
    ],
  },
]

export const AVOID_ITEM_MAP: Record<string, AvoidItem> = Object.fromEntries(
  AVOID_GROUPS.flatMap((g) => g.items.map((i) => [i.id, i])),
)

/** 每種食材含有哪些「不想吃」的細項 */
const INGREDIENT_TAGS: Record<string, string[]> = {
  乾香菇: ['mushroom'],
  鴻喜菇: ['mushroom'],
  金針菇: ['mushroom'],
  蘑菇: ['mushroom'],
  乾麵條: ['wheat'],
  義大利麵: ['wheat'],
  全麥吐司: ['wheat'],
  蛋餅皮: ['wheat'],
  冷凍水餃: ['wheat', 'pork', 'scallion'],
  咖哩塊: ['wheat', 'milk'],
  燕麥片: ['oats'],
  穀麥片: ['oats', 'treenuts'],
  味噌: ['miso'],
  醬油: ['soysauce', 'wheat'],
  豆瓣醬: ['soysauce', 'wheat', 'chili'],
  '海苔肉鬆（素）': ['soysauce', 'wheat'],
  嫩豆腐: ['tofu'],
  板豆腐: ['tofu'],
  雞蛋豆腐: ['tofu', 'egg'],
  無糖豆漿: ['soymilk'],
  毛豆: ['edamame'],
  天貝: ['tempeh'],
  雞蛋: ['egg'],
  鮮奶: ['milk'],
  希臘優格: ['yogurt'],
  青醬: ['treenuts', 'cheese', 'garlic'],
  無糖花生醬: ['peanut'],
  綜合堅果: ['treenuts'],
  蝦仁: ['shrimp'],
  鮭魚: ['fish'],
  鱈魚: ['fish'],
  牛肉片: ['beef'],
  牛腱: ['beef'],
  豬絞肉: ['pork'],
  豬肉片: ['pork'],
  雞胸肉: ['chicken'],
  雞腿肉: ['chicken'],
  洋蔥: ['onion'],
  青蔥: ['scallion'],
  薑: ['ginger'],
  甜椒: ['bellpepper'],
  紅蘿蔔: ['carrot'],
  冷凍三色豆: ['carrot'],
  小番茄: ['tomato'],
  牛番茄: ['tomato'],
}

const cache = new Map<string, string[]>()

/** 一道食譜含有的所有「不想吃」細項 */
export const recipeAvoidTags = (recipe: Recipe) => {
  let tags = cache.get(recipe.id)
  if (!tags) {
    tags = [...new Set(recipe.ingredients.flatMap((i) => INGREDIENT_TAGS[i.name] ?? []))]
    cache.set(recipe.id, tags)
  }
  return tags
}

/** 舊版只有大分類，換成對應的細項 */
export const LEGACY_AVOID: Record<string, string[]> = {
  seafood: ['fish', 'shrimp', 'crab', 'shellfish', 'squid'],
  dairy: ['milk', 'cheese', 'yogurt', 'butter'],
  egg: ['egg'],
  peanut: ['peanut'],
  gluten: ['wheat', 'oats'],
  soy: ['tofu', 'soymilk', 'soysauce', 'miso', 'edamame', 'tempeh'],
  nuts: ['treenuts'],
}

/** 摘要文字：整類都選的顯示大分類名稱 */
export const summarizeAvoid = (avoid: string[]) => {
  const set = new Set(avoid)
  return AVOID_GROUPS.flatMap((g) => {
    const picked = g.items.filter((i) => set.has(i.id))
    if (!picked.length) return []
    if (picked.length === g.items.length && g.items.length > 1) return [`全部${g.label}`]
    return picked.map((i) => i.label)
  })
}
