const fs = require('fs')
const path = require('path')

const dir = path.join('public', 'covers')
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}

const exts = ['.webp', '.jpg', '.jpeg', '.png']
const files = fs.readdirSync(dir)
const byId = new Map()

for (const f of files) {
  const lower = f.toLowerCase()
  const ext = exts.find((e) => lower.endsWith(e))
  if (!ext) continue
  const m = f.match(/^(\d{2})/)
  if (!m) continue
  const id = m[1]
  if (!byId.has(id)) byId.set(id, `/covers/${f.replace(/\\/g, '/')}`)
}

const ids = [...byId.keys()].sort()
const lines = [
  '/** Auto-generated — run: node scripts/generate-cover-map.cjs */',
  'export const COVER_BY_ID: Record<string, string> = {',
]
for (const id of ids) {
  lines.push(`  "${id}": "${byId.get(id)}",`)
}
lines.push('}')
lines.push('')
lines.push('export function getCoverUrl(pathId: string): string | null {')
lines.push('  return COVER_BY_ID[pathId] ?? null')
lines.push('}')
lines.push('')

fs.writeFileSync(path.join('src', 'data', 'coverFiles.ts'), lines.join('\n'), 'utf8')
console.log('wrote src/data/coverFiles.ts covers=' + ids.length)
if (ids.length === 0) {
  console.log('Tip: add public/covers/00.webp … 50.webp (or .jpg/.png)')
}
