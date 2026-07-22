import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Props = {
  children?: React.ReactNode
  action?: string
  /** true면 비로그인 시 본문 대신 로그인 안내만 표시 */
  requireLogin?: boolean
}

export function AuthGate({ children, action = '이용', requireLogin = false }: Props) {
  const { user, configured, loading } = useAuth()
  const location = useLocation()

  if (!configured) {
    return children ? <>{children}</> : null
  }

  if (loading) {
    return requireLogin ? (
      <div className="auth-gate auth-gate-block container">
        <span>로그인 상태 확인 중…</span>
      </div>
    ) : children ? (
      <>{children}</>
    ) : null
  }

  if (user) {
    return children ? <>{children}</> : null
  }

  const loginLink = (
    <Link to="/login" state={{ from: `${location.pathname}${location.hash}` }}>
      로그인 / 회원가입 →
    </Link>
  )

  if (requireLogin) {
    return (
      <div className="auth-gate auth-gate-block container">
        <div>
          <strong>{action}은 로그인 후 이용할 수 있습니다.</strong>
          <p>계정이 없으면 회원가입 후 바로 시작할 수 있습니다.</p>
        </div>
        {loginLink}
      </div>
    )
  }

  return (
    <div className="auth-gate container">
      <span>{action}하려면 로그인이 필요합니다.</span>
      {loginLink}
    </div>
  )
}
