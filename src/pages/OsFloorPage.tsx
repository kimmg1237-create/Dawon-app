import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../context/SubscriptionContext'
import { siteConfig } from '../data/siteConfig'
import {
  mountDawonOs,
  openDawonStudioTab,
  scrollToDawonSection,
  cancelDawonSectionScroll,
  syncDawonOsAccess,
  syncDawonOsAccount,
  type OsFloor,
} from '../newsite/dawonOs/initDawonOs'

const SEO: Record<OsFloor, { title: string; description: string; path: string }> = {
  today: siteConfig.pages.today,
  school: siteConfig.pages.school,
  create: siteConfig.pages.create,
}

export function OsFloorPage({ floor }: { floor: OsFloor }) {
  const host = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut, configured } = useAuth()
  const { isPremium, statusLabel, subscription } = useSubscription()
  const authRef = useRef({ user, signOut, configured, isPremium, statusLabel, subscription })
  authRef.current = { user, signOut, configured, isPremium, statusLabel, subscription }
  const seo = SEO[floor]

  useEffect(() => {
    const el = host.current
    if (!el) return
    return mountDawonOs(
      el,
      navigate,
      {
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
      },
      floor,
    )
  }, [navigate, floor])

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
    const t = window.setTimeout(() => {
      if (hash && document.getElementById(hash)) {
        scrollToDawonSection(hash, 'auto')
        return
      }
      cancelDawonSectionScroll()
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }, 40)
    return () => window.clearTimeout(t)
  }, [location.hash, location.pathname, floor])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    const book = params.get('book')
    if (!tab && !book) return
    const t = window.setTimeout(() => openDawonStudioTab(tab || 'video', host.current), 80)
    return () => window.clearTimeout(t)
  }, [location.search, floor])

  return (
    <>
      <Seo title={seo.title} description={seo.description} path={seo.path} />
      <div ref={host} className={`dawon-os-home dawon-os-floor dawon-os-floor-${floor}`} />
    </>
  )
}
