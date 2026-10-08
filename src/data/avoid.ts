import type { Recipe } from '../types'
import type { FoodImage } from './foodImages'

export interface AvoidItem {
  id: string
  label: string
  image: FoodImage
}

export interface AvoidGroup {
  id: string
  label: string
  image: FoodImage
  items: AvoidItem[]
}

/** 過敏或不想吃的食物：大分類 → 細項 */
export const AVOID_GROUPS: AvoidGroup[] = [
  {
    id: 'seafood',
    label: '海鮮',
    image: 'shrimp',
    items: [
      { id: 'fish', label: '魚類', image: 'fish' },
      { id: 'shrimp', label: '蝦子', image: 'shrimp' },
      { id: 'crab', label: '螃蟹', image: 'crab' },
      { id: 'shellfish', label: '貝類・牡蠣', image: 'oyster' },
      { id: 'squid', label: '花枝・魷魚・章魚', image: 'squid' },
    ],
  },
  {
    id: 'meat',
    label: '肉類',
    image: 'meat',
    items: [
      { id: 'beef', label: '牛肉', image: 'cow' },
      { id: 'pork', label: '豬肉', image: 'pig' },
      { id: 'chicken', label: '雞肉', image: 'poultry' },
      { id: 'lamb', label: '羊肉', image: 'ewe' },
      { id: 'duck', label: '鴨・鵝', image: 'duck' },
      { id: 'offal', label: '內臟', image: 'heart' },
    ],
  },
  {
    id: 'egg',
    label: '蛋',
    image: 'egg',
    items: [{ id: 'egg', label: '蛋', image: 'egg' }],
  },
  {
    id: 'dairy',
    label: '乳製品',
    image: 'milk',
    items: [
      { id: 'milk', label: '鮮奶', image: 'milk' },
      { id: 'cheese', label: '起司', image: 'cheese' },
      { id: 'yogurt', label: '優格', image: 'jar' },
      { id: 'butter', label: '奶油', image: 'butter' },
    ],
  },
  {
    id: 'soy',
    label: '黃豆製品',
    image: 'beans',
    items: [
      { id: 'tofu', label: '豆腐', image: 'oden' },
      { id: 'soymilk', label: '豆漿', image: 'cup-straw' },
      { id: 'soysauce', label: '醬油・豆瓣醬', image: 'salt' },
      { id: 'miso', label: '味噌', image: 'oats' },
      { id: 'edamame', label: '毛豆', image: 'pea-pod' },
      { id: 'tempeh', label: '天貝', image: 'beans' },
    ],
  },
  {
    id: 'gluten',
    label: '麩質',
    image: 'grain',
    items: [
      { id: 'wheat', label: '小麥（麵、麵包、醬油）', image: 'bread' },
      { id: 'oats', label: '燕麥', image: 'oats' },
    ],
  },
  {
    id: 'nuts',
    label: '堅果種子',
    image: 'peanuts',
    items: [
      { id: 'peanut', label: '花生', image: 'peanuts' },
      { id: 'treenuts', label: '杏仁・核桃・腰果', image: 'chestnut' },
      { id: 'sesame', label: '芝麻', image: 'rice-cracker' },
    ],
  },
  {
    id: 'aromatics',
    label: '辛香料',
    image: 'garlic',
    items: [
      { id: 'cilantro', label: '香菜', image: 'herb' },
      { id: 'scallion', label: '蔥', image: 'seedling' },
      { id: 'onion', label: '洋蔥', image: 'onion' },
      { id: 'garlic', label: '蒜頭', image: 'garlic' },
      { id: 'ginger', label: '薑', image: 'ginger' },
      { id: 'chili', label: '辣', image: 'hot-pepper' },
    ],
  },
  {
    id: 'veggies',
    label: '蔬菜',
    image: 'leafy-green',
    items: [
      { id: 'mushroom', label: '菇類', image: 'mushroom' },
      { id: 'bellpepper', label: '青椒・甜椒', image: 'bell-pepper' },
      { id: 'eggplant', label: '茄子', image: 'eggplant' },
      { id: 'bittergourd', label: '苦瓜', image: 'cucumber' },
      { id: 'carrot', label: '紅蘿蔔', image: 'carrot' },
      { id: 'celery', label: '芹菜', image: 'herb' },
      { id: 'tomato', label: '番茄', image: 'tomato' },
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
  乳清蛋白粉: ['milk'],
  水煮鮪魚罐頭: ['fish'],
  水煮蛋: ['egg'],
  雞蛋白: ['egg'],
  韓式泡菜: ['chili', 'shrimp'],
  綜合生魚片: ['fish'],
  鯛魚片: ['fish'],
  和風醬: ['soysauce', 'wheat', 'sesame'],
  帕瑪森起司: ['cheese'],
  茅屋起司: ['cheese'],

  煙燻鮭魚: ['fish'],
  生食級鮭魚: ['fish'],
  鯖魚: ['fish'],
  全麥貝果: ['wheat', 'sesame'],
  奶油乳酪: ['cheese'],
  菲達起司: ['cheese'],
  起司絲: ['cheese'],
  紫洋蔥: ['onion'],
  全麥墨西哥餅皮: ['wheat'],
  莎莎醬: ['tomato', 'onion', 'chili'],
  雞絞肉: ['chicken'],
  去骨雞腿排: ['chicken'],
  牛絞肉: ['beef'],
  蒜頭: ['garlic'],
  辣椒: ['chili'],
  魚露: ['fish'],
  韓式辣醬: ['chili', 'wheat', 'soysauce'],
  黃豆芽: ['edamame'],
  蝦子: ['shrimp'],
  蕎麥麵: ['wheat'],
  芝麻醬: ['sesame'],
  白芝麻: ['sesame'],
  照燒醬: ['soysauce', 'wheat'],
  全麥義大利麵: ['wheat'],
  番茄罐頭: ['tomato'],
  鷹嘴豆泥: ['sesame', 'garlic'],

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
