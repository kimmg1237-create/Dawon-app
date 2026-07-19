import { Outlet, NavLink } from 'react-router-dom'
import { AppNav } from './AppNav'
import './AppShell.css'

export function AppShell() {
  return (
    <div className="app-shell">
      <div className="topline">하루를 확인하고 · 하나를 실천하고 · 경험으로 나를 배웁니다</div>
      <div className="style-banner">INDEPENDENT STRATEGY PROTOTYPE · DAWON EXECUTION EDITION</div>
      <AppNav />
      <main className="app-shell-main" id="main">
        <Outlet />
      </main>
      <footer className="app-shell-footer">
        <div className="container">
          <p>DAWON SMALL ACTION LAB · 공개 전략 관점 연구 기반 독립 실행 플랫폼</p>
          <p>
            <NavLink to="/strategy">통합전략</NavLink>
            {' · '}
            <NavLink to="/library">라이브러리</NavLink>
            {' · '}
            <NavLink to="/operations">운영도구</NavLink>
            {' · '}
            <NavLink to="/login">로그인</NavLink>
          </p>
        </div>
      </footer>
      <nav className="mobile-dock-react" aria-label="모바일 바로가기">
        <NavLink to="/" end>
          홈
        </NavLink>
        <NavLink to="/quick-design">3분</NavLink>
        <NavLink to="/records">기록</NavLink>
        <NavLink to="/library">서재</NavLink>
        <NavLink to="/life-stage">단계</NavLink>
      </nav>
    </div>
  )
}
