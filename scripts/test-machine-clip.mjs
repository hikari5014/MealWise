// 測試拍照辨識小模型的準確度（用動作庫的示範照片）：node scripts/test-machine-clip.mjs [dtype]
import { AutoProcessor, CLIPVisionModelWithProjection, RawImage } from '@huggingface/transformers'
import { readFileSync, existsSync } from 'node:fs'

const dtype = process.argv[2] ?? 'fp16'
const root = new URL('../public/', import.meta.url)
const { model: MODEL, labels } = JSON.parse(readFileSync(new URL(process.env.CLIP_OUT ?? 'machine-embeddings.json', root), 'utf8'))
const rules = JSON.parse(readFileSync(new URL('machines.json', root), 'utf8')).rules
const processor = await AutoProcessor.from_pretrained(MODEL)
const vision = await CLIPVisionModelWithProjection.from_pretrained(MODEL, { dtype })

let top1 = 0, top3 = 0, n = 0
for (const r of rules) {
  const id = r.exercises.find((e) => existsSync(new URL(`exercises/${e}-0.webp`, root)))
  if (!id) continue
  for (const f of [0, 1]) {
    const img = await RawImage.read(new URL(`exercises/${id}-${f}.webp`, root).pathname)
    const { image_embeds } = await vision(await processor(img))
    const v = Array.from(image_embeds.data)
    const nv = Math.hypot(...v)
    const scores = labels.map((l) => ({ id: l.id, s: l.emb.reduce((t, x, i) => t + x * v[i], 0) / nv })).sort((a, b) => b.s - a.s)
    const rank = scores.findIndex((s) => s.id === r.id)
    n++
    if (rank === 0) top1++
    if (rank >= 0 && rank < 3) top3++
    if (f === 0) console.log(`${r.id.padEnd(15)} ${id.padEnd(34)} rank ${rank + 1}  top: ${scores.slice(0, 3).map((s) => s.id).join(', ')}`)
  }
}
console.log(`\n${dtype}: top1 ${top1}/${n}  top3 ${top3}/${n}`)
