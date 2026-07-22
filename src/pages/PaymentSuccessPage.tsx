import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSubscription } from '../context/SubscriptionContext'
import { confirmTossPayment } from '../services/paymentService'
import { formatKrw } from '../data/productSpec'

export function PaymentSuccessPage() {
  const [params] = useSearchParams()
  const { refresh, statusLabel } = useSubscription()
  const [state, setState] = useState<'loading' | 'done' | 'error'>('loading')
  const [message, setMessage] = useState('')

  const paymentKey = params.get('paymentKey') ?? ''
  const orderId = params.get('orderId') ?? ''
  const amount = Number(params.get('amount') ?? '0')

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setState('error')
      setMessage('결제 정보가 올바르지 않습니다. 구독 페이지에서 다시 시도해 주세요.')
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const result = await confirmTossPayment(paymentKey, orderId, amount)
        if (cancelled) return
        await refresh()
        setMessage(result.message || '결제가 완료되었습니다.')
        setState('done')
      } catch (err) {
        if (cancelled) return
        setState('error')
        setMessage(err instanceof Error ? err.message : '결제 승인에 실패했습니다.')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [paymentKey, orderId, amount, refresh])

  return (
    <div className="container payment-result">
      <div className="page-banner">
        <div className="eyebrow">PAYMENT</div>
        <h1>{state === 'loading' ? '결제 확인 중…' : state === 'done' ? '결제 완료' : '결제 오류'}</h1>
      </div>

      <div className={`payment-result-card ${state}`}>
        {state === 'loading' ? (
          <p>토스페이먼츠 승인 및 구독 반영 중입니다. 잠시만 기다려 주세요.</p>
        ) : (
          <>
            <p>{message}</p>
            {state === 'done' ? (
              <>
                <p>
                  주문번호: <code>{orderId}</code>
                  <br />
                  결제금액: <strong>{formatKrw(amount)}</strong>
                  <br />
                  이용 상태: <strong>{statusLabel}</strong>
                </p>
                <div className="payment-result-actions">
                  <Link to="/library" className="btn btn-primary">
                    라이브러리 열기
                  </Link>
                  <Link to="/subscribe" className="btn btn-light">
                    구독 관리
                  </Link>
                </div>
              </>
            ) : (
              <div className="payment-result-actions">
                <Link to="/subscribe" className="btn btn-primary">
                  다시 시도
                </Link>
                <Link to="/" className="btn btn-light">
                  홈으로
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
