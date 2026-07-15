import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import './LoginGate.css'

interface LoginGateProps {
  children: ReactNode
  feature?: string
}

export function LoginGate({ children, feature = '이 기능' }: LoginGateProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <p className="login-gate-loading">계정 확인 중...</p>
  }

  if (user) return <>{children}</>

  return (
    <div className="login-gate">
      <div className="login-gate-preview" aria-hidden="true">
        {children}
      </div>
      <div className="login-gate-overlay">
        <i className="fa-solid fa-lock" />
        <p>
          <strong>{feature}</strong>은 로그인 후 이용할 수 있습니다.
        </p>
        <p className="login-gate-sub">로그인하면 클라우드에 저장되고 기기 간 동기화됩니다.</p>
        <a href="#auth" className="login-gate-btn">
          로그인 / 회원가입
        </a>
      </div>
    </div>
  )
}
