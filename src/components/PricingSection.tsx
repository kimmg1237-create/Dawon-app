import './ContentSections.css'

const PLANS = [
  {
    name: '무료 회원',
    price: '0원',
    period: '/ 평생',
    featured: false,
    items: ['오늘 한 일 / 할 일 기본 기록', '5종 기본 감정 선택 시스템', '기초 질문 카드 제공'],
  },
  {
    name: '월 구독 회원',
    price: '정기 구독',
    period: '/ 생활설계',
    featured: true,
    items: [
      '전자책 라이브러리 열람 권한',
      '오디오북 3분 스트리밍 반복 청취',
      '월간 종합 감정 분석 리포트 피드',
    ],
  },
  {
    name: '프리미엄 기관 회원',
    price: 'B2B 제휴',
    period: '/ 학교·기업',
    featured: false,
    items: [
      '전권 전자책 및 마스터 오디오 스트리밍',
      '학교/사내 방송용 3분 스크립트 라이선스',
      '개인 맞춤형 생활설계 PDF 리포트 발행',
    ],
  },
]

export function PricingSection() {
  return (
    <section id="pricing">
      <h2 className="section-title">앱 제작 및 구독 모델 레이어</h2>
      <p className="section-subtitle">
        간단한 오픈베타 기록 서비스로 시작하여 지속 가능한 구독형 콘텐츠 허브로 유연하게 빌드업합니다.
      </p>
      <div className="grid-3">
        {PLANS.map((plan) => (
          <div key={plan.name} className={`content-card pricing-card ${plan.featured ? 'featured' : ''}`}>
            {plan.featured && <span className="pricing-badge">추천</span>}
            <h4 className="pricing-name">{plan.name}</h4>
            <p className="pricing-price">
              {plan.price} <span>{plan.period}</span>
            </p>
            <ul className="pricing-list">
              {plan.items.map((item) => (
                <li key={item}>
                  <i className={`fa-solid fa-check ${plan.featured ? 'check-green' : ''}`} /> {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
