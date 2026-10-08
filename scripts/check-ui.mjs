// 全站點擊回饋規則：可以點的東西一律用 <Tap> 或 <Button>（src/components/ui.tsx），
// 需要特殊動畫才用 motion.button，而且一定要有 whileTap。違反就讓 build 失敗。
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.tsx') ? [p] : []
  })

const problems = []
for (const file of walk('src')) {
  const src = readFileSync(file, 'utf8')
  const line = (i) => src.slice(0, i).split('\n').length
  for (const m of src.matchAll(/<button[\s>]/g)) problems.push(`${file}:${line(m.index)} 直接用了 <button>，請改用 <Tap>`)
  for (const m of src.matchAll(/<motion\.button\b/g)) {
    let depth = 0
    let i = m.index + m[0].length
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++
      else if (src[i] === '}') depth--
      else if (src[i] === '>' && depth === 0) break
    }
    if (!src.slice(m.index, i).includes('whileTap')) problems.push(`${file}:${line(m.index)} motion.button 少了 whileTap`)
  }
}

if (problems.length) {
  console.error('點擊回饋規則檢查沒過：\n' + problems.join('\n'))
  process.exit(1)
}
console.log('點擊回饋規則檢查通過')
