import type { IconName } from '../lib/icons'
import type { Ingredient, MealSlot, Nutrition, Recipe, Section } from '../types'
import type { Cuisine, Kind } from './cuisine'
import type { FoodImage } from './foodImages'

/**
 * 料理組合器：挑食材 + 烹調方式 → 自動產生食譜與營養。
 * 營養是每 `base` 份量的估計值（生重；飯麵為熟重），參考衛福部食品營養成分資料庫的常見數值四捨五入。
 */
export type Part = 'protein' | 'veg' | 'fruit' | 'carb' | 'fat' | 'flavor' | 'other'

/** 第一層分類（蛋豆魚肉、蔬菜、水果…） */
export type GroupId = 'meat' | 'sea' | 'egg' | 'bean' | 'veg' | 'fruit' | 'carb' | 'fat' | 'flavor' | 'other'

export interface Comp {
  id: string
  name: string
  /** 放在菜名裡的短名 */
  short: string
  part: Part
  group: GroupId
  /** 第二層分類，例如「豬肉」 */
  sub: string
  image: FoodImage
  section: Section
  unit: string
  /** 營養以多少 unit 為基準 */
  base: number
  /** 預設份量與每次加減 */
  qty: number
  step: number
  n: [kcal: number, protein: number, carbs: number, fat: number, fiber: number]
  meat?: boolean
  /** 調味：菜名前綴、偏向的國家料理 */
  prefix?: string
  cuisine?: Cuisine
  /** 切法／前處理 */
  cut?: string
  /** 熟度提醒 */
  done?: string
}

type Raw = Omit<Comp, 'group' | 'sub' | 'part'> & { part?: Part }

const c = (
  id: string,
  name: string,
  image: FoodImage,
  section: Section,
  unit: string,
  base: number,
  qty: number,
  step: number,
  n: Comp['n'],
  extra: Partial<Comp> = {},
): Raw => ({ id, name, short: name, image, section, unit, base, qty, step, n, ...extra })

/** g 計、每 100g 的營養 */
const g = (id: string, name: string, image: FoodImage, section: Section, qty: number, n: Comp['n'], extra: Partial<Comp> = {}) =>
  c(id, name, image, section, 'g', 100, qty, qty >= 100 ? 25 : qty >= 40 ? 10 : 5, n, extra)

export interface Group {
  id: GroupId
  label: string
  image: FoodImage
  part: Part
  subs: { label: string; items: Comp[] }[]
}

const MEAT = { meat: true }
const PORK_DONE = '表面全變白、中心微粉即可'
const CHICKEN_DONE = '中心不再粉紅、切開流出清澈肉汁'
const BEEF_DONE = '變色就起鍋，才不會老'
const FISH_DONE = '魚肉由透明轉不透明、一壓就散'
const SHELL_DONE = '殼一打開就熟，沒開的丟掉'

