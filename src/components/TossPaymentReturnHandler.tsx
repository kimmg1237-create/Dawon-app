import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../context/SubscriptionContext'
import { confirmTossPayment } from '../services/tossPaymentService'

/**
 * 토스 success/fail 리다이렉트 (?payment=success|fail&paymentKey&orderId&amount) 처리
 */
export function TossPaymentReturnHandler() {
  const { user, loading: authLoading } = useAuth()
  const { refresh } = useSubscription()
  const [banner, setBanner] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    const params = new URLSearchParams(window.location.search)
    const payment = params.get('payment')
    if (!payment) return

    const paymentKey = params.get('paymentKey')
    const orderId = params.get('orderId')
    const amountRaw = params.get('amount')

    function clearQuery() {
      const url = new URL(window.location.href)
      url.search = ''
      url.hash = 'pricing'
      window.history.replaceState({}, '', url.toString())
    }

    if (payment === 'fail') {
      const code = params.get('code')
      const message = params.get('message')
      setBanner(message ? `결제 실패: ${message}` : `결제가 취소되었거나 실패했습니다.${code ? ` (${code})` : ''}`)
      clearQuery()
      return
    }

    if (payment === 'success') {
      if (!user) {
        setBanner('결제 승인을 위해 로그인이 필요합니다.')
        clearQuery()
        return
      }
      if (!paymentKey || !orderId || !amountRaw) {
        setBanner('결제 정보가 부족합니다. 고객센터로 문의해 주세요.')
        clearQuery()
        return
      }

      const amount = Number(amountRaw)
      let cancelled = false

      ;(async () => {
        setBanner('결제 승인 처리 중...')
        const result = await confirmTossPayment({ paymentKey, orderId, amount })
        if (cancelled) return
        if (result.error) {
          setBanner(result.error)
        } else {
          await refresh()
          setBanner(result.message ?? '구독이 활성화되었습니다.')
        }
        clearQuery()
      })()

      return () => {
        cancelled = true
      }
    }
  }, [authLoading, user, refresh])

  if (!banner) return null

  return (
    <div className="toss-return-banner" role="status">
      <p>{banner}</p>
      <button type="button" onClick={() => setBanner(null)}>
        닫기
      </button>
    </div>
  )
}
