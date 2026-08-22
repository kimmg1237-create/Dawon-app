import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatDateKo, formatKrw, productLabel, type PayProduct } from '../data/productSpec'
import { fetchPaymentOrders } from '../services/refundService'
import type { PaymentOrderRow } from '../data/refundPolicy'
import { Seo } from '../components/Seo'

const STATUS: Record<string, string> = {
  pending: '결제대기',
  paid: '결제완료',
  failed: '실패',
  cancelled: '취소',
  refunded: '환불',
}

export function OrdersPage() {
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState<PaymentOrderRow[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    void fetchPaymentOrders(user.id)
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : '주문 조회 실패'))
  }, [user])

  if (!user && !loading) {
    return (
      <div className="container page-banner">
        <h1>주문 내역</h1>
        <p>
          <Link to="/login" state={{ from: '/orders' }}>
            로그인
          </Link>
          후 확인할 수 있습니다.
        </p>
      </div>
    )
  }

  return (
    <div className="container order-sheet-page">
      <Seo title="주문 내역" description="다원 주문 목록" path="/orders" />
      <div className="page-banner">
        <div className="eyebrow">ORDERS</div>
        <h1>주문 내역</h1>
      </div>
      {error ? <div className="subscribe-alert">{error}</div> : null}
      {orders.length === 0 ? (
        <p>아직 주문이 없습니다.</p>
      ) : (
        <div className="subscribe-orders-table-wrap">
          <table className="subscribe-orders-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>상품</th>
                <th>금액</th>
                <th>상태</th>
                <th>일시</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.order_id}>
                  <td>
                    <Link to={`/orders/${o.order_id}`}>
                      <code>{o.order_id}</code>
                    </Link>
                  </td>
                  <td>
                    {o.product === 'monthly' ||
                    o.product === 'b2b' ||
                    o.product === 'sotong' ||
                    o.product === 'healing'
                      ? productLabel(o.product as PayProduct)
                      : o.product}
                  </td>
                  <td>{formatKrw(o.amount)}</td>
                  <td>{STATUS[o.status] || o.status}</td>
                  <td>{formatDateKo(o.paid_at || o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
