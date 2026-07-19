/**
 * public/covers 의 이미지 파일명을 paths.ts 제목과 매칭해
 * src/data/coverFiles.ts 를 생성합니다.
 *
 * 실행: node scripts/generate-cover-map.cjs
 * 검사만: node scripts/generate-cover-map.cjs --check
 */
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const root = path.join(__dirname, '..')
const coversDir = path.join(root, 'public', 'covers')
const pathsFile = path.join(root, 'src', 'data', 'paths.ts')
const outFile = path.join(root, 'src', 'data', 'coverFiles.ts')
const checkOnly = process.argv.includes('--check')

const normalize = (s) =>
  s
    .normalize('NFC')
    .replace(/\.(png|webp|jpe?g)$/i, '')
    .replace(/^\d+[._\s-]*/, '')
    .replace(/[\s,.·'"!?~\-_]/g, '')
    .toLowerCase()

const source = fs.readFileSync(pathsFile, 'utf8')
const cards = []
const re = /id:\s*"(\d+)"[\s\S]*?title:\s*"([^"]+)"/g
let m
while ((m = re.exec(source))) cards.push({ id: m[1], title: m[2] })

const files = fs
  .readdirSync(coversDir)
  .filter((f) => /\.(png|webp|jpe?g)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, 'ko'))

const hashes = new Map()
for (const f of files) {
  const buf = fs.readFileSync(path.join(coversDir, f))
  const hash = crypto.createHash('sha256').update(buf).digest('hex')
  if (!hashes.has(hash)) hashes.set(hash, [])
  hashes.get(hash).push(f)
}
const dupGroups = [...hashes.values()].filter((g) => g.length > 1)

const byNorm = new Map()
const collisions = []
for (const f of files) {
  const key = normalize(f)
  if (byNorm.has(key)) {
    collisions.push({ key, keep: byNorm.get(key), drop: f })
    // Prefer filename that more closely matches the raw title (longer / with commas)
    const prev = byNorm.get(key)
    if (f.length > prev.length) byNorm.set(key, f)
  } else {
    byNorm.set(key, f)
  }
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
const leftovers = [...byNorm.values()]

console.log(`matched: ${entries.length}/${cards.length}`)
if (missing.length) console.log('no cover:\n' + missing.join('\n'))
if (leftovers.length) console.log('unmatched files:\n' + leftovers.join('\n'))
if (collisions.length) console.log('normalize collisions:\n' + collisions.map((c) => `${c.keep} <- ${c.drop}`).join('\n'))
if (dupGroups.length) console.log('identical hashes:\n' + dupGroups.map((g) => g.join(' == ')).join('\n'))

if (checkOnly) {
  process.exit(missing.length ? 1 : 0)
}

const out = `/** Auto-generated — run: node scripts/generate-cover-map.cjs */
export const COVER_BY_ID: Record<string, string> = {
${entries.join('\n')}
}

export function getCoverUrl(pathId: string): string | null {
  return COVER_BY_ID[pathId] ?? null
}
`
fs.writeFileSync(outFile, out, 'utf8')
console.log('wrote', path.relative(root, outFile))
