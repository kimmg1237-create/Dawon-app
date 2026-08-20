import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FEATURES } from '../data/features'
import { cancelDawonSectionScroll } from '../newsite/dawonOs/initDawonOs'
import { dawonT, getDawonLang, setDawonLang, type DawonLang } from '../newsite/dawonOs/i18n'

const THEME_KEY = 'dawon_os95_theme'

function readTheme(): 'light' | 'dark' {
  try {
    const v = localStorage.getItem('dawon_theme_v28') || localStorage.getItem(THEME_KEY)
    if (v === 'dark' || v === 'light') return v
  } catch {
    /* ignore */
  }
  return 'light'
}

function applyTheme(mode: 'light' | 'dark') {
  document.documentElement.dataset.theme = mode
  document.body.classList.toggle('dark', mode === 'dark')
  try {
    localStorage.setItem(THEME_KEY, mode)
    localStorage.setItem('dawon_theme_v28', mode)
  } catch {
    /* ignore */
  }
}

/** Off-home chrome matching the 99 Tong topbar (1F / 2F / 3F). */
export function AppNav() {
  const { user, isAdmin, signOut, configured } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' ? readTheme() : 'light',
  )
  const [lang, setLang] = useState<DawonLang>(() =>
    typeof document !== 'undefined' ? getDawonLang() : 'ko',
  )
  const menuRef = useRef<HTMLDivElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const t = (key: string) => dawonT(key, lang)

  const isLibrary =
    location.pathname.startsWith('/library') ||
    location.pathname.startsWith('/ebooks') ||
    location.pathname.startsWith('/audiobooks') ||
    location.pathname.startsWith('/comics')

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    const onLang = (e: Event) => {
      const detail = (e as CustomEvent<{ lang?: DawonLang }>).detail
      if (detail?.lang) setLang(detail.lang)
      else setLang(getDawonLang())
    }
    window.addEventListener('dawon-lang-changed', onLang)
    return () => window.removeEventListener('dawon-lang-changed', onLang)
  }, [])

  useEffect(() => {
    const modal = menuRef.current
    const active = document.activeElement
    if (modal && active instanceof HTMLElement && modal.contains(active)) {
      active.blur()
    }
    setOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    const modal = menuRef.current
    if (!modal) return
    modal.inert = !open
    if (open) return
    const active = document.activeElement
    if (active instanceof HTMLElement && modal.contains(active)) {
      active.blur()
      menuBtnRef.current?.focus()
    }
  }, [open])

  function blurMenuIfFocused() {
    const modal = menuRef.current
    const active = document.activeElement
    if (modal && active instanceof HTMLElement && modal.contains(active)) {
      active.blur()
    }
  }

  function closeMenu() {
    blurMenuIfFocused()
    setOpen(false)
    cancelDawonSectionScroll()
  }

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  function onAccountChip() {
    if (user) navigate('/subscribe')
    else navigate('/login')
    closeMenu()
  }

  function onAccountBtn() {
    if (user) void signOut()
    else navigate('/login')
    closeMenu()
  }

  const accountLabel = user?.email?.split('@')[0] || t('guestName')

  return (
    <>
    <header className="topbar app-nav-header dawon-os-topbar">
      <div className="container nav">
        <Link className="brand" to="/" aria-label={t('brandHome')} onClick={closeMenu}>
          <img
            className="brand-mark"
            src="/brand/dawon-logo.png"
            alt={t('brandLogoAlt')}
            width={50}
            height={50}
            decoding="async"
          />
          <span>
            <b>{t('brandNav')}</b>
            <small>1F TODAY · 2F GROW · 3F CREATE</small>
          </span>
        </Link>
        <nav className="nav-links" aria-label={t('mainNav')}>
          <Link to="/today" aria-current={location.pathname === '/today' ? 'page' : undefined} onClick={closeMenu} preventScrollReset>
            {t('floor1')}
          </Link>
          <Link to="/school" aria-current={location.pathname === '/school' ? 'page' : undefined} onClick={closeMenu} preventScrollReset>
            {t('floor2')}
          </Link>
          <Link to="/create" aria-current={location.pathname === '/create' || location.pathname.startsWith('/movie-studio') ? 'page' : undefined} onClick={closeMenu} preventScrollReset>
            {t('floor3')}
          </Link>
          <div className="nav-dropdown">
            <Link
              to="/programs"
              className="nav-dropdown-trigger"
              aria-current={['/programs', '/institution', '/report'].includes(location.pathname) ? 'page' : undefined}
            >
              {t('programs')} <span className="dropdown-arrow">▾</span>
            </Link>
            <div className="nav-dropdown-menu">
              <Link to="/programs" onClick={closeMenu}>{t('programs')}</Link>
              <Link to="/institution" onClick={closeMenu}>{t('institution')}</Link>
              <Link to="/report" onClick={closeMenu}>{t('report')}</Link>
            </div>
          </div>
          <Link
            to="/library"
            aria-current={isLibrary ? 'page' : undefined}
            onClick={closeMenu}
          >
            {t('library')}
          </Link>
          {FEATURES.paymentsEnabled ? (
            <Link
              to="/subscribe"
              aria-current={location.pathname.startsWith('/subscribe') || location.pathname === '/store' ? 'page' : undefined}
              onClick={closeMenu}
            >
              {t('store')}
            </Link>
          ) : null}
          {isAdmin ? (
            <Link to="/admin" onClick={closeMenu}>
              관리
            </Link>
          ) : null}
        </nav>
        <div className="nav-actions account-area">
          {configured ? (
            <button
              type="button"
              className="account-chip"
              aria-label={t('accountOpen')}
              onClick={onAccountChip}
            >
              <i className={`cloud-dot${user ? ' online' : ''}`} title="회원·클라우드 상태" />
              <span>{accountLabel}</span>
            </button>
          ) : null}
          <button
            type="button"
            className="icon-btn"
            aria-label={theme === 'dark' ? t('themeLight') : t('themeDark')}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? '☀' : '◐'}
          </button>
          <label className="lang-wrap">
            <span className="sr-only">Language</span>
            <select
              className="dawon-lang"
              aria-label="Language"
              value={lang}
              onChange={(e) => {
                const next = e.target.value
                if (next === 'ko' || next === 'en' || next === 'ja' || next === 'zh') {
                  setDawonLang(next)
                  setLang(next)
                }
              }}
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
            </select>
          </label>
          <button
            ref={menuBtnRef}
            type="button"
            className="icon-btn mobile-toggle"
            aria-label={t('mobileMenu')}
            aria-controls="appNavMenuModal"
            aria-expanded={open}
            onClick={() => {
              if (open) closeMenu()
              else setOpen(true)
            }}
          >
            {open ? '✕' : '☰'}
          </button>
          {configured ? (
            <button type="button" className="btn btn-soft" onClick={onAccountBtn}>
              {user ? t('logout') : t('login')}
            </button>
          ) : null}
          <Link className="btn btn-primary" to="/today" onClick={closeMenu}>
            {t('startOne')}
          </Link>
        </div>
      </div>
    </header>

      <div
        ref={menuRef}
        className={`modal${open ? ' open' : ''}`}
        id="appNavMenuModal"
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
        inert={!open}
        aria-labelledby="appNavMenuTitle"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeMenu()
        }}
      >
        <div className="modal-card">
          <div className="modal-head">
            <h3 id="appNavMenuTitle">{t('menu')}</h3>
            <button type="button" className="close-btn" aria-label={t('close')} onClick={closeMenu}>
              ×
            </button>
          </div>
          <div className="form-actions" style={{ display: 'grid' }}>
            <Link className="btn btn-primary" to="/today" onClick={closeMenu}>
              {t('floor1')}
            </Link>
            <Link className="btn btn-soft" to="/school" onClick={closeMenu}>
              {t('floor2')}
            </Link>
            <Link className="btn btn-soft" to="/create" onClick={closeMenu}>
              {t('floor3')}
            </Link>
            <Link className="btn btn-soft" to="/programs" onClick={closeMenu}>
              {t('programs')}
            </Link>
            <Link className="btn btn-soft" to="/institution" onClick={closeMenu}>
              {t('institution')}
            </Link>
            <Link className="btn btn-soft" to="/report" onClick={closeMenu}>
              {t('report')}
            </Link>
            <Link className="btn btn-soft" to="/library" onClick={closeMenu}>
              {t('library')}
            </Link>
            {FEATURES.paymentsEnabled ? (
              <Link className="btn btn-soft" to="/subscribe" onClick={closeMenu}>
                {t('store')}
              </Link>
            ) : null}
            {isAdmin ? (
              <Link className="btn btn-soft" to="/admin" onClick={closeMenu}>
                {t('admin')}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}
