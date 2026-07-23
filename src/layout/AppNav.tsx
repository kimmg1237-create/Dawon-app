import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSiteCopy } from '../context/SiteCopyContext'
import { FEATURES } from '../data/features'

export function AppNav() {
  const { user, isAdmin, signOut, configured } = useAuth()
  const { copy } = useSiteCopy()
  const [open, setOpen] = useState(false)

  const links = [
    { to: '/strategy', label: copy.nav.strategy },
    { to: '/life-stage', label: copy.nav.lifeStage },
    { to: '/quick-design', label: copy.nav.quickDesign },
    { to: '/records', label: copy.nav.records },
    { to: '/library', label: copy.nav.library },
    { to: '/operations', label: copy.nav.operations },
    ...(FEATURES.paymentsEnabled ? [{ to: '/subscribe', label: copy.nav.subscribe }] : []),
  ]

  function closeMenu() {
    setOpen(false)
  }

  return (
    <header className="header app-nav-header">
      <div className="container app-nav">
        <Link className="brand" to="/" aria-label="다원 생애주기 자기설계 홈" onClick={closeMenu}>
          <span className="brandmark brandmark-logo" aria-hidden="true">
            <svg viewBox="0 0 76 54" role="img">
              <defs>
                <linearGradient id="dawonRed" x1="0" x2="1">
                  <stop stopColor="#e94c5b" />
                  <stop offset="1" stopColor="#c84134" />
                </linearGradient>
                <linearGradient id="dawonBlue" x1="0" x2="1">
                  <stop stopColor="#2f65bb" />
                  <stop offset="1" stopColor="#1496b8" />
                </linearGradient>
              </defs>
              <circle cx="24" cy="27" r="17" fill="url(#dawonRed)" />
              <path d="M24 10a17 17 0 0 1 0 34c8-4 8-13 0-17s-8-13 0-17Z" fill="url(#dawonBlue)" />
              <circle cx="24" cy="18.5" r="4" fill="#fff" opacity=".96" />
              <circle cx="24" cy="35.5" r="4" fill="#fff" opacity=".96" />
              <path
                d="M38 18c13 1 22 7 34 17-14-3-23-1-34 4"
                fill="none"
                stroke="url(#dawonRed)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M38 29c13 1 22 6 33 14-14-2-23 0-34 5"
                fill="none"
                stroke="url(#dawonBlue)"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="brandtext">
            DAWON
            <small>STRATEGY LAB</small>
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
              className={({ isActive }) => (isActive ? 'nav-active' : undefined)}
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

          <NavLink to="/quick-design" className="app-nav-cta primary" onClick={closeMenu}>
            {copy.nav.startCta}
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
