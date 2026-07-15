import { useState, type ReactNode } from 'react'
import { useSubscription, AD_UNLOCK_HOURS } from '../context/SubscriptionContext'
import { PRODUCT_SPEC } from '../data/productSpec'
import './PremiumGate.css'

interface PremiumGateProps {
  children: ReactNode
  feature?: string
}

export function PremiumGate({ children, feature = '이 기능' }: PremiumGateProps) {
  const { isPremium, loading, unlockWithAd } = useSubscription()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  if (loading) {
    return <p className="premium-loading">구독 정보 확인 중...</p>
  }

  if (isPremium) return <>{children}</>

  async function handleAd() {
    if (
      !confirm(
        `광고 시청으로 ${feature}을(를) ${AD_UNLOCK_HOURS}시간 이용합니다.\n(실제 광고 연동 전: 확인 시 바로 적용)`,
      )
    ) {
      return
    }
    setBusy(true)
    const err = await unlockWithAd()
    setMessage(err ?? `${AD_UNLOCK_HOURS}시간 이용이 적용되었습니다.`)
    setBusy(false)
  }

  return (
    <div className="premium-gate">
      <i className="fa-solid fa-lock" />
      <p>
        <strong>{feature}</strong>은 무료 체험·월 구독·또는 광고 이용 회원 전용입니다.
      </p>
      <p className="premium-gate-sub">
        가입 후 {PRODUCT_SPEC.freeTrialDays}일 무료. 이후 월{' '}
        {PRODUCT_SPEC.monthlyPriceKrw.toLocaleString('ko-KR')}원 또는 광고 시청으로 이용할 수 있습니다.
      </p>
      <div className="premium-gate-actions">
        <a href="#pricing" className="premium-upgrade-btn">
          구독 플랜 보기
        </a>
        <button type="button" className="premium-ad-btn" onClick={() => void handleAd()} disabled={busy}>
          광고로 {AD_UNLOCK_HOURS}시간 이용
        </button>
      </div>
      {message && <p className="premium-gate-message">{message}</p>}
    </div>
  )
}
