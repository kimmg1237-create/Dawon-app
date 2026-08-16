import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { pageTitle, siteConfig } from '../data/siteConfig'

export function NotFoundPage() {
  return (
    <article className="container legal-page not-found-page">
      <Seo
        title={pageTitle('페이지를 찾을 수 없습니다')}
        description="요청하신 페이지를 찾을 수 없습니다. 홈 또는 3분 하루설계로 이동해 주세요."
        path="/404"
        noIndex
      />
      <div className="page-banner">
        <div className="eyebrow">404</div>
        <h1>페이지를 찾을 수 없습니다.</h1>
        <p>주소가 바뀌었거나 잘못된 링크일 수 있습니다.</p>
      </div>
      <div className="not-found-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link className="btn btn-soft" to={siteConfig.paths.home}>
          홈으로
        </Link>
        <Link className="btn btn-primary" to="/#one">
          3분 하루설계 시작
        </Link>
      </div>
    </article>
  )
}
