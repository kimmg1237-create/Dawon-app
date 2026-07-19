const https = require('https')

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let d = ''
        res.on('data', (c) => (d += c))
        res.on('end', () =>
          resolve({ status: res.statusCode, body: d, type: res.headers['content-type'] || '' }),
        )
      })
      .on('error', reject)
  })
}

;(async () => {
  const home = await get('https://dawon-app.vercel.app/')
  const m = home.body.match(/assets\/index-[^"]+\.js/)
  console.log('js=' + (m ? m[0] : 'none'))
  const cov = await get('https://dawon-app.vercel.app/covers/01.webp')
  console.log('cover01=' + cov.status + ' type=' + cov.type + ' len=' + cov.body.length)
  if (m) {
    const js = (await get('https://dawon-app.vercel.app/' + m[0])).body
    console.log('has_covers_01_webp=' + js.includes('/covers/01.webp'))
    console.log('has_path_cover=' + js.includes('path-cover'))
  }
})()
