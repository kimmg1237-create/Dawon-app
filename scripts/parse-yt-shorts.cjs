const fs = require('fs')
const path = require('path')

const htmlPath = process.argv[2] || path.join(process.env.TEMP || '/tmp', 'yt-shorts.html')
const html = fs.readFileSync(htmlPath, 'utf8')

const out = []
const seen = new Set()

const blockRe = /shortsLockupViewModel":\{[^}]*"entityId":"shorts-shelf-item-([a-zA-Z0-9_-]{11})"[^}]*"accessibilityText":"([^"]+)"/g

for (const m of html.matchAll(blockRe)) {
  const id = m[1]
  if (seen.has(id)) continue
  seen.add(id)
  let title = m[2]
    .replace(/, 다원작가\.?/g, '')
    .replace(/, 조회수 \d+회.*/g, '')
    .replace(/ - Shorts.*$/g, '')
    .trim()
  out.push({ id, title, url: `https://www.youtube.com/shorts/${id}` })
}

console.log(JSON.stringify(out, null, 2))
console.error(`Found ${out.length} shorts`)
