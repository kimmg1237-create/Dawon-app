import { supabase } from '../lib/supabase'
import type { PaymentOrderRow, RefundDecision } from '../data/refundPolicy'
import { evaluateRefund } from '../data/refundPolicy'

export async function fetchLatestPaidOrder(userId: string): Promise<PaymentOrderRow | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('payment_orders')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'paid')
    .order('paid_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as PaymentOrderRow | null) ?? null
}

export async function fetchPaymentOrders(userId: string): Promise<PaymentOrderRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('payment_orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw new Error(error.message)
  return (data as PaymentOrderRow[]) || []
}

/** Admin-only. RLS `Admins delete payment orders` enforces is_wish_admin(). */
export async function deletePaymentOrder(orderId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase가 설정되지 않았습니다.')
  const id = orderId.trim()
  if (!id) throw new Error('주문번호가 없습니다.')

  const { data: isAdmin, error: adminError } = await supabase.rpc('is_wish_admin')
  if (adminError) throw new Error(adminError.message)
  if (!isAdmin) throw new Error('관리자만 결제 내역을 삭제할 수 있습니다.')

  const { error, count } = await supabase
    .from('payment_orders')
    .delete({ count: 'exact' })
    .eq('order_id', id)

  if (error) throw new Error(error.message)
  if (count === 0) {
    throw new Error('삭제할 주문을 찾지 못했거나 권한이 없습니다.')
  }
}

export function getRefundDecision(
  order: PaymentOrderRow | null,
  contentFirstUsedAt: string | null | undefined,
): RefundDecision {
  return evaluateRefund({ order, contentFirstUsedAt })
}

export async function requestTossRefund(orderId: string, cancelReason: string) {
  if (!supabase) throw new Error('Supabase가 설정되지 않았습니다.')
  const { data, error } = await supabase.functions.invoke('cancel-toss-payment', {
    body: { orderId, cancelReason },
  })
  if (error) {
    const raw = error.message || '환불 요청 실패'
    if (/Failed to send|Failed to fetch|CORS|NetworkError|ERR_FAILED/i.test(raw)) {
      throw new Error(
        '환불 서버(cancel-toss-payment)에 연결하지 못했습니다. Edge Function 배포와 TOSS_SECRET_KEY를 확인해 주세요.',
      )
    }
    throw new Error(raw)
  }
  const payload = data as { error?: string; message?: string; amount?: number }
  if (payload?.error) throw new Error(payload.error)
  return payload
}
