const fs = require('fs')
if (!fs.existsSync('.env')) {
  console.log('STATUS=missing_env_file')
  process.exit(0)
}
const text = fs.readFileSync('.env', 'utf8')
function get(name) {
  const m = text.match(new RegExp('^\\s*' + name + '\\s*=\\s*(.+)$', 'm'))
  if (!m) return null
  return m[1].trim().replace(/^["']|["']$/g, '')
}
function report(name, val) {
  if (!val) return name + '=MISSING'
  if (/여기에|본인_|your-|xxx/i.test(val)) return name + '=PLACEHOLDER'
  return name + '=SET prefix=' + val.slice(0, 14) + '... len=' + val.length
}
const url = get('VITE_SUPABASE_URL')
const key = get('VITE_SUPABASE_ANON_KEY')
const toss = get('VITE_TOSS_CLIENT_KEY')
console.log(report('VITE_SUPABASE_URL', url))
console.log(report('VITE_SUPABASE_ANON_KEY', key))
console.log(report('VITE_TOSS_CLIENT_KEY', toss))
const ok =
  Boolean(url) &&
  Boolean(key) &&
  !String(key).includes('여기에') &&
  key !== 'your-anon-key' &&
  !/본인_/.test(String(key))
console.log('isSupabaseConfigured=' + ok)
