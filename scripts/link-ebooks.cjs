const fs = require('fs')
const path = require('path')

const dir = path.join('public', 'ebooks')
const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.pdf'))

let linked = 0
for (const f of files) {
  const m = f.match(/^(\d{2})_/)
  if (!m) continue
  const id = m[1]
  const src = path.join(dir, f)
  const dest = path.join(dir, `${id}.pdf`)
  fs.copyFileSync(src, dest)
  linked++
  console.log('linked', id, '<-', f)
}

const ids = [...new Set(files.map((f) => (f.match(/^(\d{2})_/) || [])[1]).filter(Boolean))].sort()
const lines = [
  '/** Auto-generated — run: node scripts/link-ebooks.cjs */',
  'export const EBOOK_BY_ID: Record<string, string> = {',
]
for (const id of ids) {
  lines.push(`  "${id}": "/ebooks/${id}.pdf",`)
}
lines.push('}')
lines.push('')
lines.push('export function getEbookUrl(pathId: string): string | null {')
lines.push('  return EBOOK_BY_ID[pathId] ?? null')
lines.push('}')
lines.push('')

fs.writeFileSync(path.join('src', 'data', 'ebookFiles.ts'), lines.join('\n'), 'utf8')
console.log('done linked=' + linked + ' map=' + ids.length)
