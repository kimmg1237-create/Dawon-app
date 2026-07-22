import { Outlet, NavLink } from 'react-router-dom'
import { AppNav } from './AppNav'
import { FEATURES } from '../data/features'
import './AppShell.css'

export function AppShell() {
  return (
    <div className="app-shell">
      <div className="topline">오늘을 확인하고, 내일을 설계합니다 · Check Today. Design Tomorrow.</div>
      <div className="style-banner">DAWON LIFE DESIGN · CHECK → CHOOSE → ACT → RECORD → LEARN → NEXT</div>
      <AppNav />
      <main className="app-shell-main" id="main">
        <Outlet />
      </main>
      <footer className="app-shell-footer">
        <div className="container">
          <p>다원 인생설계 · DAWON Life Design · 확인하고 실천하며 다음 하루를 설계합니다</p>
          <p>
            <NavLink to="/strategy">실행지도</NavLink>
            {' · '}
            <NavLink to="/library">전자책·오디오북·만화</NavLink>
            {' · '}
            <NavLink to="/operations">운영 상담</NavLink>
            {FEATURES.paymentsEnabled ? (
              <>
                {' · '}
                <NavLink to="/subscribe">구독·결제</NavLink>
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
          홈
        </NavLink>
        <NavLink to="/quick-design">실천</NavLink>
        <NavLink to="/library">콘텐츠</NavLink>
        {FEATURES.paymentsEnabled ? <NavLink to="/subscribe">구독</NavLink> : null}
        <NavLink to="/login">계정</NavLink>
      </nav>
    </div>
  )
}
