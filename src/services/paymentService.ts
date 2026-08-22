import { supabase } from '../lib/supabase'
import type { PayProduct } from '../data/productSpec'
import { productAmount } from '../data/productSpec'
import type { BookFormat, OrderBuyer } from '../data/orderBuyer'
import { normalizeBuyer } from '../data/orderBuyer'

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
  productName?: string
}

type ConfirmResult = {
  message: string
  orderId?: string
  paymentKey?: string
  product?: string
  productName?: string
  receiptNo?: string
  buyerName?: string
}

async function waitForAccessToken(retries = 8): Promise<string> {
  if (!supabase) throw new Error('Supabase가 설정되지 않았습니다.')

  for (let i = 0; i < retries; i++) {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (token) return token
    await new Promise((r) => setTimeout(r, 200 + i * 100))
  }

  throw new Error('로그인이 필요합니다. 로그인 후 결제 완료 페이지를 다시 열어 주세요.')
}

async function extractFunctionError(
  error: { message?: string; context?: Response } | null,
  data: unknown,
): Promise<string | null> {
  if (data && typeof data === 'object' && 'error' in data && typeof (data as { error: unknown }).error === 'string') {
    return (data as { error: string }).error
  }
  const ctx = error?.context
  if (ctx && typeof ctx.json === 'function') {
    try {
      const body = (await ctx.json()) as { error?: string; message?: string }
      if (body?.error) return body.error
      if (body?.message) return body.message
    } catch {
      /* ignore */
    }
  }
  return null
}

async function invoke<T>(name: string, body: Record<string, unknown>): Promise<T> {
  if (!supabase) throw new Error('Supabase가 설정되지 않았습니다.')

  const accessToken = await waitForAccessToken()
  const { data, error } = await supabase.functions.invoke(name, {
    body,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (error) {
    const detail = await extractFunctionError(error as { message?: string; context?: Response }, data)
    if (detail) throw new Error(detail)
    const raw = error.message || '함수 호출 실패'
    if (/Failed to send|Failed to fetch|CORS|NetworkError|ERR_FAILED/i.test(raw)) {
      throw new Error(
        `결제 서버(${name})에 연결하지 못했습니다. Edge Function 배포와 TOSS_SECRET_KEY를 확인해 주세요.`,
      )
    }
    throw new Error(raw)
  }

  const payload = data as { error?: string; message?: string } & T
  if (payload?.error) throw new Error(payload.error)
  return payload
}

export async function createTossOrder(
  product: PayProduct,
  orderId: string,
  buyer: OrderBuyer,
  extras?: { format?: BookFormat },
): Promise<CreateOrderResult> {
  const amount = productAmount(product)
  const next = normalizeBuyer(buyer)
  return invoke<CreateOrderResult>('create-toss-order', {
    orderId,
    amount,
    product,
    buyer: next,
    format: extras?.format || 'none',
    shipping: {
      zip: next.zip,
      address1: next.address1,
      address2: next.address2,
      receiverName: next.receiverName,
    },
  })
}

export async function recordOrderPaymentFail(orderId: string, failCode: string, failMessage: string) {
  return invoke<{ message?: string }>('create-toss-order', {
    action: 'fail',
    orderId,
    failCode,
    failMessage,
  })
}

export async function confirmTossPayment(
  paymentKey: string,
  orderId: string,
  amount: number,
): Promise<ConfirmResult> {
  return invoke<ConfirmResult>('confirm-toss-payment', { paymentKey, orderId, amount })
}
