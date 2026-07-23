import { Outlet, NavLink } from 'react-router-dom'
import { AppNav } from './AppNav'
import { FEATURES } from '../data/features'
import { useSiteCopy } from '../context/SiteCopyContext'
import './AppShell.css'

export function AppShell() {
  const { copy } = useSiteCopy()

  return (
    <div className="app-shell">
      <div className="topline">{copy.chrome.topline}</div>
      <div className="style-banner">{copy.chrome.styleBanner}</div>
      <AppNav />
      <main className="app-shell-main" id="main">
        <Outlet />
      </main>
      <footer className="app-shell-footer">
        <div className="container">
          <p>{copy.footer.tagline}</p>
          <p>
            <NavLink to="/strategy">{copy.footer.strategy}</NavLink>
            {' · '}
            <NavLink to="/library">{copy.footer.library}</NavLink>
            {' · '}
            <NavLink to="/operations">{copy.footer.operations}</NavLink>
            {FEATURES.paymentsEnabled ? (
              <>
                {' · '}
                <NavLink to="/subscribe">{copy.footer.subscribe}</NavLink>
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
      <nav className="mobile-dock-react" aria-label="모바일 바로가기">
        <NavLink to="/" end>
          {copy.dock.home}
        </NavLink>
        <NavLink to="/quick-design">{copy.dock.practice}</NavLink>
        <NavLink to="/library">{copy.dock.content}</NavLink>
        {FEATURES.paymentsEnabled ? <NavLink to="/subscribe">{copy.dock.subscribe}</NavLink> : null}
        <NavLink to="/login">{copy.dock.account}</NavLink>
      </nav>
    </div>
  )
}
