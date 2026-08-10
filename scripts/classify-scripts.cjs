const fs = require('fs')
const path = require('path')
const dir = 'src/newsite/_incoming'
const file = fs.readdirSync(dir).find((f) => f.includes('DAWON'))
const raw = fs.readFileSync(path.join(dir, file), 'utf8')
const re = /<script>([\s\S]*?)<\/script>/g
let m
let i = 0
while ((m = re.exec(raw))) {
  i++
  const s = m[1]
  const isPay =
    /TossPayments|subscription\/confirm|paymentKey|checkoutEnabled|refundLatest|cancelSubscription|openCheckout|selectedPlan|checkoutModal/.test(
      s,
    )
  const markers = [
    'getElementById',
    'dawonNavigate',
    'TossPayments',
    'refundLatest',
    'saveDay',
    'generateContent',
    'motionComic',
    'STORAGE',
  ]
  console.log(
    i,
    JSON.stringify({
      len: s.length,
      isPay,
      hits: markers.filter((k) => s.includes(k)),
      head: s.slice(0, 80).replace(/\s+/g, ' '),
    }),
  )
}
