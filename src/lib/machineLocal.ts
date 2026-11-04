// 手機上的拍照辨識：MobileCLIP S0 看圖小模型（約 23 MB，第一次下載後存在手機裡，之後不用網路）
// 器材名稱的文字向量事先算好放在 public/machine-embeddings.json（scripts/build-machine-embeddings.mjs）
import { loadMachines, type MachineRule } from './machines'

interface Label {
  id: string
  name?: string
  negative?: boolean
  emb: number[]
}

type Vision = (img: unknown) => Promise<{ image_embeds: { data: Float32Array } }>
let ready: Promise<{ embed: (file: Blob) => Promise<Float32Array>; labels: Label[] }> | null = null

const MODEL_KEY = 'mw-clip-ready'
/** 模型下載過了嗎（下載過就不用再提醒檔案大小） */
export const localModelCached = () => {
  try {
    return localStorage.getItem(MODEL_KEY) === '1'
  } catch {
    return false
  }
}

function load(onProgress?: (pct: number) => void) {
  ready ??= (async () => {
    const [{ AutoProcessor, CLIPVisionModelWithProjection, RawImage, env }, data] = await Promise.all([
      import('@huggingface/transformers'),
      fetch(`${import.meta.env.BASE_URL}machine-embeddings.json`).then((r) => r.json() as Promise<{ model: string; labels: Label[] }>),
    ])
    env.allowLocalModels = false
    const files: Record<string, { loaded: number; total: number }> = {}
    const progress_callback = (p: { status: string; file?: string; loaded?: number; total?: number }) => {
      if (p.status !== 'progress' || !p.file || !p.total) return
      files[p.file] = { loaded: p.loaded ?? 0, total: p.total }
      const all = Object.values(files)
      onProgress?.(Math.round((all.reduce((t, f) => t + f.loaded, 0) / all.reduce((t, f) => t + f.total, 0)) * 100))
    }
    const processor = await AutoProcessor.from_pretrained(data.model, { progress_callback })
    const vision = (await CLIPVisionModelWithProjection.from_pretrained(data.model, { dtype: 'fp16', progress_callback })) as unknown as Vision
    try {
      localStorage.setItem(MODEL_KEY, '1')
    } catch {
      /* 沒關係 */
    }
    const embed = async (file: Blob) => {
      const img = await RawImage.fromBlob(file)
      const { image_embeds } = await vision(await processor(img))
      return image_embeds.data
    }
    return { embed, labels: data.labels }
  })().catch((e) => {
    ready = null
    throw e
  })
  return ready
}

export interface LocalGuess {
  rule: MachineRule
  /** 0–1，跟其他選項比起來有多像 */
  score: number
}

/** 回傳最像的幾種器材；看起來不像器材就回傳空陣列 */
export async function identifyLocal(file: Blob, onProgress?: (pct: number) => void, top = 4): Promise<LocalGuess[]> {
  const [{ embed, labels }, machines] = await Promise.all([load(onProgress), loadMachines()])
  const v = await embed(file)
  let n = 0
  for (const x of v) n += x * x
  n = Math.sqrt(n)
  const sims = labels.map((l) => ({ l, s: l.emb.reduce((t, x, i) => t + x * v[i], 0) / n }))
  // 換成機率（CLIP 的溫度約 100）
  const max = Math.max(...sims.map((x) => x.s))
  const exp = sims.map((x) => ({ ...x, p: Math.exp((x.s - max) * 100) }))
  const sum = exp.reduce((t, x) => t + x.p, 0)
  const ranked = exp.map((x) => ({ ...x, p: x.p / sum })).sort((a, b) => b.p - a.p)
  // 最像的是「不是器材」而且很有把握，就當作認不出來
  if (ranked[0].l.negative && ranked[0].p > 0.6) return []
  const byId = new Map(machines.rules.map((r) => [r.id, r]))
  return ranked
    .filter((x) => !x.l.negative && byId.has(x.l.id))
    .slice(0, top)
    .map((x) => ({ rule: byId.get(x.l.id)!, score: x.p }))
}
