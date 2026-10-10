/**
 * 聰明一點的搜尋：不用字完全一樣也找得到。
 * - 異體字、常見別名先統一（土司＝吐司、臺＝台、起士＝起司…）
 * - 同類的詞互相找得到（牛奶↔鮮奶、麵包↔吐司、可頌…）
 * - 中間多字少字也算（「火腿吐司」找得到「火腿蛋吐司」）
 * - 打錯一個字也算（「荷包旦」找得到「荷包蛋」）
 * 分數越高越像，低於 MIN_SCORE 就當作沒找到。
 */

const CHAR: Record<string, string> = {
  臺: '台',
  蕃: '番',
  鹵: '滷',
  猪: '豬',
  麪: '麵',
  鷄: '雞',
  乾: '干',
  裏: '裡',
  菓: '果',
  蔴: '麻',
  糰: '團',
}

const WORD: [RegExp, string][] = [
  [/土司/g, '吐司'],
  [/起士|芝士|乳酪/g, '起司'],
  [/西紅柿/g, '番茄'],
  [/優酪乳?/g, '優格'],
  [/牛乳|鮮乳/g, '鮮奶'],
  [/三文魚/g, '鮭魚'],
  [/青花菜|綠花椰/g, '花椰菜'],
  [/洋芋|土豆/g, '馬鈴薯'],
  [/番薯/g, '地瓜'],
  [/豆奶/g, '豆漿'],
  [/珍奶/g, '珍珠奶茶'],
  [/義麵/g, '義大利麵'],
  [/卡路里|大卡/g, '熱量'],
]

/** 同一組的詞互相找得到（統一寫法之後的字） */
const SYN: string[][] = [
  ['鮮奶', '牛奶'],
  ['素', '蔬食', '素食'],
  ['低卡', '輕食', '減脂', '低熱量'],
  ['點心', '零食'],
]

/** 大類找得到底下的東西，反過來不行（搜「麵包」有吐司，搜「吐司」不會跑出漢堡） */
const BROAD: Record<string, string[]> = {
  咖啡: ['拿鐵', '美式', '卡布', '摩卡'],
  雞肉: ['雞胸', '雞腿', '雞排'],
  麵包: ['吐司', '可頌', '貝果', '餐包', '菠蘿', '甜甜圈'],
  蛋糕: ['蛋塔', '泡芙', '提拉米蘇'],
  甜點: ['蛋糕', '布丁', '冰淇淋', '蛋塔', '豆花', '鬆餅'],
  飲料: ['茶', '咖啡', '果汁', '奶茶', '豆漿'],
  早餐: ['蛋餅', '吐司', '三明治', '饅頭'],
  沙拉: ['生菜'],
  魚: ['鮭魚', '鯛魚', '鱈魚', '鯖魚', '鮪魚'],
  海鮮: ['蝦', '魚', '蛤', '花枝', '透抽'],
  飯: ['丼', '便當'],
  麵: ['拉麵', '烏龍', '義大利麵', '冬粉', '米粉'],
  湯: ['羹'],
  水果: ['香蕉', '蘋果', '芭樂', '奇異果', '莓', '葡萄', '柳丁'],
}

export function normalize(s: string) {
  let t = s.normalize('NFKC').toLowerCase()
  t = t.replace(/[臺蕃鹵猪麪鷄乾裏菓蔴糰]/g, (c) => CHAR[c] ?? c)
  for (const [re, to] of WORD) t = t.replace(re, to)
  return t.replace(/[\s·・、，,.。（）()「」【】\-_/+&~!?！？:：'"]+/g, '')
}

export interface Term {
  word: string
  alts: string[]
}

/** 空白隔開的每個詞都要找得到 */
export function parseQuery(q: string): Term[] {
  return q
    .split(/[\s,，、]+/)
    .map(normalize)
    .filter(Boolean)
    .map((word) => ({ word, alts: [...new Set([...SYN.filter((g) => g.includes(word)).flat(), ...(BROAD[word] ?? [])])].filter((x) => x !== word) }))
}

/** 每個字依序出現、而且不會散太開（多一兩個字也算） */
function inOrder(q: string, t: string) {
  if (q.length < 2) return false
  for (let i = t.indexOf(q[0]); i >= 0; i = t.indexOf(q[0], i + 1)) {
    let j = i
    let k = 0
    while (j < t.length && k < q.length) {
      if (t[j] === q[k]) k++
      j++
    }
    if (k === q.length && j - i <= q.length * 2 + 1) return true
  }
  return false
}

/** 同長度的一段只差一個字（打錯字） */
function oneTypo(q: string, t: string) {
  if (q.length < 3 || t.length < q.length) return false
  for (let i = 0; i + q.length <= t.length; i++) {
    let diff = 0
    for (let k = 0; k < q.length && diff < 2; k++) if (t[i + k] !== q[k]) diff++
    if (diff < 2) return true
  }
  return false
}

function termScore(term: Term, text: string) {
  const { word } = term
  if (text.includes(word)) return text === word ? 120 : text.startsWith(word) ? 110 : 100
  if (term.alts.some((a) => text.includes(a))) return 75
  if (inOrder(word, text)) return 60
  if (oneTypo(word, text)) return 55
  const chars = [...new Set(word)]
  if (chars.length >= 3) {
    const hit = chars.filter((c) => text.includes(c)).length / chars.length
    if (hit >= 0.75) return Math.round(45 * hit)
  }
  return 0
}

/** fields：[已 normalize 的文字, 權重]，品名 1、標籤分類 0.8、食材 0.6 這樣 */
export type Prepared = [string, number][]

export const prepare = (fields: [string | undefined, number][]): Prepared =>
  fields.filter((f): f is [string, number] => !!f[0]).map(([s, w]) => [normalize(s), w])

export function matchScore(terms: Term[], fields: Prepared) {
  if (!terms.length) return 0
  let sum = 0
  for (const term of terms) {
    let best = 0
    for (const [text, w] of fields) best = Math.max(best, termScore(term, text) * w)
    if (best < MIN_SCORE) return 0
    sum += best
  }
  return sum / terms.length
}

export const MIN_SCORE = 30

/** 分數分成幾級：同一級裡再照原本的排序 */
export const scoreTier = (s: number) => (s >= 100 ? 3 : s >= 70 ? 2 : s >= 50 ? 1 : 0)
