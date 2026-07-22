import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useSubscription } from '../context/SubscriptionContext'

type Props = {
  children?: ReactNode
  feature?: string
}

/** 프리미엄 콘텐츠(전자책·오디오북 등) 접근 게이트 */
export function PremiumGate({ children, feature = '프리미엄 콘텐츠' }: Props) {
  const { loading, isPremium, statusLabel, paymentsEnabled } = useSubscription()

  if (!paymentsEnabled) {
    return children ? <>{children}</> : null
  }

  if (loading) {
    return <p className="premium-gate-loading">이용 권한 확인 중…</p>
  }

  if (isPremium) return children ? <>{children}</> : null

  return (
    <div className="premium-gate">
      <div className="premium-gate-inner">
        <span className="premium-gate-badge">PRO</span>
        <h3>{feature}은 구독 또는 체험·광고 이용이 필요합니다</h3>
        <p>
          현재 상태: <strong>{statusLabel}</strong>
          <br />
          첫 가입 후 30일 무료 체험, 이후 월 12,900원 결제 또는 광고 시청으로 이용할 수 있습니다.
        </p>
        <div className="premium-gate-actions">
          <Link to="/subscribe" className="btn btn-primary">
            구독·결제하기
          </Link>
          <Link to="/login" className="btn btn-light">
            로그인
          </Link>
        </div>
      </div>
    </div>
  )
}
