const https = require('https')
function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let d = ''
        res.on('data', (c) => (d += c))
        res.on('end', () =>
          resolve({ status: res.statusCode, type: res.headers['content-type'] || '', len: d.length }),
        )
      })
      .on('error', reject)
  })
}
;(async () => {
  for (const u of [
    'https://dawon-app.vercel.app/ebooks/01.pdf',
    'https://dawon-app.vercel.app/covers/01.png',
    'https://dawon-app.vercel.app/favicon.svg',
  ]) {
    const r = await get(u)
    console.log(u, r.status, r.type, 'len=' + r.len)
  }
})()
