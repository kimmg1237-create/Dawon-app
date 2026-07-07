import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../context/SubscriptionContext'
import './ContentSections.css'
import './PricingSection.css'

const PLANS = [
  {
    id: 'free' as const,
    name: '무료 회원',
    price: '0원',
    period: '/ 평생',
    featured: false,
    items: ['오늘 한 일 / 할 일 기본 기록', '5종 기본 감정 선택 시스템', '기초 질문 카드 제공'],
  },
  {
    id: 'monthly' as const,
    name: '월 구독 회원',
    price: '정기 구독',
    period: '/ 생활설계',
    featured: true,
    items: [
      '전자책 라이브러리 열람 권한',
      '오디오북 3분 스트리밍 반복 청취',
      '월간 종합 감정 분석 리포트 피드',
    ],
  },
  {
    id: 'b2b' as const,
    name: '프리미엄 기관 회원',
    price: 'B2B 제휴',
    period: '/ 학교·기업',
    featured: false,
    items: [
      '전권 전자책 및 마스터 오디오 스트리밍',
      '학교/사내 방송용 3분 스크립트 라이선스',
      '개인 맞춤형 생활설계 PDF 리포트 발행',
    ],
  },
]

export function PricingSection() {
  const { user } = useAuth()
  const { plan, isPremium, subscribeMonthly, cancelSubscription, requestB2B } = useSubscription()
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleMonthly() {
    if (!user) {
      setMessage('로그인 후 구독할 수 있습니다.')
      document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (plan === 'monthly' && isPremium) {
      if (!confirm('월 구독을 해지하고 무료 플랜으로 돌아갈까요?')) return
      setBusy(true)
      const err = await cancelSubscription()
      setMessage(err ?? '구독이 해지되었습니다.')
      setBusy(false)
      return
    }
    setBusy(true)
    const err = await subscribeMonthly()
    setMessage(err ?? '월 구독이 활성화되었습니다! (개발용: 30일 유효)')
    setBusy(false)
  }

  async function handleB2B() {
    if (!user) {
      setMessage('로그인 후 B2B 플랜을 신청할 수 있습니다.')
      document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (!confirm('B2B 기관 플랜을 신청하시겠습니까? (개발용 즉시 활성화)')) return
    setBusy(true)
    const err = await requestB2B()
    setMessage(err ?? 'B2B 플랜이 활성화되었습니다. 담당자가 연락드립니다.')
    setBusy(false)
  }

  function planButton(id: 'free' | 'monthly' | 'b2b') {
    if (id === 'free') {
      if (plan === 'free') return <span className="plan-current">현재 플랜</span>
      return null
    }
    if (id === 'monthly') {
      if (plan === 'monthly' && isPremium) {
        return (
          <button type="button" className="pricing-btn outline" onClick={handleMonthly} disabled={busy}>
            구독 해지
          </button>
        )
      }
      return (
        <button type="button" className="pricing-btn filled" onClick={handleMonthly} disabled={busy}>
          월 구독 시작
        </button>
      )
    }
    if (id === 'b2b') {
      if (plan === 'b2b') return <span className="plan-current">B2B 활성</span>
      return (
        <button type="button" className="pricing-btn outline" onClick={handleB2B} disabled={busy}>
          B2B 문의·신청
        </button>
      )
    }
    return null
  }

  return (
    <section id="pricing">
      <h2 className="section-title">구독 플랜</h2>
      <p className="section-subtitle">
        무료로 시작하고, 필요할 때 월 구독으로 전자책·리포트·프리미엄 콘텐츠를 이용하세요.
      </p>

      {user && (
        <p className="pricing-current-plan">
          현재 플랜: <strong>{plan === 'free' ? '무료' : plan === 'monthly' ? '월 구독' : 'B2B 기관'}</strong>
          {isPremium && plan === 'monthly' && ' (프리미엄 활성)'}
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
        * 현재는 개발용 구독 시스템입니다. Play 스토어 출시 시 Google Play Billing으로 전환됩니다.
      </p>
    </section>
  )
}
