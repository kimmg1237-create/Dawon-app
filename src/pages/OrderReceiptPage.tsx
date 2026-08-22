import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatKrw, formatDateKo, productLabel, type PayProduct } from '../data/productSpec'
import { formatPhone } from '../data/orderBuyer'
import { fetchOrderEvents, fetchStoreOrder, type OrderEvent, type StoreOrder } from '../services/orderService'
import { Seo } from '../components/Seo'

const STATUS: Record<string, string> = {
  pending: '주문접수 · 결제대기',
  paid: '결제완료',
  failed: '결제실패',
  cancelled: '취소',
  refunded: '환불완료',
}

const FULFILL: Record<string, string> = {
  pending: '상품 지급 대기',
  fulfilled: '디지털 상품 지급 완료',
  revoked: '지급 회수',
}

const EVENT: Record<string, string> = {
  order_created: '주문서 작성',
  payment_requested: '결제창 요청',
  paid: '결제 승인',
  payment_failed: '결제 실패',
  fulfilled: '상품 지급',
  refunded: '환불',
}

function labelProduct(product: string) {
  if (product === 'monthly' || product === 'b2b' || product === 'sotong' || product === 'healing') {
    return productLabel(product as PayProduct)
  }
  return product
}

export function OrderReceiptPage() {
  const { orderId = '' } = useParams()
  const { user, loading } = useAuth()
  const [order, setOrder] = useState<StoreOrder | null>(null)
  const [events, setEvents] = useState<OrderEvent[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orderId || loading || !user) return
    let cancelled = false
    ;(async () => {
      try {
        const [row, log] = await Promise.all([fetchStoreOrder(orderId), fetchOrderEvents(orderId)])
        if (cancelled) return
        setOrder(row)
        setEvents(log)
        if (!row) setError('주문을 찾을 수 없습니다.')
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : '주문서 조회 실패')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [orderId, user, loading])

  if (!user && !loading) {
    return (
      <div className="container page-banner">
        <h1>주문서</h1>
        <p>
          로그인이 필요합니다. <Link to="/login" state={{ from: `/orders/${orderId}` }}>로그인</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="container order-sheet-page">
      <Seo title="주문서" description="다원 주문 내역" path={`/orders/${orderId}`} />
      <div className="page-banner">
        <div className="eyebrow">ORDER</div>
        <h1>주문서</h1>
      </div>
      {error ? <div className="subscribe-alert">{error}</div> : null}
      {order ? (
        <article className="order-sheet">
          <header>
            <div>
              <small>영수증 번호</small>
              <strong>{order.receipt_no || '-'}</strong>
            </div>
            <div>
              <small>주문번호</small>
              <code>{order.order_id}</code>
            </div>
          </header>
          <dl>
            <div>
              <dt>상품</dt>
              <dd>
                {order.product_name || labelProduct(order.product)} × {order.quantity || 1}
              </dd>
            </div>
            <div>
              <dt>금액</dt>
              <dd>{formatKrw(order.amount)}</dd>
            </div>
            <div>
              <dt>주문 상태</dt>
              <dd>{STATUS[order.status] || order.status}</dd>
            </div>
            <div>
              <dt>지급 상태</dt>
              <dd>{FULFILL[order.fulfillment_status] || order.fulfillment_status}</dd>
            </div>
            <div>
              <dt>주문자</dt>
              <dd>{order.buyer_name || '-'}</dd>
            </div>
            <div>
              <dt>이메일</dt>
              <dd>{order.buyer_email || '-'}</dd>
            </div>
                <div>
                  <dt>연락처</dt>
                  <dd>{order.buyer_phone ? formatPhone(order.buyer_phone) : '-'}</dd>
                </div>
                {order.book_format && order.book_format !== 'none' ? (
                  <div>
                    <dt>형태</dt>
                    <dd>{order.book_format === 'paper' ? '종이책' : '전자책'}</dd>
                  </div>
                ) : null}
                {order.ship_address1 ? (
                  <div>
                    <dt>배송지</dt>
                    <dd>
                      {order.ship_receiver ? `${order.ship_receiver} · ` : ''}
                      {order.ship_zip ? `(${order.ship_zip}) ` : ''}
                      {order.ship_address1} {order.ship_address2}
                    </dd>
                  </div>
                ) : null}
            <div>
              <dt>주문일시</dt>
              <dd>{formatDateKo(order.created_at)}</dd>
            </div>
            <div>
              <dt>결제일시</dt>
              <dd>{formatDateKo(order.paid_at)}</dd>
            </div>
          </dl>
          {events.length > 0 ? (
            <ol className="order-timeline">
              {events.map((ev) => (
                <li key={ev.id}>
                  <b>{EVENT[ev.event_type] || ev.event_type}</b>
                  <span>{formatDateKo(ev.created_at)}</span>
                </li>
              ))}
            </ol>
          ) : null}
          <div className="payment-result-actions">
            <Link to="/orders" className="btn btn-light">
              주문 목록
            </Link>
            <Link to="/library" className="btn btn-primary">
              서재 열기
            </Link>
          </div>
        </article>
      ) : !error ? (
        <p>주문서를 불러오는 중…</p>
      ) : null}
    </div>
  )
}