const RAW: { id: GroupId; label: string; image: FoodImage; part: Part; subs: [string, Raw[]][] }[] = [
  {
    id: 'meat',
    label: '肉類',
    image: 'steak',
    part: 'protein',
    subs: [
      [
        '豬肉',
        [
          g('pork-loin', '豬里肌', 'pig', 'protein', 120, [140, 21, 0, 6, 0], { ...MEAT, cut: '切薄片，用刀背拍鬆', done: PORK_DONE }),
          g('pork-tenderloin', '腰內肉', 'pig', 'protein', 120, [120, 21, 0, 3.5, 0], { ...MEAT, short: '腰內肉', cut: '切 1 公分厚圓片', done: PORK_DONE }),
          g('pork-shoulder', '梅花肉', 'pig', 'protein', 120, [230, 17, 0, 18, 0], { ...MEAT, short: '梅花豬', cut: '切片', done: PORK_DONE }),
          g('pork-jowl', '豬頸肉（松阪豬）', 'pig', 'protein', 100, [300, 16, 0, 26, 0], { ...MEAT, short: '松阪豬', cut: '整塊煎或切斜片', done: PORK_DONE }),
          g('pork-belly', '五花肉', 'bacon', 'protein', 100, [370, 14, 0, 35, 0], { ...MEAT, short: '五花肉', cut: '切薄片', done: PORK_DONE }),
          g('pork-mince', '瘦豬絞肉', 'pig', 'protein', 120, [200, 18, 0, 14, 0], { ...MEAT, short: '豬絞肉', cut: '加一點水攪到有黏性', done: '全部變色、沒有粉紅' }),
          g('pork-ribs', '豬小排', 'pig', 'protein', 150, [280, 16, 0, 24, 0], { ...MEAT, short: '排骨', cut: '冷水下鍋汆燙去血水', done: '筷子能輕鬆穿過' }),
        ],
      ],
      [
        '雞肉',
        [
          g('chicken-breast', '雞胸肉', 'poultry', 'protein', 150, [117, 23, 0, 2, 0], { ...MEAT, short: '雞胸', cut: '切成約 1.5 公分厚的片', done: CHICKEN_DONE }),
          g('chicken-thigh', '去皮雞腿肉', 'poultry', 'protein', 150, [125, 19, 0, 5, 0], { ...MEAT, short: '雞腿', cut: '切成一口大小', done: CHICKEN_DONE }),
          g('chicken-tender', '雞柳', 'poultry', 'protein', 150, [110, 23, 0, 1.5, 0], { ...MEAT, short: '雞柳', cut: '去掉白筋', done: CHICKEN_DONE }),
          g('drumstick', '棒棒腿（去皮）', 'poultry', 'protein', 180, [130, 19, 0, 5.5, 0], { ...MEAT, short: '棒棒腿', cut: '劃兩刀幫助入味', done: '骨頭旁不帶血水' }),
          g('chicken-mince', '雞絞肉', 'poultry', 'protein', 120, [150, 18, 0, 8.5, 0], { ...MEAT, short: '雞絞肉', cut: '加一點鹽攪到有黏性', done: '全部變白' }),
        ],
      ],
      [
        '牛肉',
        [
          g('beef-lean', '瘦牛肉片', 'steak', 'protein', 120, [150, 21, 0, 7, 0], { ...MEAT, short: '牛肉', cut: '逆紋切片', done: BEEF_DONE }),
          g('beef-sirloin', '沙朗牛排', 'steak', 'protein', 150, [200, 20, 0, 13, 0], { ...MEAT, short: '牛排', cut: '退冰到室溫、擦乾', done: '每面 2–3 分鐘，起鍋靜置 5 分鐘' }),
          g('beef-shank', '牛腱', 'steak', 'protein', 120, [125, 21, 0, 4.5, 0], { ...MEAT, short: '牛腱', cut: '整條汆燙後切塊', done: '筷子能穿過' }),
          g('beef-mince', '牛絞肉', 'steak', 'protein', 120, [220, 19, 0, 15, 0], { ...MEAT, short: '牛絞肉', cut: '撥散', done: '全部變色' }),
        ],
      ],
      [
        '其他',
        [
          g('lamb', '羊肉片', 'meat', 'protein', 120, [200, 19, 0, 13, 0], { ...MEAT, short: '羊肉', cut: '解凍後擦乾', done: BEEF_DONE }),
          g('duck-breast', '鴨胸（去皮）', 'duck', 'protein', 130, [130, 20, 0, 5, 0], { ...MEAT, short: '鴨胸', cut: '切斜片', done: '中心微粉' }),
        ],
      ],
    ],
  },
  {
    id: 'sea',
    label: '海鮮',
    image: 'salmon',
    part: 'protein',
    subs: [
      [
        '魚',
        [
          g('salmon', '鮭魚', 'fish', 'protein', 120, [200, 20, 0, 13, 0], { ...MEAT, cut: '擦乾表面水分', done: FISH_DONE }),
          g('white-fish', '鯛魚片', 'tropical-fish', 'protein', 150, [100, 20, 0, 2, 0], { ...MEAT, short: '鯛魚', cut: '切成大塊、擦乾', done: FISH_DONE }),
          g('mackerel', '鯖魚', 'fish', 'protein', 100, [205, 19, 0, 14, 0], { ...MEAT, cut: '擦乾，皮面劃兩刀', done: '皮面金黃、肉不透明' }),
          g('seabass', '鱸魚', 'fish', 'protein', 150, [105, 19, 0, 3, 0], { ...MEAT, cut: '擦乾，切大塊', done: FISH_DONE }),
          g('cod', '鱈魚', 'tropical-fish', 'protein', 150, [80, 18, 0, 0.7, 0], { ...MEAT, cut: '擦乾，撒少許鹽', done: FISH_DONE }),
          g('milkfish', '虱目魚肚', 'fish', 'protein', 120, [200, 18, 0, 14, 0], { ...MEAT, short: '虱目魚', cut: '擦乾', done: '皮面金黃' }),
          g('tuna-can', '水煮鮪魚罐頭', 'fish', 'protein', 80, [110, 25, 0, 1, 0], { ...MEAT, short: '鮪魚', cut: '瀝乾湯汁' }),
        ],
      ],
      [
        '蝦蟹',
        [
          g('shrimp', '蝦仁', 'shrimp', 'protein', 120, [90, 20, 0, 1, 0], { ...MEAT, cut: '去腸泥，用一點太白粉抓洗後擦乾', done: '捲起變紅就熟' }),
          g('prawn', '白蝦（帶殼）', 'shrimp', 'protein', 180, [60, 13, 0, 0.7, 0], { ...MEAT, short: '鮮蝦', cut: '剪鬚、開背去腸泥', done: '殼變紅、肉捲起' }),
          g('lobster', '龍蝦／大明蝦', 'lobster', 'protein', 200, [50, 10, 0, 0.5, 0], { ...MEAT, short: '明蝦', cut: '對半剖開', done: '肉變白不透明' }),
        ],
      ],
      [
        '貝類',
        [
          g('clam', '蛤蜊（帶殼）', 'oyster', 'protein', 300, [30, 5, 1.5, 0.4, 0], { ...MEAT, short: '蛤蜊', cut: '泡鹽水吐沙 1 小時', done: SHELL_DONE }),
          g('scallop', '干貝', 'oyster', 'protein', 100, [90, 17, 3, 0.8, 0], { ...MEAT, cut: '退冰後擦乾', done: '兩面金黃、中心微透' }),
          g('oyster', '鮮蚵', 'oyster', 'protein', 100, [80, 9, 5, 2.3, 0], { ...MEAT, short: '鮮蚵', cut: '用太白粉輕輕抓洗', done: '邊緣捲起' }),
        ],
      ],
      [
        '花枝章魚',
        [
          g('squid', '花枝', 'squid', 'protein', 120, [75, 15, 1, 1, 0], { ...MEAT, cut: '切圈或切花', done: '捲起變白就起鍋，煮太久會硬' }),
          g('calamari', '透抽／小卷', 'squid', 'protein', 120, [80, 16, 1, 1, 0], { ...MEAT, short: '透抽', cut: '切圈', done: '變白捲起' }),
          g('octopus', '章魚', 'octopus', 'protein', 100, [80, 15, 2, 1, 0], { ...MEAT, cut: '切小段', done: '快速燙 1 分鐘' }),
        ],
      ],
    ],
  },
  {
    id: 'egg',
    label: '蛋',
    image: 'egg',
    part: 'protein',
    subs: [
      [
        '蛋',
        [
          c('egg', '雞蛋', 'egg', 'dairyEgg', '顆', 1, 2, 1, [75, 7, 0.5, 5, 0], { short: '蛋', cut: '打散，加一小撮鹽' }),
          c('egg-white', '蛋白', 'egg', 'dairyEgg', '顆', 1, 3, 1, [17, 3.6, 0.2, 0, 0], { short: '蛋白', cut: '只留蛋白打散' }),
          c('duck-egg', '鴨蛋', 'egg', 'dairyEgg', '顆', 1, 1, 1, [130, 9, 1, 10, 0], { short: '鴨蛋', cut: '打散' }),
          c('quail-egg', '鵪鶉蛋', 'egg', 'dairyEgg', '顆', 1, 6, 2, [16, 1.3, 0.1, 1.1, 0], { short: '鵪鶉蛋', cut: '煮熟剝殼' }),
        ],
      ],
    ],
  },
  {
    id: 'bean',
    label: '豆製品',
    image: 'tofu-firm',
    part: 'protein',
    subs: [
      [
        '豆腐豆干',
        [
          g('tofu', '板豆腐', 'beans', 'protein', 150, [88, 8.5, 2, 5, 0.6], { short: '豆腐', cut: '切塊，用廚房紙巾壓乾水分' }),
          g('silken-tofu', '嫩豆腐', 'beans', 'protein', 150, [50, 5, 1.5, 2.7, 0.3], { short: '嫩豆腐', cut: '小心切塊' }),
          g('dried-tofu', '豆干', 'beans', 'protein', 100, [160, 17, 4, 8.5, 1], { short: '豆干', cut: '切片或切丁' }),
        ],
      ],
      [
        '豆類',
        [
          g('edamame', '毛豆仁', 'pea-pod', 'produce', 80, [125, 13, 9, 5, 6], { short: '毛豆', cut: '洗淨瀝乾' }),
          g('tempeh', '天貝', 'beans', 'protein', 100, [192, 20, 8, 11, 5], { cut: '切片' }),
          g('chickpea', '鷹嘴豆（熟）', 'beans', 'pantry', 80, [165, 9, 27, 2.6, 7.6], { short: '鷹嘴豆', cut: '瀝乾' }),
          c('soy-milk', '無糖豆漿', 'milk', 'dairyEgg', 'ml', 100, 240, 60, [35, 3.6, 1.5, 1.8, 0.5], { short: '豆漿' }),
        ],
      ],
    ],
  },
  {
    id: 'veg',
    label: '蔬菜',
    image: 'broccoli',
    part: 'veg',
    subs: [
      [
        '葉菜',
        [
          g('cabbage', '高麗菜', 'leafy-green', 'produce', 120, [23, 1.3, 5, 0.1, 1.3], { cut: '剝片撕小塊' }),
          g('napa', '大白菜', 'leafy-green', 'produce', 120, [13, 1, 2.5, 0.1, 1], { cut: '切段' }),
          g('spinach', '菠菜', 'leafy-green', 'produce', 100, [20, 2.5, 3, 0.3, 2.4], { cut: '切段，根部洗淨' }),
          g('bokchoy', '小白菜', 'leafy-green', 'produce', 100, [13, 1.4, 2, 0.2, 1.6], { cut: '切段' }),
          g('qingjiang', '青江菜', 'leafy-green', 'produce', 100, [12, 1.2, 2, 0.2, 1.5], { cut: '對半切開洗淨' }),
          g('water-spinach', '空心菜', 'leafy-green', 'produce', 100, [20, 1.5, 3, 0.3, 2.1], { cut: '切段' }),
          g('sweet-potato-leaves', '地瓜葉', 'leafy-green', 'produce', 100, [30, 3, 4, 0.5, 3], { cut: '摘嫩葉' }),
          g('lettuce', '美生菜', 'leafy-green', 'produce', 80, [14, 1, 3, 0.2, 1.2], { cut: '撕小片泡冰水' }),
        ],
      ],
      [
        '花果菜',
        [
          g('broccoli', '青花菜', 'broccoli', 'produce', 100, [30, 3, 5, 0.3, 3], { cut: '切小朵，莖削皮切片' }),
          g('cauliflower', '白花椰', 'broccoli', 'produce', 100, [25, 2, 5, 0.3, 2], { cut: '切小朵' }),
          g('zucchini', '櫛瓜', 'cucumber', 'produce', 100, [17, 1.2, 3, 0.3, 1], { cut: '切半月片' }),
          g('eggplant', '茄子', 'eggplant', 'produce', 100, [25, 1, 6, 0.2, 3], { cut: '切滾刀塊，泡鹽水防變色' }),
          g('bell-pepper', '甜椒', 'bell-pepper', 'produce', 60, [30, 1, 6, 0.2, 1.8], { cut: '去籽切條' }),
          g('tomato', '番茄', 'tomato', 'produce', 100, [20, 0.9, 4, 0.2, 1.2], { cut: '切塊' }),
          g('cucumber', '小黃瓜', 'cucumber', 'produce', 80, [13, 0.8, 3, 0.1, 1], { cut: '拍裂切段' }),
          g('bitter-melon', '苦瓜', 'cucumber', 'produce', 100, [18, 0.9, 4, 0.1, 2.8], { cut: '去籽切薄片' }),
          g('luffa', '絲瓜', 'cucumber', 'produce', 150, [17, 1, 3.5, 0.1, 0.6], { cut: '削皮切塊' }),
        ],
      ],
      [
        '根莖',
        [
          g('onion', '洋蔥', 'onion', 'produce', 50, [40, 1, 9, 0.1, 1.5], { cut: '切絲' }),
          g('carrot', '紅蘿蔔', 'carrot', 'produce', 40, [38, 1, 9, 0.2, 2.6], { cut: '切絲或薄片' }),
          g('daikon', '白蘿蔔', 'carrot', 'produce', 120, [18, 0.6, 4, 0.1, 1.3], { cut: '削皮切塊' }),
          g('burdock', '牛蒡', 'carrot', 'produce', 50, [85, 2.5, 18, 0.3, 6], { cut: '刷皮切絲泡水' }),
          g('lotus-root', '蓮藕', 'potato', 'produce', 80, [70, 2.4, 15, 0.1, 2.7], { cut: '削皮切薄片泡醋水' }),
        ],
      ],
      [
        '菇類',
        [
          g('shiitake', '香菇', 'mushroom', 'produce', 60, [35, 3, 7, 0.3, 3.8], { cut: '去蒂切片' }),
          g('king-oyster', '杏鮑菇', 'mushroom', 'produce', 80, [40, 2.7, 8, 0.2, 3], { cut: '切片或切條' }),
          g('shimeji', '鴻喜菇', 'mushroom', 'produce', 80, [25, 2.5, 5, 0.3, 2], { cut: '切掉根部剝小朵' }),
          g('enoki', '金針菇', 'mushroom', 'produce', 80, [37, 2.6, 8, 0.3, 2.3], { cut: '切掉根部撥散' }),
          g('wood-ear', '黑木耳', 'mushroom', 'produce', 60, [35, 1, 8, 0.2, 7], { cut: '切絲' }),
        ],
      ],
      [
        '豆莢筍類',
        [
          g('asparagus', '蘆筍', 'herb', 'produce', 80, [22, 2.2, 4, 0.2, 2], { cut: '削掉老皮切段' }),
          g('green-beans', '四季豆', 'pea-pod', 'produce', 80, [30, 1.8, 7, 0.1, 2.7], { cut: '撕掉老筋切段' }),
          g('snow-peas', '豌豆莢', 'pea-pod', 'produce', 60, [40, 2.8, 7, 0.2, 2.6], { cut: '撕掉老筋' }),
          g('baby-corn', '玉米筍', 'corn', 'produce', 60, [30, 2, 6, 0.2, 2], { cut: '斜切段' }),
        ],
      ],
      [
        '其他',
        [
          g('celery', '芹菜', 'celery', 'produce', 60, [14, 0.7, 3, 0.2, 1.6], { cut: '切段' }),
          g('cauli-rice', '花椰菜米', 'broccoli', 'produce', 120, [25, 2, 5, 0.3, 2], { cut: '花椰菜切碎成米粒大小（或買現成）' }),
          g('wakame', '海帶芽（泡開）', 'leafy-green', 'produce', 40, [18, 1.5, 4, 0.3, 3], { short: '海帶芽', cut: '泡水 5 分鐘瀝乾' }),
        ],
      ],
    ],
  },
  {
    id: 'fruit',
    label: '水果',
    image: 'apple',
    part: 'fruit',
    subs: [
      [
        '常見',
        [
          g('apple', '蘋果', 'apple', 'produce', 100, [52, 0.3, 14, 0.2, 2.4], { cut: '切片' }),
          g('banana', '香蕉', 'banana', 'produce', 100, [89, 1.1, 23, 0.3, 2.6], { cut: '切片' }),
          g('guava', '芭樂', 'pear', 'produce', 120, [38, 0.7, 9, 0.1, 3], { cut: '切塊' }),
          g('orange', '柳橙', 'tangerine', 'produce', 120, [47, 0.9, 12, 0.1, 2.4], { cut: '剝皮分瓣' }),
          g('pear', '水梨', 'pear', 'produce', 120, [42, 0.3, 11, 0.1, 2], { cut: '切塊' }),
        ],
      ],
      [
        '熱帶',
        [
          g('pineapple', '鳳梨', 'pineapple', 'produce', 100, [50, 0.5, 13, 0.1, 1.4], { cut: '切小塊' }),
          g('mango', '芒果', 'mango', 'produce', 100, [60, 0.8, 15, 0.4, 1.6], { cut: '切丁' }),
          g('kiwi', '奇異果', 'kiwi', 'produce', 100, [55, 1, 13, 0.3, 2.7], { cut: '切片' }),
        ],
      ],
      [
        '莓果',
        [
          g('strawberry', '草莓', 'strawberry', 'produce', 100, [32, 0.7, 8, 0.3, 2], { cut: '去蒂對切' }),
          g('blueberry', '藍莓', 'blueberries', 'produce', 60, [57, 0.7, 14, 0.3, 2.4], { cut: '洗淨瀝乾' }),
        ],
      ],
    ],
  },
  {
    id: 'carb',
    label: '主食',
    image: 'rice',
    part: 'carb',
    subs: [
      [
        '米飯',
        [
          g('white-rice', '白飯', 'rice', 'grain', 150, [183, 3.1, 41, 0.3, 0.6], { short: '飯' }),
          g('brown-rice', '糙米飯', 'rice', 'grain', 150, [165, 3.5, 35, 1.2, 1.8], { short: '飯' }),
          g('multigrain-rice', '五穀飯', 'rice', 'grain', 150, [170, 4, 35, 1.5, 2.5], { short: '飯' }),
          g('quinoa', '藜麥飯', 'grain', 'grain', 120, [120, 4.4, 21, 1.9, 2.8], { short: '藜麥' }),
        ],
      ],
      [
        '根莖',
        [
          g('sweet-potato', '地瓜', 'sweet-potato', 'produce', 150, [115, 1.2, 27, 0.2, 2.5], { cut: '切塊，電鍋蒸 25 分鐘（外鍋 1 杯水）' }),
          g('pumpkin', '南瓜', 'sweet-potato', 'produce', 150, [70, 2, 15, 0.2, 2], { cut: '切塊，電鍋蒸 15 分鐘' }),
          g('potato', '馬鈴薯', 'potato', 'produce', 150, [77, 2, 17, 0.1, 1.5], { cut: '切塊，電鍋蒸 20 分鐘' }),
          g('taro', '芋頭', 'potato', 'produce', 100, [130, 2.5, 26, 1, 2.3], { cut: '切塊，電鍋蒸 25 分鐘' }),
          g('corn', '玉米', 'corn', 'produce', 150, [105, 3.3, 22, 1.4, 2.4], { cut: '切段，水煮 10 分鐘' }),
        ],
      ],
      [
        '麵',
        [
          g('ww-pasta', '全麥義大利麵（熟）', 'spaghetti', 'grain', 150, [150, 5.5, 30, 1, 3.5], { short: '全麥麵' }),
          g('soba', '蕎麥麵（熟）', 'noodle-bowl', 'grain', 150, [115, 5, 24, 0.5, 2], { short: '蕎麥麵' }),
          g('udon', '烏龍麵（熟）', 'noodle-bowl', 'grain', 180, [105, 2.6, 22, 0.4, 0.8], { short: '烏龍麵' }),
          g('glass-noodle', '冬粉（泡開）', 'noodle-bowl', 'grain', 100, [85, 0.1, 21, 0, 0.5], { short: '冬粉麵' }),
        ],
      ],
      [
        '其他',
        [
          g('oats', '燕麥片', 'oats', 'grain', 40, [380, 13, 66, 7, 10]),
          c('toast', '全麥吐司', 'bread', 'grain', '片', 1, 2, 1, [90, 4, 15, 1.3, 2]),
        ],
      ],
    ],
  },
  {
    id: 'fat',
    label: '好油脂',
    image: 'avocado',
    part: 'fat',
    subs: [
      [
        '油',
        [
          c('olive-oil', '橄欖油', 'olive', 'pantry', '大匙', 1, 0.5, 0.5, [115, 0, 0, 13, 0]),
          c('camellia-oil', '苦茶油', 'droplet', 'pantry', '大匙', 1, 0.5, 0.5, [115, 0, 0, 13, 0], { cuisine: 'tw' }),
          c('avocado-oil', '酪梨油', 'droplet', 'pantry', '大匙', 1, 0.5, 0.5, [120, 0, 0, 14, 0]),
          c('sesame-oil', '黑麻油', 'droplet', 'pantry', '大匙', 1, 0.5, 0.5, [120, 0, 0, 14, 0], { cuisine: 'tw' }),
        ],
      ],
      [
        '堅果種子',
        [
          g('nuts', '綜合堅果', 'peanuts', 'pantry', 15, [600, 20, 20, 50, 8], { short: '堅果' }),
          g('almond', '杏仁片', 'chestnut', 'pantry', 15, [580, 21, 22, 50, 12], { short: '杏仁' }),
          g('cashew', '腰果', 'cashew', 'pantry', 15, [560, 18, 30, 44, 3.3]),
          g('walnut', '核桃', 'chestnut', 'pantry', 15, [650, 15, 14, 65, 7]),
          c('sesame', '白芝麻', 'grain', 'pantry', '大匙', 1, 1, 1, [52, 1.6, 2, 4.5, 1], { short: '芝麻' }),
          c('chia', '奇亞籽', 'grain', 'pantry', '大匙', 1, 1, 1, [58, 2, 5, 3.7, 4]),
        ],
      ],
      [
        '其他',
        [
          g('avocado', '酪梨', 'avocado', 'produce', 50, [160, 2, 9, 15, 6.7]),
          g('olives', '橄欖', 'olive', 'pantry', 20, [145, 1, 4, 15, 3.3]),
          c('cheese', '起司片', 'cheese', 'dairyEgg', '片', 1, 1, 1, [60, 4, 1, 4.5, 0]),
        ],
      ],
    ],
  },
  {
    id: 'flavor',
    label: '調味',
    image: 'soy-sauce',
    part: 'flavor',
    subs: [
      [
        '辛香料',
        [
          c('garlic', '蒜頭', 'garlic', 'produce', '瓣', 1, 3, 1, [4, 0.2, 1, 0, 0], { prefix: '蒜香', cuisine: 'tw' }),
          c('ginger', '薑絲', 'ginger', 'produce', 'g', 10, 10, 5, [2, 0, 0.5, 0, 0.2], { prefix: '薑絲', cuisine: 'tw' }),
          c('scallion', '青蔥', 'herb', 'produce', '根', 1, 1, 1, [5, 0.3, 1, 0, 0.4], { prefix: '蔥爆', cuisine: 'tw' }),
          c('basil', '九層塔', 'herb', 'produce', 'g', 10, 10, 5, [2, 0.3, 0.3, 0, 0.3], { prefix: '塔香', cuisine: 'tw' }),
          c('shallot', '紅蔥頭', 'shallot', 'produce', '顆', 1, 2, 1, [7, 0.2, 1.7, 0, 0.3], { prefix: '油蔥', cuisine: 'tw' }),
          c('chili', '辣椒', 'hot-pepper', 'produce', '根', 1, 1, 1, [4, 0.2, 0.9, 0, 0.3], { prefix: '辣炒' }),
          c('cilantro', '香菜', 'herb', 'produce', 'g', 10, 5, 5, [2, 0.2, 0.4, 0, 0.3]),
        ],
      ],
      [
        '中式醬料',
        [
          c('soy', '醬油', 'jar', 'pantry', '大匙', 1, 1, 0.5, [10, 1, 1, 0, 0], { prefix: '醬燒', cuisine: 'tw' }),
          c('oyster-sauce', '蠔油', 'jar', 'pantry', '大匙', 1, 1, 0.5, [20, 0.5, 4, 0, 0], { prefix: '蠔油', cuisine: 'cn' }),
          c('satay', '沙茶醬', 'jar', 'pantry', '大匙', 1, 1, 0.5, [80, 1, 1, 7.5, 0], { prefix: '沙茶', cuisine: 'tw' }),
          c('black-vinegar', '烏醋', 'jar', 'pantry', '大匙', 1, 1, 0.5, [8, 0, 2, 0, 0], { prefix: '醋溜', cuisine: 'tw' }),
        ],
      ],
      [
        '日韓',
        [
          c('miso', '味噌', 'jar', 'pantry', '大匙', 1, 1, 0.5, [35, 2, 4, 1, 1], { prefix: '味噌', cuisine: 'jp' }),
          c('shio-koji', '鹽麴', 'jar', 'pantry', '大匙', 1, 1, 0.5, [15, 0.5, 3, 0, 0], { prefix: '鹽麴', cuisine: 'jp' }),
          c('mirin', '味醂', 'jar', 'pantry', '大匙', 1, 1, 0.5, [40, 0, 7, 0, 0], { prefix: '照燒', cuisine: 'jp' }),
          g('kimchi', '韓式泡菜', 'leafy-green', 'produce', 60, [25, 1.5, 4, 0.5, 2], { prefix: '泡菜', cuisine: 'kr' }),
          c('gochujang', '韓式辣醬', 'hot-pepper', 'pantry', '大匙', 1, 1, 0.5, [35, 1, 7, 0.3, 0.5], { prefix: '韓式辣', cuisine: 'kr' }),
        ],
      ],
      [
        '西式南洋',
        [
          c('lemon', '檸檬', 'lemon', 'produce', '顆', 1, 0.5, 0.5, [15, 0.5, 5, 0, 1.5], { prefix: '檸檬', cuisine: 'west' }),
          c('pepper', '黑胡椒鹽', 'salt', 'pantry', '小匙', 1, 1, 1, [3, 0.1, 0.6, 0, 0.3], { prefix: '黑胡椒', cuisine: 'west' }),
          c('herbs', '義式香草', 'herb', 'pantry', '小匙', 1, 1, 1, [3, 0.1, 0.6, 0, 0.4], { prefix: '香草', cuisine: 'med' }),
          c('balsamic', '巴薩米克醋', 'jar', 'pantry', '大匙', 1, 1, 0.5, [14, 0, 2.7, 0, 0], { prefix: '油醋', cuisine: 'med' }),
          c('curry', '咖哩粉', 'curry', 'pantry', '小匙', 1, 1, 1, [7, 0.3, 1.2, 0.3, 0.6], { prefix: '咖哩', cuisine: 'sea' }),
          c('fish-sauce', '魚露', 'jar', 'pantry', '大匙', 1, 1, 0.5, [6, 0.9, 0.7, 0, 0], { prefix: '泰式', cuisine: 'sea' }),
        ],
      ],
    ],
  },
]

