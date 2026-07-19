/**
 * public/covers ? PNG ???(? ?? ??)? paths.ts ? ? ID? ???
 * src/data/coverFiles.ts ? ?????.
 * ??: node scripts/generate-cover-map.cjs
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const coversDir = path.join(root, 'public', 'covers')
const pathsFile = path.join(root, 'src', 'data', 'paths.ts')
const outFile = path.join(root, 'src', 'data', 'coverFiles.ts')

const normalize = (s) =>
  s
    .normalize('NFC')
    .replace(/\.(png|webp|jpg|jpeg)$/i, '')
    .replace(/^\d+[._\s]*/, '')
    .replace(/[\s,.�"'����!?~\-_]/g, '')
    .toLowerCase()

const source = fs.readFileSync(pathsFile, 'utf8')
const cards = []
const re = /id:\s*"(\d+)"[\s\S]*?title:\s*"([^"]+)"/g
let m
while ((m = re.exec(source))) cards.push({ id: m[1], title: m[2] })

const files = fs.readdirSync(coversDir).filter((f) => /\.png$/i.test(f))
const byNorm = new Map()
for (const f of files) {
  const key = normalize(f)
  // ?? ??? ?? ??? ?? ?? ? ??? ??
  if (!byNorm.has(key)) byNorm.set(key, f)
}

const entries = []
const missing = []
for (const card of cards) {
  const file = byNorm.get(normalize(card.title))
  if (file) {
    entries.push(`  "${card.id}": "/covers/${encodeURI(file)}",`)
    byNorm.delete(normalize(card.title))
  } else {
    missing.push(`${card.id} ${card.title}`)
  }
}

const out = `/** Auto-generated � run: node scripts/generate-cover-map.cjs */
export const COVER_BY_ID: Record<string, string> = {
${entries.join('\n')}
}

export function getCoverUrl(pathId: string): string | null {
  return COVER_BY_ID[pathId] ?? null
}
`
fs.writeFileSync(outFile, out, 'utf8')
console.log(`matched: ${entries.length}/${cards.length}`)
if (missing.length) console.log('no cover (fallback used):\n' + missing.join('\n'))
const leftovers = [...byNorm.values()]
if (leftovers.length) console.log('unmatched cover files:\n' + leftovers.join('\n'))
