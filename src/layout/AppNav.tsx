import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FEATURES } from '../data/features'
import { siteConfig } from '../data/siteConfig'
import { cancelDawonSectionScroll } from '../newsite/dawonOs/initDawonOs'

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
  const menuRef = useRef<HTMLDivElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)

  const isLibrary =
    location.pathname.startsWith('/library') ||
    location.pathname.startsWith('/ebooks') ||
    location.pathname.startsWith('/audiobooks') ||
    location.pathname.startsWith('/comics')

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

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

  const accountLabel = user?.email?.split('@')[0] || '게스트'

  return (
    <>
    <header className="topbar app-nav-header dawon-os-topbar">
      <div className="container nav">
        <Link className="brand" to="/" aria-label="DAWON 다원 하루설계 홈" onClick={closeMenu}>
          <img
            className="brand-mark"
            src="/brand/dawon-logo.png"
            alt="다원 공식 금박 로고"
            width={50}
            height={50}
            decoding="async"
          />
          <span>
            <b>{siteConfig.brand.full}</b>
            <small>1F TODAY · 2F GROW · 3F CREATE</small>
          </span>
        </Link>
        <nav className="nav-links" aria-label="주요 메뉴">
          <Link to="/today" aria-current={location.pathname === '/today' ? 'page' : undefined} onClick={closeMenu} preventScrollReset>
            1층 · 오늘설계
          </Link>
          <Link to="/school" aria-current={location.pathname === '/school' ? 'page' : undefined} onClick={closeMenu} preventScrollReset>
            2층 · 365학교
          </Link>
          <Link to="/create" aria-current={location.pathname === '/create' || location.pathname.startsWith('/movie-studio') ? 'page' : undefined} onClick={closeMenu} preventScrollReset>
            3층 · 창작
          </Link>
          <Link
            to="/library"
            aria-current={isLibrary ? 'page' : undefined}
            onClick={closeMenu}
          >
            작품관
          </Link>
          {FEATURES.paymentsEnabled ? (
            <Link
              to="/subscribe"
              aria-current={location.pathname.startsWith('/subscribe') || location.pathname === '/store' ? 'page' : undefined}
              onClick={closeMenu}
            >
              스토어
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
              aria-label="회원 계정과 클라우드 상태 열기"
              onClick={onAccountChip}
            >
              <i className={`cloud-dot${user ? ' online' : ''}`} title="회원·클라우드 상태" />
              <span>{accountLabel}</span>
            </button>
          ) : null}
          <button
            type="button"
            className="icon-btn"
            aria-label={theme === 'dark' ? '밝은 화면으로 변경' : '어두운 화면으로 변경'}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? '☀' : '◐'}
          </button>
          <button
            ref={menuBtnRef}
            type="button"
            className="icon-btn mobile-toggle"
            aria-label="모바일 메뉴"
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
              {user ? '로그아웃' : '로그인'}
            </button>
          ) : null}
          <Link className="btn btn-primary" to="/today" onClick={closeMenu}>
            오늘 한 가지
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
            <h3 id="appNavMenuTitle">메뉴</h3>
            <button type="button" className="close-btn" aria-label="메뉴 닫기" onClick={closeMenu}>
              ×
            </button>
          </div>
          <div className="form-actions" style={{ display: 'grid' }}>
            <Link className="btn btn-primary" to="/today" onClick={closeMenu}>
              오늘설계
            </Link>
            <Link className="btn btn-soft" to="/school" onClick={closeMenu}>
              365 생활습관학교
            </Link>
            <Link className="btn btn-soft" to="/create" onClick={closeMenu}>
              3층 · 창작
            </Link>
            <Link className="btn btn-soft" to="/library" onClick={closeMenu}>
              작품관
            </Link>
            {FEATURES.paymentsEnabled ? (
              <Link className="btn btn-soft" to="/subscribe" onClick={closeMenu}>
                스토어
              </Link>
            ) : null}
            {isAdmin ? (
              <Link className="btn btn-soft" to="/admin" onClick={closeMenu}>
                관리
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}
