const fs = require('fs')
const path = require('path')

const dir = path.join('src', 'newsite', '_incoming')
const file = fs.readdirSync(dir).find((f) => f.includes('DAWON'))
if (!file) throw new Error('DAWON incoming file not found')
const raw = fs.readFileSync(path.join(dir, file), 'utf8')

const styleMatch = raw.match(/<style>([\s\S]*?)<\/style>/)
const style = styleMatch ? styleMatch[1] : ''

const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i)
if (!bodyMatch) throw new Error('body not found')
let body = bodyMatch[1]

function removeElementById(html, id) {
  const needle = `id="${id}"`
  const idAt = html.indexOf(needle)
  if (idAt < 0) return html
  const start = html.lastIndexOf('<div', idAt)
  if (start < 0) return html
  let i = start
  let depth = 0
  while (i < html.length) {
    const nextOpen = html.indexOf('<div', i)
    const nextClose = html.indexOf('</div>', i)
    if (nextClose < 0) break
    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth++
      i = nextOpen + 4
    } else {
      depth--
      i = nextClose + 6
      if (depth === 0) return html.slice(0, start) + html.slice(i)
    }
  }
  return html
}

body = removeElementById(body, 'authModal')
body = removeElementById(body, 'checkoutModal')

body = body.replace(
  /<div class="local-mode-banner"[\s\S]*?<\/div>\s*/m,
  '<div class="local-mode-banner">로컬 미리보기 · 결제는 앱의 이용권(구독) 결제 시스템으로 안전하게 연결됩니다.</div>\n',
)

body = body
  .replace(/https:\/\/dawon-app\.vercel\.app\/#daily/g, '/#today')
  .replace(/https:\/\/dawon-app\.vercel\.app\/library\/?/g, '/library')
  .replace(/href="#works"/g, 'href="/library"')
  .replace(
    /<button class="btn ([^"]*) demo-plan"[^>]*>[^<]*<\/button>/g,
    '<a class="btn $1" href="/subscribe">이용권 결제하기</a>',
  )

body = body.replace(
  /id="paymentReadiness"[^>]*>[^<]*<\/span>/,
  'id="paymentReadiness">토스 결제 · 앱 이용권 페이지에서 진행</span>',
)

body = body.replace(
  /(<div class="works-actions">\s*)/,
  '$1<a class="btn btn-primary" href="/library">전자책·오디오북·만화 서재</a>\n            ',
)

body = body.replace(
  /<nav class="nav-links" aria-label="주요 메뉴">\s*<a href="#one">오늘설계<\/a><a href="#school">365 생활습관학교<\/a><a href="#subscription">이용권<\/a>\s*<\/nav>/,
  `<nav class="nav-links" aria-label="주요 메뉴">
      <a href="#one">오늘설계</a><a href="#school">365 생활습관학교</a><a href="/library">전자책·오디오북·만화</a><a href="#subscription">이용권</a>
    </nav>`,
)

body = body.replace(
  /(<div class="form-actions" style="display:grid"><a class="btn btn-primary" href="#one">오늘설계<\/a><a class="btn btn-soft" href="#school">365 생활습관학교<\/a>)<a class="btn btn-soft" href="#subscription">이용권<\/a><a class="btn btn-soft" href="\/library">작품관 · 보상\/확장<\/a>/,
  '$1<a class="btn btn-soft" href="/library">전자책·오디오북·만화</a><a class="btn btn-soft" href="#subscription">이용권</a>',
)

body = body.replace(
  /(<article class="plan-card">[\s\S]*?<h3>2주 이용권<\/h3>[\s\S]*?)<a class="btn [^"]+" href="\/subscribe">[^<]*<\/a>/,
  '$1<a class="btn btn-soft" href="/subscribe?plan=trial">이용권 결제하기</a>',
)
body = body.replace(
  /(<article class="plan-card recommended">[\s\S]*?<h3>30일 이용권<\/h3>[\s\S]*?)<a class="btn [^"]+" href="\/subscribe">[^<]*<\/a>/,
  '$1<a class="btn btn-primary" href="/subscribe?plan=monthly">이용권 결제하기</a>',
)
body = body.replace(
  /(<article class="plan-card">[\s\S]*?<h3>365일 이용권<\/h3>[\s\S]*?)<a class="btn [^"]+" href="\/subscribe">[^<]*<\/a>/,
  '$1<a class="btn btn-soft" href="/subscribe?plan=annual">이용권 결제하기</a>',
)

if (!body.includes('dawon-os-pay-bridge')) {
  body = body.replace(
    /(<div class="subscription-trust-grid"[^>]*>)/,
    `<div class="dawon-os-pay-bridge works-actions" style="display:flex;gap:12px;flex-wrap:wrap;margin:18px 0 8px">
      <a class="btn btn-primary" href="/subscribe">토스로 이용권 결제하기</a>
      <a class="btn btn-soft" href="/login">로그인</a>
      <a class="btn btn-gold" href="/library">서재 열기</a>
    </div>
    $1`,
  )
}

body = body.replace(/href="\/refund"/g, 'href="/refund-policy"')
body = body.replaceAll('14,900원', '12,900원')

// Collect ALL scripts from full document (head + body). Head has dawonNavigateSection.
const scriptRe = /<script>([\s\S]*?)<\/script>/g
const scripts = []
let sm
while ((sm = scriptRe.exec(raw))) {
  const s = sm[1]
  const isPay =
    /TossPayments|subscription\/confirm|paymentKey|checkoutEnabled|refundLatest|cancelSubscription|openCheckout|selectedPlan|checkoutModal/.test(
      s,
    )
  if (isPay) continue
  // Skip pure auth-server script blocks that only talk to missing authModal APIs? Keep for now — guarded.
  scripts.push(s)
}

