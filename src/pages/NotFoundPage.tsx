import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { siteConfig } from '../data/siteConfig'

export function NotFoundPage() {
  return (
    <article className="container legal-page">
      <Seo
        title={siteConfig.pages.notFound.title}
        description={siteConfig.pages.notFound.description}
        path="/"
        noIndex
      />
      <div className="page-banner">
        <div className="eyebrow">404</div>
        <h1>페이지를 찾을 수 없습니다</h1>
        <p>주소가 바뀌었거나 잘못된 링크일 수 있습니다.</p>
        <p style={{ marginTop: 16 }}>
          <Link className="btn btn-soft" to={siteConfig.paths.home}>
            홈으로
          </Link>
        </p>
      </div>
    </article>
  )
}
