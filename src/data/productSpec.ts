import { siteConfig } from './siteConfig'

/** 상품·환불·사업자 표시 정책 (약관·결제 UI 공통) — business fields from siteConfig */
export const PRODUCT_SPEC = {
  productName: siteConfig.product.serviceName,
  monthlyPriceKrw: siteConfig.product.monthlyPriceKrw,
  b2bPriceKrw: 990000,
  currency: 'KRW' as const,
  freeTrialDays: 7,
  subscriptionDays: 30,
  coolingOffDays: siteConfig.product.coolingOffDays,
  supportEmail: siteConfig.business.supportEmail,
  autoRenew: false,
} as const

export const BUSINESS_INFO = {
  companyName: siteConfig.business.companyName,
  representative: siteConfig.business.representative,
  businessNumber: siteConfig.business.businessNumber,
  address: siteConfig.business.address,
  email: siteConfig.business.email,
  phone: siteConfig.business.phone,
  mailOrderNumber: siteConfig.business.mailOrderNumber,
} as const

export type PayProduct = 'monthly' | 'b2b'

export function productAmount(product: PayProduct): number {
  return product === 'b2b' ? PRODUCT_SPEC.b2bPriceKrw : PRODUCT_SPEC.monthlyPriceKrw
}

export function productLabel(product: PayProduct): string {
  return product === 'b2b' ? '기관·B2B 이용권' : '월 구독 (30일)'
}

export function formatKrw(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`
}

export function formatDateKo(iso: string | null | undefined): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
