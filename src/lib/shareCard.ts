// 一鍵分享圖卡：把食譜或完成的訓練畫成一張圖，用手機的分享選單傳出去（不支援就下載）
import { EXERCISE_MAP } from '../data/exercises'
import photoCredits from '../data/photoCredits.json'
import { TRAIN_MAP, activeMs, cardioSummary, doneSets, isCardio, workoutCardio, workoutVolume, type Workout } from './workout'
import { formatQty } from './meal'
import type { Recipe } from '../types'

const W = 1080
const PAD = 72
const FONT = '"Noto Sans TC", system-ui, -apple-system, sans-serif'
const C = { bg: '#f7f3ec', card: '#ffffff', ink: '#2f2a24', muted: '#8a8178', leaf: '#5b8c5a', leafDark: '#3f6b3e', leafSoft: '#e3eedf', tomato: '#e07a5f', honey: '#e9b44c', sky: '#5fa8d3' }

type Ctx = CanvasRenderingContext2D
const font = (ctx: Ctx, weight: number, size: number) => (ctx.font = `${weight} ${size}px ${FONT}`)

/** 中文逐字換行；回傳每一行 */
function wrap(ctx: Ctx, text: string, maxWidth: number, maxLines = 99) {
  const lines: string[] = []
  let line = ''
  for (const ch of text) {
    if (ch === '\n' || ctx.measureText(line + ch).width > maxWidth) {
      lines.push(line)
      line = ch === '\n' ? '' : ch
      if (lines.length === maxLines) break
    } else line += ch
  }
  if (lines.length < maxLines && line) lines.push(line)
  else if (lines.length === maxLines && line) lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + '…'
  return lines
}

const fit = (ctx: Ctx, text: string, maxWidth: number) => wrap(ctx, text, maxWidth, 1)[0] ?? ''

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => res(img)
    img.onerror = () => res(null)
    img.src = src
  })
}

async function ready() {
  try {
    await Promise.all([document.fonts.load(`700 40px ${FONT}`, '好食光'), document.fonts.load(`400 40px ${FONT}`, '好食光')])
  } catch {
    /* 字型載不到就用系統字 */
  }
}

/** 先在很高的畫布上畫，最後裁成實際高度 */
function canvas(height = 6000) {
  const c = document.createElement('canvas')
  c.width = W
  c.height = height
  const ctx = c.getContext('2d')!
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, W, height)
  ctx.textBaseline = 'top'
  return { c, ctx }
}

function finish(c: HTMLCanvasElement, height: number): Promise<Blob> {
  const out = document.createElement('canvas')
  out.width = W
  out.height = Math.round(height)
  out.getContext('2d')!.drawImage(c, 0, 0)
  return new Promise((res, rej) => out.toBlob((b) => (b ? res(b) : rej(new Error('toBlob'))), 'image/png'))
}

function footer(ctx: Ctx, y: number) {
  ctx.fillStyle = C.leaf
  font(ctx, 700, 34)
  ctx.textAlign = 'center'
  ctx.fillText('好食光 MealWise', W / 2, y + 36)
  ctx.fillStyle = C.muted
  font(ctx, 400, 24)
  ctx.fillText('吃得剛好，練得剛好', W / 2, y + 84)
  ctx.textAlign = 'left'
  return y + 150
}

function statRow(ctx: Ctx, y: number, stats: { label: string; value: string; color?: string }[]) {
  const gap = 20
  const w = (W - PAD * 2 - gap * (stats.length - 1)) / stats.length
  stats.forEach((s, i) => {
    const x = PAD + i * (w + gap)
    ctx.fillStyle = C.card
    ctx.beginPath()
    ctx.roundRect(x, y, w, 150, 36)
    ctx.fill()
    ctx.textAlign = 'center'
    ctx.fillStyle = s.color ?? C.ink
    font(ctx, 700, 46)
    ctx.fillText(fit(ctx, s.value, w - 24), x + w / 2, y + 28)
    ctx.fillStyle = C.muted
    font(ctx, 400, 26)
    ctx.fillText(s.label, x + w / 2, y + 96)
  })
  ctx.textAlign = 'left'
  return y + 150
}

function sectionTitle(ctx: Ctx, y: number, text: string) {
  ctx.fillStyle = C.leaf
  ctx.beginPath()
  ctx.roundRect(PAD, y + 6, 10, 40, 5)
  ctx.fill()
  ctx.fillStyle = C.ink
  font(ctx, 700, 40)
  ctx.fillText(text, PAD + 28, y)
  return y + 70
}

