import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../context/SubscriptionContext'
import './Header.css'

const NAV_ITEMS = [
  { href: '#intro', label: '하루설계' },
  { href: '#record-calendar', label: '실천체크' },
  { href: '#recommendations', label: '맞춤추천' },
  { href: '#notifications', label: '알림' },
  { href: '#record-history', label: '기록목록' },
  { href: '#books', label: '선정도서' },
  { href: '#palette', label: '꽃인물화' },
  { href: '#library', label: '음악도서관' },
  { href: '#calendar', label: '365일카드' },
]

export function Header() {
  const { user } = useAuth()
  const { isPremium, plan } = useSubscription()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header>
      <div className="nav-container">
        <a href="#intro" className="logo" onClick={closeMenu}>
          DAWON <span>글로벌</span>
          {user && isPremium && <span className="logo-premium">PRO</span>}
        </a>

        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} />
        </button>

        <nav className={`nav-menu ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
          <ul className="nav-list">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={closeMenu}>
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#auth" className="btn-start" onClick={closeMenu}>
                {user ? (plan === 'free' ? '내 계정' : 'PRO') : '로그인'}
              </a>
            </li>
          </ul>
        </nav>

        {menuOpen && <button type="button" className="nav-overlay" aria-label="메뉴 닫기" onClick={closeMenu} />}
      </div>
    </header>
  )
}