/** Gemini 生成的食材圖（art/inbox → public/food），沒有列在這裡的用原本的圖 */
const ART: Record<string, FoodImage> = {
  'beef-lean': 'beef-slices',
  'shrimp': 'shrimp-peeled',
  'oyster': 'oyster-meat',
  'squid': 'cuttlefish',
  'tofu': 'tofu-firm',
  'silken-tofu': 'tofu-silken',
  'eggplant': 'eggplant-long',
  'toast': 'ww-toast',
  'basil': 'thai-basil',
  'soy': 'soy-sauce',
  'curry': 'curry-powder',
  'pepper': 'black-pepper',
  'herbs': 'dried-herbs',
  'beef-sirloin': 'steak',
  'pork-loin': 'pork-loin',
  'pork-tenderloin': 'pork-tenderloin',
  'pork-shoulder': 'pork-shoulder',
  'pork-jowl': 'pork-jowl',
  'pork-belly': 'pork-belly',
  'pork-mince': 'pork-mince',
  'pork-ribs': 'pork-ribs',
  'chicken-breast': 'chicken-breast',
  'chicken-thigh': 'chicken-thigh',
  'chicken-tender': 'chicken-tender',
  'drumstick': 'drumstick',
  'chicken-mince': 'chicken-mince',
  'beef-shank': 'beef-shank',
  'beef-mince': 'beef-mince',
  'lamb': 'lamb',
  'duck-breast': 'duck-breast',
  'salmon': 'salmon',
  'white-fish': 'white-fish',
  'mackerel': 'mackerel',
  'seabass': 'seabass',
  'cod': 'cod',
  'milkfish': 'milkfish',
  'tuna-can': 'tuna-can',
  'prawn': 'prawn',
  'lobster': 'lobster',
  'clam': 'clam',
  'scallop': 'scallop',
  'calamari': 'calamari',
  'octopus': 'octopus',
  'egg-white': 'egg-white',
  'duck-egg': 'duck-egg',
  'quail-egg': 'quail-egg',
  'dried-tofu': 'dried-tofu',
  'edamame': 'edamame',
  'tempeh': 'tempeh',
  'chickpea': 'chickpea',
  'soy-milk': 'soy-milk',
  'cabbage': 'cabbage',
  'napa': 'napa',
  'spinach': 'spinach',
  'bokchoy': 'bokchoy',
  'qingjiang': 'qingjiang',
  'water-spinach': 'water-spinach',
  'sweet-potato-leaves': 'sweet-potato-leaves',
  'lettuce': 'lettuce',
  'cauliflower': 'cauliflower',
  'zucchini': 'zucchini',
  'bitter-melon': 'bitter-melon',
  'luffa': 'luffa',
  'daikon': 'daikon',
  'burdock': 'burdock',
  'lotus-root': 'lotus-root',
  'shiitake': 'shiitake',
  'king-oyster': 'king-oyster',
  'shimeji': 'shimeji',
  'enoki': 'enoki',
  'wood-ear': 'wood-ear',
  'asparagus': 'asparagus',
  'green-beans': 'green-beans',
  'snow-peas': 'snow-peas',
  'baby-corn': 'baby-corn',
  'cauli-rice': 'cauli-rice',
  'wakame': 'wakame',
  'guava': 'guava',
  'brown-rice': 'brown-rice',
  'multigrain-rice': 'multigrain-rice',
  'quinoa': 'quinoa',
  'pumpkin': 'pumpkin',
  'taro': 'taro',
  'udon': 'udon',
  'glass-noodle': 'glass-noodle',
  'olive-oil': 'olive-oil',
  'camellia-oil': 'camellia-oil',
  'avocado-oil': 'avocado-oil',
  'sesame-oil': 'sesame-oil',
  'almond': 'almond',
  'walnut': 'walnut',
  'sesame': 'sesame',
  'chia': 'chia',
  'scallion': 'scallion',
  'cilantro': 'cilantro',
  'oyster-sauce': 'oyster-sauce',
  'satay': 'satay',
  'black-vinegar': 'black-vinegar',
  'miso': 'miso',
  'shio-koji': 'shio-koji',
  'mirin': 'mirin',
  'kimchi': 'kimchi',
  'gochujang': 'gochujang',
  'balsamic': 'balsamic',
  'fish-sauce': 'fish-sauce',
}

