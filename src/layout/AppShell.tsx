import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AppNav } from './AppNav'
import { SectionSubNav } from './SectionSubNav'
import { JourneyBar } from '../components/JourneyBar'
import { SiteFooter } from '../components/SiteFooter'
import { cancelDawonSectionScroll } from '../newsite/dawonOs/initDawonOs'
import './AppShell.css'
import '../newsite/dawonOs/theme.css'
import '../newsite/dawonOs/bridge.css'
import '../newsite/dawonOs/dark-contrast.css'
import '../newsite/dawonOs/readability.css'

const THEME_KEY = 'dawon_os95_theme'

export function AppShell() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isStudio = location.pathname.startsWith('/movie-studio')
  const isFloor =
    location.pathname === '/today' ||
    location.pathname === '/school' ||
    location.pathname === '/create'
  const isLibrary =
    location.pathname.startsWith('/library') ||
    location.pathname.startsWith('/ebooks') ||
    location.pathname.startsWith('/audiobooks') ||
    location.pathname.startsWith('/comics')
  const isStore =
    location.pathname.startsWith('/subscribe') ||
    location.pathname === '/store' ||
    location.pathname.startsWith('/payment')
  const osLook = isHome || isFloor

  useEffect(() => {
    cancelDawonSectionScroll()
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  useEffect(() => {
    document.body.classList.add('dawon-os-active')
    try {
      const saved =
        localStorage.getItem('dawon_theme_v28') || localStorage.getItem(THEME_KEY) || 'light'
      const dark = saved === 'dark'
      document.documentElement.dataset.theme = dark ? 'dark' : 'light'
      document.body.classList.toggle('dark', dark)
    } catch {
      document.documentElement.dataset.theme = 'light'
      document.body.classList.remove('dark')
    }
    return () => {
      document.body.classList.remove('dawon-os-active')
    }
  }, [osLook])

  return (
    <div className={`app-shell dawon-os-shell${isHome ? ' is-home' : ''}`}>
      {!isHome ? <AppNav /> : null}
      {!isHome ? <SectionSubNav /> : null}
      {!isHome && !isStudio && !isLibrary && !isFloor && !isStore ? <JourneyBar /> : null}
      <main className="app-shell-main" id="main">
        <Outlet />
      </main>
      {!isHome ? <SiteFooter /> : null}
    </div>
  )
}
