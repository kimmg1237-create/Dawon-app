/**
 * Single source of truth for brand, business, and public URLs.
 * Do not invent business numbers — values match live footer / productSpec.
 *
 * Business registration: 454-95-01876 (XXX-XX-XXXXX) — single source in siteConfig.
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
    /** Official format XXX-XX-XXXXX — do not change without verified source */
    businessNumber: '454-95-01876',
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
    ebooks: `${SITE_ORIGIN}/ebooks`,
    audiobooks: `${SITE_ORIGIN}/audiobooks`,
    comics: `${SITE_ORIGIN}/comics`,
    subscribe: `${SITE_ORIGIN}/subscribe`,
    login: `${SITE_ORIGIN}/login`,
    terms: `${SITE_ORIGIN}/terms`,
    privacy: `${SITE_ORIGIN}/privacy`,
    refund: `${SITE_ORIGIN}/refund`,
    author: `${SITE_ORIGIN}/#author`,
    guide: `${SITE_ORIGIN}/#first-taste`,
    youtube: 'https://www.youtube.com/@다원작가-y6i',
    /** Publisher / author site — not this product homepage */
    publisherSite: 'https://www.dawon53.com',
  },
  /** Absolute brand asset URLs (cache-bust when swapping files for crawlers) */
  assets: {
    logo: `${SITE_ORIGIN}/brand/dawon-logo.png?v=20260817a`,
    favicon: `${SITE_ORIGIN}/brand/site-icon.png?v=20260817a`,
    appleTouchIcon: `${SITE_ORIGIN}/brand/site-apple-touch.png?v=20260817a`,
    ogImage: `${SITE_ORIGIN}/brand/og-dawon84.png?v=20260816c`,
  },
  paths: {
    home: '/',
    today: '/today',
    school: '/school',
    create: '/create',
    library: '/library',
    ebooks: '/ebooks',
    audiobooks: '/audiobooks',
    comics: '/comics',
    subscribe: '/subscribe',
    login: '/login',
    terms: '/terms',
    privacy: '/privacy',
    refund: '/refund',
    /** Legacy — keep links working via redirect */
    refundLegacy: '/refund-policy',
    storeLegacy: '/store',
    profileLegacy: '/profile',
  },
  seoDefaults: {
    title: '다원 하루설계 | 오늘 바꿀 딱 한 가지',
    description:
      '하루 약 3분, 오늘을 확인하고 하나를 실천하며 결과에서 배워 내일을 설계하는 다원 하루설계입니다.',
    ogImage: `${SITE_ORIGIN}/brand/og-dawon84.png?v=20260816c`,
  },
  /** Per-route title + description (unique titles for SEO) */
  pages: {
    home: {
      title: '다원 하루설계 | 오늘 바꿀 딱 한 가지',
      description:
        '하루 약 3분, 오늘을 확인하고 하나를 실천하며 결과에서 배워 내일을 설계하는 다원 하루설계입니다.',
      path: '/',
    },
    today: {
      title: '1층 오늘설계 | 다원 하루설계',
      description: '오늘 바꿀 한 가지를 정하고, 3분 오늘설계와 정밀설계로 하루를 기록합니다.',
      path: '/today',
    },
    school: {
      title: '2층 365학교 | 다원 하루설계',
      description: '7일 실천부터 365일 생활방식까지, 쉬어도 다시 시작하는 생활습관학교입니다.',
      path: '/school',
    },
    create: {
      title: '3층 창작 | 다원 하루설계',
      description: '오늘의 기록을 글·노래·영상·전자책으로 확장하는 다원 창작스튜디오입니다.',
      path: '/create',
    },
    library: {
      title: '작품관 | 다원 하루설계',
      description: '다원작가의 전자책, 오디오북, 만화책을 한곳에서 만나보세요.',
      path: '/library',
    },
    ebooks: {
      title: '전자책 | 다원 하루설계',
      description: '다원작가의 전자책을 만나고 생활설계와 자기성장에 필요한 내용을 읽어보세요.',
      path: '/ebooks',
    },
    audiobooks: {
      title: '오디오북 | 다원 하루설계',
      description:
        '다원 성우 7명(창조상담·집중·공감·이해·희망·소망·통합)으로 오디오북을 낭독하고, 걷기와 휴식 시간에도 생활설계 콘텐츠를 들어 보세요.',
      path: '/audiobooks',
    },
    comics: {
      title: '만화책 | 다원 하루설계',
      description: '다원작가의 만화형 전자책을 보고 생활설계 이야기를 장면으로 만나보세요.',
      path: '/comics',
    },
    author: {
      title: '다원작가 소개 | 다원 하루설계',
      description: '다원작가의 작품과 자신과의 소통, 생활설계 활동을 소개합니다.',
      path: '/#author',
    },
    subscribe: {
      title: '스토어 | 다원 하루설계',
      description: '다원 하루설계 이용권과 결제·이용 안내를 확인하세요.',
      path: '/subscribe',
    },
    login: {
      title: '로그인 | 다원 하루설계',
      description: '다원 하루설계에 로그인하고 기록을 이어가세요.',
      path: '/login',
    },
    signup: {
      title: '회원가입 | 다원 하루설계',
      description: '다원 하루설계에 가입하고 오늘 설계를 시작하세요.',
      path: '/login',
    },
    terms: {
      title: '이용약관 | 다원 하루설계',
      description: '다원 하루설계 디지털 콘텐츠·기간제 이용권 서비스의 이용 조건입니다.',
      path: '/terms',
    },
    privacy: {
      title: '개인정보처리방침 | 다원 하루설계',
      description: '다원 하루설계 서비스의 개인정보 수집·이용·보관 기준을 안내합니다.',
      path: '/privacy',
    },
    refund: {
      title: '환불·청약철회 안내 | 다원 하루설계',
      description: '다원 하루설계 유료 이용권의 환불·청약철회·기간 종료형 해지 기준을 안내합니다.',
      path: '/refund',
    },
    notFound: {
      title: '페이지를 찾을 수 없습니다 | 다원 하루설계',
      description: '요청하신 페이지를 찾을 수 없습니다. 홈에서 다시 시작해 주세요.',
      path: '/',
    },
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
