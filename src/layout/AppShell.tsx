import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AppNav } from './AppNav'
import { JourneyBar } from '../components/JourneyBar'
import { FEATURES } from '../data/features'
import { useSiteCopy } from '../context/SiteCopyContext'
import './AppShell.css'
import '../newsite/dawonOs/theme.css'
import '../newsite/dawonOs/bridge.css'
import '../newsite/dawonOs/dark-contrast.css'

const THEME_KEY = 'dawon_os95_theme'

export function AppShell() {
  const { copy } = useSiteCopy()
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
      {!isHome ? (
        <footer className="app-shell-footer">
          <div className="container">
            <p>{copy.footer.tagline}</p>
            <p>
              <NavLink to="/#one">오늘설계</NavLink>
              {' · '}
              <NavLink to="/#school">365 생활습관학교</NavLink>
              {' · '}
              <NavLink to="/library">전자책·오디오북·만화</NavLink>
              {FEATURES.paymentsEnabled ? (
                <>
                  {' · '}
                  <NavLink to="/subscribe">이용권</NavLink>
                </>
              ) : null}
              {' · '}
              <NavLink to="/terms">이용약관</NavLink>
              {' · '}
              <NavLink to="/refund-policy">환불정책</NavLink>
              {' · '}
              <NavLink to="/privacy">개인정보</NavLink>
              {' · '}
              <NavLink to="/login">로그인</NavLink>
            </p>
          </div>
        </footer>
      ) : null}
      {!isHome ? (
        <nav className="mobile-dock-react" aria-label="모바일 바로가기">
          <NavLink to="/" end>
            홈
          </NavLink>
          <NavLink to="/#one">오늘설계</NavLink>
          <NavLink to="/library">전자책·오디오북·만화</NavLink>
          {FEATURES.paymentsEnabled ? <NavLink to="/subscribe">이용권</NavLink> : null}
          <NavLink to="/login">로그인</NavLink>
        </nav>
      ) : null}
    </div>
  )
}
