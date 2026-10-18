// 有氧：每種器材要記的欄位不一樣（跑步機記速度坡度、划船機記公尺和槳頻…），
// 還有 Hyrox、器材循環這種「一段時間內連做好幾站」的組合課表。
// 圖示用 Microsoft Fluent Emoji 3D（MIT），沒有示範照片的動作就顯示圖示。
import type { FoodImage } from './foodImages'
import type { Exercise } from './exercises'

/** 有氧每一段可以記的數字；min 存在 WorkoutSet.r（跟舊資料相容） */
export type CardioMetric = 'min' | 'km' | 'm' | 'kcal' | 'hr' | 'spd' | 'inc' | 'lvl' | 'rpm' | 'spm' | 'reps' | 'floors' | 'kg'

export const METRIC: Record<CardioMetric, { label: string; unit: string; step: number }> = {
  min: { label: '時間', unit: '分', step: 1 },
  km: { label: '距離', unit: 'km', step: 0.1 },
  m: { label: '距離', unit: 'm', step: 50 },
  kcal: { label: '消耗', unit: 'kcal', step: 10 },
  hr: { label: '平均心率', unit: 'bpm', step: 1 },
  spd: { label: '速度', unit: 'km/h', step: 0.5 },
  inc: { label: '坡度', unit: '%', step: 0.5 },
  lvl: { label: '阻力／等級', unit: '級', step: 1 },
  rpm: { label: '踏頻', unit: 'rpm', step: 5 },
  spm: { label: '槳頻', unit: 'spm', step: 1 },
  reps: { label: '次數', unit: '下', step: 5 },
  floors: { label: '樓層', unit: '層', step: 5 },
  kg: { label: '重量', unit: 'kg', step: 2 },
}

/** 已經有照片的有氧動作：補上要記的欄位、圖示、MET（每公斤每小時消耗的倍數） */
export const CARDIO_EXTRA: Record<string, Pick<Exercise, 'metrics' | 'icon' | 'met'>> = {
  'jogging-treadmill': { metrics: ['min', 'km', 'spd', 'inc', 'hr', 'kcal'], icon: 'cx-running', met: 9 },
  'bicycling-stationary': { metrics: ['min', 'km', 'lvl', 'rpm', 'hr', 'kcal'], icon: 'cx-bicycle', met: 7 },
  'rowing-stationary': { metrics: ['min', 'm', 'spm', 'hr', 'kcal'], icon: 'cx-rowing', met: 7.5 },
  'elliptical-trainer': { metrics: ['min', 'lvl', 'hr', 'kcal'], icon: 'cx-walking', met: 5.5 },
  'rope-jumping': { metrics: ['min', 'reps', 'hr'], icon: 'cx-cartwheel', met: 11 },
}

type Draft = Omit<Exercise, 'en' | 'level' | 'compound' | 'move' | 'equip' | 'steps' | 'secondary'> &
  Partial<Pick<Exercise, 'secondary' | 'level'>>

const cardio = (d: Draft): Exercise => ({
  en: '',
  equip: 'cardio',
  level: 'beginner',
  compound: true,
  move: 'cardio',
  steps: [],
  secondary: [],
  noPhoto: true,
  ...d,
})

