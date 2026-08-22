import { supabase } from '../lib/supabase'
import type { OrderBuyer } from '../data/orderBuyer'
import { normalizeBuyer } from '../data/orderBuyer'

export type StoreOrder = {
  order_id: string
  user_id: string
  amount: number
  product: string
  product_name: string | null
  quantity: number
  status: string
  fulfillment_status: string
  buyer_name: string | null
  buyer_email: string | null
  buyer_phone: string | null
  receipt_no: string | null
  payment_key: string | null
  paid_at: string | null
  created_at: string
  refunded_at?: string | null
  fail_code?: string | null
  fail_message?: string | null
  admin_note?: string | null
  book_format?: string | null
  ship_zip?: string | null
  ship_address1?: string | null
  ship_address2?: string | null
  ship_receiver?: string | null
  order_sheet?: Record<string, unknown> | null
}

export type OrderEvent = {
  id: string
  order_id: string
  event_type: string
  payload: Record<string, unknown>
  created_at: string
}

export async function loadBuyerProfile(userId: string, fallbackEmail = ''): Promise<OrderBuyer> {
  if (!supabase) return { name: '', email: fallbackEmail, phone: '', zip: '', address1: '', address2: '', receiverName: '' }
  const { data } = await supabase.from('buyer_profiles').select('*').eq('user_id', userId).maybeSingle()
  return {
    name: (data?.name as string) || '',
    email: (data?.email as string) || fallbackEmail,
    phone: (data?.phone as string) || '',
    zip: (data?.zip as string) || '',
    address1: (data?.address1 as string) || '',
    address2: (data?.address2 as string) || '',
    receiverName: (data?.receiver_name as string) || '',
  }
}

export async function saveBuyerProfile(userId: string, buyer: OrderBuyer): Promise<void> {
  if (!supabase) return
  const next = normalizeBuyer(buyer)
  const payload: Record<string, string> = {
    user_id: userId,
    name: next.name,
    email: next.email,
    phone: next.phone,
    updated_at: new Date().toISOString(),
  }
  if (next.zip != null) payload.zip = next.zip
  if (next.address1 != null) payload.address1 = next.address1
  if (next.address2 != null) payload.address2 = next.address2
  if (next.receiverName != null) payload.receiver_name = next.receiverName
  const { error } = await supabase.from('buyer_profiles').upsert(payload)
  if (error && !/column|schema cache/i.test(error.message)) throw new Error(error.message)
}

export async function fetchStoreOrder(orderId: string): Promise<StoreOrder | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('payment_orders').select('*').eq('order_id', orderId).maybeSingle()
  if (error) throw new Error(friendlyDbError(error.message))
  return (data as StoreOrder | null) ?? null
}

export async function fetchOrderEvents(orderId: string): Promise<OrderEvent[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('order_events')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return []
    throw new Error(friendlyDbError(error.message))
  }
  return (data as OrderEvent[]) || []
}

export async function fetchAdminOrders(): Promise<StoreOrder[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('payment_orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300)
  if (error) throw new Error(friendlyDbError(error.message))
  return (data as StoreOrder[]) || []
}

export async function saveAdminNote(orderId: string, note: string): Promise<void> {
  if (!supabase) throw new Error('Supabase가 설정되지 않았습니다.')
  const { error } = await supabase
    .from('payment_orders')
    .update({ admin_note: note.slice(0, 2000) })
    .eq('order_id', orderId)
  if (error) throw new Error(friendlyDbError(error.message))
}

function friendlyDbError(message: string) {
  if (/permission denied|row-level security|rls/i.test(message)) {
    return '이 계정의 관리자 권한이 주문 조회를 허용하지 않습니다. admin_users 등록을 확인해 주세요.'
  }
  if (/column .* does not exist/i.test(message)) {
    return '주문 테이블 업데이트가 필요합니다. supabase/orders.sql 과 admin_orders.sql 을 실행해 주세요.'
  }
  return message
}
