const fs = require('fs')
if (!fs.existsSync('.env')) {
  console.log('STATUS=missing_env_file')
  process.exit(0)
}
const text = fs.readFileSync('.env', 'utf8')
function get(name) {
  const re = new RegExp('^\\s*' + name + '\\s*=\\s*(.+)$', 'm')
  const m = text.match(re)
  if (!m) return null
  return m[1].trim().replace(/^["']|["']$/g, '')
}
const key = get('VITE_TOSS_CLIENT_KEY')
if (!key) console.log('VITE_TOSS_CLIENT_KEY=MISSING')
else if (/여기에|your-|xxx/i.test(key)) console.log('VITE_TOSS_CLIENT_KEY=PLACEHOLDER')
else {
  let kind = 'UNKNOWN'
  if (key.startsWith('test_ck_') || key.startsWith('live_ck_')) kind = 'OK_CLIENT'
  else if (key.startsWith('test_sk_') || key.startsWith('live_sk_')) kind = 'WRONG_SECRET_IN_CLIENT'
  else if (key.startsWith('test_gck_') || key.startsWith('live_gck_')) kind = 'WIDGET_CLIENT'
  else if (key.startsWith('test_gsk_') || key.startsWith('live_gsk_')) kind = 'WRONG_WIDGET_SECRET'
  console.log('VITE_TOSS_CLIENT_KEY=' + kind)
  console.log('PREFIX=' + key.slice(0, 12) + '...')
  console.log('LENGTH=' + key.length)
  const ok = Boolean(key) && !key.includes('여기에') && (key.startsWith('test_') || key.startsWith('live_'))
  console.log('isTossConfigured=' + ok)
  console.log('is_client_key=' + (kind === 'OK_CLIENT'))
}
const sk = get('TOSS_SECRET_KEY')
if (sk) {
  const skKind = sk.startsWith('test_sk_') || sk.startsWith('live_sk_') ? 'OK_SECRET' : 'UNEXPECTED'
  console.log('TOSS_SECRET_KEY_LOCAL=' + skKind + ' (prefer Supabase secrets)')
}
