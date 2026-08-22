import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { loadTossPayments } from '@tosspayments/tosspayments-sdk'
import { useAuth } from '../context/AuthContext'
import { Seo } from '../components/Seo'
import {
  BOOK_PRICE_KRW,
  PRODUCT_SPEC,
  formatKrw,
  isBookProduct,
  productAmount,
  productLabel,
  type PayProduct,
} from '../data/productSpec'
import {
  type BookFormat,
  type OrderBuyer,
  emptyBuyer,
  validateBuyer,
  validateShipping,
} from '../data/orderBuyer'
import { AddressSearchFields } from '../components/AddressSearchFields'
import { loadBuyerProfile, saveBuyerProfile } from '../services/orderService'
import { createTossOrder, generateOrderId } from '../services/paymentService'
import { tossClientKey, tossConfigured } from '../lib/toss'
import './CheckoutPage.css'

function parseItem(raw: string | null): PayProduct | null {
  if (raw === 'sotong' || raw === 'healing' || raw === 'monthly' || raw === 'b2b') return raw
  return null
}

export function CheckoutPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const item = parseItem(params.get('item'))
  const isBook = item ? isBookProduct(item) : false
  const [format, setFormat] = useState<BookFormat>(params.get('format') === 'paper' ? 'paper' : 'ebook')
  const [buyer, setBuyer] = useState<OrderBuyer>(emptyBuyer())
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreeDigital, setAgreeDigital] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const amount = item ? productAmount(item) : 0
  const title = useMemo(() => {
    if (!item) return '주문서'
    if (!isBook) return productLabel(item)
    return `${productLabel(item)} · ${format === 'paper' ? '종이책' : '전자책'}`
  }, [item, isBook, format])

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/login', { state: { from: `/checkout?${params.toString()}` } })
      return
    }
    void loadBuyerProfile(user.id, user.email || '').then(setBuyer)
  }, [loading, user, navigate, params])

  function setField<K extends keyof OrderBuyer>(key: K, value: OrderBuyer[K]) {
    setBuyer((prev) => ({ ...prev, [key]: value }))
  }

  async function onPay() {
    if (!user || !item) return
    const buyerErr = validateBuyer(buyer)
    if (buyerErr) {
      setError(buyerErr)
      return
    }
    if (isBook && format === 'paper') {
      const shipErr = validateShipping(buyer)
      if (shipErr) {
        setError(shipErr)
        return
      }
    }
    if (!agreeTerms || !agreeDigital) {
      setError('약관과 디지털 콘텐츠 안내에 동의해 주세요.')
      return
    }
    if (!tossConfigured) {
      setError('결제 키가 아직 설정되지 않았습니다.')
      return
    }

    setBusy(true)
    setError('')
    try {
      await saveBuyerProfile(user.id, buyer)
      const orderId = generateOrderId(user.id)
      const order = await createTossOrder(item, orderId, buyer, isBook ? { format } : undefined)
      const tossPayments = await loadTossPayments(tossClientKey)
      const payment = tossPayments.payment({ customerKey: order.customerKey })
      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: amount },
        orderId: order.orderId,
        orderName: `${title} · ${formatKrw(amount)}`,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: buyer.email || user.email || undefined,
        customerName: buyer.name,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : '결제에 실패했습니다.'
      if (!/취소|cancel|USER/i.test(msg)) setError(msg)
    } finally {
      setBusy(false)
    }
  }

  if (!item) {
    return (
      <div className="checkout-page">
        <div className="container">
          <h1>주문할 상품이 없습니다.</h1>
          <Link to="/subscribe" className="btn btn-primary">
            스토어로
          </Link>
        </div>
      </div>
    )
  }

  const cover = item === 'healing' ? '/store-books/healing.png' : item === 'sotong' ? '/store-books/sotong.png' : ''

  return (
    <div className="checkout-page">
      <Seo title="주문서" description="다원 주문서" path="/checkout" />
      <div className="container checkout-wrap">
        <div className="checkout-head">
          <p className="eyebrow">ORDER SHEET</p>
          <h1>주문서</h1>
          <p>쿠팡·네이버쇼핑처럼 받는 분 정보를 확인한 뒤 결제합니다.</p>
        </div>

        <div className="checkout-grid">
          <section className="checkout-card">
            <h2>주문 상품</h2>
            <div className="checkout-product">
              {cover ? <img src={cover} alt="" width={72} height={100} /> : null}
              <div>
                <b>{productLabel(item)}</b>
                <strong>{formatKrw(amount)}</strong>
              </div>
            </div>
            {isBook ? (
              <div className="checkout-formats" role="radiogroup" aria-label="구매 형태">
                <button
                  type="button"
                  className={format === 'ebook' ? 'is-on' : ''}
                  onClick={() => setFormat('ebook')}
                >
                  <b>전자책</b>
                  <span>결제 후 바로 서재에서 이용</span>
                  <em>{formatKrw(BOOK_PRICE_KRW)}</em>
                </button>
                <button
                  type="button"
                  className={format === 'paper' ? 'is-on' : ''}
                  onClick={() => setFormat('paper')}
                >
                  <b>종이책</b>
                  <span>입력한 주소로 배송</span>
                  <em>{formatKrw(BOOK_PRICE_KRW)}</em>
                </button>
              </div>
            ) : null}
          </section>

          <section className="checkout-card">
            <h2>주문자</h2>
            <label>
              이름
              <input value={buyer.name} onChange={(e) => setField('name', e.target.value)} autoComplete="name" />
            </label>
            <label>
              이메일
              <input value={buyer.email} onChange={(e) => setField('email', e.target.value)} autoComplete="email" />
            </label>
            <label>
              휴대폰
              <input value={buyer.phone} onChange={(e) => setField('phone', e.target.value)} autoComplete="tel" placeholder="01012345678" />
            </label>
          </section>

          {isBook && format === 'paper' ? (
            <section className="checkout-card">
              <h2>배송지</h2>
              <p>도로명 주소 검색을 누르면 우편번호와 기본주소가 자동으로 채워집니다. 상세주소만 직접 입력하세요.</p>
              <AddressSearchFields value={buyer} onChange={setBuyer} />
            </section>
          ) : null}

          <section className="checkout-card">
            <h2>동의</h2>
            <label className="checkout-check">
              <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
              <span>
                <Link to="/terms" target="_blank">이용약관</Link>, <Link to="/refund" target="_blank">환불정책</Link>,{' '}
                <Link to="/privacy" target="_blank">개인정보</Link>에 동의합니다.
              </span>
            </label>
            <label className="checkout-check">
              <input type="checkbox" checked={agreeDigital} onChange={(e) => setAgreeDigital(e.target.checked)} />
              <span>
                디지털 콘텐츠는 이용 시작 시 청약철회가 제한될 수 있음에 동의합니다. ({PRODUCT_SPEC.coolingOffDays}일)
              </span>
            </label>
          </section>
        </div>

        {error ? <div className="checkout-error">{error}</div> : null}

        <div className="checkout-paybar">
          <div>
            <small>결제 금액</small>
            <strong>{formatKrw(amount)}</strong>
          </div>
          <div className="checkout-paybar-actions">
            <Link to="/subscribe" className="btn btn-soft">
              스토어로
            </Link>
            <button type="button" className="btn btn-primary" disabled={busy || !user} onClick={() => void onPay()}>
              {busy ? '결제창 여는 중…' : `${formatKrw(amount)} 결제하기`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