/* ───────── 食譜 ───────── */

export async function renderRecipeCard(recipe: Recipe, servings = 1): Promise<Blob> {
  await ready()
  const { c, ctx } = canvas()
  let y = 0
  // 照片（沒有或載不到就用底色）
  const photoId = recipe.photoOf ?? recipe.id
  const hasPhoto = !!(photoCredits as Record<string, unknown>)[photoId]
  const src = recipe.photoUrl ?? (hasPhoto ? `${import.meta.env.BASE_URL}photos/${photoId}-lg.webp` : null)
  const img = src ? await loadImage(src) : null
  const PH = 700
  if (img) {
    const s = Math.max(W / img.naturalWidth, PH / img.naturalHeight)
    const dw = img.naturalWidth * s
    const dh = img.naturalHeight * s
    ctx.drawImage(img, (W - dw) / 2, (PH - dh) / 2, dw, dh)
    try {
      // 外部網址的照片不給讀的話，畫布會壞掉：先測一下
      ctx.getImageData(0, 0, 1, 1)
      y = PH
    } catch {
      return renderRecipeCard({ ...recipe, photoUrl: undefined, photoOf: '__none__' }, servings)
    }
  } else {
    ctx.fillStyle = C.leafSoft
    ctx.fillRect(0, 0, W, 220)
    y = 220
  }
  y += 76
  ctx.fillStyle = C.ink
  font(ctx, 700, 68)
  for (const l of wrap(ctx, recipe.name, W - PAD * 2, 2)) {
    ctx.fillText(l, PAD, y)
    y += 88
  }
  ctx.fillStyle = C.muted
  font(ctx, 400, 30)
  const meta = [recipe.eatout?.brand, recipe.minutes ? `${recipe.minutes} 分鐘` : '', `${servings} 人份`, recipe.tags.slice(0, 3).join('・')].filter(Boolean).join('　')
  ctx.fillText(fit(ctx, meta, W - PAD * 2), PAD, y)
  y += 70
  const n = recipe.nutrition
  y = statRow(ctx, y, [
    { label: '熱量 kcal', value: String(Math.round(n.kcal)) },
    { label: '蛋白質 g', value: String(Math.round(n.protein)), color: C.tomato },
    { label: '碳水 g', value: String(Math.round(n.carbs)), color: '#b8860b' },
    { label: '脂肪 g', value: String(Math.round(n.fat)), color: C.sky },
  ])
  ctx.fillStyle = C.muted
  font(ctx, 400, 24)
  ctx.fillText('營養為 1 人份', PAD, y + 14)
  y += 76

  if (recipe.ingredients.length) {
    y = sectionTitle(ctx, y, '食材')
    const colW = (W - PAD * 2 - 40) / 2
    const rows = Math.ceil(recipe.ingredients.length / 2)
    recipe.ingredients.forEach((ing, i) => {
      const col = i < rows ? 0 : 1
      const x = PAD + col * (colW + 40)
      const ry = y + (col ? i - rows : i) * 54
      const qty = formatQty(ing.qty * servings, ing.unit)
      font(ctx, 400, 30)
      ctx.fillStyle = C.muted
      ctx.textAlign = 'right'
      ctx.fillText(qty, x + colW, ry)
      const qw = ctx.measureText(qty).width
      ctx.textAlign = 'left'
      ctx.fillStyle = C.ink
      ctx.fillText(fit(ctx, ing.name, colW - qw - 20), x, ry)
    })
    y += rows * 54 + 40
  }

  if (recipe.steps.length) {
    y = sectionTitle(ctx, y, '做法')
    recipe.steps.forEach((step, i) => {
      ctx.fillStyle = C.leaf
      ctx.beginPath()
      ctx.arc(PAD + 22, y + 22, 22, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      font(ctx, 700, 24)
      ctx.textAlign = 'center'
      ctx.fillText(String(i + 1), PAD + 22, y + 7)
      ctx.textAlign = 'left'
      ctx.fillStyle = C.ink
      font(ctx, 400, 30)
      for (const l of wrap(ctx, step, W - PAD * 2 - 68)) {
        ctx.fillText(l, PAD + 68, y)
        y += 46
      }
      y += 18
    })
    y += 16
  }
  y = footer(ctx, y)
  return finish(c, y)
}

/* ───────── 訓練 ───────── */

const num = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1))

