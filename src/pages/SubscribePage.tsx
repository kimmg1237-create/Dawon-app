import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { loadTossPayments } from '@tosspayments/tosspayments-sdk'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../context/SubscriptionContext'
import { SubscriptionManagePanel } from '../components/SubscriptionManagePanel'
import { Seo } from '../components/Seo'
import {
  PRODUCT_SPEC,
  formatKrw,
  productAmount,
  productLabel,
  type PayProduct,
} from '../data/productSpec'
import { siteConfig } from '../data/siteConfig'
import { tossClientKey, tossConfigured } from '../lib/toss'
import { createTossOrder, generateOrderId } from '../services/paymentService'
import '../newsite/dawonOs/theme.css'
import '../newsite/dawonOs/bridge.css'
import '../newsite/dawonOs/dark-contrast.css'

const isTestPay = tossClientKey.startsWith('test_')

type UiPlanId = 'free' | 'trial' | 'monthly' | 'annual'

type UiPlan = {
  id: UiPlanId
  tag: string
  stage: string
  name: string
  price: string
  renewal: string
  items: string[]
  period: string
  nextPay: string
  recommended?: boolean
  /** Actual Toss product; null = free path */
  payProduct: PayProduct | null
  cta: string
}

const UI_PLANS: UiPlan[] = [
  {
    id: 'free',
    tag: '무료',
    stage: 'STAGE 01 · 먼저 경험한다',
    name: '무료 시작',
    price: '0원',
    renewal: '결제 없음',
    items: ['오늘 하나를 정하고 바로 시작', '3분 오늘설계', '7일간 핵심 흐름 경험', '브라우저 로컬 기록'],
    period: '무료 기능 상시',
    nextPay: '없음',
    payProduct: null,
    cta: '무료로 사용하기',
  },
  {
    id: 'trial',
    tag: '씨앗',
    stage: 'STAGE 02 · 하나를 반복한다',
    name: '2주 이용권',
    price: '6,900원',
    renewal: '자동갱신 없음',
    items: [
      '회원 기록·기기 동기화',
      '14일 생활실천 기록',
      '성장 확인·생활책 기반 데이터',
      '전자책·오디오북·만화 이용',
    ],
    period: '결제 승인 시점부터 14일',
    nextPay: '자동 청구하지 않음',
    // Edge function currently supports monthly/b2b — charge working monthly pass.
    payProduct: 'monthly',
    cta: '이용권 결제하기',
  },
  {
    id: 'monthly',
    tag: '추천',
    stage: 'STAGE 03 · 내 패턴을 발견한다',
    name: '30일 이용권',
    price: formatKrw(PRODUCT_SPEC.monthlyPriceKrw),
    renewal: '자동갱신 없음',
    items: ['30일 생활패턴 발견', '‘나의 30일 생활책’ 만들기', '회원 클라우드 기록', '전자책·오디오북·만화 · STUDIO'],
    period: `결제 승인 시점부터 ${PRODUCT_SPEC.subscriptionDays}일`,
    nextPay: '자동 청구하지 않음',
    recommended: true,
    payProduct: 'monthly',
    cta: '이용권 결제하기',
  },
  {
    id: 'annual',
    tag: '연간',
    stage: 'STAGE 04 · 내 생활방식을 만든다',
    name: '365일 이용권',
    price: '99,000원',
    renewal: '자동갱신 없음',
    items: ['365일 생활 데이터 축적', '연간 성장리포트', '‘나의 365일 생활연감’ 완성', 'STUDIO & LIBRARY 확장'],
    period: '결제 승인 시점부터 365일',
    nextPay: '자동 청구하지 않음',
    payProduct: 'monthly',
    cta: '이용권 결제하기',
  },
]

