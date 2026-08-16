/** 상품·환불·사업자 표시 정책 (약관·결제 UI 공통) */
export const PRODUCT_SPEC = {
  productName: '다원 하루설계 AI',
  monthlyPriceKrw: 12900,
  b2bPriceKrw: 990000,
  currency: 'KRW' as const,
  freeTrialDays: 30,
  subscriptionDays: 30,
  /** 전자상거래법 청약철회 기준(일) */
  coolingOffDays: 7,
  /** 환불 문의·접수 안내 이메일 */
  supportEmail: 'support@dawon84.com',
  autoRenew: false,
} as const

/** 사업자 정보 — 홈/푸터/약관 공통 */
export const BUSINESS_INFO = {
  companyName: '다원',
  representative: '안현인',
  businessNumber: '454-95-01878',
  address: '경기도 고양시 덕양구 신원로 55, 506/904',
  email: 'book8453@naver.com',
  phone: '02-6407-7778',
  mailOrderNumber: '제2024-고양덕양구-2619호',
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
