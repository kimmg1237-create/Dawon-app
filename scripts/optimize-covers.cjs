const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const dir = path.join('public', 'covers')
const exts = ['.webp', '.jpg', '.jpeg', '.png']

async function main() {
  const files = fs
    .readdirSync(dir)
    .filter((f) => {
      const l = f.toLowerCase()
      return exts.some((e) => l.endsWith(e)) && !/^\d{2}\.webp$/i.test(f)
    })
    .sort((a, b) => a.localeCompare(b, 'ko'))

  // First file per id (by number order)
  const byId = new Map()
  for (const f of files) {
    const m = f.match(/^(\d{2})/)
    if (!m) continue
    const id = m[1]
    if (!byId.has(id)) byId.set(id, f)
  }

  // Prefer compact numbered png already created for ids not in source map
  for (const f of fs.readdirSync(dir)) {
    const m = f.match(/^(\d{2})\.png$/i)
    if (!m) continue
    const id = m[1]
    if (!byId.has(id)) byId.set(id, f)
  }

  const ids = [...byId.keys()].sort()
  console.log('ids=' + ids.join(','))

  for (const id of ids) {
    const srcName = byId.get(id)
    const src = path.join(dir, srcName)
    const dest = path.join(dir, `${id}.webp`)
    await sharp(src)
      .rotate()
      .resize({ width: 720, height: 1080, fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(dest)
    const kb = Math.round(fs.statSync(dest).size / 1024)
    console.log('ok', id, '<=', srcName, kb + 'kb')
  }

  // 00 from 50 if missing
  if (!byId.has('00') && fs.existsSync(path.join(dir, '50.webp'))) {
    fs.copyFileSync(path.join(dir, '50.webp'), path.join(dir, '00.webp'))
    byId.set('00', '50.webp')
    console.log('ok 00 <= 50.webp copy')
  }

  const finalIds = fs
    .readdirSync(dir)
    .map((f) => f.match(/^(\d{2})\.webp$/i))
    .filter(Boolean)
    .map((m) => m[1])
    .sort()

  const lines = [
    '/** Auto-generated — run: node scripts/optimize-covers.cjs */',
    'export const COVER_BY_ID: Record<string, string> = {',
  ]
  for (const id of finalIds) {
    lines.push(`  "${id}": "/covers/${id}.webp",`)
  }
  lines.push('}')
  lines.push('')
  lines.push('export function getCoverUrl(pathId: string): string | null {')
  lines.push('  return COVER_BY_ID[pathId] ?? null')
  lines.push('}')
  lines.push('')
  fs.writeFileSync(path.join('src', 'data', 'coverFiles.ts'), lines.join('\n'), 'utf8')
  console.log('map=' + finalIds.length)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
