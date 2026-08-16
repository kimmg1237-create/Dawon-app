import { Link } from 'react-router-dom'
import { siteConfig } from '../data/siteConfig'
import { FEATURES } from '../data/features'
import './SiteFooter.css'

export function SiteFooter() {
  const { brand, business, paths, urls } = siteConfig
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container site-footer-inner">
        <div className="site-footer-brand">
          <strong>{brand.full}</strong>
          <p>{brand.subline}</p>
        </div>

        <div className="site-footer-biz">
          <p>
            {business.companyName} · 대표 {business.representative} · 사업자등록번호{' '}
            {business.businessNumber}
            <br />
            통신판매업 신고 {business.mailOrderNumber} · 신고기관 {business.mailOrderAuthority}
            <br />
            출판사 신고확인증 {business.publishingCertificate} · 발급기관{' '}
            {business.publishingAuthority}
            <br />
            {business.address}
            <br />
            고객센터 {business.phone} · {business.email} · 개인정보·환불 {business.supportEmail}
          </p>
        </div>

        <nav className="site-footer-links" aria-label="푸터 링크">
          <Link to={paths.home}>홈</Link>
          <Link to="/#one">오늘설계</Link>
          <Link to={paths.library}>작품관</Link>
          {FEATURES.paymentsEnabled ? <Link to={paths.subscribe}>이용권</Link> : null}
          <Link to={paths.terms}>이용약관</Link>
          <Link to={paths.privacy}>개인정보처리방침</Link>
          <Link to={paths.refund}>환불·청약철회</Link>
          <a href={urls.youtube} target="_blank" rel="noopener noreferrer">
            YouTube
          </a>
          <a href={urls.publisherSite} target="_blank" rel="noopener noreferrer">
            출판사 사이트
          </a>
          <Link to={paths.login}>로그인</Link>
        </nav>

        <p className="site-footer-copy">
          © {year} {brand.publisher}. All rights reserved. · 저작권은 {brand.publisher}에 있습니다.
        </p>
      </div>
    </footer>
  )
}
