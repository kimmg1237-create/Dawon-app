import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AppNav } from './AppNav'
import { JourneyBar } from '../components/JourneyBar'
import { SiteFooter } from '../components/SiteFooter'
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
    if (location.hash) return
    const pinTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    pinTop()
    const t1 = window.setTimeout(pinTop, 40)
    const t2 = window.setTimeout(pinTop, 160)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [location.pathname, location.key])

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
          <NavLink to="/#one">하루설계</NavLink>
          <NavLink to="/library">작품관</NavLink>
          <NavLink to="/#first-taste">사용방법</NavLink>
          <NavLink to="/login">로그인</NavLink>
        </nav>
      ) : null}
    </div>
  )
}
