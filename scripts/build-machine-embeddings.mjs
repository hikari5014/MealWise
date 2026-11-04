// 產生「拍照辨識器材」用的文字向量：先把每種器材的英文描述算好存起來，
// App 裡只要下載看圖的小模型（MobileCLIP S0，約 12 MB）就能比對，不用再下載文字模型。
// 用法：node scripts/build-machine-embeddings.mjs
import { AutoTokenizer, CLIPTextModelWithProjection } from '@huggingface/transformers'
import { readFileSync, writeFileSync } from 'node:fs'

const MODEL = process.env.CLIP_MODEL ?? 'Xenova/mobileclip_s0'

/** 器材 id（對應 public/machines.json 的 rules）→ 英文描述（多句取平均） */
const PROMPTS = {
  'assault-bike': ['an air bike with a large fan wheel in a gym', 'an assault fan bike'],
  'ski-erg': ['a SkiErg ski ergometer machine with two pull handles', 'a person using a ski erg machine'],
  rower: ['an indoor rowing machine', 'a person on a rowing ergometer'],
  stair: ['a stair climber machine with rotating stairs', 'a StairMaster stepmill in a gym'],
  treadmill: ['a treadmill running machine', 'a person running on a treadmill'],
  elliptical: ['an elliptical cross trainer machine', 'a person on an elliptical trainer'],
  bike: ['a stationary exercise bike', 'an indoor spin bike'],
  smith: ['a smith machine with a barbell on vertical rails', 'a smith machine squat rack'],
  'hack-squat': ['a hack squat machine', 'an angled sled hack squat machine with shoulder pads'],
  'leg-press': ['a leg press machine', 'a 45 degree leg press machine with a foot platform'],
  'leg-extension': ['a leg extension machine', 'a seated leg extension machine with a shin pad'],
  'leg-curl': ['a leg curl machine', 'a lying hamstring curl machine'],
  abductor: ['a hip abductor machine', 'a seated outer thigh abduction machine'],
  adductor: ['a hip adductor machine', 'a seated inner thigh adduction machine'],
  calf: ['a calf raise machine', 'a standing calf raise machine'],
  glute: ['a glute kickback machine', 'a hip thrust machine'],
  'pec-fly': ['a pec deck fly machine', 'a chest fly machine with two swinging arms'],
  'chest-press': ['a seated chest press machine', 'a chest press machine with two handles in front'],
  'shoulder-press': ['a seated shoulder press machine', 'an overhead press machine'],
  'lateral-raise': ['a lateral raise machine', 'a shoulder lateral raise machine with arm pads'],
  assisted: ['an assisted pull up and dip machine', 'a gravitron assisted chin up machine with a knee pad'],
  'lat-pulldown': ['a lat pulldown machine with a long bar', 'a person doing lat pulldowns'],
  't-bar': ['a t-bar row machine', 'a landmine t bar row'],
  row: ['a seated cable row machine', 'a seated row machine with a chest pad'],
  biceps: ['a biceps curl machine with an arm pad', 'a preacher curl machine'],
  triceps: ['a triceps extension machine', 'a seated dip machine'],
  ab: ['an abdominal crunch machine', 'a seated ab crunch machine'],
  'back-ext': ['a back extension bench', 'a roman chair hyperextension bench'],
  cable: ['a cable crossover machine with pulleys', 'a cable pulley station in a gym'],
}
/** 不是器材的照片（拿來判斷「認不出來」） */
const NEGATIVE = {
  'free-weights': ['dumbbells on a rack', 'a barbell with weight plates on the floor'],
  bench: ['an empty weight bench'],
  person: ['a selfie of a person', 'a person standing'],
  other: ['a photo of food', 'a room interior', 'a street outside', 'a cat or a dog'],
}

const rules = JSON.parse(readFileSync(new URL('../public/machines.json', import.meta.url), 'utf8')).rules
const missing = rules.filter((r) => !PROMPTS[r.id]).map((r) => r.id)
if (missing.length) throw new Error(`沒有英文描述：${missing.join(', ')}`)

const tokenizer = await AutoTokenizer.from_pretrained(MODEL)
const model = await CLIPTextModelWithProjection.from_pretrained(MODEL, { dtype: 'fp32' })

async function embed(texts) {
  const inputs = tokenizer(texts, { padding: 'max_length', truncation: true })
  const { text_embeds } = await model(inputs)
  const dim = text_embeds.dims[1]
  const data = text_embeds.data
  const avg = new Array(dim).fill(0)
  for (let i = 0; i < texts.length; i++) {
    const row = Array.from(data.slice(i * dim, (i + 1) * dim))
    const n = Math.hypot(...row)
    row.forEach((v, j) => (avg[j] += v / n))
  }
  const n = Math.hypot(...avg)
  return avg.map((v) => Math.round((v / n) * 10000) / 10000)
}

const labels = []
for (const r of rules) labels.push({ id: r.id, name: r.name, emb: await embed(PROMPTS[r.id]) })
for (const [id, p] of Object.entries(NEGATIVE)) labels.push({ id, negative: true, emb: await embed(p) })

writeFileSync(new URL(process.env.CLIP_OUT ?? '../public/machine-embeddings.json', import.meta.url), JSON.stringify({ model: MODEL, labels }))
console.log(`寫入 ${labels.length} 種，向量長度 ${labels[0].emb.length}`)
