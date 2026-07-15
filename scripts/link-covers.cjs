const fs = require('fs')
const path = require('path')

const dir = path.join('public', 'covers')
const exts = ['.webp', '.jpg', '.jpeg', '.png']

function normalizeTitle(name) {
  // strip leading "NN." / "NN_" / "NN " and extension
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/^\d{2}[\.\_\s\-]+/, '')
    .replace(/\s+/g, '')
    .toLowerCase()
}

const files = fs
  .readdirSync(dir)
  .filter((f) => {
    const l = f.toLowerCase()
    return exts.some((e) => l.endsWith(e)) && !/^\d{2}\.(webp|jpg|jpeg|png)$/i.test(f)
  })
  .sort((a, b) => a.localeCompare(b, 'ko'))

const kept = []
const skipped = []
const seenTitles = new Set()

for (const f of files) {
  const m = f.match(/^(\d{2})/)
  if (!m) {
    skipped.push({ f, reason: 'no-id' })
    continue
  }
  const id = m[1]
  const titleKey = normalizeTitle(f)
  if (seenTitles.has(titleKey)) {
    skipped.push({ f, reason: 'duplicate-title', id })
    continue
  }
  seenTitles.add(titleKey)
  kept.push({ id, f })
}

// Remove any previous compact copies we may overwrite carefully
for (const { id, f } of kept) {
  const ext = path.extname(f).toLowerCase()
  const destName = `${id}${ext === '.jpeg' ? '.jpg' : ext}`
  const src = path.join(dir, f)
  const dest = path.join(dir, destName)
  fs.copyFileSync(src, dest)
  console.log('keep', id, '<-', f, '=>', destName)
}

console.log('--- skipped duplicates ---')
for (const s of skipped) {
  console.log(s.reason, s.id || '', s.f)
}

// Build map from compact files only (00-50)
const byId = new Map()
for (const f of fs.readdirSync(dir)) {
  const m = f.match(/^(\d{2})\.(webp|jpg|jpeg|png)$/i)
  if (!m) continue
  const id = m[1]
  if (!byId.has(id)) byId.set(id, `/covers/${f}`)
}

const ids = [...byId.keys()].sort()
const lines = [
  '/** Auto-generated — run: node scripts/link-covers.cjs */',
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
console.log('map entries=' + ids.length)
