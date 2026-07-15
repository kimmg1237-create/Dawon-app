/**
 * 확정된 상품·결제 정책 (개발·약관·스토어 심사 공통 기준)
 * 웹 PG: 토스페이먼츠 | 앱: RevenueCat + Google/Apple IAP | DB: Supabase
 */
export const PRODUCT_SPEC = {
  productName: '다원 하루설계 AI',
  productNameEn: 'My Day Design AI',
  monthlyPriceKrw: 12900,
  currency: 'KRW',
  freeTrialDays: 14, // 가입 후 2주 무료
  afterTrial: {
    paid: true,
    adAlternative: true, // 광고 시청 등으로 무료 이용 가능
  },
  channels: {
    app: 'revenuecat_iap', // Google Play + App Store
    web: 'toss_payments',
    b2b: 'toss_payments', // B2B도 토스 결제 포함
  },
  launch: 'simultaneous_web_and_stores',
  siteUrl: 'https://dawon-app.vercel.app',
  brandUrl: 'https://dawon84.com/',
  business: {
    companyName: '다원',
    ceo: '안현인',
    businessNumber: '454-95-01878',
    mailOrderNumber: '제2024-고양덕양구-2619호',
    address: '경기도 고양시 덕양구 신원로 55, 506/904',
    email: 'book8453@naver.com',
    phone: '02-6407-7778',
  },
} as const
