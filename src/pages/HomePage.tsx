import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { HomeNoticePopup } from '../components/HomeNoticePopup'
import { Seo } from '../components/Seo'
import { useAuth } from '../context/AuthContext'
import { siteConfig } from '../data/siteConfig'
import { mountDawonOs, scrollToDawonSection, syncDawonOsAccount } from '../newsite/dawonOs/initDawonOs'

export function HomePage() {
  const host = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut, configured } = useAuth()
  const authRef = useRef({ user, signOut, configured })
  authRef.current = { user, signOut, configured }

  useEffect(() => {
    const el = host.current
    if (!el) return
    return mountDawonOs(el, navigate, {
      isLoggedIn: () => Boolean(authRef.current.user),
      onSignOut: () => {
        void authRef.current.signOut()
      },
      account: {
        email: authRef.current.user?.email ?? null,
        configured: authRef.current.configured,
      },
    })
  }, [navigate])

  useEffect(() => {
    syncDawonOsAccount(host.current, {
      email: user?.email ?? null,
      configured,
    })
  }, [user, configured])

  useEffect(() => {
    const hash = location.hash.replace(/^#/, '')
    if (!hash) {
      // Beat any delayed OS first-run scroll; keep hero + React nav in view.
      const pinTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      pinTop()
      const t1 = window.setTimeout(pinTop, 40)
      const t2 = window.setTimeout(pinTop, 120)
      const t3 = window.setTimeout(pinTop, 280)
      return () => {
        window.clearTimeout(t1)
        window.clearTimeout(t2)
        window.clearTimeout(t3)
      }
    }
    const t = window.setTimeout(() => scrollToDawonSection(hash, 'smooth'), 50)
    return () => window.clearTimeout(t)
  }, [location.hash, location.key])

  return (
    <>
      <Seo
        title={siteConfig.pages.home.title}
        description={siteConfig.pages.home.description}
        path={siteConfig.pages.home.path}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteConfig.brand.nameKo,
            url: siteConfig.urls.home,
            description: siteConfig.pages.home.description,
            inLanguage: 'ko-KR',
            publisher: { '@type': 'Organization', name: siteConfig.brand.nameKo },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: siteConfig.brand.nameKo,
            alternateName: [siteConfig.business.companyName, siteConfig.brand.mark],
            url: siteConfig.urls.home,
            logo: siteConfig.assets.logo,
            email: siteConfig.business.email,
            telephone: siteConfig.business.phone,
            sameAs: [siteConfig.urls.youtube],
          },
        ]}
      />
      <div ref={host} className="dawon-os-home" />
      <HomeNoticePopup />
    </>
  )
}
