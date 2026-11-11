// 一鍵分享圖卡：把食譜或完成的訓練畫成一張圖，用手機的分享選單傳出去（不支援就下載）
import { EXERCISE_MAP } from '../data/exercises'
import exerciseCredits from '../data/exerciseCredits.json'
import photoCredits from '../data/photoCredits.json'
import { TRAIN_MAP, activeMs, cardioSummary, doneSets, isCardio, workoutCardio, workoutVolume, type Workout } from './workout'
import { formatQty } from './meal'
import type { Recipe } from '../types'

const W = 1080
const PAD = 64
const FONT = '"Noto Sans TC", system-ui, -apple-system, sans-serif'

/** 顏色跟著 App 目前的主題（淺色或深色）：直接讀介面用的顏色變數 */
function palette() {
  const cs = getComputedStyle(document.documentElement)
  const v = (name: string, fallback: string) => {
    const t = cs.getPropertyValue(`--${name}`).trim()
    return t ? `rgb(${t.split(/\s+/).join(',')})` : fallback
  }
  const a = (name: string, alpha: number, fallback: string) => {
    const t = cs.getPropertyValue(`--${name}`).trim()
    return t ? `rgba(${t.split(/\s+/).join(',')},${alpha})` : fallback
  }
  return {
    bg: v('cream', '#f7f3ec'),
    card: v('card', '#ffffff'),
    ink: v('ink', '#2f2a24'),
    muted: v('muted', '#8a8178'),
    leaf: v('leaf', '#5b8c5a'),
    leafDark: v('leaf-dark', '#3f6b3e'),
    leafSoft: v('leaf-soft', '#e3eedf'),
    onLeaf: v('on-leaf', '#ffffff'),
    tomato: v('tomato', '#e07a5f'),
    honey: v('honey-ink', '#a07a20'),
    sky: v('sky', '#5fa8d3'),
    skySoft: v('sky-soft', '#e0f0f9'),
    line: a('ink', 0.08, 'rgba(0,0,0,0.08)'),
    dark: document.documentElement.dataset.theme === 'dark',
  }
}
type Pal = ReturnType<typeof palette>

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
function canvas(P: Pal, height = 7000) {
  const c = document.createElement('canvas')
  c.width = W
  c.height = height
  const ctx = c.getContext('2d')!
  ctx.fillStyle = P.bg
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

/** 跟介面一樣的卡片：圓角、淺色有淡淡的陰影、深色有細邊 */
function card(ctx: Ctx, P: Pal, x: number, y: number, w: number, h: number, r = 44, fill = P.card) {
  ctx.save()
  if (!P.dark) {
    ctx.shadowColor = 'rgba(47,42,36,0.08)'
    ctx.shadowBlur = 32
    ctx.shadowOffsetY = 8
  }
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
  ctx.restore()
  if (P.dark) {
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, r)
    ctx.stroke()
  }
}

/** 圓角裁切後畫圖（填滿） */
function cover(ctx: Ctx, img: HTMLImageElement, x: number, y: number, w: number, h: number, r: number | number[]) {
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.clip()
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  ctx.drawImage(img, x + (w - img.naturalWidth * s) / 2, y + (h - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s)
  ctx.restore()
}

function pill(ctx: Ctx, x: number, y: number, text: string, bg: string, fg: string, size = 26, padX = 22, h = 52) {
  font(ctx, 700, size)
  const w = ctx.measureText(text).width + padX * 2
  ctx.fillStyle = bg
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, h / 2)
  ctx.fill()
  ctx.fillStyle = fg
  ctx.fillText(text, x + padX, y + (h - size) / 2 - 2)
  return w
}

function footer(ctx: Ctx, P: Pal, y: number) {
  const icon = 56
  font(ctx, 700, 34)
  const tw = ctx.measureText('好食光 MealWise').width
  const x = (W - (icon + 18 + tw)) / 2
  ctx.fillStyle = P.leaf
  ctx.beginPath()
  ctx.roundRect(x, y + 30, icon, icon, 18)
  ctx.fill()
  // 小葉子打勾
  ctx.strokeStyle = P.onLeaf
  ctx.lineWidth = 7
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(x + 16, y + 60)
  ctx.lineTo(x + 25, y + 69)
  ctx.lineTo(x + 41, y + 49)
  ctx.stroke()
  ctx.fillStyle = P.ink
  ctx.fillText('好食光 MealWise', x + icon + 18, y + 40)
  return y + 140
}

