import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AppNav } from './AppNav'
import { JourneyBar } from '../components/JourneyBar'
import { SiteFooter } from '../components/SiteFooter'
import { FEATURES } from '../data/features'
import './AppShell.css'
import '../newsite/dawonOs/theme.css'
import '../newsite/dawonOs/bridge.css'
import '../newsite/dawonOs/dark-contrast.css'

const THEME_KEY = 'dawon_os95_theme'

export function AppShell() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isStudio = location.pathname.startsWith('/movie-studio')

  useEffect(() => {
    document.body.classList.add('dawon-os-active')
    try {
      if (!localStorage.getItem('dawon_os_theme_v2')) {
        localStorage.setItem(THEME_KEY, 'dark')
        localStorage.setItem('dawon_os_theme_v2', '1')
      }
      const saved = localStorage.getItem(THEME_KEY) || 'dark'
      document.body.classList.toggle('dark', saved === 'dark')
    } catch {
      document.body.classList.add('dark')
    }
    return () => {
      document.body.classList.remove('dawon-os-active')
    }
  }, [])

  return (
    <div className={`app-shell dawon-os-shell${isHome ? ' is-home' : ''}`}>
      <AppNav />
      {!isHome && !isStudio ? <JourneyBar /> : null}
      <main className="app-shell-main" id="main">
        <Outlet />
      </main>
      <SiteFooter />
      {!isHome ? (
        <nav className="mobile-dock-react" aria-label="모바일 바로가기">
          <NavLink to="/" end>
            홈
          </NavLink>
          <NavLink to="/#one">오늘설계</NavLink>
          <NavLink to="/library">작품관</NavLink>
          {FEATURES.paymentsEnabled ? <NavLink to="/subscribe">이용권</NavLink> : null}
          <NavLink to="/login">로그인</NavLink>
        </nav>
      ) : null}
    </div>
  )
}
