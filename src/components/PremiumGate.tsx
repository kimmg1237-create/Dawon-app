import type { ReactNode } from 'react'
import { useSubscription } from '../context/SubscriptionContext'
import './PremiumGate.css'

interface PremiumGateProps {
  children: ReactNode
  feature?: string
}

export function PremiumGate({ children, feature = '이 기능' }: PremiumGateProps) {
  const { isPremium, loading } = useSubscription()

  if (loading) {
    return <p className="premium-loading">구독 정보 확인 중...</p>
  }

  if (isPremium) return <>{children}</>

  return (
    <div className="premium-gate">
      <i className="fa-solid fa-lock" />
      <p>
        <strong>{feature}</strong>은 월 구독 회원 전용입니다.
      </p>
      <a href="#pricing" className="premium-upgrade-btn">
        구독 플랜 보기
      </a>
    </div>
  )
}
