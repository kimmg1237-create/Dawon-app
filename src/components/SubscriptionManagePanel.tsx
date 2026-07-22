import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../context/SubscriptionContext'
import { formatDateKo, formatKrw, PRODUCT_SPEC } from '../data/productSpec'
import type { PaymentOrderRow } from '../data/refundPolicy'
import {
  fetchLatestPaidOrder,
  fetchPaymentOrders,
  getRefundDecision,
  requestTossRefund,
} from '../services/refundService'

export function SubscriptionManagePanel() {
  const { user } = useAuth()
  const { subscription, statusLabel, refresh, scheduleCancel, undoCancel, premiumReason } =
    useSubscription()
  const [orders, setOrders] = useState<PaymentOrderRow[]>([])
  const [latestPaid, setLatestPaid] = useState<PaymentOrderRow | null>(null)
  const [busy, setBusy] = useState<'cancel' | 'resume' | 'refund' | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      try {
        const [list, paid] = await Promise.all([
          fetchPaymentOrders(user.id),
          fetchLatestPaidOrder(user.id),
        ])
        if (cancelled) return
        setOrders(list)
        setLatestPaid(paid)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : '결제 내역 조회 실패')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) return null

  const decision = getRefundDecision(latestPaid, subscription?.content_first_used_at)
  const isPaidActive = premiumReason === 'paid'

  async function onCancel() {
    if (!window.confirm('기간 종료형 해지를 신청할까요?\n남은 이용 기간까지는 콘텐츠를 이용할 수 있으며, 대금 환불은 되지 않습니다.')) {
      return
    }
    setBusy('cancel')
    setError('')
    setMessage('')
    try {
      await scheduleCancel()
      setMessage('기간 종료형 해지가 예약되었습니다. 만료일까지 이용할 수 있습니다.')
    } catch (err) {
      setError(err instanceof Error ? err.message : '해지 신청 실패')
    } finally {
      setBusy(null)
    }
  }

  async function onResume() {
    setBusy('resume')
    setError('')
    setMessage('')
    try {
      await undoCancel()
      setMessage('해지 예약이 취소되었습니다.')
    } catch (err) {
      setError(err instanceof Error ? err.message : '해지 철회 실패')
    } finally {
      setBusy(null)
    }
  }

  async function onRefund() {
    if (!latestPaid) return
    if (!decision.eligible) {
      setError(decision.reason)
      return
    }
    if (
      !window.confirm(
        `${formatKrw(decision.amount)} 전액 환불을 신청할까요?\n환불이 완료되면 유료 이용이 즉시 종료됩니다.`,
      )
    ) {
      return
    }
    setBusy('refund')
    setError('')
    setMessage('')
    try {
      const result = await requestTossRefund(
        latestPaid.order_id,
        '고객 청약철회(디지털 콘텐츠 미이용·철회기간 내)',
      )
      await refresh()
      if (user) {
        const paid = await fetchLatestPaidOrder(user.id)
        const list = await fetchPaymentOrders(user.id)
        setLatestPaid(paid)
        setOrders(list)
      }
      setMessage(result.message || '환불이 완료되었습니다.')
    } catch (err) {
      setError(err instanceof Error ? err.message : '환불 신청 실패')
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="subscribe-manage" aria-labelledby="subscribe-manage-title">
      <div className="subscribe-manage-head">
        <div>
          <div className="kicker">MY SUBSCRIPTION</div>
          <h3 id="subscribe-manage-title">구독 관리 · 해지 · 환불</h3>
        </div>
        <p>
          해지는 남은 기간 이용 후 종료입니다. 환불은{' '}
          <Link to="/refund-policy">환불·청약철회 정책</Link> 조건을 충족할 때만 가능합니다.
        </p>
      </div>

      <div className="subscribe-manage-grid">
        <div className="subscribe-manage-card">
          <h4>현재 상태</h4>
          <p className="subscribe-manage-strong">{statusLabel}</p>
          <ul className="subscribe-manage-meta">
            <li>만료·종료 예정: {formatDateKo(subscription?.expires_at)}</li>
            <li>체험 종료: {formatDateKo(subscription?.trial_ends_at)}</li>
            <li>
              콘텐츠 이용 개시:{' '}
              {subscription?.content_first_used_at
                ? formatDateKo(subscription.content_first_used_at)
                : '아직 없음'}
            </li>
            <li>
              기간 종료형 해지:{' '}
              {subscription?.cancel_at_period_end ? '예약됨' : '없음'}
            </li>
          </ul>
          {isPaidActive ? (
            subscription?.cancel_at_period_end ? (
              <button
                type="button"
                className="btn btn-light"
                disabled={busy !== null}
                onClick={() => void onResume()}
              >
                {busy === 'resume' ? '처리 중…' : '해지 예약 취소'}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-light"
                disabled={busy !== null}
                onClick={() => void onCancel()}
              >
                {busy === 'cancel' ? '처리 중…' : '기간 종료형 해지'}
              </button>
            )
          ) : (
            <p className="subscribe-manage-hint">유료 이용 중이 아니면 해지 대상이 없습니다.</p>
          )}
        </div>

        <div className="subscribe-manage-card">
          <h4>환불(청약철회)</h4>
          <p className="subscribe-manage-strong">{decision.title}</p>
          <p className="subscribe-manage-hint">{decision.reason}</p>
          {latestPaid ? (
            <ul className="subscribe-manage-meta">
              <li>주문번호: {latestPaid.order_id}</li>
              <li>결제금액: {formatKrw(latestPaid.amount)}</li>
              <li>결제일: {formatDateKo(latestPaid.paid_at)}</li>
            </ul>
          ) : null}
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy !== null || !decision.eligible}
            onClick={() => void onRefund()}
          >
            {busy === 'refund' ? '환불 처리 중…' : '환불 신청'}
          </button>
          <p className="subscribe-manage-hint">
            문의: {PRODUCT_SPEC.supportEmail} · <Link to="/refund-policy">정책 전문</Link>
          </p>
        </div>
      </div>

      {message ? <div className="subscribe-alert done">{message}</div> : null}
      {error ? (
        <div className="subscribe-alert" role="alert">
          {error}
        </div>
      ) : null}

      {orders.length > 0 ? (
        <div className="subscribe-orders">
          <h4>결제·환불 내역</h4>
          <div className="subscribe-orders-table-wrap">
            <table className="subscribe-orders-table">
              <thead>
                <tr>
                  <th>주문번호</th>
                  <th>상품</th>
                  <th>금액</th>
                  <th>상태</th>
                  <th>결제일</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.order_id}>
                    <td>
                      <code>{o.order_id}</code>
                    </td>
                    <td>{o.product}</td>
                    <td>{formatKrw(o.amount)}</td>
                    <td>{o.status}</td>
                    <td>{formatDateKo(o.paid_at || o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  )
}
