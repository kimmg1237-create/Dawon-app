import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { HomeNoticePopup } from '../components/HomeNoticePopup'
import { Seo } from '../components/Seo'
import { useAuth } from '../context/AuthContext'
import { siteConfig } from '../data/siteConfig'
import { useSubscription } from '../context/SubscriptionContext'
import {
  mountDawonOs,
  openDawonStudioTab,
  scrollToDawonSection,
  cancelDawonSectionScroll,
  syncDawonOsAccess,
  syncDawonOsAccount,
} from '../newsite/dawonOs/initDawonOs'

export function HomePage() {
  const host = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut, configured } = useAuth()
  const { isPremium, statusLabel, subscription } = useSubscription()
  const authRef = useRef({ user, signOut, configured, isPremium, statusLabel, subscription })
  authRef.current = { user, signOut, configured, isPremium, statusLabel, subscription }

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
      access: {
        authenticated: Boolean(authRef.current.user),
        active: authRef.current.isPremium,
        planName: authRef.current.statusLabel,
        endsAt:
          authRef.current.subscription?.expires_at ??
          authRef.current.subscription?.trial_ends_at ??
          null,
      },
    })
  }, [navigate])

  useEffect(() => {
    syncDawonOsAccount(host.current, {
      email: user?.email ?? null,
      configured,
    })
    syncDawonOsAccess({
      authenticated: Boolean(user),
      active: isPremium,
      planName: statusLabel,
      endsAt: subscription?.expires_at ?? subscription?.trial_ends_at ?? null,
    })
  }, [user, configured, isPremium, statusLabel, subscription])

  useEffect(() => {
    const hash = location.hash.replace(/^#/, '')
    if (!hash) {
      cancelDawonSectionScroll()
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return
    }
    const t = window.setTimeout(() => scrollToDawonSection(hash, 'auto'), 30)
    return () => window.clearTimeout(t)
  }, [location.hash])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    const book = params.get('book')
    if (!tab && !book) return
    const t = window.setTimeout(() => openDawonStudioTab(tab || 'video', host.current), 80)
    return () => window.clearTimeout(t)
  }, [location.search])

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
