const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, '..', 'public', 'audiobook-texts')
const out = path.join(dir, 'index.json')

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}

const files = fs
  .readdirSync(dir)
  .filter((name) => name.toLowerCase().endsWith('.txt') && name.toLowerCase() !== 'readme.txt')
  .sort((a, b) => a.localeCompare(b, 'ko'))

fs.writeFileSync(out, JSON.stringify(files, null, 2) + '\n', 'utf8')
console.log(`Indexed ${files.length} text file(s) → public/audiobook-texts/index.json`)
files.forEach((f) => console.log(`  - ${f}`))
