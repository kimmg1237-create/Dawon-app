import { useEffect, useState } from 'react'
import { resolveStoreBookLocal, type StoreBookLocalFiles, type StoreBookProduct } from '../services/storeBookService'

const PRODUCTS: StoreBookProduct[] = ['sotong', 'healing']

export function AdminStoreBooksPanel() {
  const [files, setFiles] = useState<StoreBookLocalFiles[]>([])

  useEffect(() => {
    void Promise.all(PRODUCTS.map((p) => resolveStoreBookLocal(p))).then(setFiles)
  }, [])

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>스토어 단행본</h2>
          <p className="admin-hint">
            홈페이지에서 올리지 마세요. 컴퓨터 프로젝트 폴더{' '}
            <code>public/store-books</code>에 파일을 넣으면 됩니다. 넣은 뒤 이 페이지를 새로고침하세요.
          </p>
          <p className="admin-hint">
            자신과의 소통: <code>sotong.png</code> + <code>sotong.pdf</code>
            <br />
            힐링게임: <code>healing.png</code> + <code>healing.pdf</code>
          </p>
        </div>
      </div>
      <div className="admin-grid-2">
        {files.map((row) => (
          <article key={row.product} className="admin-card">
            <h3>{row.title}</h3>
            <img src={row.coverUrl} alt="" style={{ width: 120, borderRadius: 10 }} />
            <p className="admin-hint">
              표지: {row.coverFromDisk ? '폴더에서 인식됨' : '아직 없음 — sotong/healing 이미지 파일을 넣으세요'}
            </p>
            <p className="admin-hint">
              PDF: {row.pdfFromDisk ? '폴더에서 인식됨 — 전자책 구매자가 보관함에서 읽을 수 있습니다' : '아직 없음 — 같은 폴더에 PDF를 넣으세요'}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