body = body.replace(/<script\b[\s\S]*?<\/script>/gi, '')

const outDir = path.join('src', 'newsite', 'dawonOs')
fs.mkdirSync(outDir, { recursive: true })

let scoped = style
scoped = scoped.replace(/(^|[^a-zA-Z0-9_-])body\{/g, '$1.dawon-os-root, body.dawon-os-active{')
scoped = scoped.replace(/(^|[^a-zA-Z0-9_-])body\./g, '$1body.dawon-os-active.')
// Sticky panels need a non-clipping ancestor. overflow:hidden on studio-shell breaks sticky-form.
scoped = scoped.replace(
  /\.studio-shell\{([^}]*)overflow:hidden([^}]*)\}/,
  '.studio-shell{$1overflow:visible$2}',
)
// Keep horizontal clip without breaking sticky — prefer visible for SPA shell
scoped = scoped.replace(
  /overflow-x:hidden;background:/,
  'overflow-x:visible;background:',
)

const theme =
  `/* Extracted from DAWON OS — auth/checkout removed; React /subscribe handles payment */\n` + scoped

let scriptsJoined = scripts.join('\n;\n')

// Safe DOM helpers: missing nodes are falsy (null), not Proxies that break if() checks.
const prelude = `
(() => {
  'use strict';
  if (!window.dawonNavigateSection) {
    window.dawonNavigateSection = (id) => {
      const key = String(id || '').replace(/^#/, '');
      const target = document.getElementById(key);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      try { history.replaceState(null, '', '#' + key); } catch (e) {}
    };
  }
})();
`

scriptsJoined = prelude + '\n' + scriptsJoined

// Normalize $ / $$ — IMPORTANT: in String.replace replacement, "$$" means literal "$".
// To emit "$$=" we must write "$$$$=".
scriptsJoined = scriptsJoined.replace(
  /const \$=id=>document\.getElementById\(id\),\s*\$\$=s=>\[\.\.\.document\.querySelectorAll\(s\)\];/g,
  'const $=id=>document.getElementById(id), $$$$=s=>[...document.querySelectorAll(s)];',
)
scriptsJoined = scriptsJoined.replace(
  /const __el=\([\s\S]*?\);\s*const \$=id=>__el\(id\),\s*\$\$?=s=>\[\.\.\.document\.querySelectorAll\(s\)\];/g,
  'const $=id=>document.getElementById(id), $$$$=s=>[...document.querySelectorAll(s)];',
)
scriptsJoined = scriptsJoined.replace(
  /const \$=id=>__el\(id\),\s*\$=s=>\[\.\.\.document\.querySelectorAll\(s\)\];/g,
  'const $=id=>document.getElementById(id), $$$$=s=>[...document.querySelectorAll(s)];',
)
scriptsJoined = scriptsJoined.replace(
  /const \$=id=>document\.getElementById\(id\),\s*\$=s=>\[\.\.\.document\.querySelectorAll\(s\)\];/g,
  'const $=id=>document.getElementById(id), $$$$=s=>[...document.querySelectorAll(s)];',
)
scriptsJoined = scriptsJoined.replace(
  /const motionEl=id=>__el\(id\);/g,
  'const motionEl=id=>document.getElementById(id);',
)
scriptsJoined = scriptsJoined.replace(
  "store.get(STORAGE.theme,'light')",
  "store.get(STORAGE.theme,'dark')",
)

// Guard common null addEventListener crash sites without Proxy
scriptsJoined = scriptsJoined.replace(
  /\$\('themeBtn'\)\.addEventListener/g,
  "$('themeBtn')&&$('themeBtn').addEventListener",
)
scriptsJoined = scriptsJoined.replace(
  /\$\('menuBtn'\)\.addEventListener/g,
  "$('menuBtn')&&$('menuBtn').addEventListener",
)
scriptsJoined = scriptsJoined.replace(
  /\$\('closeMenu'\)\.addEventListener/g,
  "$('closeMenu')&&$('closeMenu').addEventListener",
)
scriptsJoined = scriptsJoined.replace(
  /\$\('menuModal'\)\.addEventListener/g,
  "$('menuModal')&&$('menuModal').addEventListener",
)
scriptsJoined = scriptsJoined.replace(
  /\$\('accountBtn'\)\.addEventListener/g,
  "$('accountBtn')&&$('accountBtn').addEventListener",
)
scriptsJoined = scriptsJoined.replace(
  /\$\('worksGrid'\)\.addEventListener/g,
  "$('worksGrid')&&$('worksGrid').addEventListener",
)

fs.writeFileSync(path.join(outDir, 'theme.css'), theme)
fs.writeFileSync(path.join(outDir, 'body.html'), body)
fs.writeFileSync(path.join(outDir, 'scripts.raw.js'), scriptsJoined)

console.log(
  JSON.stringify(
    {
      file,
      scripts: scripts.length,
      hasNavigate: scriptsJoined.includes('dawonNavigateSection'),
      hasDollarDollar: /const \$\$=s=>/.test(scriptsJoined),
      brokenDollar: /const \$=id=>document\.getElementById\(id\),\s*\$=s=>/.test(scriptsJoined),
      hasTopbar: body.includes('class="topbar"'),
      libraryNav: body.includes('href="/library">전자책·오디오북·만화'),
      studioOverflow: /studio-shell\{[^}]*overflow:visible/.test(theme),
      saveDay: scriptsJoined.includes('saveDay'),
    },
    null,
    2,
  ),
)