export const GROUPS: Group[] = RAW.map((gr) => ({
  id: gr.id,
  label: gr.label,
  image: gr.image,
  part: gr.part,
  subs: gr.subs.map(([label, items]) => ({ label, items: items.map((x) => ({ ...x, image: ART[x.id] ?? x.image, part: gr.part, group: gr.id, sub: label })) })),
}))

export const COMPONENTS: Comp[] = GROUPS.flatMap((gr) => gr.subs.flatMap((s) => s.items))

/** 冰箱清單才用到的：乳品、現成醬料與其他常見食材（組合料理不顯示） */
const other = (id: string, name: string, image: FoodImage, section: Section, sub: string): Comp => ({
  id, name, short: name, part: 'other', group: 'other', sub, image, section, unit: '份', base: 1, qty: 1, step: 1, n: [0, 0, 0, 0, 0],
})
export const PANTRY_EXTRA: Group = {
  id: 'other',
  label: '乳品與其他',
  image: 'milk',
  part: 'other',
  subs: [
    { label: '乳品', items: [other('milk', '鮮奶', 'milk', 'dairyEgg', '乳品'), other('yogurt', '希臘優格', 'yogurt', 'dairyEgg', '乳品'), other('cheese-shred', '起司絲', 'cheese', 'dairyEgg', '乳品'), other('butter', '奶油', 'butter', 'dairyEgg', '乳品')] },
    { label: '蔬果', items: [other('mixed-greens', '綜合生菜', 'lettuce', 'produce', '蔬果'), other('bean-sprouts', '豆芽菜', 'seedling', 'produce', '蔬果'), other('frozen-veg', '冷凍三色豆', 'pea-pod', 'produce', '蔬果'), other('berries', '綜合莓果', 'blueberries', 'produce', '蔬果')] },
    { label: '醬料乾貨', items: [other('rice-wine', '米酒', 'jar', 'pantry', '醬料乾貨'), other('doubanjiang', '豆瓣醬', 'doubanjiang', 'pantry', '醬料乾貨'), other('honey', '蜂蜜', 'honey', 'pantry', '醬料乾貨'), other('dry-noodle', '乾麵條', 'noodle-bowl', 'grain', '醬料乾貨'), other('preserved-radish', '菜脯', 'jar', 'pantry', '醬料乾貨'), other('peanut-butter', '花生醬', 'peanuts', 'pantry', '醬料乾貨')] },
  ],
}
export const PANTRY_GROUPS: Group[] = [...GROUPS, PANTRY_EXTRA]
export const ALL_COMP_MAP: Record<string, Comp> = Object.fromEntries(PANTRY_GROUPS.flatMap((g) => g.subs.flatMap((s) => s.items)).map((x) => [x.id, x]))

