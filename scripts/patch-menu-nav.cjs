const fs = require('fs')
const p = 'src/newsite/dawonOs/body.html'
let b = fs.readFileSync(p, 'utf8')
b = b.replace(
  /<div class="form-actions" style="display:grid"><a class="btn btn-primary" href="#one">오늘설계<\/a><a class="btn btn-soft" href="#school">365 생활습관학교<\/a><a class="btn btn-soft" href="\/library">전자책·오디오북·만화<\/a><a class="btn btn-soft" href="#subscription">이용권<\/a><a class="btn btn-soft" href="\/library">작품관 · 보상\/확장<\/a><\/div>/,
  `<div class="form-actions" style="display:grid"><a class="btn btn-primary" href="#one">오늘설계</a><a class="btn btn-soft" href="#school">365 생활습관학교</a><a class="btn btn-soft" href="/library">전자책·오디오북·만화</a><a class="btn btn-soft" href="#subscription">이용권</a></div>`,
)
fs.writeFileSync(p, b)
console.log('menu cleaned', !b.includes('작품관 · 보상/확장'))
