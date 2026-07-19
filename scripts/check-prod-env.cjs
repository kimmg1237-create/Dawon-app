const https = require('https')

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let d = ''
        res.on('data', (c) => (d += c))
        res.on('end', () => resolve({ status: res.statusCode, body: d, headers: res.headers }))
      })
      .on('error', reject)
  })
}

;(async () => {
  const home = await get('https://dawon-app.vercel.app/')
  console.log('HOME_STATUS=' + home.status)
  console.log('X_VERCEL_ID=' + (home.headers['x-vercel-id'] || 'n/a'))
  const m = home.body.match(/assets\/index-[^"]+\.js/)
  if (!m) {
    console.log('NO_JS')
    return
  }
  console.log('JS=' + m[0])
  const asset = await get('https://dawon-app.vercel.app/' + m[0])
  const js = asset.body
  const hasUrl = js.includes('zkxndxurporlkjssxqch.supabase.co')
  console.log('HAS_SUPABASE_URL=' + hasUrl)

  const jwtRe = /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/g
  const unique = [...new Set([...js.matchAll(jwtRe)].map((x) => x[0]))]
  console.log('JWT_COUNT=' + unique.length)
  for (const j of unique.slice(0, 5)) {
    console.log('JWT_LEN=' + j.length + ' PREFIX=' + j.slice(0, 16) + '...')
  }

  // Real configured build should have a long anon JWT (>=180). Placeholders won't match JWT regex.
  const hasRealAnon = unique.some((j) => j.length >= 150)
  console.log('HAS_REAL_ANON_JWT=' + hasRealAnon)
  console.log('HAS_TEST_CK=' + /test_ck_[A-Za-z0-9]+/.test(js))
  console.log('HAS_LIVE_CK=' + /live_ck_[A-Za-z0-9]+/.test(js))

  // Note: warning UI strings always exist in source even when configured
  console.log('NOTE=cloud_warning_text_always_in_bundle=' + js.includes('클라우드 연동 설정 필요'))
})()