/** 把同樣重量次數的組合併：60kg×10 ×3 */
function setsText(sets: { w: number; r: number }[]) {
  const groups: { w: number; r: number; n: number }[] = []
  for (const s of sets) {
    const last = groups[groups.length - 1]
    if (last && last.w === s.w && last.r === s.r) last.n++
    else groups.push({ w: s.w, r: s.r, n: 1 })
  }
  return groups.map((g) => `${g.w ? `${num(g.w)}kg×` : ''}${g.r} 下${g.n > 1 ? ` ×${g.n} 組` : ''}`).join('、')
}

export async function renderWorkoutCard(w: Workout, weightKg = 60): Promise<Blob> {
  await ready()
  const { c, ctx } = canvas()
  // 上方綠色標題
  ctx.fillStyle = C.leaf
  ctx.fillRect(0, 0, W, 300)
  ctx.fillStyle = '#ffffff'
  font(ctx, 700, 72)
  const d = new Date(`${w.date}T00:00:00`)
  const title = `${w.type ? TRAIN_MAP[w.type].label.replace('重訓・', '') + '日' : ''}訓練完成`
  ctx.fillText(title, PAD, 76)
  font(ctx, 400, 34)
  ctx.fillStyle = C.leafSoft
  ctx.fillText(`${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}（${'日一二三四五六'[d.getDay()]}）`, PAD, 180)
  let y = 300 - 60

  const cardio = workoutCardio(w, weightKg)
  const volume = Math.round(workoutVolume(w))
  const stats = [
    { label: '時間', value: `${Math.round(activeMs(w) / 60000)} 分` },
    { label: '完成組數', value: String(doneSets(w)) },
    ...(volume > 0 ? [{ label: '總重量', value: `${volume.toLocaleString()} kg`, color: C.leafDark }] : []),
    ...(cardio.kcal > 0 || w.watch?.kcal ? [{ label: '消耗 kcal', value: String(w.watch?.kcal ?? cardio.kcal), color: C.tomato }] : []),
  ].slice(0, 4)
  y = statRow(ctx, y, stats) + 56

  const entries = w.entries.filter((e) => EXERCISE_MAP[e.exerciseId] && e.sets.some((s) => s.done))
  if (entries.length) y = sectionTitle(ctx, y, '這次練了')
  for (const e of entries) {
    const ex = EXERCISE_MAP[e.exerciseId]
    const done = e.sets.filter((s) => s.done)
    let detail: string
    if (isCardio(ex)) {
      const s = cardioSummary(ex, e.sets, weightKg)
      detail = [`${num(Math.round(s.min * 10) / 10)} 分`, s.km ? `${num(Math.round(s.km * 100) / 100)} km` : '', s.kcal ? `${Math.round(s.kcal)} kcal` : ''].filter(Boolean).join('・')
    } else detail = setsText(done)
    font(ctx, 400, 28)
    const lines = wrap(ctx, detail, W - PAD * 2 - 64, 3)
    const h = 76 + lines.length * 42 + 20
    ctx.fillStyle = C.card
    ctx.beginPath()
    ctx.roundRect(PAD, y, W - PAD * 2, h, 32)
    ctx.fill()
    ctx.fillStyle = isCardio(ex) ? C.sky : C.leaf
    ctx.beginPath()
    ctx.roundRect(PAD, y + 24, 10, h - 48, 5)
    ctx.fill()
    ctx.fillStyle = C.ink
    font(ctx, 700, 36)
    ctx.fillText(fit(ctx, ex.zh, W - PAD * 2 - 64), PAD + 36, y + 22)
    ctx.fillStyle = C.muted
    font(ctx, 400, 28)
    lines.forEach((l, i) => ctx.fillText(l, PAD + 36, y + 76 + i * 42))
    y += h + 18
  }
  if (w.watch?.hr) {
    ctx.fillStyle = C.muted
    font(ctx, 400, 28)
    ctx.fillText(`Apple Watch：平均心率 ${w.watch.hr} bpm`, PAD, y + 8)
    y += 60
  }
  y = footer(ctx, y + 10)
  return finish(c, y)
}

/* ───────── 分享 ───────── */

/** 能用分享選單就分享（可以存到照片、傳 LINE…），不行就下載；回傳做了哪一種 */
export async function shareImage(blob: Blob, name: string, title: string): Promise<'shared' | 'saved' | 'cancelled'> {
  const file = new File([blob], `${name}.png`, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title })
      return 'shared'
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return 'cancelled'
    }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(file)
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 4000)
  return 'saved'
}
