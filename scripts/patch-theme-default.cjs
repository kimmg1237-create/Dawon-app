const fs = require('fs')
const p = 'src/newsite/dawonOs/scripts.raw.js'
let s = fs.readFileSync(p, 'utf8')
s = s.replace("store.get(STORAGE.theme,'light')", "store.get(STORAGE.theme,'dark')")
fs.writeFileSync(p, s)
console.log('dark default', s.includes("store.get(STORAGE.theme,'dark')"))