export function SubscribePage() {
  const { user, configured } = useAuth()
  const { isPremium, statusLabel, premiumReason, unlockWithAd, refresh, loading, subscription } =
    useSubscription()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [busy, setBusy] = useState<UiPlanId | 'ad' | null>(null)
  const [error, setError] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreeDigital, setAgreeDigital] = useState(false)
  const [selected, setSelected] = useState<UiPlanId>('monthly')

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    const plan = params.get('plan')
    if (plan === 'trial' || plan === 'monthly' || plan === 'annual' || plan === 'free') {
      setSelected(plan)
    }
  }, [params])

  const selectedPlan = useMemo(
    () => UI_PLANS.find((p) => p.id === selected) ?? UI_PLANS[2],
    [selected],
  )

  async function startPayment(uiPlan: UiPlan) {
    if (!uiPlan.payProduct) return
    if (!user) {
      navigate('/login', { state: { from: `/subscribe?plan=${uiPlan.id}` } })
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

    setBusy(uiPlan.id)
    setError('')

    try {
      const product = uiPlan.payProduct
      const orderId = generateOrderId(user.id)
      const amount = productAmount(product)
      const order = await createTossOrder(product, orderId)

      const tossPayments = await loadTossPayments(tossClientKey)
      const payment = tossPayments.payment({ customerKey: order.customerKey })

      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: amount },
        orderId: order.orderId,
        orderName: `${PRODUCT_SPEC.productName} · ${uiPlan.name} · ${productLabel(product)}`,
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

  function onPlanAction(plan: UiPlan) {
    setSelected(plan.id)
    if (plan.id === 'free') {
      if (!user) navigate('/login', { state: { from: '/subscribe?plan=free' } })
      else navigate('/')
      return
    }
    void startPayment(plan)
  }

  const canPay = agreeTerms && agreeDigital

  return (
    <section id="subscription" className="section-soft subscribe-page dawon-os-checkout">
      <Seo
        title={siteConfig.pages.subscribe.title}
        description={siteConfig.pages.subscribe.description}
        path={siteConfig.pages.subscribe.path}
      />
      <div className="container">
        <div className="section-head">
          <div>
            <div className="kicker">이용권</div>
            <h2>얼마인지, 무엇을 얻는지, 언제까지 쓰는지 먼저 확인하세요.</h2>
            <p>
              다원 하루설계의 유료상품은 기간형 이용권입니다. 원하는 기간을 선택해 이용하고, 기간이 끝난 뒤
              필요할 때 다시 선택합니다. 전자책·오디오북·만화는{' '}
              <Link to="/library">서재</Link>에서 이용합니다.
            </p>
          </div>
        </div>

        <div className="subscription-policy-banner">
          <b>안심 이용 안내:</b> 2주·30일·365일 모두 <strong>자동갱신·자동청구가 없는 기간형 이용권</strong>
          입니다. 이용기간이 끝난 뒤 원할 때 다시 선택할 수 있습니다.
        </div>

        {isTestPay ? (
          <div className="subscription-policy-banner" style={{ marginTop: 10 }}>
            <b>테스트 결제 모드:</b> 실제 카드 출금은 되지 않으며, 토스 개발자센터 테스트 결제 내역에만
            남습니다.
          </div>
        ) : null}

        {!configured ? (
          <div className="subscription-policy-banner" style={{ marginTop: 10 }}>
            <b>안내:</b> Supabase 로그인 설정 후 결제·구독 저장이 가능합니다.
          </div>
        ) : null}

        {error ? (
          <div className="subscribe-alert" role="alert" style={{ marginTop: 14 }}>
            {error}
          </div>
        ) : null}

        <div className="plan-grid">
          {UI_PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`plan-card${plan.recommended ? ' recommended' : ''}${
                selected === plan.id ? ' is-selected' : ''
              }`}
            >
              <span className="plan-tag">{plan.tag}</span>
              <span className="growth-stage">{plan.stage}</span>
              <h3>{plan.name}</h3>
              <div className="plan-price">{plan.price}</div>
              <span className="renewal-badge">{plan.renewal}</span>
              <ul>
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="plan-contract">
                <span>
                  <b>이용기간</b> {plan.period}
                </span>
                <span>
                  <b>다음 결제</b> {plan.nextPay}
                </span>
              </div>
              <button
                type="button"
                className={plan.recommended ? 'btn btn-primary' : 'btn btn-soft'}
                disabled={busy !== null || (plan.payProduct !== null && !canPay)}
                onClick={() => onPlanAction(plan)}
              >
                {busy === plan.id ? '결제창 여는 중…' : plan.cta}
              </button>
            </article>
          ))}
        </div>

        {!canPay ? (
          <p className="subscribe-consent-hint" style={{ marginTop: 14 }}>
            아래 필수 동의에 체크해야 유료 이용권 결제가 활성화됩니다. 현재 토스 결제는{' '}
            <strong>30일 이용권 {formatKrw(PRODUCT_SPEC.monthlyPriceKrw)}</strong>으로 안전하게
            진행됩니다.
          </p>
        ) : (
          <p className="subscribe-consent-hint" style={{ marginTop: 14 }}>
            선택: <strong>{selectedPlan.name}</strong> · 토스 결제 금액{' '}
            <strong>{formatKrw(PRODUCT_SPEC.monthlyPriceKrw)}</strong> (자동갱신 없음)
          </p>
        )}

        <div className="subscribe-consent panel panel-pad" style={{ marginTop: 18 }}>
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
              <Link to="/refund" target="_blank">
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

        <div className="subscription-trust-grid" aria-label="이용권 선택 핵심 확인사항">
          <div className="subscription-trust-item">
            <b>01 · 얼마인가?</b>
            <strong>가격을 먼저 확인</strong>
            <span>
              2주 · 30일 {formatKrw(PRODUCT_SPEC.monthlyPriceKrw)} · 365일. 결제 전에 선택한 금액을 다시
              보여드립니다.
            </span>
          </div>
          <div className="subscription-trust-item">
            <b>02 · 무엇을 얻는가?</b>
            <strong>기록이 결과로 남습니다</strong>
            <span>
              3분 오늘설계, 실천 기록, 회원 기록 동기화, 성장 확인과 생활책·생활연감, 전자책·오디오북·만화로
              이어집니다.
            </span>
          </div>
          <div className="subscription-trust-item">
            <b>03 · 언제까지 쓰는가?</b>
            <strong>14일 · 30일 · 365일</strong>
            <span>결제 승인 시점부터 선택한 기간 동안 이용합니다. 자동갱신과 자동청구는 없습니다.</span>
          </div>
        </div>

        <div className="subscription-layout">
          <article className="status-panel">
            <span className="status-badge">이용권 선택 가이드</span>
            <h3>
              처음에는 무료로,
              <br />
              변화를 확인하려면 30일을 추천합니다.
            </h3>
            <p>
              기능을 많이 쓰는 것이 목적이 아닙니다. 오늘 하나를 정하고 3분 기록을 반복해 내 생활의 변화를
              확인하는 것이 핵심입니다.
            </p>
            <div className="readiness-list">
              <div className="readiness-item">
                <i>1</i>
                <span>먼저 경험하기</span>
                <strong>무료 시작</strong>
              </div>
              <div className="readiness-item">
                <i>2</i>
                <span>한 가지를 반복해 보기</span>
                <strong>14일</strong>
              </div>
              <div className="readiness-item">
                <i>3</i>
                <span>내 생활패턴을 발견하기</span>
                <strong>30일 추천</strong>
              </div>
              <div className="readiness-item">
                <i>4</i>
                <span>생활기록을 장기 자산으로 만들기</span>
                <strong>365일</strong>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <span className={`payment-status ${canPay ? 'ready' : 'blocked'}`}>
                {canPay
                  ? `토스 결제 준비됨 · ${formatKrw(PRODUCT_SPEC.monthlyPriceKrw)}`
                  : '동의 후 토스 결제 가능'}
              </span>
            </div>
          </article>

          <article className="status-panel">
            <span className="status-badge">MY SUBSCRIPTION</span>
            <h3>내 이용권·결제 상태</h3>
            <p>
              {loading
                ? '구독 상태를 확인하는 중…'
                : user
                  ? `현재 상태: ${statusLabel}${isPremium ? ' · 이용 가능' : ' · 잠김'}`
                  : '로그인 후 이용권·결제 상태가 표시됩니다.'}
            </p>
            <div className="subscription-state-grid">
              <div className="subscription-state-item">
                <b>상태</b>
                <span>{user ? statusLabel : '로그인 필요'}</span>
              </div>
              <div className="subscription-state-item">
                <b>이용권</b>
                <span>{isPremium ? '활성' : '-'}</span>
              </div>
              <div className="subscription-state-item">
                <b>이용 만료</b>
                <span>
                  {subscription?.expires_at
                    ? new Date(subscription.expires_at).toLocaleDateString('ko-KR')
                    : '-'}
                </span>
              </div>
              <div className="subscription-state-item">
                <b>자동갱신</b>
                <span>없음</span>
              </div>
              <div className="subscription-state-item">
                <b>계정</b>
                <span>{user?.email ?? '-'}</span>
              </div>
              <div className="subscription-state-item">
                <b>결제</b>
                <span>토스페이먼츠</span>
              </div>
            </div>
            <div className="subscription-actions">
              <button className="btn btn-sm btn-soft" type="button" onClick={() => void refresh()}>
                상태 새로고침
              </button>
              {!user ? (
                <Link className="btn btn-sm btn-primary" to="/login" state={{ from: '/subscribe' }}>
                  로그인
                </Link>
              ) : null}
              <Link className="btn btn-sm btn-gold" to="/library">
                서재 열기
              </Link>
            </div>
            {user ? <div style={{ marginTop: 14 }}><SubscriptionManagePanel /></div> : null}
          </article>
        </div>

        {premiumReason === 'none' && user ? (
          <div className="subscribe-ad-alt" style={{ marginTop: 18 }}>
            <div>
              <h3>무료로 계속 이용</h3>
              <p>체험이 끝난 뒤에는 광고 시청(임시) 또는 월 이용권으로 프리미엄을 열 수 있습니다.</p>
            </div>
            <button
              type="button"
              className="btn btn-soft"
              disabled={busy !== null}
              onClick={() => void onAdUnlock()}
            >
              {busy === 'ad' ? '처리 중…' : '광고로 24시간 이용 (임시)'}
            </button>
          </div>
        ) : null}

        <div className="business-disclosure">
          <h4>판매자 정보</h4>
          <p>
            {siteConfig.business.companyName}은 전자책·오디오북·자기확인 노트·온라인 콘텐츠·구독
            서비스를 제공합니다.
          </p>
          <div className="business-grid">
            <div>
              <b>상호</b> <span>{siteConfig.business.companyName}</span>
            </div>
            <div>
              <b>대표자</b> <span>{siteConfig.business.representative}</span>
            </div>
            <div>
              <b>사업자등록번호</b> <span>{siteConfig.business.businessNumber}</span>
            </div>
            <div>
              <b>통신판매업 신고</b> <span>{siteConfig.business.mailOrderNumber}</span>
            </div>
            <div>
              <b>고객센터</b> <span>{siteConfig.business.phone}</span>
            </div>
            <div>
              <b>개인정보·환불 문의</b>{' '}
              <span>
                <a href={`mailto:${PRODUCT_SPEC.supportEmail}`}>{PRODUCT_SPEC.supportEmail}</a>
              </span>
            </div>
          </div>
        </div>

        <div className="launch-note">
          <b>이용 안내:</b> 모든 유료 이용권은 자동갱신되지 않습니다. 결제 전 선택한 상품의 가격과
          이용기간을 다시 확인할 수 있으며, 환불·해지 기준은{' '}
          <Link to="/refund">환불정책</Link>에서 확인할 수 있습니다.
        </div>
      </div>
    </section>
  )
}
