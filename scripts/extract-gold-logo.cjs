/**
 * Extract gold logo from dawon OS body.html and write a transparent PNG for site-wide use.
 */
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

async function main() {
  const html = fs.readFileSync('src/newsite/dawonOs/body.html', 'utf8')
  const m = html.match(/class="hero-logo" src="data:image\/png;base64,([^"]+)"/)
  if (!m) throw new Error('hero-logo base64 not found')

  const src = Buffer.from(m[1], 'base64')
  const outDir = path.join('public', 'brand')
  fs.mkdirSync(outDir, { recursive: true })

  // Keep original (black bg) for reference
  fs.writeFileSync(path.join(outDir, 'dawon-logo-source.png'), src)

  // Make near-black background transparent so it works on light & dark UI
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    // Black / near-black pixels → transparent
    if (r < 28 && g < 28 && b < 28) {
      data[i + 3] = 0
    }
  }

  const transparent = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer()

  fs.writeFileSync(path.join(outDir, 'dawon-logo.png'), transparent)

  // Favicon-sized square
  await sharp(transparent)
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(outDir, 'dawon-favicon.png'))

  console.log('wrote', {
    logo: path.join(outDir, 'dawon-logo.png'),
    favicon: path.join(outDir, 'dawon-favicon.png'),
    bytes: transparent.length,
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
