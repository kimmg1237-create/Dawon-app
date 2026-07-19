import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LINKS = [
  { to: '/strategy', label: '통합전략' },
  { to: '/life-stage', label: '생애단계' },
  { to: '/quick-design', label: '3분 설계' },
  { to: '/records', label: '7일 기록' },
  { to: '/library', label: '라이브러리' },
  { to: '/operations', label: '운영도구' },
] as const

export function AppNav() {
  const { user, isAdmin, signOut, configured } = useAuth()

  return (
    <header className="header app-nav-header">
      <div className="container nav">
        <Link className="brand" to="/" aria-label="다원 생애주기 자기설계 홈">
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
            DAWON TRIPLE STRATEGY LAB
            <small>SIGNAL · VALUE · BRAND · ACTION</small>
          </span>
        </Link>

        <div className="a11y-actions" aria-label="화면 보기 설정">
          <button
            type="button"
            onClick={() => {
              document.body.classList.toggle('large-text')
              localStorage.setItem('dawonLargeText', document.body.classList.contains('large-text') ? '1' : '0')
            }}
          >
            글자 크게
          </button>
          <button
            type="button"
            onClick={() => {
              document.body.classList.toggle('high-contrast')
              localStorage.setItem(
                'dawonHighContrast',
                document.body.classList.contains('high-contrast') ? '1' : '0',
              )
            }}
          >
            고대비
          </button>
        </div>

        <button
          className="menu"
          type="button"
          aria-label="메뉴 열기"
          onClick={(e) => {
            const nav = document.getElementById('appNavLinks')
            const open = nav?.classList.toggle('open')
            ;(e.currentTarget as HTMLButtonElement).setAttribute('aria-expanded', String(Boolean(open)))
          }}
        >
          ☰
        </button>

        <nav className="navlinks" id="appNavLinks" aria-label="주요 메뉴">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'nav-active' : undefined)}
              onClick={() => document.getElementById('appNavLinks')?.classList.remove('open')}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/survey"
            className={({ isActive }) => (isActive ? 'nav-active' : undefined)}
            onClick={() => document.getElementById('appNavLinks')?.classList.remove('open')}
          >
            설문
          </NavLink>
          {isAdmin ? (
            <NavLink to="/admin/responses" className={({ isActive }) => (isActive ? 'nav-active' : undefined)}>
              응답관리
            </NavLink>
          ) : null}
          {configured ? (
            user ? (
              <button type="button" className="nav-auth-btn" onClick={() => void signOut()}>
                로그아웃
              </button>
            ) : (
              <NavLink to="/login" className="cta">
                로그인
              </NavLink>
            )
          ) : null}
          <NavLink to="/quick-design" className="cta">
            오늘 시작
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