function statRow(ctx: Ctx, P: Pal, y: number, stats: { label: string; value: string; unit?: string; color?: string }[]) {
  const gap = 18
  const w = (W - PAD * 2 - gap * (stats.length - 1)) / stats.length
  const h = 168
  stats.forEach((s, i) => {
    const x = PAD + i * (w + gap)
    card(ctx, P, x, y, w, h, 40)
    ctx.textAlign = 'center'
    ctx.fillStyle = s.color ?? P.ink
    font(ctx, 800, stats.length > 3 ? 52 : 60)
    const vw = ctx.measureText(s.value).width
    font(ctx, 400, 26)
    const uw = s.unit ? ctx.measureText(s.unit).width + 6 : 0
    font(ctx, 800, stats.length > 3 ? 52 : 60)
    ctx.textAlign = 'left'
    const sx = x + (w - vw - uw) / 2
    ctx.fillText(s.value, sx, y + 32)
    if (s.unit) {
      ctx.fillStyle = P.muted
      font(ctx, 400, 26)
      ctx.fillText(s.unit, sx + vw + 6, y + 62)
    }
    ctx.textAlign = 'center'
    ctx.fillStyle = P.muted
    font(ctx, 400, 26)
    ctx.fillText(s.label, x + w / 2, y + 112)
  })
  ctx.textAlign = 'left'
  return y + h
}

/* ───────── 食譜 ───────── */

