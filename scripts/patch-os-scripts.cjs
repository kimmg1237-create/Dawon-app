const fs = require('fs')
const p = 'src/newsite/dawonOs/scripts.raw.js'
let s = fs.readFileSync(p, 'utf8')

s = s.replace(
  "const $=id=>document.getElementById(id), $$=s=>[...document.querySelectorAll(s)];",
  `const __el=(id)=>{const n=document.getElementById(id);if(n)return n;return new Proxy({},{get:(_,p)=>p==='classList'?{add(){},remove(){},toggle(){},contains:()=>false}:p==='style'?{}:p==='dataset'?{}:p==='addEventListener'||p==='removeEventListener'||p==='focus'||p==='click'||p==='setAttribute'||p==='remove'?()=>undefined:p==='querySelector'?()=>null:p==='querySelectorAll'?()=>[]:p==='contains'?()=>false:p==='value'||p==='textContent'||p==='innerHTML'?'':p==='checked'||p==='disabled'?false:undefined});}; const $=id=>__el(id), $$=s=>[...document.querySelectorAll(s)];`,
)

s = s.replace(
  'const motionEl=id=>document.getElementById(id);',
  'const motionEl=id=>__el(id);',
)

s = s.replace("store.get(STORAGE.theme,'light')", "store.get(STORAGE.theme,'dark')")

fs.writeFileSync(p, s)
console.log('patched', {
  proxy: s.includes('const __el='),
  motion: s.includes('const motionEl=id=>__el(id)'),
  dark: s.includes("store.get(STORAGE.theme,'dark')"),
})
