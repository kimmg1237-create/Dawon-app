import { PRODUCT_SPEC } from '../data/productSpec'

export function isTossConfigured(): boolean {
  const key = import.meta.env.VITE_TOSS_CLIENT_KEY?.trim() ?? ''
  if (!key || key.includes('여기에')) return false
  return key.startsWith('test_') || key.startsWith('live_')
}

/** 토스 customerKey: 2~50자 영문·숫자·-_.=@ */
export function toCustomerKey(userId: string): string {
  const cleaned = userId.replace(/[^a-zA-Z0-9\-_=.]/g, '').slice(0, 50)
  return cleaned.length >= 2 ? cleaned : `u_${cleaned.padEnd(2, '0')}`
}

export function createOrderId(): string {
  const id = crypto.randomUUID().replace(/-/g, '')
  return `dawon_${id}`.slice(0, 64)
}

export const MONTHLY_ORDER_NAME = `${PRODUCT_SPEC.productName} 월 구독`
export const MONTHLY_AMOUNT = PRODUCT_SPEC.monthlyPriceKrw