/** 新增的有氧動作（沒有示範照片，用圖示） */
export const CARDIO_EXERCISES: Exercise[] = [
  cardio({
    id: 'cx-outdoor-run', zh: '戶外慢跑', icon: 'cx-shoe', met: 9, metrics: ['min', 'km', 'hr', 'kcal'],
    primary: ['quadriceps', 'hamstrings', 'calves'], secondary: ['glutes'],
    cue: '能邊跑邊講話的速度就是有氧區間，先求跑得久再求快',
    stepsZh: ['先快走 5 分鐘熱身', '用能說完整句子的速度慢跑，上身微微前傾', '腳步輕、步頻快，落地在身體正下方', '最後 5 分鐘放慢成快走收操'],
  }),
  cardio({
    id: 'cx-walk', zh: '快走／健走', icon: 'cx-walking', met: 4.3, metrics: ['min', 'km', 'hr'],
    primary: ['quadriceps', 'calves'], secondary: ['glutes'],
    cue: '走到有點喘、還能講話的速度，手臂跟著擺',
    stepsZh: ['抬頭挺胸，眼睛看前方', '步伐比平常大一點、快一點', '手肘彎 90 度自然前後擺'],
  }),
  cardio({
    id: 'cx-incline-walk', zh: '跑步機爬坡走', icon: 'cx-mountain', met: 6.5, metrics: ['min', 'spd', 'inc', 'km', 'hr', 'kcal'],
    primary: ['glutes', 'hamstrings', 'calves'],
    cue: '經典 12-3-30：坡度 12%、時速 3 英里（約 4.8 km/h）、走 30 分鐘',
    stepsZh: ['坡度和速度慢慢調上去', '手不要抓扶手，身體保持直立', '腳跟先著地、用屁股推地往前', '結束前先降坡度再降速度'],
  }),
  cardio({
    id: 'cx-stair-climber', zh: '登階機', icon: 'cx-ladder', met: 9, metrics: ['min', 'lvl', 'floors', 'hr', 'kcal'],
    primary: ['glutes', 'quadriceps', 'calves'],
    cue: '身體不要整個趴在扶手上，整個腳掌踩穩每一階',
    stepsZh: ['從低等級開始，站穩再加速', '上身微微前傾，手輕扶就好', '整個腳掌踩上階梯，用屁股和大腿出力', '結束時慢慢降速再下機'],
  }),
  cardio({
    id: 'cx-spin-class', zh: '飛輪課', icon: 'cx-biking', met: 8.5, metrics: ['min', 'hr', 'kcal'],
    primary: ['quadriceps', 'hamstrings'], secondary: ['calves', 'glutes'],
    cue: '座椅高度約在髖骨，踩到最低時膝蓋微彎',
    stepsZh: ['調整座椅和把手高度', '跟著教練節奏加減阻力', '站姿踩踏時核心收緊、屁股往後', '最後降阻力慢踩收操'],
  }),
  cardio({
    id: 'cx-assault-bike', zh: '風扇車', icon: 'cx-wind', met: 10, metrics: ['min', 'kcal', 'hr'],
    primary: ['quadriceps', 'shoulders'], secondary: ['hamstrings', 'chest'],
    cue: '手推腳踩一起用力，越用力風阻越大',
    stepsZh: ['座椅調到腳踩到底時膝蓋微彎', '手推拉把手、腳同時踩', '衝刺時全力，休息時慢慢踩', '看儀表上的卡路里當目標最直覺'],
  }),
  cardio({
    id: 'cx-ski-erg', zh: '滑雪機 SkiErg', icon: 'cx-skier', met: 9, metrics: ['min', 'm', 'hr', 'kcal'],
    primary: ['lats', 'triceps'], secondary: ['abdominals', 'shoulders'],
    cue: '用髖部往後坐帶動下拉，不是只用手臂',
    stepsZh: ['雙手高舉握住把手', '屁股往後坐、身體前傾，把手往下拉到大腿旁', '站直把手臂舉回頭頂', '節奏穩定，注意呼吸'],
  }),
  cardio({
    id: 'cx-swimming', zh: '游泳', icon: 'cx-swimming', met: 7, metrics: ['min', 'm', 'hr'],
    primary: ['lats', 'shoulders'], secondary: ['triceps', 'quadriceps'],
    cue: '換氣不要抬頭，轉頭換氣比較省力',
    stepsZh: ['先慢游幾趟熱身', '身體保持水平、核心收緊', '用固定的划手次數換氣', '最後用輕鬆的速度游完收操'],
  }),
  cardio({
    id: 'cx-boxing', zh: '拳擊有氧', icon: 'cx-boxing', met: 7.8, metrics: ['min', 'hr', 'kcal'],
    primary: ['shoulders', 'chest'], secondary: ['abdominals', 'triceps'],
    cue: '出拳靠轉腰轉髖，收拳回來保護臉',
    stepsZh: ['雙腳前後站、膝蓋微彎', '出拳時轉動腰和後腳', '每一拳都收回到下巴前', '跟著節奏組合出拳和閃躲'],
  }),
  cardio({
    id: 'cx-dance', zh: '有氧舞蹈／Zumba', icon: 'cx-dancing', met: 6.5, metrics: ['min', 'hr'],
    primary: ['quadriceps', 'calves'], secondary: ['glutes', 'abdominals'],
    cue: '跟著音樂動起來，動作大一點消耗更多',
    stepsZh: ['先跟著慢節奏熱身', '跟著老師或影片的動作', '膝蓋落地時保持微彎'],
  }),
  cardio({
    id: 'cx-hiking', zh: '登山健行', icon: 'cx-climb', met: 6, metrics: ['min', 'km', 'hr'],
    primary: ['quadriceps', 'glutes', 'calves'],
    cue: '上坡步伐小、下坡膝蓋微彎慢慢走',
    stepsZh: ['穿好抓地的鞋子', '上坡縮小步伐、保持呼吸', '下坡身體重心放低、膝蓋微彎'],
  }),
  cardio({
    id: 'cx-hiit', zh: '徒手 HIIT', icon: 'cx-bolt', met: 8, metrics: ['min', 'reps', 'hr', 'kcal'],
    primary: ['quadriceps', 'abdominals'], secondary: ['shoulders', 'glutes'],
    cue: '練 20 秒休 10 秒，練的時候全力、休的時候真的休息',
    stepsZh: ['選 4–6 個動作（開合跳、深蹲跳、登山者…）', '每個動作全力做 20–40 秒', '休息 10–20 秒換下一個', '做 3–5 輪'],
  }),
  cardio({
    id: 'cx-burpee', zh: '波比跳', icon: 'cx-fire', met: 8, metrics: ['reps', 'min', 'hr'],
    primary: ['quadriceps', 'chest'], secondary: ['shoulders', 'abdominals', 'triceps'],
    cue: '趴下時身體一直線，跳起時手過頭',
    stepsZh: ['站姿蹲下雙手撐地', '雙腳往後跳成伏地挺身姿勢', '胸口碰地再推起、雙腳跳回', '站起跳躍、雙手過頭'],
  }),
  // ── Hyrox 各站 ──
  cardio({
    id: 'cx-hyrox-run', zh: '跑步（Hyrox）', icon: 'cx-running', met: 10, metrics: ['km', 'min', 'hr'],
    primary: ['quadriceps', 'hamstrings', 'calves'],
    cue: '每站中間都要跑 1 km，前面別衝太快，留體力給後面',
    stepsZh: ['Hyrox 共 8 段，每段 1 km', '用比平常慢一點的配速，穩定最重要', '跑進場內直接接下一站'],
  }),
  cardio({
    id: 'cx-sled-push', zh: '雪橇推', icon: 'cx-sled', met: 8, metrics: ['m', 'kg', 'min'],
    primary: ['quadriceps', 'glutes'], secondary: ['calves', 'shoulders', 'triceps'],
    cue: '身體壓低成 45 度，手臂打直、用腿一步一步推',
    stepsZh: ['雙手握住雪橇上方把手', '身體前傾、手臂伸直', '小步快踩，用腳掌推地前進', 'Hyrox 共推 50 m（4 × 12.5 m）'],
  }),
  cardio({
    id: 'cx-sled-pull', zh: '雪橇拉', icon: 'cx-sled', met: 8, metrics: ['m', 'kg', 'min'],
    primary: ['lats', 'middle back'], secondary: ['biceps', 'hamstrings', 'glutes'],
    cue: '屁股往後坐、腳踩穩，手一把一把交替把繩子拉回來',
    stepsZh: ['站在拉線後方，雙腳與肩同寬', '身體微後傾、膝蓋彎曲', '雙手交替拉繩，同時往後退一步', 'Hyrox 共拉 50 m'],
  }),
  cardio({
    id: 'cx-burpee-broad-jump', zh: '波比跳遠', icon: 'cx-frog', met: 9, metrics: ['m', 'min'],
    primary: ['quadriceps', 'glutes'], secondary: ['chest', 'shoulders'],
    cue: '做完波比直接往前跳，跳的距離不用遠、節奏穩比較省力',
    stepsZh: ['做一下波比（胸口碰地）', '站起後雙腳往前跳', '落地後接下一下', 'Hyrox 共 80 m'],
  }),
  cardio({
    id: 'cx-farmers-carry', zh: '農夫走路（Hyrox）', icon: 'cx-bag', met: 6, metrics: ['m', 'kg', 'min'],
    primary: ['forearms', 'traps'], secondary: ['abdominals', 'quadriceps'],
    cue: '肩膀往下往後、核心收緊，小步快走',
    stepsZh: ['兩手各提一顆壺鈴', '挺胸收核心、肩膀不要聳起', '小步快走不要停', 'Hyrox 共 200 m'],
  }),
  cardio({
    id: 'cx-sandbag-lunges', zh: '沙袋弓箭步', icon: 'cx-backpack', met: 7, metrics: ['m', 'kg', 'min'],
    primary: ['quadriceps', 'glutes'], secondary: ['hamstrings', 'abdominals'],
    cue: '沙袋扛在肩上，後膝輕碰地再站起往前',
    stepsZh: ['把沙袋扛在肩膀後方', '往前跨一大步，後膝碰地', '用前腳推起，換腳往前', 'Hyrox 共 100 m'],
  }),
  cardio({
    id: 'cx-wall-balls', zh: '壁球', icon: 'cx-basketball', met: 8, metrics: ['reps', 'kg', 'min'],
    primary: ['quadriceps', 'shoulders'], secondary: ['glutes', 'triceps'],
    cue: '蹲到大腿低於水平，站起的力量順勢把球丟上去',
    stepsZh: ['雙手捧球在胸前，面向牆壁站', '深蹲到大腿低於水平', '站起時把球往上丟到目標線', '接球順勢蹲下接下一下', 'Hyrox 共 100 下'],
  }),
]

