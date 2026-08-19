/**
 * Replace embedded base64 gold logos in dawon OS body.html with /brand/dawon-logo.png
 */
const fs = require('fs')

const path = 'src/newsite/dawonOs/body.html'
let html = fs.readFileSync(path, 'utf8')
const before = html.length

html = html.replace(
  /src="data:image\/png;base64,[A-Za-z0-9+/=]+"/g,
  'src="/brand/dawon-logo.png"',
)

const after = html.length
const count = (html.match(/\/brand\/dawon-logo\.png/g) || []).length
fs.writeFileSync(path, html)
console.log({ before, after, saved: before - after, logoRefs: count })
