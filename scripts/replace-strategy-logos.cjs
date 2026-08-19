const fs = require('fs')
const p = 'src/newsite/strategyBody.html'
let h = fs.readFileSync(p, 'utf8')

const oldBrand = /<span class="brandmark brandmark-logo"[^>]*>[\s\S]*?<\/span>/
const newBrand =
  '<span class="brandmark brandmark-logo" aria-hidden="true"><img src="/brand/dawon-logo.png" alt="" width="46" height="46" decoding="async" /></span>'
if (!oldBrand.test(h)) throw new Error('nav brand not found')
h = h.replace(oldBrand, newBrand)

const oldFoot = /<div class="footer-logo-line"><svg[\s\S]*?<\/svg>/
const newFoot =
  '<div class="footer-logo-line"><img src="/brand/dawon-logo.png" alt="" width="46" height="46" decoding="async" />'
if (!oldFoot.test(h)) throw new Error('footer not found')
h = h.replace(oldFoot, newFoot)

fs.writeFileSync(p, h)
console.log('strategyBody logo refs', (h.match(/\/brand\/dawon-logo\.png/g) || []).length)
