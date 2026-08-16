/**
 * Single source of truth for brand, business, and public URLs.
 * Do not invent business numbers — values match live footer / productSpec.
 */
export const SITE_ORIGIN = 'https://www.dawon84.com' as const

export const siteConfig = {
  brand: {
    mark: 'DAWON',
    nameKo: '다원 하루설계',
    full: 'DAWON | 다원 하루설계',
    headline: '오늘 바꿀 딱 한 가지',
    subline: '오늘을 확인하고, 하나를 실천하고, 결과에서 배워 내일을 설계합니다.',
    flow: '확인 → 실천 → 결과 → 배움 → 다음 설계',
    taglineEn: 'TODAY · PRACTICE · GROW',
    /** Publisher / legal entity label — use only where publisher is required */
    publisher: '다원',
  },
  product: {
    /** Display name for product/legal (avoid competing brand names) */
    serviceName: '다원 하루설계',
    monthlyPriceKrw: 12900,
    coolingOffDays: 7,
  },
  business: {
    companyName: '다원',
    representative: '안현인',
    businessNumber: '454-95-01878',
    mailOrderNumber: '제2024-고양덕양구-2619호',
    mailOrderAuthority: '덕양구 구청장',
    publishingCertificate: '395-251002011000040',
    publishingAuthority: '덕양구 구청장',
    address: '경기도 고양시 덕양구 신원로 55, 506/904',
    phone: '02-6407-7778',
    email: 'book8453@naver.com',
    supportEmail: 'support@dawon84.com',
  },
  urls: {
    origin: SITE_ORIGIN,
    home: `${SITE_ORIGIN}/`,
    library: `${SITE_ORIGIN}/library`,
    subscribe: `${SITE_ORIGIN}/subscribe`,
    login: `${SITE_ORIGIN}/login`,
    terms: `${SITE_ORIGIN}/terms`,
    privacy: `${SITE_ORIGIN}/privacy`,
    refund: `${SITE_ORIGIN}/refund`,
    youtube: 'https://www.youtube.com/@다원작가-y6i',
    /** Publisher / author site — not this product homepage */
    publisherSite: 'https://www.dawon53.com',
  },
  /** Absolute brand asset URLs (cache-bust when swapping files for crawlers) */
  assets: {
    logo: `${SITE_ORIGIN}/brand/dawon-logo.png?v=20260816`,
    favicon: `${SITE_ORIGIN}/brand/dawon-favicon.png?v=20260816`,
    appleTouchIcon: `${SITE_ORIGIN}/brand/apple-touch-icon.png?v=20260816`,
    ogImage: `${SITE_ORIGIN}/brand/og-dawon84.png?v=20260816`,
  },
  paths: {
    home: '/',
    library: '/library',
    subscribe: '/subscribe',
    login: '/login',
    terms: '/terms',
    privacy: '/privacy',
    refund: '/refund',
    /** Legacy — keep links working via redirect */
    refundLegacy: '/refund-policy',
  },
  seoDefaults: {
    title: '다원 하루설계 | 오늘 바꿀 딱 한 가지',
    description:
      '오늘 바꿀 딱 한 가지만 정하세요. 3분 기록, 7일 실천, 성장 확인까지 — 다원 하루설계.',
    ogImage: `${SITE_ORIGIN}/brand/og-dawon84.png?v=20260816`,
  },
} as const

export type SiteConfig = typeof siteConfig

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path
  const p = path.startsWith('/') ? path : `/${path}`
  return `${SITE_ORIGIN}${p}`
}

export function pageTitle(section: string): string {
  return `${section} | ${siteConfig.brand.nameKo}`
}
