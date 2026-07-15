import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSubscription, AD_UNLOCK_HOURS } from '../context/SubscriptionContext'
import { PRODUCT_SPEC } from '../data/productSpec'
import {
  createTossOrder,
  isTossConfigured,
  requestTossCheckout,
} from '../services/tossPaymentService'
import './ContentSections.css'
import './PricingSection.css'

const priceLabel = `${PRODUCT_SPEC.monthlyPriceKrw.toLocaleString('ko-KR')}원`
const tossReady = isTossConfigured()

const PLANS = [
  {
    id: 'free' as const,
    name: '무료 · 체험',
    price: '2주 무료',
    period: `/ ${PRODUCT_SPEC.freeTrialDays}일`,
    featured: false,
    items: [
      `가입 후 ${PRODUCT_SPEC.freeTrialDays}일(2주)간 프리미엄 기능 이용`,
      '체험 종료 후 광고 시청으로 일부 기능 이용',
      '오늘 기록 · 기본 감정 선택',
    ],
  },
  {
    id: 'monthly' as const,
    name: '월 구독',
    price: priceLabel,
    period: '/ 매월',
    featured: true,
    items: [
      '전자책 라이브러리 열람',
      '오디오 · 카드 · 월간 리포트',
      '광고 없이 전체 프리미엄 기능',
      tossReady ? '웹: 토스페이먼츠 카드 결제' : '웹: 토스페이먼츠 (키 설정 후 결제)',
    ],
  },
  {
    id: 'b2b' as const,
    name: '기관(B2B)',
    price: '토스 결제',
    period: '/ 견적',
    featured: false,
    items: [
      '학교·기업용 라이선스',
      '토스페이먼츠 결제 지원 (연동 준비)',
      '맞춤 리포트·콘텐츠 패키지',
    ],
  },
]

function accessStatusText(
  accessReason: ReturnType<typeof useSubscription>['accessReason'],
  plan: string,
  trialDaysLeft: number | null,
  adHoursLeftLabel: string | null,
) {
  if (accessReason === 'trial') {
    return `무료 체험 중${trialDaysLeft != null && trialDaysLeft > 0 ? ` · 남은 ${trialDaysLeft}일` : ''}`
  }
  if (accessReason === 'paid') {
    return plan === 'b2b' ? 'B2B 기관 플랜 활성' : '월 구독 활성'
  }
  if (accessReason === 'ads') {
    return `광고 이용 중${adHoursLeftLabel ? ` · ${adHoursLeftLabel} 남음` : ''}`
  }
  return '체험 종료 · 구독 또는 광고로 이용'
}