export const COMP_MAP: Record<string, Comp> = Object.fromEntries(COMPONENTS.map((x) => [x.id, x]))

export const PART_LABEL: Record<Part, { label: string; hint: string; max: number }> = {
  protein: { label: '蛋白質', hint: '最多 2 樣', max: 2 },
  veg: { label: '蔬菜', hint: '最多 3 樣', max: 3 },
  fruit: { label: '水果', hint: '最多 2 樣', max: 2 },
  carb: { label: '主食', hint: '最多 1 樣，不選＝低碳', max: 1 },
  fat: { label: '好油脂', hint: '最多 2 樣', max: 2 },
  flavor: { label: '調味', hint: '最多 3 樣', max: 3 },
  other: { label: '其他', hint: '', max: 99 },
}

export type Method = 'pan' | 'stir' | 'oven' | 'steam' | 'soup' | 'cold' | 'air'

export const METHODS: { id: Method; label: string; verb: string; icon: IconName; image: FoodImage; oil: number; minutes: number }[] = [
  { id: 'pan', label: '煎', verb: '煎', icon: 'skillet', image: 'method-pan', oil: 0.5, minutes: 15 },
  { id: 'stir', label: '炒', verb: '炒', icon: 'skillet', image: 'method-stir', oil: 1, minutes: 15 },
  { id: 'oven', label: '烤箱', verb: '烤', icon: 'local_fire_department', image: 'method-oven', oil: 0.5, minutes: 25 },
  { id: 'air', label: '氣炸', verb: '氣炸', icon: 'local_fire_department', image: 'method-air', oil: 0.25, minutes: 20 },
  { id: 'steam', label: '蒸', verb: '蒸', icon: 'water_drop', image: 'method-steam', oil: 0, minutes: 20 },
  { id: 'soup', label: '煮湯', verb: '湯', icon: 'ramen_dining', image: 'method-soup', oil: 0, minutes: 30 },
  { id: 'cold', label: '涼拌', verb: '涼拌', icon: 'eco', image: 'method-cold', oil: 0.5, minutes: 15 },
]

