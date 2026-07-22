import { Link, useSearchParams } from 'react-router-dom'

export function PaymentFailPage() {
  const [params] = useSearchParams()
  const code = params.get('code') ?? ''
  const message = params.get('message') ?? '결제가 완료되지 않았습니다.'

  return (
    <div className="container payment-result">
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
        <div className="payment-result-actions">
          <Link to="/subscribe" className="btn btn-primary">
            구독 페이지로
          </Link>
          <Link to="/" className="btn btn-light">
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}