export async function renderRecipeCard(recipe: Recipe, servings = 1): Promise<Blob> {
  await ready()
  const P = palette()
  const { c, ctx } = canvas(P)
  let y = 0
  const photoId = recipe.photoOf ?? recipe.id
  const hasPhoto = !!(photoCredits as Record<string, unknown>)[photoId]
  const src = recipe.photoUrl ?? (hasPhoto ? `${import.meta.env.BASE_URL}photos/${photoId}-lg.webp` : null)
  let img = src ? await loadImage(src) : null
  const PH = 860
  if (img) {
    cover(ctx, img, 0, 0, W, PH, 0)
    try {
      ctx.getImageData(0, 0, 1, 1)
    } catch {
      return renderRecipeCard({ ...recipe, photoUrl: undefined, photoOf: '__none__' }, servings)
    }
    // 跟食譜頁一樣：照片下半部漸層變暗，名字壓在照片上
    const g = ctx.createLinearGradient(0, PH * 0.35, 0, PH)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(0,0,0,0.72)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, PH)
  } else {
    img = null
    const g = ctx.createLinearGradient(0, 0, W, PH)
    g.addColorStop(0, P.leaf)
    g.addColorStop(1, P.leafDark)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, 520)
  }
  const top = img ? PH : 520
  const onPhoto = img ? '#ffffff' : P.onLeaf
  ctx.fillStyle = onPhoto
  font(ctx, 800, 80)
  const nameLines = wrap(ctx, recipe.name, W - PAD * 2, 2)
  let ty = top - 150 - nameLines.length * 98
  // 標籤
  let px = PAD
  for (const t of [recipe.eatout?.brand, ...recipe.tags].filter(Boolean).slice(0, 3) as string[]) {
    px += pill(ctx, px, ty - 76, t, img ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.25)', onPhoto) + 12
  }
  ctx.fillStyle = onPhoto
  font(ctx, 800, 80)
  for (const l of nameLines) {
    ctx.fillText(l, PAD, ty)
    ty += 98
  }
  font(ctx, 400, 32)
  ctx.globalAlpha = 0.85
  ctx.fillText([recipe.minutes ? `${recipe.minutes} 分鐘` : '', `${servings} 人份`].filter(Boolean).join('・'), PAD, ty + 8)
  ctx.globalAlpha = 1
  // 內容區往上蓋住照片一點，做出圓角
  ctx.fillStyle = P.bg
  ctx.beginPath()
  ctx.roundRect(0, top - 56, W, 200, [56, 56, 0, 0])
  ctx.fill()
  y = top - 8

  const n = recipe.nutrition
  y = statRow(ctx, P, y, [
    { label: '熱量', value: String(Math.round(n.kcal)), unit: 'kcal' },
    { label: '蛋白質', value: String(Math.round(n.protein)), unit: 'g', color: P.tomato },
    { label: '碳水', value: String(Math.round(n.carbs)), unit: 'g', color: P.honey },
    { label: '脂肪', value: String(Math.round(n.fat)), unit: 'g', color: P.sky },
  ])
  y += 36

  if (recipe.ingredients.length) {
    const rows = Math.ceil(recipe.ingredients.length / 2)
    const h = 110 + rows * 62 + 24
    card(ctx, P, PAD, y, W - PAD * 2, h)
    ctx.fillStyle = P.ink
    font(ctx, 700, 38)
    ctx.fillText('食材', PAD + 40, y + 34)
    const colW = (W - PAD * 2 - 80 - 48) / 2
    recipe.ingredients.forEach((ing, i) => {
      const col = i < rows ? 0 : 1
      const x = PAD + 40 + col * (colW + 48)
      const ry = y + 106 + (col ? i - rows : i) * 62
      const qty = formatQty(ing.qty * servings, ing.unit)
      font(ctx, 400, 30)
      ctx.fillStyle = P.muted
      ctx.textAlign = 'right'
      ctx.fillText(qty, x + colW, ry)
      const qw = ctx.measureText(qty).width
      ctx.textAlign = 'left'
      ctx.fillStyle = P.ink
      ctx.fillText(fit(ctx, ing.name, colW - qw - 20), x, ry)
      ctx.fillStyle = P.line
      ctx.fillRect(x, ry + 48, colW, 2)
    })
    y += h + 28
  }

  if (recipe.steps.length) {
    font(ctx, 400, 30)
    const tw = W - PAD * 2 - 80 - 72
    const wrapped = recipe.steps.map((s) => wrap(ctx, s, tw))
    const h = 110 + wrapped.reduce((t, l) => t + l.length * 46 + 26, 0) + 14
    card(ctx, P, PAD, y, W - PAD * 2, h)
    ctx.fillStyle = P.ink
    font(ctx, 700, 38)
    ctx.fillText('做法', PAD + 40, y + 34)
    let sy = y + 106
    wrapped.forEach((lines, i) => {
      ctx.fillStyle = P.leaf
      ctx.beginPath()
      ctx.arc(PAD + 40 + 24, sy + 22, 24, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = P.onLeaf
      font(ctx, 700, 26)
      ctx.textAlign = 'center'
      ctx.fillText(String(i + 1), PAD + 40 + 24, sy + 6)
      ctx.textAlign = 'left'
      ctx.fillStyle = P.ink
      font(ctx, 400, 30)
      for (const l of lines) {
        ctx.fillText(l, PAD + 40 + 72, sy)
        sy += 46
      }
      sy += 26
    })
    y += h + 20
  }
  y = footer(ctx, P, y)
  return finish(c, y)
}

/* ───────── 訓練 ───────── */

const num = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1))

/** 把同樣重量次數的組合併：60 kg × 10 ×2 */
function setChips(sets: { w: number; r: number }[]) {
  const groups: { w: number; r: number; n: number }[] = []
  for (const s of sets) {
    const last = groups[groups.length - 1]
    if (last && last.w === s.w && last.r === s.r) last.n++
    else groups.push({ w: s.w, r: s.r, n: 1 })
  }
  return groups.map((g) => `${g.w ? `${num(g.w)} kg × ` : ''}${g.r} 下${g.n > 1 ? `　×${g.n}` : ''}`)
}

const exerciseThumb = (id: string, noPhoto?: boolean) => {
  if (!noPhoto) return `${import.meta.env.BASE_URL}exercises/${id}-0.webp`
  return (exerciseCredits as Record<string, unknown>)[id] ? `${import.meta.env.BASE_URL}exercises/${id}.webp` : null
}

