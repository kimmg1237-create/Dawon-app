import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
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
import { loadBuyerProfile, saveBuyerProfile } from '../services/orderService'
import { OrderBuyerFields } from '../components/OrderBuyerFields'
import { validateBuyer, type OrderBuyer } from '../data/orderBuyer'
import { dawonT, getDawonLang, type DawonLang } from '../newsite/dawonOs/i18n'
import '../newsite/dawonOs/theme.css'
import '../newsite/dawonOs/bridge.css'
import '../newsite/dawonOs/dark-contrast.css'
import '../newsite/dawonOs/adRail.css'

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

function splitPlanItems(desc: string): string[] {
  return desc
    .split(/\n|·|\|/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function getUiPlans(lang: DawonLang): UiPlan[] {
  const t = (key: string) => dawonT(key, lang)
  const days = String(PRODUCT_SPEC.freeTrialDays)
  const subDays = String(PRODUCT_SPEC.subscriptionDays)

  return [
    {
      id: 'free',
      tag: t('planFreeTag'),
      stage: t('planFreeStage'),
      name: t('planFreeName'),
      price: t('planFreePrice'),
      renewal: t('planFreeRenewal'),
      items: splitPlanItems(t('planFreeDesc')),
      period: t('planFreePeriod').replace('{days}', days),
      nextPay: t('planNextPayNone'),
      payProduct: null,
      cta: t('planFreeCta'),
    },
    {
      id: 'trial',
      tag: t('plan14Tag'),
      stage: t('plan14Stage'),
      name: t('plan14Name'),
      price: t('plan14Price'),
      renewal: t('planNoAutoRenew'),
      items: splitPlanItems(t('plan14Desc')),
      period: t('plan14Period'),
      nextPay: t('planNextPayNoCharge'),
      // Edge function currently supports monthly/b2b — charge working monthly pass.
      payProduct: 'monthly',
      cta: t('plan14Cta'),
    },
    {
      id: 'monthly',
      tag: t('plan30Tag'),
      stage: t('plan30Stage'),
      name: t('plan30Name'),
      price: t('plan30Price'),
      renewal: t('planNoAutoRenew'),
      items: splitPlanItems(t('plan30Desc')),
      period: t('plan30Period').replace('{days}', subDays),
      nextPay: t('planNextPayNoCharge'),
      recommended: true,
      payProduct: 'monthly',
      cta: t('plan30Cta'),
    },
    {
      id: 'annual',
      tag: t('plan365Tag'),
      stage: t('plan365Stage'),
      name: t('plan365Name'),
      price: t('plan365Price'),
      renewal: t('planNoAutoRenew'),
      items: splitPlanItems(t('plan365Desc')),
      period: t('plan365Period'),
      nextPay: t('planNextPayNoCharge'),
      payProduct: 'monthly',
      cta: t('plan365Cta'),
    },
  ]
}

function langLocale(lang: DawonLang): string {
  if (lang === 'en') return 'en-US'
  if (lang === 'ja') return 'ja-JP'
  if (lang === 'zh') return 'zh-CN'
  return 'ko-KR'
}

export function SubscribePage() {
  const { user, configured } = useAuth()
  const { isPremium, statusLabel, premiumReason, unlockWithAd, refresh, loading, subscription } =
    useSubscription()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const [lang, setLang] = useState<DawonLang>(() => getDawonLang())
  const [busy, setBusy] = useState<UiPlanId | 'ad' | 'sotong' | 'healing' | null>(null)
  const [error, setError] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreeDigital, setAgreeDigital] = useState(false)
  const [selected, setSelected] = useState<UiPlanId>('monthly')
  const [buyer, setBuyer] = useState<OrderBuyer>({ name: '', email: '', phone: '' })
  const t = (key: string) => dawonT(key, lang)

  useEffect(() => {
    const onLang = () => setLang(getDawonLang())
    window.addEventListener('dawon-lang-changed', onLang)
    return () => window.removeEventListener('dawon-lang-changed', onLang)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!user) return
    void loadBuyerProfile(user.id, user.email || '').then(setBuyer)
  }, [user])

  useEffect(() => {
    const plan = params.get('plan')
    if (plan === 'trial' || plan === 'monthly' || plan === 'annual' || plan === 'free') {
      setSelected(plan)
    }
  }, [params])

  useEffect(() => {
    const id = location.hash.replace(/^#/, '')
    if (!id) return
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => window.clearTimeout(timer)
  }, [location.hash])

  useEffect(() => {
    const buy = params.get('buy')
    if (buy !== 'sotong' && buy !== 'healing') return
    if (!user) return
    navigate(`/checkout?item=${buy}`, { replace: true })
  }, [params, user, navigate])

  const uiPlans = useMemo(() => getUiPlans(lang), [lang])

  const selectedPlan = useMemo(
    () => uiPlans.find((p) => p.id === selected) ?? uiPlans[2],
    [selected, uiPlans],
  )

  async function startPayment(uiPlan: UiPlan) {
    if (!uiPlan.payProduct) return
    if (!user) {
      navigate('/login', { state: { from: `/subscribe?plan=${uiPlan.id}` } })
      return
    }
    if (!agreeTerms || !agreeDigital) {
      setError(t('subErrConsent'))
      return
    }
    const buyerErr = validateBuyer(buyer)
    if (buyerErr) {
      setError(buyerErr)
      return
    }
    if (!tossConfigured) {
      setError(t('subErrTossKey'))
      return
    }

    setBusy(uiPlan.id)
    setError('')

    try {
      await saveBuyerProfile(user.id, buyer)
      const product = uiPlan.payProduct
      const orderId = generateOrderId(user.id)
      const amount = productAmount(product)
      const order = await createTossOrder(product, orderId, buyer)

      const tossPayments = await loadTossPayments(tossClientKey)
      const payment = tossPayments.payment({ customerKey: order.customerKey })

      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: amount },
        orderId: order.orderId,
        orderName: `${PRODUCT_SPEC.productName} · ${uiPlan.name} · ${productLabel(product)}`,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: buyer.email || user.email || undefined,
        customerName: buyer.name,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('subErrPayment')
      if (!/취소|cancel|USER/i.test(msg)) setError(msg)
    } finally {
      setBusy(null)
    }
  }

  function openBookCheckout(product: 'sotong' | 'healing') {
    if (!user) {
      navigate('/login', { state: { from: `/checkout?item=${product}` } })
      return
    }
    navigate(`/checkout?item=${product}`)
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
      setError(err instanceof Error ? err.message : t('subErrAd'))
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
  const priceLabel = formatKrw(PRODUCT_SPEC.monthlyPriceKrw)

  return (
    <section id="subscription" className="section-soft subscribe-page dawon-os-checkout">
      <Seo
        title={siteConfig.pages.subscribe.title}
        description={siteConfig.pages.subscribe.description}
        path={siteConfig.pages.subscribe.path}
      />
      <div className="container">
        <aside className="store-ad-banners" id="book-shop" aria-label={t('subBookAria')}>
          <button
            type="button"
            className="store-ad-card"
            disabled={busy !== null}
            onClick={() => openBookCheckout('sotong')}
          >
            <img src="/store-books/sotong.png" alt={t('adCoverSotong')} width="300" height="420" decoding="async" />
            <div className="store-ad-copy">
              <b>자신과의 소통</b>
              <span>{t('adSelected')}</span>
              <p>{t('adSotongDesc')}</p>
              <em>{t('buyBookNow')}</em>
            </div>
          </button>
          <button
            type="button"
            className="store-ad-card"
            disabled={busy !== null}
            onClick={() => openBookCheckout('healing')}
          >
            <img src="/store-books/healing.png" alt={t('adCoverHealing')} width="300" height="420" decoding="async" />
            <div className="store-ad-copy">
              <b>힐링게임</b>
              <span>{t('adSelected')}</span>
              <p>{t('adHealingDesc')}</p>
              <em>{t('buyBookNow')}</em>
            </div>
          </button>
        </aside>

        <div className="section-head">
          <div>
            <div className="kicker">{t('subKicker')}</div>
            <h2>{t('subTitle')}</h2>
            <p>
              {t('subDesc')}{' '}
              {t('subDescLibrary')}{' '}
              <Link to="/library">{t('subLibraryLink')}</Link>
              {t('subDescLibraryEnd')}
            </p>
          </div>
        </div>

        <div className="subscription-policy-banner">{t('subPolicyBanner')}</div>

        {isTestPay ? (
          <div className="subscription-policy-banner" style={{ marginTop: 10 }}>
            {t('subTestPayBanner')}
          </div>
        ) : null}

        {!configured ? (
          <div className="subscription-policy-banner" style={{ marginTop: 10 }}>
            {t('subSupabaseBanner')}
          </div>
        ) : null}

        {error ? (
          <div className="subscribe-alert" role="alert" style={{ marginTop: 14 }}>
            {error}
          </div>
        ) : null}

        <div className="plan-grid" id="plans">
          {uiPlans.map((plan) => (
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
                  <b>{t('subPeriodLabel')}</b> {plan.period}
                </span>
                <span>
                  <b>{t('subNextPayLabel')}</b> {plan.nextPay}
                </span>
              </div>
              <button
                type="button"
                className={plan.recommended ? 'btn btn-primary' : 'btn btn-soft'}
                disabled={busy !== null || (plan.payProduct !== null && !canPay)}
                onClick={() => onPlanAction(plan)}
              >
                {busy === plan.id ? t('subPaying') : plan.cta}
              </button>
            </article>
          ))}
        </div>

        {!canPay ? (
          <p className="subscribe-consent-hint" style={{ marginTop: 14 }}>
            {t('subConsentHintNeed').replace('{price}', priceLabel)}
          </p>
        ) : (
          <p className="subscribe-consent-hint" style={{ marginTop: 14 }}>
            {t('subConsentHintReady')
              .replace('{name}', selectedPlan.name)
              .replace('{price}', priceLabel)}
          </p>
        )}

        <div className="subscribe-consent panel panel-pad" style={{ marginTop: 18 }}>
          <h3>{t('subConsentTitle')}</h3>
          <OrderBuyerFields value={buyer} onChange={setBuyer} disabled={busy !== null} />
          <label className="subscribe-check">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <span>
              {t('subConsentTermsPrefix')}
              <Link to="/terms" target="_blank">
                {t('subLinkTerms')}
              </Link>
              {t('subConsentTermsMid1')}
              <Link to="/refund" target="_blank">
                {t('subLinkRefund')}
              </Link>
              {t('subConsentTermsMid2')}
              <Link to="/privacy" target="_blank">
                {t('subLinkPrivacy')}
              </Link>
              {t('subConsentTermsEnd')}
            </span>
          </label>
          <label className="subscribe-check">
            <input
              type="checkbox"
              checked={agreeDigital}
              onChange={(e) => setAgreeDigital(e.target.checked)}
            />
            <span>
              {t('subConsentDigitalBefore')}
              <strong>{t('subConsentDigitalStrong')}</strong>
              {t('subConsentDigitalAfter').replace('{days}', String(PRODUCT_SPEC.coolingOffDays))}
            </span>
          </label>
        </div>

        <div className="subscription-trust-grid" aria-label={t('subTrustAria')}>
          <div className="subscription-trust-item">
            <b>{t('subTrust1Q')}</b>
            <strong>{t('subTrust1Title')}</strong>
            <span>{t('subTrust1Desc')}</span>
          </div>
          <div className="subscription-trust-item">
            <b>{t('subTrust2Q')}</b>
            <strong>{t('subTrust2Title')}</strong>
            <span>{t('subTrust2Desc')}</span>
          </div>
          <div className="subscription-trust-item">
            <b>{t('subTrust3Q')}</b>
            <strong>{t('subTrust3Title')}</strong>
            <span>{t('subTrust3Desc')}</span>
          </div>
        </div>

        <div className="subscription-layout">
          <article className="status-panel">
            <span className="status-badge">{t('subGuideBadge')}</span>
            <h3>
              {t('subGuideTitle')
                .split('\n')
                .map((line, i, arr) => (
                  <span key={line}>
                    {line}
                    {i < arr.length - 1 ? <br /> : null}
                  </span>
                ))}
            </h3>
            <p>{t('subGuideDesc')}</p>
            <div className="readiness-list">
              <div className="readiness-item">
                <i>1</i>
                <span>{t('subGuideStep1Label')}</span>
                <strong>{t('subGuideStep1Value')}</strong>
              </div>
              <div className="readiness-item">
                <i>2</i>
                <span>{t('subGuideStep2Label')}</span>
                <strong>{t('subGuideStep2Value')}</strong>
              </div>
              <div className="readiness-item">
                <i>3</i>
                <span>{t('subGuideStep3Label')}</span>
                <strong>{t('subGuideStep3Value')}</strong>
              </div>
              <div className="readiness-item">
                <i>4</i>
                <span>{t('subGuideStep4Label')}</span>
                <strong>{t('subGuideStep4Value')}</strong>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <span className={`payment-status ${canPay ? 'ready' : 'blocked'}`}>
                {canPay
                  ? t('subPayReady').replace('{price}', priceLabel)
                  : t('subPayBlocked')}
              </span>
            </div>
          </article>

          <article className="status-panel" id="status">
            <span className="status-badge">{t('subMyBadge')}</span>
            <h3>{t('subMyTitle')}</h3>
            <p>
              {loading
                ? t('subStatusLoading')
                : user
                  ? `${t('subStatusCurrent').replace('{status}', t(statusLabel))} · ${
                      isPremium ? t('subStatusAvailable') : t('subStatusLocked')
                    }`
                  : t('subStatusLoginHint')}
            </p>
            <div className="subscription-state-grid">
              <div className="subscription-state-item">
                <b>{t('subStatusLabel')}</b>
                <span>{user ? t(statusLabel) : t('subStatusNeedLogin')}</span>
              </div>
              <div className="subscription-state-item">
                <b>{t('subPlanLabel')}</b>
                <span>{isPremium ? t('subActive') : '-'}</span>
              </div>
              <div className="subscription-state-item">
                <b>{t('subEndsLabel')}</b>
                <span>
                  {subscription?.expires_at
                    ? new Date(subscription.expires_at).toLocaleDateString(langLocale(lang))
                    : '-'}
                </span>
              </div>
              <div className="subscription-state-item">
                <b>{t('subAutoRenewLabel')}</b>
                <span>{t('subAutoRenewNone')}</span>
              </div>
              <div className="subscription-state-item">
                <b>{t('subAccountLabel')}</b>
                <span>{user?.email ?? '-'}</span>
              </div>
              <div className="subscription-state-item">
                <b>{t('subPaymentLabel')}</b>
                <span>{t('subPaymentProvider')}</span>
              </div>
            </div>
            <div className="subscription-actions">
              <button className="btn btn-sm btn-soft" type="button" onClick={() => void refresh()}>
                {t('subRefresh')}
              </button>
              {!user ? (
                <Link className="btn btn-sm btn-primary" to="/login" state={{ from: '/subscribe' }}>
                  {t('authLoginSubmit')}
                </Link>
              ) : null}
              <Link className="btn btn-sm btn-gold" to="/library">
                {t('subOpenLibrary')}
              </Link>
            </div>
            {user ? (
              <div style={{ marginTop: 14 }}>
                <SubscriptionManagePanel />
              </div>
            ) : null}
          </article>
        </div>

        {premiumReason === 'none' && user ? (
          <div className="subscribe-ad-alt" style={{ marginTop: 18 }}>
            <div>
              <h3>{t('subAdTitle')}</h3>
              <p>{t('subAdDesc')}</p>
            </div>
            <button
              type="button"
              className="btn btn-soft"
              disabled={busy !== null}
              onClick={() => void onAdUnlock()}
            >
              {busy === 'ad' ? t('loginBusy') : t('subAdCta')}
            </button>
          </div>
        ) : null}

        <div className="business-disclosure">
          <h4>{t('subSellerTitle')}</h4>
          <p>{t('subSellerBlurb').replace('{company}', siteConfig.business.companyName)}</p>
          <div className="business-grid">
            <div>
              <b>{t('subBizName')}</b> <span>{siteConfig.business.companyName}</span>
            </div>
            <div>
              <b>{t('subBizRep')}</b> <span>{siteConfig.business.representative}</span>
            </div>
            <div>
              <b>{t('subBizNumber')}</b> <span>{siteConfig.business.businessNumber}</span>
            </div>
            <div>
              <b>{t('subBizMailOrder')}</b> <span>{siteConfig.business.mailOrderNumber}</span>
            </div>
            <div>
              <b>{t('subBizSupport')}</b> <span>{siteConfig.business.phone}</span>
            </div>
            <div>
              <b>{t('subBizPrivacy')}</b>{' '}
              <span>
                <a href={`mailto:${PRODUCT_SPEC.supportEmail}`}>{PRODUCT_SPEC.supportEmail}</a>
              </span>
            </div>
          </div>
        </div>

        <div className="launch-note">
          {t('subLaunchNoteBefore')}
          <Link to="/refund">{t('subLaunchNoteLink')}</Link>
          {t('subLaunchNoteAfter')}
        </div>
      </div>
    </section>
  )
}
