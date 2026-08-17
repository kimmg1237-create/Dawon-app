const fs = require('fs')
const path = require('path')

const dir = path.join('public', 'comics')
const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.pdf'))

let linked = 0
for (const f of files) {
  const m = f.match(/^(\d{2})_/)
  if (!m) continue
  const id = m[1]
  fs.copyFileSync(path.join(dir, f), path.join(dir, `${id}.pdf`))
  linked++
  console.log('linked', id, '<-', f)
}

const ids = [...new Set(files.map((f) => (f.match(/^(\d{2})_/) || [])[1]).filter(Boolean))].sort()
const lines = [
  '/** Auto-generated — run: node scripts/link-comics.cjs */',
  'export const COMIC_BY_ID: Record<string, string> = {',
]
for (const id of ids) {
  lines.push(`  "${id}": "/comics/${id}.pdf",`)
}
lines.push('}')
lines.push('')
lines.push('export function getComicUrl(pathId: string): string | null {')
lines.push('  return COMIC_BY_ID[pathId] ?? null')
lines.push('}')
lines.push('')

fs.writeFileSync(path.join('src', 'data', 'comicFiles.ts'), lines.join('\n'), 'utf8')
console.log('done linked=' + linked + ' map=' + ids.length)