/* ───────── 組合課表 ───────── */

export interface ComboStation {
  exerciseId: string
  /** 目標，例如 km: 1、m: 1000、reps: 100、kg: 102、min: 10 */
  target: Partial<Record<CardioMetric, number>>
}
export interface ComboTemplate {
  id: string
  name: string
  hint: string
  icon: FoodImage
  stations: (sex: 'male' | 'female') => ComboStation[]
}

const run = (): ComboStation => ({ exerciseId: 'cx-hyrox-run', target: { km: 1 } })
const HYROX = (sex: 'male' | 'female'): ComboStation[] => {
  const m = sex === 'male'
  return [
    { exerciseId: 'cx-ski-erg', target: { m: 1000 } },
    { exerciseId: 'cx-sled-push', target: { m: 50, kg: m ? 152 : 102 } },
    { exerciseId: 'cx-sled-pull', target: { m: 50, kg: m ? 103 : 78 } },
    { exerciseId: 'cx-burpee-broad-jump', target: { m: 80 } },
    { exerciseId: 'rowing-stationary', target: { m: 1000 } },
    { exerciseId: 'cx-farmers-carry', target: { m: 200, kg: m ? 24 : 16 } },
    { exerciseId: 'cx-sandbag-lunges', target: { m: 100, kg: m ? 20 : 10 } },
    { exerciseId: 'cx-wall-balls', target: { reps: 100, kg: m ? 6 : 4 } },
  ]
}
const rounds = (n: number, list: ComboStation[]) => Array.from({ length: n }, () => list.map((s) => ({ ...s, target: { ...s.target } }))).flat()

