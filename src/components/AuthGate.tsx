import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AuthGate({ children, action = '저장' }: { children?: React.ReactNode; action?: string }) {
  const { user, configured, loading } = useAuth()
  if (!configured || loading || user) return children ? <>{children}</> : null
  return (
    <div className="auth-gate container">
      <span>
        {action}하려면 로그인이 필요합니다. 콘텐츠 열람은 비로그인으로도 가능합니다.
      </span>
      <Link to="/login">로그인 / 회원가입 →</Link>
    </div>
  )
}
