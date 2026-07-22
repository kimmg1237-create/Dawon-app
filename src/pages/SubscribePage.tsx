import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadTossPayments } from '@tosspayments/tosspayments-sdk'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../context/SubscriptionContext'
import { SubscriptionManagePanel } from '../components/SubscriptionManagePanel'
import {
  PRODUCT_SPEC,
  formatKrw,
  productAmount,
  productLabel,
  type PayProduct,
} from '../data/productSpec'
import { tossClientKey, tossConfigured } from '../lib/toss'
import { createTossOrder, generateOrderId } from '../services/paymentService'

type PlanId = PayProduct | 'free'

const PLANS: {
  id: PlanId
  name: string
  price: string
  period: string
  featured?: boolean
  cta: string
  items: string[]
}[] = [
  {
    id: 'free',
    name: '무료·체험',
    price: '0원',
    period: `첫 ${PRODUCT_SPEC.freeTrialDays}일`,
    cta: '가입하면 자동 시작',
    items: ['3분 설계 · 7일 기록', '기본 AI 안내', '체험 기간 전자책·오디오북'],
  },
  {
    id: 'monthly',
    name: '월 구독',
    price: formatKrw(PRODUCT_SPEC.monthlyPriceKrw),
    period: '/ 30일',
    featured: true,
    cta: '토스로 결제하기',
    items: ['50개의 길 전자책·만화', '오디오북 청취', '클라우드 저장 · 설문 제출'],
  },
  {
    id: 'b2b',
    name: '기관·B2B',
    price: formatKrw(PRODUCT_SPEC.b2bPriceKrw),
    period: '/ 기관 1년',
    cta: '기관 결제하기',
    items: ['학교·기업 프로그램', '운영도구·설문 관리', '별도 계약·세금계산서'],
  },
]

