import { useEffect, useState, type MouseEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { isPageHash, scrollToHash } from '../../utils/scroll'

const NAV_ITEMS = [
  { href: '#daily', label: '오늘 3분' },
  { href: '#ai', label: 'AI 맞춤' },
  { href: '#routes', label: '오늘의 통로' },
  { href: '#paths', label: '50개의 길' },
  { href: '#library', label: '라이브러리' },
  { href: '#faq', label: 'FAQ' },
]

export function DawonNav() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
    return () => document.body.classList.remove('menu-open')
  }, [open])

  function close() {
    setOpen(false)
  }

  function goTo(href: string, e: MouseEvent<HTMLAnchorElement>) {
    close()

    if (isPageHash(href)) return

    e.preventDefault()

    if (href === '#top' || href === '') {
      if (window.location.hash) {
        history.pushState(null, '', window.location.pathname + window.location.search)
      }
      scrollToHash('#top', 'smooth')
      return
    }

    if (window.location.hash === href) {
      scrollToHash(href, 'smooth')
      return
    }

    window.location.hash = href
    requestAnimationFrame(() => scrollToHash(href, 'smooth'))
  }

  const startHref = user ? '#daily' : '#auth'
  const startLabel = user ? '3분 기록' : '시작하기'

  return (
    <>
      <a className="skip" href="#main">
        본문 바로가기
      </a>
      <nav className="nav" aria-label="주요 메뉴">
        <div className="wrap nav-inner">
          <a className="brand" href="#top" aria-label="다원 하루설계 AI 홈" onClick={(e) => goTo('#top', e)}>
            <span className="logo">D</span>
            <span>
              다원 하루설계 AI
              <small>My Day Design AI</small>
            </span>
          </a>

          <button
            type="button"
            className="mobile-toggle"
            aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '✕' : '☰'}
          </button>

          <div className={`nav-links ${open ? 'open' : ''}`}>
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} onClick={(e) => goTo(item.href, e)}>
                {item.label}
              </a>
            ))}
            <a className="btn btn-primary btn-small" href={startHref} onClick={(e) => goTo(startHref, e)}>
              {startLabel}
            </a>
          </div>
        </div>
      </nav>
    </>
  )
}
