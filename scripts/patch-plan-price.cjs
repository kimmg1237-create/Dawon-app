const fs = require('fs')
const p = 'src/newsite/dawonOs/body.html'
let b = fs.readFileSync(p, 'utf8')
b = b.replaceAll('14,900원', '12,900원')
b = b.replaceAll('30일 14,900원', '30일 12,900원')
fs.writeFileSync(p, b)
console.log({
  price12900: (b.match(/12,900원/g) || []).length,
  libraryNav: b.includes('href="/library">전자책·오디오북·만화</a>'),
})