export async function renderWorkoutCard(w: Workout, weightKg = 60): Promise<Blob> {
  await ready()
  const P = palette()
  const { c, ctx } = canvas(P)
  const d = new Date(`${w.date}T00:00:00`)
  // 標題區：跟介面一樣的大字，重點色的小標籤
  let y = 84
  pill(ctx, PAD, y, `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}（${'日一二三四五六'[d.getDay()]}）`, P.leafSoft, P.leafDark, 28, 26, 58)
  y += 92
  ctx.fillStyle = P.ink
  font(ctx, 800, 92)
  ctx.fillText(`${w.type ? TRAIN_MAP[w.type].label.replace('重訓・', '') + '日' : ''}訓練`, PAD, y)
  const tw = ctx.measureText(`${w.type ? TRAIN_MAP[w.type].label.replace('重訓・', '') + '日' : ''}訓練`).width
  ctx.fillStyle = P.leaf
  ctx.fillText('完成！', PAD + tw + 12, y)
  y += 150

  const cardio = workoutCardio(w, weightKg)
  const volume = Math.round(workoutVolume(w))
  const kcal = w.watch?.kcal ?? cardio.kcal
  const stats = [
    { label: '運動時間', value: String(Math.round(activeMs(w) / 60000)), unit: '分' },
    { label: '完成組數', value: String(doneSets(w)), unit: '組' },
    ...(volume > 0 ? [{ label: '總重量', value: volume.toLocaleString(), unit: 'kg', color: P.leafDark }] : []),
    ...(kcal > 0 ? [{ label: '消耗', value: String(kcal), unit: 'kcal', color: P.tomato }] : []),
  ].slice(0, 4)
  y = statRow(ctx, P, y, stats) + 32

  const entries = w.entries.filter((e) => EXERCISE_MAP[e.exerciseId] && e.sets.some((s) => s.done))
  const thumbs = await Promise.all(
    entries.map((e) => {
      const ex = EXERCISE_MAP[e.exerciseId]
      const src = exerciseThumb(ex.id, ex.noPhoto)
      return src ? loadImage(src) : Promise.resolve(null)
    }),
  )
  entries.forEach((e, i) => {
    const ex = EXERCISE_MAP[e.exerciseId]
    const done = e.sets.filter((s) => s.done)
    const cardioEx = isCardio(ex)
    let chips: string[]
    if (cardioEx) {
      const s = cardioSummary(ex, e.sets, weightKg)
      chips = [`${num(Math.round(s.min * 10) / 10)} 分`, s.km ? `${num(Math.round(s.km * 100) / 100)} km` : '', s.kcal ? `${Math.round(s.kcal)} kcal` : ''].filter(Boolean)
    } else chips = setChips(done)
    // 先量每個小標籤的位置（放不下就換行）
    const TH = 150
    const left = PAD + 28 + TH + 28
    const maxX = W - PAD - 28
    font(ctx, 700, 26)
    const pos: { x: number; y: number; t: string }[] = []
    let cx = left
    let row = 0
    for (const t of chips) {
      const cw = ctx.measureText(t).width + 40
      if (cx + cw > maxX && cx > left) {
        cx = left
        row++
      }
      pos.push({ x: cx, y: row, t })
      cx += cw + 12
    }
    const h = Math.max(TH + 56, 96 + (row + 1) * 62 + 30)
    card(ctx, P, PAD, y, W - PAD * 2, h)
    const img = thumbs[i]
    if (img) cover(ctx, img, PAD + 28, y + 28, TH, h - 56 > TH ? TH : h - 56, 28)
    else {
      ctx.fillStyle = cardioEx ? P.skySoft : P.leafSoft
      ctx.beginPath()
      ctx.roundRect(PAD + 28, y + 28, TH, TH, 28)
      ctx.fill()
      ctx.fillStyle = cardioEx ? P.sky : P.leafDark
      font(ctx, 800, 64)
      ctx.textAlign = 'center'
      ctx.fillText(ex.zh.slice(0, 1), PAD + 28 + TH / 2, y + 28 + 40)
      ctx.textAlign = 'left'
    }
    ctx.fillStyle = P.ink
    font(ctx, 700, 38)
    ctx.fillText(fit(ctx, ex.zh, maxX - left), left, y + 30)
    for (const p of pos) pill(ctx, p.x, y + 96 + p.y * 62, p.t, cardioEx ? P.skySoft : P.leafSoft, cardioEx ? P.sky : P.leafDark, 26, 20, 50)
    y += h + 20
  })
  if (w.watch?.hr) {
    ctx.fillStyle = P.muted
    font(ctx, 400, 28)
    ctx.fillText(`Apple Watch・平均心率 ${w.watch.hr} bpm`, PAD + 8, y + 8)
    y += 60
  }
  y = footer(ctx, P, y + 4)
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
