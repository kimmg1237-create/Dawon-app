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
  const isHome = location.pathname === '/'

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // On home, OS HTML already renders its own topbar — hide React duplicate.
  if (isHome) return null

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
        <Link className="brand" to="/" aria-label="다원 하루설계 홈" onClick={closeMenu}>
          <span className="brandmark brandmark-logo" aria-hidden="true">
            <svg viewBox="0 0 76 54" role="img">
              <defs>
                <linearGradient id="dawonRedNav" x1="0" x2="1">
                  <stop stopColor="#e94c5b" />
                  <stop offset="1" stopColor="#c84134" />
                </linearGradient>
                <linearGradient id="dawonBlueNav" x1="0" x2="1">
                  <stop stopColor="#2f65bb" />
                  <stop offset="1" stopColor="#1496b8" />
                </linearGradient>
              </defs>
              <circle cx="24" cy="27" r="17" fill="url(#dawonRedNav)" />
              <path d="M24 10a17 17 0 0 1 0 34c8-4 8-13 0-17s-8-13 0-17Z" fill="url(#dawonBlueNav)" />
              <circle cx="24" cy="18.5" r="4" fill="#fff" opacity=".96" />
              <circle cx="24" cy="35.5" r="4" fill="#fff" opacity=".96" />
              <path
                d="M38 18c13 1 22 7 34 17-14-3-23-1-34 4"
                fill="none"
                stroke="url(#dawonRedNav)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M38 29c13 1 22 6 33 14-14-2-23 0-34 5"
                fill="none"
                stroke="url(#dawonBlueNav)"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="brandtext">
            다원 하루설계
            <small>TODAY · PRACTICE · GROW</small>
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