export const COMBOS: ComboTemplate[] = [
  {
    id: 'hyrox',
    name: 'Hyrox 完整模擬',
    hint: '8 × (1 km 跑步＋1 站)，重量依 Open 組',
    icon: 'cx-trophy',
    stations: (sex) => HYROX(sex).flatMap((s) => [run(), s]),
  },
  {
    id: 'hyrox-half',
    name: 'Hyrox 半程練習',
    hint: '4 × (1 km 跑步＋前 4 站)',
    icon: 'cx-medal',
    stations: (sex) => HYROX(sex).slice(0, 4).flatMap((s) => [run(), s]),
  },
  {
    id: 'machines',
    name: '有氧器材循環 30 分',
    hint: '跑步機、飛輪、划船機各 10 分鐘',
    icon: 'cx-stopwatch',
    stations: () => [
      { exerciseId: 'jogging-treadmill', target: { min: 10 } },
      { exerciseId: 'bicycling-stationary', target: { min: 10 } },
      { exerciseId: 'rowing-stationary', target: { min: 10 } },
    ],
  },
  {
    id: 'hiit',
    name: 'HIIT 燃脂 12 分',
    hint: '風扇車、波比跳、跳繩各 1 分鐘 × 4 輪',
    icon: 'cx-fire',
    stations: () =>
      rounds(4, [
        { exerciseId: 'cx-assault-bike', target: { min: 1 } },
        { exerciseId: 'cx-burpee', target: { min: 1 } },
        { exerciseId: 'rope-jumping', target: { min: 1 } },
      ]),
  },
  {
    id: 'custom',
    name: '自訂組合',
    hint: '自己挑要連續做的有氧，一個碼錶計時每一站',
    icon: 'cx-dash',
    stations: () => [],
  },
]