export function SubscribePage() {
  const { user, configured } = useAuth()
  const { isPremium, statusLabel, premiumReason, unlockWithAd, refresh, loading } = useSubscription()
  const navigate = useNavigate()
  const [busy, setBusy] = useState<PayProduct | 'ad' | null>(null)
  const [error, setError] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreeDigital, setAgreeDigital] = useState(false)

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function startPayment(product: PayProduct) {
    if (!user) {
      navigate('/login', { state: { from: '/subscribe' } })
      return
    }
    if (!agreeTerms || !agreeDigital) {
      setError('이용약관·환불정책 및 디지털 콘텐츠 청약철회 제한에 동의한 뒤 결제할 수 있습니다.')
      return
    }
    if (!tossConfigured) {
      setError('토스 클라이언트 키(VITE_TOSS_CLIENT_KEY)가 설정되지 않았습니다.')
      return
    }

    setBusy(product)
    setError('')

    try {
      const orderId = generateOrderId(user.id)
      const amount = productAmount(product)
      const order = await createTossOrder(product, orderId)

      const tossPayments = await loadTossPayments(tossClientKey)
      const payment = tossPayments.payment({ customerKey: order.customerKey })

      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: amount },
        orderId: order.orderId,
        orderName: `${PRODUCT_SPEC.productName} · ${productLabel(product)}`,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: user.email ?? undefined,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : '결제를 시작하지 못했습니다.'
      if (!/취소|cancel|USER/i.test(msg)) setError(msg)
    } finally {
      setBusy(null)
    }
  }

  async function onAdUnlock() {
    if (!user) {
      navigate('/login', { state: { from: '/subscribe' } })
      return
    }
    setBusy('ad')
    setError('')
    try {
      await unlockWithAd()
    } catch (err) {
      setError(err instanceof Error ? err.message : '광고 이용 권한 부여에 실패했습니다.')
    } finally {
      setBusy(null)
    }
  }

  function onPlanClick(id: PlanId) {
    if (id === 'free') {
      if (!user) navigate('/login', { state: { from: '/subscribe' } })
      return
    }
    void startPayment(id)
  }

  const canPay = agreeTerms && agreeDigital

  return (
    <section className="section subscribe-section">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="kicker">SUBSCRIPTION · TOSS PAYMENTS</div>
            <h2>
              구독하고
              <br />
              콘텐츠를 열어보세요
            </h2>
          </div>
          <p>
            월 {formatKrw(PRODUCT_SPEC.monthlyPriceKrw)} · 첫 {PRODUCT_SPEC.freeTrialDays}일 무료 ·
            자동 갱신 없음. 해지·환불은 아래 구독 관리에서 신청합니다.
          </p>
        </div>

        <div className="subscribe-status-panel" aria-live="polite">
          <div>
            <span className="subscribe-status-label">나의 이용 상태</span>
            <strong>{loading ? '확인 중…' : statusLabel}</strong>
          </div>
          <div className="subscribe-status-meta">
            {isPremium ? <span className="subscribe-chip ok">이용 가능</span> : <span className="subscribe-chip">잠김</span>}
            {user ? (
              <span className="subscribe-user">{user.email}</span>
            ) : (
              <Link to="/login" state={{ from: '/subscribe' }} className="subscribe-login-link">
                로그인 후 결제 →
              </Link>
            )}
          </div>
        </div>

        {user ? <SubscriptionManagePanel /> : null}

        {error ? (
          <div className="subscribe-alert" role="alert">
            {error}
          </div>
        ) : null}

        {!configured ? (
          <div className="subscribe-alert warn">
            Supabase 로그인 설정 후 결제·구독 저장이 가능합니다.
          </div>
        ) : null}

        <div className="subscribe-consent">
          <h3>결제 전 동의 (필수)</h3>
          <label className="subscribe-check">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <span>
              <Link to="/terms" target="_blank">
                이용약관
              </Link>
              과{' '}
              <Link to="/refund-policy" target="_blank">
                환불·청약철회 정책
              </Link>
              ,{' '}
              <Link to="/privacy" target="_blank">
                개인정보처리방침
              </Link>
              에 동의합니다.
            </span>
          </label>
          <label className="subscribe-check">
            <input
              type="checkbox"
              checked={agreeDigital}
              onChange={(e) => setAgreeDigital(e.target.checked)}
            />
            <span>
              본 상품은 디지털 콘텐츠·기간제 이용권이며, 전자책·만화·오디오북을{' '}
              <strong>이용(열람·재생)한 이후</strong>에는 전자상거래법상 청약철회가 제한될 수 있음에
              동의합니다. 미이용 시 결제일로부터 {PRODUCT_SPEC.coolingOffDays}일 이내 전액 환불이
              가능합니다. 자동 갱신은 없습니다.
            </span>
          </label>
        </div>

        <div className="subscribe-grid">
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`subscribe-card${plan.featured ? ' featured' : ''}`}
            >
              {plan.featured ? <span className="subscribe-tag">추천</span> : null}
              <h3>{plan.name}</h3>
              <p className="subscribe-price">
                {plan.price}
                <small>{plan.period}</small>
              </p>
              <ul>
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {plan.id === 'free' ? (
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => onPlanClick('free')}
                >
                  {user ? plan.cta : '로그인하고 체험 시작'}
                </button>
              ) : (
                <button
                  type="button"
                  className={plan.featured ? 'btn btn-primary' : 'btn btn-mint'}
                  disabled={busy !== null || !canPay}
                  onClick={() => onPlanClick(plan.id)}
                >
                  {busy === plan.id ? '결제창 여는 중…' : plan.cta}
                </button>
              )}
            </article>
          ))}
        </div>

        {!canPay ? (
          <p className="subscribe-consent-hint">위의 필수 동의에 체크해야 결제가 활성화됩니다.</p>
        ) : null}

        <div className="subscribe-steps">
          <div>
            <b>1</b>
            <span>로그인</span>
          </div>
          <div>
            <b>2</b>
            <span>약관·환불 동의</span>
          </div>
          <div>
            <b>3</b>
            <span>토스 카드 결제</span>
          </div>
          <div>
            <b>4</b>
            <span>해지·환불은 구독 관리</span>
          </div>
        </div>

        {premiumReason === 'none' && user ? (
          <div className="subscribe-ad-alt">
            <div>
              <h3>무료로 계속 이용</h3>
              <p>체험이 끝난 뒤에는 광고 시청(임시) 또는 월 구독으로 프리미엄을 열 수 있습니다.</p>
            </div>
            <button
              type="button"
              className="btn btn-light"
              disabled={busy !== null}
              onClick={() => void onAdUnlock()}
            >
              {busy === 'ad' ? '처리 중…' : '광고로 24시간 이용 (임시)'}
            </button>
          </div>
        ) : null}

        <div className="subscribe-footer-row">
          <p>
            결제는 토스페이먼츠로 처리됩니다. 자동 갱신은 없으며, 환불·해지는{' '}
            <Link to="/refund-policy">환불정책</Link>을 따릅니다.
          </p>
          <div className="subscribe-footer-links">
            <Link to="/terms">이용약관</Link>
            <Link to="/refund-policy">환불정책</Link>
            <Link to="/privacy">개인정보</Link>
            <Link to="/library">라이브러리</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
