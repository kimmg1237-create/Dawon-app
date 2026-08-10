import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../context/SubscriptionContext'
import { confirmTossPayment } from '../services/paymentService'
import { formatKrw } from '../data/productSpec'
import { tossClientKey } from '../lib/toss'

export function PaymentSuccessPage() {
  const [params] = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const { refresh, statusLabel, isPremium } = useSubscription()
  const [state, setState] = useState<'loading' | 'done' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const isTestPay = tossClientKey.startsWith('test_')

  const paymentKey = params.get('paymentKey') ?? ''
  const orderId = params.get('orderId') ?? ''
  const amount = Number(params.get('amount') ?? '0')
  const returnTo = `/payment/success?${params.toString()}`

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setState('error')
      setMessage('결제 정보가 올바르지 않습니다. 구독 페이지에서 다시 시도해 주세요.')
      return
    }

    if (authLoading) return

    if (!user) {
      setState('error')
      setMessage('결제 승인에 로그인이 필요합니다. 로그인한 뒤 이 페이지로 다시 돌아와 주세요.')
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
  }, [paymentKey, orderId, amount, refresh, authLoading, user])

  return (
    <div className="container payment-result payment-result-page">
      <div className="page-banner">
        <div className="eyebrow">PAYMENT{isTestPay ? ' · TEST' : ''}</div>
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
                {isTestPay ? (
                  <p className="subscribe-alert warn" style={{ marginTop: 12 }}>
                    현재 <strong>테스트 키</strong>로 결제되었습니다. 카드에서 실제 출금되지 않으며,
                    토스 개발자센터의 <strong>테스트 결제 내역</strong>에만 기록됩니다.
                  </p>
                ) : null}
                <p>
                  주문번호: <code>{orderId}</code>
                  <br />
                  결제금액: <strong>{formatKrw(amount)}</strong>
                  <br />
                  이용 상태: <strong>{statusLabel}</strong>
                  <br />
                  프리미엄: <strong>{isPremium ? '이용 가능' : '아직 잠김 — 구독 페이지에서 상태 확인'}</strong>
                </p>
                <div className="payment-result-actions">
                  <Link to="/library" className="btn btn-primary">
                    라이브러리 열기
                  </Link>
                  <Link to="/subscribe" className="btn btn-light">
                    구독
                  </Link>
                </div>
              </>
            ) : (
              <div className="payment-result-actions">
                {!user ? (
                  <Link to="/login" state={{ from: returnTo }} className="btn btn-primary">
                    로그인 후 승인 이어하기
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setState('loading')
                      setMessage('')
                      void confirmTossPayment(paymentKey, orderId, amount)
                        .then(async (result) => {
                          await refresh()
                          setMessage(result.message || '결제가 완료되었습니다.')
                          setState('done')
                        })
                        .catch((err) => {
                          setState('error')
                          setMessage(err instanceof Error ? err.message : '결제 승인에 실패했습니다.')
                        })
                    }}
                  >
                    승인 다시 시도
                  </button>
                )}
                <Link to="/subscribe" className="btn btn-light">
                  구독 페이지
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
