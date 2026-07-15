const fs = require('fs')

const dir = 'public/ebooks'
const files = fs
  .readdirSync(dir)
  .filter((f) => f.toLowerCase().endsWith('.pdf'))
  .sort()

const lines = [
  '/** Auto-generated from public/ebooks — run: node scripts/generate-ebook-map.cjs */',
  'export const EBOOK_BY_ID: Record<string, string> = {',
]

for (const f of files) {
  const m = f.match(/^(\d{2})_/)
  if (!m) continue
  const escaped = f.replace(/\\/g, '/').replace(/"/g, '\\"')
  lines.push(`  "${m[1]}": "/ebooks/${escaped}",`)
}

lines.push('}')
lines.push('')
lines.push('export function getEbookUrl(pathId: string): string | null {')
lines.push('  const file = EBOOK_BY_ID[pathId]')
lines.push('  if (!file) return null')
lines.push('  return encodeURI(file)')
lines.push('}')
lines.push('')

fs.writeFileSync('src/data/ebookFiles.ts', lines.join('\n'), 'utf8')
console.log('wrote src/data/ebookFiles.ts entries=' + files.length)
