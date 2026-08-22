import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../context/SubscriptionContext'
import { Seo } from '../components/Seo'
import { formatDateKo, formatKrw, productLabel, type PayProduct } from '../data/productSpec'
import { type OrderBuyer, emptyBuyer, formatAddress, formatPhone, validateBuyer } from '../data/orderBuyer'
import { dawonT, getDawonLang } from '../newsite/dawonOs/i18n'
import { AddressSearchFields } from '../components/AddressSearchFields'
import { EbookViewer } from '../components/EbookViewer'
import { fetchOwnedBooks, type OwnedBook } from '../services/storeBookService'
import { loadBuyerProfile, saveBuyerProfile } from '../services/orderService'
import { fetchPaymentOrders } from '../services/refundService'
import type { PaymentOrderRow } from '../data/refundPolicy'
import './CheckoutPage.css'

const STATUS: Record<string, string> = {
  pending: '결제대기',
  paid: '결제완료',
  failed: '실패',
  cancelled: '취소',
  refunded: '환불',
}

export function MyPage() {
  const { user, loading } = useAuth()
  const { isPremium, statusLabel, subscription } = useSubscription()
  const navigate = useNavigate()
  const [buyer, setBuyer] = useState<OrderBuyer>(emptyBuyer())
  const [orders, setOrders] = useState<PaymentOrderRow[]>([])
  const [owned, setOwned] = useState<OwnedBook[]>([])
  const [reading, setReading] = useState<OwnedBook | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const t = (key: string) => dawonT(key, getDawonLang())

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/login', { state: { from: '/mypage' } })
      return
    }
    void loadBuyerProfile(user.id, user.email || '').then(setBuyer)
    void fetchPaymentOrders(user.id)
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : '주문 조회 실패'))
    void fetchOwnedBooks(user.id).then(setOwned)
  }, [loading, user, navigate])

  function setField<K extends keyof OrderBuyer>(key: K, value: OrderBuyer[K]) {
    setBuyer((prev) => ({ ...prev, [key]: value }))
  }

  async function onSave() {
    if (!user) return
    const err = validateBuyer(buyer)
    if (err) {
      setError(err)
      return
    }
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await saveBuyerProfile(user.id, buyer)
      setMessage('내 정보가 저장되었습니다.')
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  if (!user && !loading) return null

  return (
    <div className="mypage-page">
      <Seo title="마이페이지" description="내 정보와 주문" path="/mypage" />
      <div className="container mypage-wrap">
        <div className="mypage-head">
          <p className="eyebrow">마이페이지</p>
          <h1>마이페이지</h1>
          <p>로그인한 계정의 정보·구매한 책·주문만 여기에 보입니다.</p>
        </div>

        <div className="mypage-grid">
          <section className="mypage-card">
            <h2>이용 상태</h2>
            <dl className="mypage-meta">
              <div>
                <dt>현재</dt>
                <dd>{t(statusLabel)}</dd>
              </div>
              <div>
                <dt>콘텐츠</dt>
                <dd>{isPremium ? '이용 가능' : '잠김'}</dd>
              </div>
              <div>
                <dt>만료</dt>
                <dd>{formatDateKo(subscription?.expires_at)}</dd>
              </div>
            </dl>
            <Link to="/subscribe" className="btn btn-soft">
              스토어
            </Link>
          </section>

          <section className="mypage-card">
            <h2>내 정보 · 기본 배송지</h2>
            <label>
              이름
              <input value={buyer.name} onChange={(e) => setField('name', e.target.value)} />
            </label>
            <label>
              이메일
              <input value={buyer.email} onChange={(e) => setField('email', e.target.value)} />
            </label>
            <label>
              휴대폰
              <input value={buyer.phone} onChange={(e) => setField('phone', e.target.value)} />
            </label>
            <AddressSearchFields value={buyer} onChange={setBuyer} />
            {formatAddress(buyer) ? <p>{formatAddress(buyer)}</p> : null}
            {error ? <p className="checkout-error">{error}</p> : null}
            {message ? <p>{message}</p> : null}
            <button type="button" className="btn btn-primary" disabled={saving} onClick={() => void onSave()}>
              {saving ? '저장 중…' : '내 정보 저장'}
            </button>
          </section>

          <section className="mypage-card">
            <h2>구매한 책 보관함</h2>
            <p>스토어에서 산 자신과의 소통·힐링게임만 여기에 모입니다. 서재 51권과는 별도입니다.</p>
            {owned.length === 0 ? (
              <p>
                아직 구매한 책이 없습니다. <Link to="/subscribe">스토어</Link>에서 전자책 또는 종이책을 고를 수 있습니다.
              </p>
            ) : (
              <div className="mypage-shelf">
                {owned.map((book) => (
                  <article key={`${book.product}-${book.format}`} className="mypage-shelf-card">
                    <img src={book.coverUrl} alt="" width={92} height={128} />
                    <div>
                      <b>{book.title}</b>
                      <small>{book.format === 'paper' ? '종이책 · 배송 주문' : '전자책'}</small>
                      {book.format === 'ebook' ? (
                        book.canRead ? (
                          <button type="button" className="btn btn-primary" onClick={() => setReading(book)}>
                            보관함에서 읽기
                          </button>
                        ) : (
                          <span>파일 준비 중 — 관리자가 PDF를 올리면 바로 열립니다.</span>
                        )
                      ) : (
                        <Link to={`/orders/${book.orderId}`}>배송 주문서</Link>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="mypage-card">
            <h2>주문 내역</h2>
            {orders.length === 0 ? (
              <p>아직 주문이 없습니다.</p>
            ) : (
              <div className="mypage-orders">
                {orders.slice(0, 20).map((o) => (
                  <Link key={o.order_id} className="mypage-order" to={`/orders/${o.order_id}`}>
                    <b>
                      {o.product === 'monthly' || o.product === 'b2b' || o.product === 'sotong' || o.product === 'healing'
                        ? productLabel(o.product as PayProduct)
                        : o.product}{' '}
                      · {formatKrw(o.amount)}
                    </b>
                    <small>
                      {STATUS[o.status] || o.status} · {formatDateKo(o.paid_at || o.created_at)}
                    </small>
                    <small>{o.order_id}</small>
                  </Link>
                ))}
              </div>
            )}
            <p>
              <Link to="/orders">전체 주문</Link>
              {buyer.phone ? ` · ${formatPhone(buyer.phone)}` : ''}
            </p>
          </section>
        </div>
      </div>
      {reading?.pdfUrl ? (
        <EbookViewer
          url={reading.pdfUrl}
          title={reading.title}
          subtitle="마이페이지 보관함"
          onClose={() => setReading(null)}
        />
      ) : null}
    </div>
  )
}
