import { supabase } from '../lib/supabase'
import type { PayProduct } from '../data/productSpec'
import { productAmount } from '../data/productSpec'

export function generateOrderId(userId: string): string {
  const stamp = Date.now().toString(36)
  const safe = userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)
  return `dawon-${safe}-${stamp}`.slice(0, 64)
}

type CreateOrderResult = {
  orderId: string
  amount: number
  customerKey: string
  product: PayProduct
}

type ConfirmResult = {
  message: string
  orderId?: string
  paymentKey?: string
}

function friendlyInvokeError(name: string, error: { message?: string } | null): string {
  const raw = error?.message || '함수 호출 실패'
  if (/Failed to send|Failed to fetch|CORS|NetworkError|ERR_FAILED/i.test(raw)) {
    return (
      `결제 서버(${name})에 연결하지 못했습니다. ` +
      `Supabase Edge Function이 배포됐는지, TOSS_SECRET_KEY 시크릿이 설정됐는지 확인해 주세요.`
    )
  }
  return raw
}

async function invoke<T>(name: string, body: Record<string, unknown>): Promise<T> {
  if (!supabase) throw new Error('Supabase가 설정되지 않았습니다.')
  const { data, error } = await supabase.functions.invoke(name, { body })
  if (error) throw new Error(friendlyInvokeError(name, error))
  const payload = data as { error?: string; message?: string } & T
  if (payload?.error) throw new Error(payload.error)
  return payload
}

export async function createTossOrder(product: PayProduct, orderId: string): Promise<CreateOrderResult> {
  const amount = productAmount(product)
  return invoke<CreateOrderResult>('create-toss-order', { orderId, amount, product })
}

export async function confirmTossPayment(
  paymentKey: string,
  orderId: string,
  amount: number,
): Promise<ConfirmResult> {
  return invoke<ConfirmResult>('confirm-toss-payment', { paymentKey, orderId, amount })
}
