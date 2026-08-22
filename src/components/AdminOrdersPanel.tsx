import { useEffect, useMemo, useState } from 'react'
import { formatDateKo, formatKrw } from '../data/productSpec'
import { formatPhone } from '../data/orderBuyer'
import { fulfillLabel, ORDER_EVENT_LABEL, orderStatusLabel } from '../data/orderStatus'
import {
  fetchAdminOrders,
  fetchOrderEvents,
  saveAdminNote,
  type OrderEvent,
  type StoreOrder,
} from '../services/orderService'

type StatusFilter = 'all' | 'paid' | 'pending' | 'failed' | 'refunded'

function matchesQuery(order: StoreOrder, q: string) {
  if (!q) return true
  const hay = [
    order.order_id,
    order.receipt_no,
    order.buyer_name,
    order.buyer_email,
    order.buyer_phone,
    order.product_name,
    order.product,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return hay.includes(q)
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function AdminOrdersPanel() {
  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [events, setEvents] = useState<OrderEvent[]>([])
  const [note, setNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  async function reload() {
    setError('')
    const list = await fetchAdminOrders()
    setOrders(list)
    return list
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void reload()
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : '주문을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const selected = orders.find((o) => o.order_id === selectedId) ?? null

  useEffect(() => {
    if (!selected) {
      setEvents([])
      setNote('')
      return
    }
    setNote(selected.admin_note || '')
    let cancelled = false
    void fetchOrderEvents(selected.order_id)
      .then((log) => {
        if (!cancelled) setEvents(log)
      })
      .catch(() => {
        if (!cancelled) setEvents([])
      })
    return () => {
      cancelled = true
    }
  }, [selected])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter((o) => (filter === 'all' ? true : o.status === filter) && matchesQuery(o, q))
  }, [orders, filter, query])

  const counts = useMemo(() => {
    const next = { all: orders.length, paid: 0, pending: 0, failed: 0, refunded: 0, amount: 0 }
    for (const o of orders) {
      if (o.status === 'paid') {
        next.paid += 1
        next.amount += o.amount || 0
      } else if (o.status === 'pending') next.pending += 1
      else if (o.status === 'failed') next.failed += 1
      else if (o.status === 'refunded') next.refunded += 1
    }
    return next
  }, [orders])

  async function onSaveNote() {
    if (!selected) return
    setSavingNote(true)
    setNotice('')
    try {
      await saveAdminNote(selected.order_id, note)
      setOrders((prev) => prev.map((o) => (o.order_id === selected.order_id ? { ...o, admin_note: note } : o)))
      setNotice('판매자 메모를 저장했습니다.')
    } catch (err) {
      setNotice(err instanceof Error ? err.message : '메모 저장에 실패했습니다.')
    } finally {
      setSavingNote(false)
    }
  }

  return (
    <section className="seller-orders">
      <div className="seller-toolbar">
        <div>
          <h2>주문관리</h2>
          <p>쿠팡 판매자센터처럼 검색·상태 필터·주문 상세를 한 화면에서 처리합니다.</p>
        </div>
        <button
          type="button"
          className="btn btn-soft"
          onClick={() => {
            setLoading(true)
            void reload()
              .catch((err) => setError(err instanceof Error ? err.message : '새로고침 실패'))
              .finally(() => setLoading(false))
          }}
        >
          새로고침
        </button>
      </div>

      <div className="seller-stats">
        {(
          [
            ['all', '전체', counts.all],
            ['paid', '결제완료', counts.paid],
            ['pending', '대기', counts.pending],
            ['failed', '실패', counts.failed],
            ['refunded', '환불', counts.refunded],
          ] as const
        ).map(([key, label, value]) => (
          <button
            key={key}
            type="button"
            className={`seller-stat${filter === key ? ' is-on' : ''}`}
            onClick={() => setFilter(key)}
          >
            <span>{label}</span>
            <strong>{value}</strong>
          </button>
        ))}
        <div className="seller-stat seller-stat-money">
          <span>결제완료 합계</span>
          <strong>{formatKrw(counts.amount)}</strong>
        </div>
      </div>

      <label className="seller-search">
        <span className="sr-only">주문 검색</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="주문번호, 영수증, 이름, 이메일, 연락처, 상품"
        />
      </label>

      {error ? <div className="subscribe-alert">{error}</div> : null}
      {notice ? <div className="admin-status">{notice}</div> : null}

      <div className={`seller-split${selected ? ' has-detail' : ''}`}>
        <div className="seller-table-wrap">
          {loading ? (
            <p className="seller-empty">주문 목록을 불러오는 중…</p>
          ) : filtered.length === 0 ? (
            <p className="seller-empty">해당 조건의 주문이 없습니다.</p>
          ) : (
            <table className="seller-table">
              <thead>
                <tr>
                  <th>주문</th>
                  <th>구매자</th>
                  <th>상품</th>
                  <th>금액</th>
                  <th>상태</th>
                  <th>일시</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr
                    key={o.order_id}
                    className={selectedId === o.order_id ? 'is-selected' : ''}
                    onClick={() => setSelectedId(o.order_id)}
                  >
                    <td>
                      <b>{o.receipt_no || '영수증 대기'}</b>
                      <small>{o.order_id}</small>
                    </td>
                    <td>
                      <b>{o.buyer_name || '미입력'}</b>
                      <small>{o.buyer_email || '-'}</small>
                    </td>
                    <td>{o.product_name || o.product}</td>
                    <td>{formatKrw(o.amount)}</td>
                    <td>
                      <span className={`seller-badge status-${o.status}`}>{orderStatusLabel(o.status)}</span>
                    </td>
                    <td>{formatDateKo(o.paid_at || o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <aside className="seller-detail" aria-live="polite">
          {!selected ? (
            <p className="seller-empty">왼쪽 주문을 선택하면 상세·구매자·처리 이력이 열립니다.</p>
          ) : (
            <>
              <div className="seller-detail-head">
                <h3>주문 상세</h3>
                <button type="button" className="btn btn-soft btn-small" onClick={() => setSelectedId(null)}>
                  닫기
                </button>
              </div>
              <p className="seller-detail-id">
                {selected.receipt_no || '-'} · {orderStatusLabel(selected.status)} · {fulfillLabel(selected.fulfillment_status)}
              </p>
              <dl className="seller-dl">
                <div>
                  <dt>상품</dt>
                  <dd>
                    {selected.product_name || selected.product} × {selected.quantity || 1}
                  </dd>
                </div>
                <div>
                  <dt>결제금액</dt>
                  <dd>{formatKrw(selected.amount)}</dd>
                </div>
                <div>
                  <dt>구매자</dt>
                  <dd>{selected.buyer_name || '-'}</dd>
                </div>
                <div>
                  <dt>이메일</dt>
                  <dd>
                    {selected.buyer_email ? (
                      <a href={`mailto:${selected.buyer_email}`}>{selected.buyer_email}</a>
                    ) : (
                      '-'
                    )}
                  </dd>
                </div>
                <div>
                  <dt>연락처</dt>
                  <dd>
                    {selected.buyer_phone ? (
                      <a href={`tel:${selected.buyer_phone}`}>{formatPhone(selected.buyer_phone)}</a>
                    ) : (
                      '-'
                    )}
                  </dd>
                </div>
                {selected.book_format && selected.book_format !== 'none' ? (
                  <div>
                    <dt>형태</dt>
                    <dd>{selected.book_format === 'paper' ? '종이책' : '전자책'}</dd>
                  </div>
                ) : null}
                {selected.ship_address1 ? (
                  <div>
                    <dt>배송지</dt>
                    <dd>
                      {selected.ship_receiver ? `${selected.ship_receiver} · ` : ''}
                      {selected.ship_zip ? `(${selected.ship_zip}) ` : ''}
                      {selected.ship_address1} {selected.ship_address2}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt>주문번호</dt>
                  <dd>
                    <code>{selected.order_id}</code>
                    <button
                      type="button"
                      className="seller-copy"
                      onClick={() =>
                        void copyText(selected.order_id).then((ok) => setNotice(ok ? '주문번호를 복사했습니다.' : '복사에 실패했습니다.'))
                      }
                    >
                      복사
                    </button>
                  </dd>
                </div>
                {selected.fail_message ? (
                  <div>
                    <dt>실패 사유</dt>
                    <dd>{selected.fail_message}</dd>
                  </div>
                ) : null}
              </dl>
              <label className="seller-note">
                판매자 메모
                <textarea
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="고객 문의, 재발송, 확인 사항"
                />
              </label>
              <button type="button" className="btn btn-primary" disabled={savingNote} onClick={() => void onSaveNote()}>
                {savingNote ? '저장 중…' : '메모 저장'}
              </button>
              <h4>처리 이력</h4>
              {events.length === 0 ? (
                <p className="seller-empty">아직 이력이 없습니다.</p>
              ) : (
                <ol className="order-timeline">
                  {events.map((ev) => (
                    <li key={ev.id}>
                      <b>{ORDER_EVENT_LABEL[ev.event_type] || ev.event_type}</b>
                      <span>{formatDateKo(ev.created_at)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
        </aside>
      </div>
    </section>
  )
}
