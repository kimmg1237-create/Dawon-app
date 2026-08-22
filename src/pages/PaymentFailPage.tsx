import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { recordOrderPaymentFail } from '../services/paymentService'
import { useAuth } from '../context/AuthContext'

export function PaymentFailPage() {
  const [params] = useSearchParams()
  const { user, loading } = useAuth()
  const code = params.get('code') ?? ''
  const message = params.get('message') ?? '결제가 완료되지 않았습니다.'
  const orderId = params.get('orderId') ?? ''

  useEffect(() => {
    if (loading || !user || !orderId) return
    void recordOrderPaymentFail(orderId, code, decodeURIComponent(message)).catch(() => undefined)
  }, [loading, user, orderId, code, message])

  return (
    <div className="container payment-result payment-result-page">
      <div className="page-banner">
        <div className="eyebrow">PAYMENT</div>
        <h1>결제 실패</h1>
      </div>
      <div className="payment-result-card error">
        <p>{decodeURIComponent(message)}</p>
        {code ? (
          <p>
            오류 코드: <code>{code}</code>
          </p>
        ) : null}
        {orderId ? (
          <p>
            주문번호: <code>{orderId}</code>
            <br />
            이 주문은 실패로 기록됩니다. 주문서에서 확인할 수 있습니다.
          </p>
        ) : null}
        <div className="payment-result-actions">
          {orderId ? (
            <Link to={`/orders/${orderId}`} className="btn btn-light">
              주문서
            </Link>
          ) : null}
          <Link to="/subscribe" className="btn btn-primary">
            다시 결제
          </Link>
          <Link to="/" className="btn btn-light">
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}
