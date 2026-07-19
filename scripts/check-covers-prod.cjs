const https = require('https')
const fs = require('fs')

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
  const local = fs.readdirSync('public/covers').filter((f) => /^\d{2}\.png$/i.test(f))
  console.log('local_compact=' + local.length)

  const home = await get('https://dawon-app.vercel.app/')
  const m = home.body.match(/assets\/index-[^"]+\.js/)
  console.log('js=' + (m ? m[0] : 'none'))

  for (const id of ['00', '01', '14']) {
    const r = await get('https://dawon-app.vercel.app/covers/' + id + '.png')
    console.log('png_' + id + '=' + r.status + ' type=' + (r.headers['content-type'] || ''))
  }

  if (m) {
    const js = (await get('https://dawon-app.vercel.app/' + m[0])).body
    console.log('bundle_has_/covers/01.png=' + js.includes('/covers/01.png'))
    console.log('bundle_has_path-cover=' + js.includes('path-cover'))
    console.log('bundle_has_has-cover=' + js.includes('has-cover'))
  }
})()
