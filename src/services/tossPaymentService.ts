import { loadTossPayments } from '@tosspayments/tosspayments-sdk'
import { getSupabase } from '../lib/supabase'
import {
  MONTHLY_AMOUNT,
  MONTHLY_ORDER_NAME,
  createOrderId,
  isTossConfigured,
} from '../lib/toss'
import { PRODUCT_SPEC } from '../data/productSpec'

function functionsBaseUrl(): string | null {
  const url = import.meta.env.VITE_SUPABASE_URL
  if (!url) return null
  return `${url.replace(/\/$/, '')}/functions/v1`
}

async function authHeader(): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export interface CreateOrderResult {
  orderId: string
  amount: number
  customerKey: string
  orderName: string
}

/** 서버에 pending 주문 생성 (금액 위변조 방지용) */
export async function createTossOrder(
  product: 'monthly' | 'b2b' = 'monthly',
): Promise<{ data?: CreateOrderResult; error?: string }> {
  const token = await authHeader()
  const base = functionsBaseUrl()
  if (!token || !base) return { error: '로그인이 필요합니다.' }

  const orderId = createOrderId()
  const amount = product === 'monthly' ? MONTHLY_AMOUNT : MONTHLY_AMOUNT // B2B는 추후 견적 금액

  const res = await fetch(`${base}/create-toss-order`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderId, amount, product }),
  })

  const body = (await res.json().catch(() => ({}))) as {
    error?: string
    orderId?: string
    amount?: number
    customerKey?: string
  }

  if (!res.ok) {
    return { error: body.error ?? `주문 생성 실패 (${res.status})` }
  }

  return {
    data: {
      orderId: body.orderId!,
      amount: body.amount!,
      customerKey: body.customerKey!,
      orderName: product === 'monthly' ? MONTHLY_ORDER_NAME : `${PRODUCT_SPEC.productName} B2B`,
    },
  }
}

/** 토스 결제창 요청 → success/fail URL로 리다이렉트 */
export async function requestTossCheckout(params: {
  customerKey: string
  orderId: string
  amount: number
  orderName: string
  customerEmail?: string
}): Promise<string | null> {
  if (!isTossConfigured()) {
    return 'VITE_TOSS_CLIENT_KEY가 없습니다. .env에 토스 클라이언트 키를 넣어주세요.'
  }

  const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY
  if (!clientKey) {
    return 'VITE_TOSS_CLIENT_KEY가 없습니다. .env에 토스 클라이언트 키를 넣어주세요.'
  }
  const tossPayments = await loadTossPayments(clientKey)
  const payment = tossPayments.payment({ customerKey: params.customerKey })

  const origin = window.location.origin
  // 쿼리로 결과 수신 후 App에서 승인 처리
  const successUrl = `${origin}/?payment=success`
  const failUrl = `${origin}/?payment=fail`

  try {
    await payment.requestPayment({
      method: 'CARD',
      amount: { currency: 'KRW', value: params.amount },
      orderId: params.orderId,
      orderName: params.orderName,
      successUrl,
      failUrl,
      customerEmail: params.customerEmail,
    })
    return null
  } catch (err) {
    const message = err instanceof Error ? err.message : '결제 요청이 취소되었거나 실패했습니다.'
    return message
  }
}

export async function confirmTossPayment(params: {
  paymentKey: string
  orderId: string
  amount: number
}): Promise<{ error?: string; message?: string }> {
  const token = await authHeader()
  const base = functionsBaseUrl()
  if (!token || !base) return { error: '로그인이 필요합니다.' }

  const res = await fetch(`${base}/confirm-toss-payment`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string }
  if (!res.ok) return { error: body.error ?? `결제 승인 실패 (${res.status})` }
  return { message: body.message ?? '구독이 활성화되었습니다.' }
}

export { isTossConfigured, MONTHLY_AMOUNT }
