import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FEATURES } from '../data/features'

const THEME_KEY = 'dawon_os95_theme'

function readTheme(): 'light' | 'dark' {
  try {
    if (!localStorage.getItem('dawon_os_theme_v2')) {
      localStorage.setItem(THEME_KEY, 'dark')
      localStorage.setItem('dawon_os_theme_v2', '1')
    }
    const v = localStorage.getItem(THEME_KEY)
    if (v === 'dark' || v === 'light') return v
  } catch {
    /* ignore */
  }
  return 'dark'
}

function applyTheme(mode: 'light' | 'dark') {
  document.body.classList.toggle('dark', mode === 'dark')
  try {
    localStorage.setItem(THEME_KEY, mode)
  } catch {
    /* ignore */
  }
}

/** Shell nav matching DAWON OS: 오늘설계 · 365 생활습관학교 · 이용권 */
export function AppNav() {
  const { user, isAdmin, signOut, configured } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' ? readTheme() : 'dark',
  )

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Close mobile menu on route change.
  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.hash])

  const links = [
    { to: '/#one', label: '오늘설계' },
    { to: '/#school', label: '365 생활습관학교' },
    { to: '/library', label: '전자책·오디오북·만화' },
    ...(FEATURES.paymentsEnabled ? [{ to: '/subscribe', label: '이용권' }] : []),
  ]

  function closeMenu() {
    setOpen(false)
  }

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  return (
    <header className="header app-nav-header dawon-os-topbar">
      <div className="container app-nav">
        <Link className="brand" to="/" aria-label="DAWON | 다원 하루설계 홈" onClick={closeMenu}>
          <span className="brandmark brandmark-logo" aria-hidden="true">
            <img src="/brand/dawon-logo.png" alt="" width={46} height={46} decoding="async" />
          </span>
          <span className="brandtext">
            DAWON | 다원 하루설계
            <small>오늘 바꿀 딱 한 가지</small>
          </span>
        </Link>

        <nav
          className={`app-nav-links${open ? ' open' : ''}`}
          id="appNavLinks"
          aria-label="주요 메뉴"
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive && (link.to.startsWith('/subscribe') || link.to.startsWith('/library'))
                  ? 'nav-active'
                  : undefined
              }
              onClick={closeMenu}
            >
              {link.label}
            </NavLink>
          ))}
          {isAdmin ? (
            <NavLink
              to="/admin"
              className={({ isActive }) => (isActive ? 'nav-active' : undefined)}
              onClick={closeMenu}
            >
              관리
            </NavLink>
          ) : null}
        </nav>

        <div className="app-nav-actions">
          <button type="button" className="nav-icon-btn" aria-label="화면 모드 변경" onClick={toggleTheme}>
            {theme === 'dark' ? '☾' : '◐'}
          </button>

          {configured ? (
            user ? (
              <button type="button" className="nav-auth-btn" onClick={() => void signOut()}>
                로그아웃
              </button>
            ) : (
              <NavLink to="/login" className="app-nav-cta" onClick={closeMenu}>
                로그인
              </NavLink>
            )
          ) : null}

          <NavLink to="/#one" className="app-nav-cta primary" onClick={closeMenu}>
            오늘 한 가지
          </NavLink>

          <button
            className="menu app-nav-menu"
            type="button"
            aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={open}
            aria-controls="appNavLinks"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  )
}