export function PricingSection() {
  const { user } = useAuth()
  const {
    plan,
    isPremium,
    accessReason,
    trialDaysLeft,
    adHoursLeftLabel,
    subscribeMonthly,
    cancelSubscription,
    requestB2B,
    unlockWithAd,
  } = useSubscription()
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleMonthly() {
    if (!user) {
      setMessage('로그인 후 구독할 수 있습니다.')
      document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (plan === 'monthly' && accessReason === 'paid') {
      if (!confirm('월 구독을 해지할까요? 이미 결제된 기간·체험·광고 이용은 약관에 따릅니다.')) return
      setBusy(true)
      const err = await cancelSubscription()
      setMessage(err ?? '구독이 해지되었습니다.')
      setBusy(false)
      return
    }

    setBusy(true)
    setMessage('')

    if (tossReady) {
      const order = await createTossOrder('monthly')
      if (order.error || !order.data) {
        setMessage(order.error ?? '주문 생성에 실패했습니다. Edge Function 배포를 확인해주세요.')
        setBusy(false)
        return
      }
      const payErr = await requestTossCheckout({
        customerKey: order.data.customerKey,
        orderId: order.data.orderId,
        amount: order.data.amount,
        orderName: order.data.orderName,
        customerEmail: user.email,
      })
      if (payErr) setMessage(payErr)
      setBusy(false)
      return
    }

    const err = await subscribeMonthly()
    setMessage(
      err ??
        `월 구독이 개발용으로 활성화되었습니다. (${priceLabel}/월 · 토스 키·Edge Function 연결 후 실제 결제)`,
    )
    setBusy(false)
  }

  async function handleB2B() {
    if (!user) {
      setMessage('로그인 후 B2B 플랜을 신청할 수 있습니다.')
      document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (!confirm('B2B 기관 플랜을 신청하시겠습니까? (지금은 개발용 즉시 활성화 · 토스 금액 결제는 추후)')) return
    setBusy(true)
    const err = await requestB2B()
    setMessage(err ?? 'B2B 플랜이 활성화되었습니다. 담당자가 연락드립니다.')
    setBusy(false)
  }

  async function handleAdUnlock() {
    if (!user) {
      setMessage('로그인 후 광고로 이용할 수 있습니다.')
      document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (
      !confirm(
        `광고 시청으로 프리미엄 기능을 ${AD_UNLOCK_HOURS}시간 이용합니다.\n(실제 광고 SDK 연동 전: 확인 시 바로 적용)`,
      )
    ) {
      return
    }
    setBusy(true)
    const err = await unlockWithAd()
    setMessage(err ?? `광고 이용이 적용되었습니다. ${AD_UNLOCK_HOURS}시간 동안 프리미엄 기능을 쓸 수 있습니다.`)
    setBusy(false)
  }

  function planButton(id: 'free' | 'monthly' | 'b2b') {
    if (id === 'free') {
      if (accessReason === 'trial') return <span className="plan-current">체험 이용 중</span>
      if (!isPremium) {
        return (
          <button type="button" className="pricing-btn outline" onClick={handleAdUnlock} disabled={busy}>
            광고로 {AD_UNLOCK_HOURS}시간 이용
          </button>
        )
      }
      if (accessReason === 'ads') return <span className="plan-current">광고 이용 중</span>
      return null
    }
    if (id === 'monthly') {
      if (plan === 'monthly' && accessReason === 'paid') {
        return (
          <button type="button" className="pricing-btn outline" onClick={handleMonthly} disabled={busy}>
            구독 해지
          </button>
        )
      }
      return (
        <button type="button" className="pricing-btn filled" onClick={handleMonthly} disabled={busy}>
          {tossReady ? `${priceLabel} 토스 결제` : `${priceLabel} 구독하기`}
        </button>
      )
    }
    if (id === 'b2b') {
      if (plan === 'b2b' && accessReason === 'paid') return <span className="plan-current">B2B 활성</span>
      return (
        <button type="button" className="pricing-btn outline" onClick={handleB2B} disabled={busy}>
          B2B 신청
        </button>
      )
    }
    return null
  }

  return (
    <section id="pricing">
      <h2 className="section-title">구독 플랜</h2>
      <p className="section-subtitle">
        첫 {PRODUCT_SPEC.freeTrialDays}일은 무료, 이후 월 {priceLabel} 구독 또는 광고 시청으로 이용합니다.
      </p>

      {user && (
        <p className="pricing-current-plan">
          현재 상태:{' '}
          <strong>{accessStatusText(accessReason, plan, trialDaysLeft, adHoursLeftLabel)}</strong>
        </p>
      )}

      <div className="grid-3">
        {PLANS.map((p) => (
          <div key={p.id} className={`content-card pricing-card ${p.featured ? 'featured' : ''}`}>
            {p.featured && <span className="pricing-badge">추천</span>}
            <h4 className="pricing-name">{p.name}</h4>
            <p className="pricing-price">
              {p.price} <span>{p.period}</span>
            </p>
            <ul className="pricing-list">
              {p.items.map((item) => (
                <li key={item}>
                  <i className={`fa-solid fa-check ${p.featured ? 'check-green' : ''}`} /> {item}
                </li>
              ))}
            </ul>
            <div className="pricing-action">{planButton(p.id)}</div>
          </div>
        ))}
      </div>

      {message && <p className="pricing-message">{message}</p>}

      <p className="pricing-note">
        {tossReady ? (
          <>
            * 웹 결제는 <strong>토스페이먼츠</strong>로 진행됩니다. (카드 결제 · 1개월 이용권) 앱 스토어 구독은 별도
            인앱결제로 연결됩니다.
          </>
        ) : (
          <>
            * 토스 결제 키가 없으면 개발용 즉시 구독이 적용됩니다. <code>.env</code>에{' '}
            <code>VITE_TOSS_CLIENT_KEY</code>를 넣고, Supabase에 <code>payments.sql</code> 실행 및 Edge Function을
            배포하세요.
          </>
        )}
      </p>
    </section>
  )
}
