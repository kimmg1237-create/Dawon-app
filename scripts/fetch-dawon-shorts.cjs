const fs = require('fs')
const path = require('path')
const https = require('https')

const CHANNEL_SHORTS =
  'https://www.youtube.com/@%EB%8B%A4%EC%9B%90%EC%9E%91%EA%B0%80-y6i/shorts'
const OUT = path.join(__dirname, 'dawon-shorts-raw.json')

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept-Language': 'ko-KR,ko;q=0.9',
          },
        },
        (res) => {
          const chunks = []
          res.on('data', (c) => chunks.push(c))
          res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
        },
      )
      .on('error', reject)
  })
}

async function main() {
  const html = await fetch(CHANNEL_SHORTS)
  const out = []
  const seen = new Set()

  const itemRe =
    /shorts-shelf-item-([a-zA-Z0-9_-]{11})[\s\S]*?"overlayMetadata":\{"primaryText":\{"content":"([^"]+)"\}/g

  for (const m of html.matchAll(itemRe)) {
    const id = m[1]
    if (seen.has(id)) continue
    seen.add(id)
    out.push({
      id,
      title: m[2].replace(/, 다원작가\.?$/g, '').trim(),
      url: `https://www.youtube.com/shorts/${id}`,
    })
  }

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf8')
  console.log(`Wrote ${out.length} shorts to ${OUT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