export interface Combo {
  /** 食材 id → 份量 */
  items: Record<string, number>
  method: Method
}

const join = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join('、')}和${xs[xs.length - 1]}`)
const round = (x: number, d = 0) => Math.round(x * 10 ** d) / 10 ** d

export function comboParts(combo: Combo) {
  const list = Object.entries(combo.items)
    .map(([id, qty]) => ({ comp: COMP_MAP[id], qty }))
    .filter((x) => x.comp && x.qty > 0)
  const of = (p: Part) => list.filter((x) => x.comp.part === p)
  return { list, protein: of('protein'), veg: of('veg'), fruit: of('fruit'), carb: of('carb'), fat: of('fat'), flavor: of('flavor') }
}

export function comboNutrition(combo: Combo): Nutrition {
  const t = [0, 0, 0, 0, 0]
  for (const { comp, qty } of comboParts(combo).list) comp.n.forEach((v, i) => (t[i] += (v * qty) / comp.base))
  return { kcal: round(t[0]), protein: round(t[1]), carbs: round(t[2]), fat: round(t[3]), fiber: round(t[4], 1) }
}

/** 自動取名：蒜香煎雞胸佐青花菜、味噌烤鮭魚、薑絲鯛魚菠菜湯… */
export function comboName(combo: Combo) {
  const { protein, veg, fruit, carb, flavor } = comboParts(combo)
  const m = METHODS.find((x) => x.id === combo.method)!
  const prefix = flavor.find((f) => f.comp.prefix)?.comp.prefix ?? ''
  const p = protein.map((x) => x.comp.short).join('')
  const v = veg.slice(0, 2).map((x) => x.comp.short)
  if (!p && !v.length) return fruit.length ? `${fruit.map((x) => x.comp.short).join('')}${combo.method === 'cold' ? '沙拉' : '水果盤'}` : '我的組合料理'
  let name: string
  if (combo.method === 'soup') name = `${prefix}${p}${v.join('')}湯`
  else if (combo.method === 'stir') name = `${prefix}${v[0] ?? ''}炒${p || v[1] || ''}`
  else if (combo.method === 'cold') name = `${prefix}涼拌${p}${v.length && p ? '佐' : ''}${v.join('')}`
  else name = `${prefix}${m.verb}${p || v.join('')}${p && v.length ? `佐${v.join('')}` : ''}`
  const noodle = carb.find((x) => /麵/.test(x.comp.short))
  if (noodle && combo.method !== 'soup') name = `${prefix}${p}${v[0] ?? ''}${noodle.comp.short}`
  return name
}

/** 產生做法 */
export function comboSteps(combo: Combo): string[] {
  const { protein, veg, fruit, carb, fat, flavor } = comboParts(combo)
  const oil = fat.find((f) => /oil/.test(f.comp.id))
  const oilName = oil ? `${oil.comp.name} ${oil.qty} 大匙` : '少許油'
  const P = join(protein.map((x) => x.comp.name))
  const V = join(veg.map((x) => x.comp.name))
  const AROMA = ['garlic', 'ginger', 'basil', 'scallion', 'chili', 'cilantro']
  const aroma = flavor.filter((f) => AROMA.includes(f.comp.id))
  const sauce = flavor.filter((f) => !AROMA.includes(f.comp.id))
  const S = sauce.length ? join(sauce.map((x) => x.comp.name)) : '鹽'
  const marinade = sauce.filter((x) => !['kimchi', 'lemon', 'black-vinegar', 'balsamic'].includes(x.comp.id))
  const M = marinade.length ? marinade[0].comp.name : '鹽'
  const A = aroma.length ? join(aroma.map((x) => x.comp.name)) : ''
  const out: string[] = []

  for (const { comp } of protein) if (comp.cut) out.push(`${comp.name}${comp.cut}${comp.meat && combo.method !== 'soup' ? `，用一點${M}抓醃 10 分鐘` : ''}`)
  if (veg.length) out.push(veg.map((x) => `${x.comp.name}${x.comp.cut ?? '洗淨切好'}`).join('；'))
  if (aroma.length) out.push(`${A}切好備用`)
  const steamCarb = carb.filter((x) => x.comp.cut)
  if (steamCarb.length) out.push(steamCarb.map((x) => `${x.comp.name}${x.comp.cut}`).join('；') + '，趁這時間做其他步驟')
  const noodle = carb.find((x) => /麵/.test(x.comp.short))
  if (noodle) out.push(`${noodle.comp.short}照包裝煮熟，冷水沖過瀝乾`)

  const done = protein.map((x) => x.comp.done).filter(Boolean)[0]
  const doneText = done ? `（${done}）` : ''
  switch (combo.method) {
    case 'pan':
      out.push(`平底鍋加${oilName}中火燒熱，${P}下鍋每面煎 3–4 分鐘${doneText}，取出`)
      if (veg.length) out.push(`原鍋${A ? `爆香${A}，` : ''}放入${V}炒熟，加${S}調味`)
      break
    case 'stir':
      out.push(`鍋中加${oilName}${A ? `，小火爆香${A}` : '燒熱'}，${P ? `轉大火下${P}炒到變色${doneText}，先盛出` : ''}`)
      if (veg.length) out.push(`同一鍋下${V}炒到快熟，${P ? `${P}回鍋，` : ''}加${S}和 2 大匙水拌炒均勻`)
      break
    case 'oven':
      out.push('烤箱預熱 200°C')
      out.push(`${P}${veg.length ? `和${V}` : ''}拌上${oilName}、${S}${A ? `、${A}` : ''}，平鋪在烤盤`)
      out.push(`烤 ${protein.some((x) => x.comp.group === 'sea') ? '12–15' : '18–22'} 分鐘，中途翻面一次${doneText}`)
      break
    case 'air':
      out.push(`${P}表面抹${oilName}和${S}${A ? `、${A}` : ''}`)
      out.push(`氣炸鍋 190°C 炸 12–15 分鐘，中途翻面${veg.length ? `；${V}拌一點油鹽，最後 6 分鐘放進去` : ''}${doneText}`)
      break
    case 'steam':
      out.push(`${P}放在深盤，鋪上${[V, A].filter(Boolean).join('和')}，淋${S}`)
      out.push(`電鍋外鍋 1 杯水，蒸到開關跳起（約 15 分鐘）${doneText}`)
      if (oil) out.push(`起鍋前淋上${oilName}`)
      break
    case 'soup':
      out.push(`鍋中放 500ml 水${A ? `和${A}` : ''}煮滾`)
      if (P) out.push(`下${P}小火煮 8–10 分鐘，撈掉浮沫${doneText}`)
      if (veg.length) out.push(`加入${V}再煮 5 分鐘`)
      out.push(`加${S}調味${oil ? `，起鍋滴幾滴${oil.comp.name}` : ''}`)
      break
    case 'cold':
      if (P) out.push(`${P}放進滾水，轉小火燙熟${doneText}，撈起泡冰水後切片或撕絲`)
      if (veg.length) out.push(`${V}${veg.some((x) => ['cucumber', 'tomato', 'bell-pepper'].includes(x.comp.id)) ? '（生吃的直接切）' : ''}燙 1 分鐘，瀝乾放涼`)
      out.push(`全部和${S}${A ? `、${A}` : ''}${oil ? `、${oilName}` : ''}拌勻，冰 10 分鐘更入味`)
      break
  }
  if (noodle) out.push(combo.method === 'soup' ? `${noodle.comp.short}放碗底，把湯淋上去` : `${noodle.comp.short}加進來拌勻就完成`)
  if (fruit.length) out.push(combo.method === 'cold' ? `${join(fruit.map((x) => x.comp.name))}${fruit[0].comp.cut ?? '切好'}，最後拌進去` : `旁邊配上${join(fruit.map((x) => x.comp.name))}當飯後水果`)
  const toppings = fat.filter((f) => !/oil/.test(f.comp.id))
  if (toppings.length) out.push(`盛盤，放上${join(toppings.map((x) => x.comp.name))}`)
  const rice = carb.find((x) => !x.comp.cut && !/麵/.test(x.comp.short))
  if (rice) out.push(`搭配${rice.comp.name} ${rice.qty}${rice.comp.unit === 'g' ? 'g' : ` ${rice.comp.unit}`} 一起吃`)
  return out
}

const KIND_OF = (combo: Combo): Kind => {
  const { carb } = comboParts(combo)
  if (combo.method === 'soup') return 'soup'
  if (carb.some((x) => /麵/.test(x.comp.short))) return 'noodle'
  if (carb.some((x) => x.comp.short === '飯' || x.comp.id === 'quinoa')) return 'rice'
  if (combo.method === 'cold') return 'salad'
  return 'plate'
}

const cuisineOf = (combo: Combo): Cuisine | undefined => {
  const votes = new Map<Cuisine, number>()
  for (const { comp } of comboParts(combo).list) if (comp.cuisine) votes.set(comp.cuisine, (votes.get(comp.cuisine) ?? 0) + (comp.part === 'flavor' ? 2 : 1))
  return [...votes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
}

const COLORS: Record<Method, string> = {
  pan: '#fbf0d9',
  stir: '#fbe7d6',
  oven: '#f8e3d3',
  air: '#f8e3d3',
  steam: '#e3eedf',
  soup: '#e5eef5',
  cold: '#e3eedf',
}

/** 把組合變成一道正式的食譜（存進「我的食譜」） */
export function comboToRecipe(combo: Combo, id: string, name = comboName(combo)): Recipe {
  const parts = comboParts(combo)
  const nutrition = comboNutrition(combo)
  const m = METHODS.find((x) => x.id === combo.method)!
  const ingredients: Ingredient[] = parts.list.map(({ comp, qty }) => ({ name: comp.name, qty, unit: comp.unit, section: comp.section }))
  const meals: MealSlot[] = ['lunch', 'dinner']
  if (parts.protein.some((x) => x.comp.id === 'egg' || x.comp.id === 'tofu') && combo.method !== 'soup') meals.unshift('breakfast')
  const tags = ['組合料理', m.label]
  if (nutrition.protein >= 30) tags.push('高蛋白')
  if (nutrition.carbs <= 20) tags.push('低碳')
  if (
    parts.fat.some((f) => ['avocado', 'nuts', 'almond', 'walnut', 'chia', 'olives', 'olive-oil', 'camellia-oil', 'avocado-oil'].includes(f.comp.id)) ||
    parts.protein.some((x) => ['salmon', 'mackerel', 'milkfish', 'sardine'].includes(x.comp.id))
  )
    tags.push('好油脂')
  const extra = parts.carb.some((x) => x.comp.cut) ? 5 : 0
  return {
    id,
    name,
    image: parts.protein[0]?.comp.image ?? parts.veg[0]?.comp.image ?? 'salad',
    color: COLORS[combo.method],
    meals,
    minutes: m.minutes + extra,
    tags,
    vegetarian: !parts.list.some((x) => x.comp.meat),
    ingredients,
    steps: comboSteps(combo),
    prep: parts.protein.some((x) => x.comp.meat) && combo.method !== 'soup' ? [{ task: `${join(parts.protein.map((x) => x.comp.name))}先切好醃起來`, keep: '冷藏 1 天' }] : [],
    nutrition,
    cuisine: cuisineOf(combo),
    kind: KIND_OF(combo),
    custom: true,
    createdAt: Date.now(),
  }
}

/** 隨機組一道：1 蛋白 + 1–2 菜 + 依方法配調味；低碳時不放主食 */
export function randomCombo(opts: { lowCarb?: boolean; vegetarian?: boolean } = {}): Combo {
  const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]
  const by = (p: Part) => COMPONENTS.filter((x) => x.part === p)
  const proteins = by('protein').filter((x) => !opts.vegetarian || !x.meat)
  const method = pick(METHODS).id
  const items: Record<string, number> = {}
  const pr = pick(proteins)
  items[pr.id] = pr.qty
  const vegs = by('veg').sort(() => Math.random() - 0.5).slice(0, 1 + Math.round(Math.random()))
  vegs.forEach((v) => (items[v.id] = v.qty))
  if (!opts.lowCarb && Math.random() < 0.6) {
    const k = pick(by('carb'))
    items[k.id] = k.qty
  }
  const flavorSets = [['garlic', 'soy'], ['ginger', 'soy'], ['miso'], ['shio-koji'], ['kimchi'], ['garlic', 'pepper', 'lemon'], ['herbs', 'lemon'], ['curry', 'garlic'], ['basil', 'garlic'], ['satay', 'garlic']]
  pick(flavorSets).forEach((id) => (items[id] = COMP_MAP[id].qty))
  const m = METHODS.find((x) => x.id === method)!
  if (m.oil) items[Math.random() < 0.7 ? 'olive-oil' : 'camellia-oil'] = m.oil
  if (Math.random() < 0.35) {
    const f = pick(['avocado', 'nuts', 'sesame'])
    items[f] = COMP_MAP[f].qty
  }
  return { items, method }
}
