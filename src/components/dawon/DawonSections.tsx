import { useEffect, useState } from 'react'
import { getRandomDawonShort } from '../../data/dawonShorts'

export function Metrics() {
  return (
    <section className="metrics" aria-label="플랫폼 콘텐츠 구조">
      <div className="wrap">
        <div className="metric-grid">
          <div className="metric">
            <strong>50권</strong>
            <span>전자책의 50개 길</span>
          </div>
          <div className="metric">
            <strong>365일</strong>
            <span>매일 한 가지 실천</span>
          </div>
          <div className="metric">
            <strong>1~3분</strong>
            <span>짧게 듣고 읽는 콘텐츠</span>
          </div>
          <div className="metric">
            <strong>1,000곡</strong>
            <span>음악 콘텐츠로 확장</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Formula() {
  return (
    <section className="section-tight">
      <div className="wrap">
        <div className="formula">
          <div>
            <span
              className="eyebrow"
              style={{ background: 'rgba(255,255,255,.1)', borderColor: 'rgba(255,255,255,.2)', color: 'white' }}
            >
              다원 생활설계 공식
            </span>
            <h2 style={{ marginTop: 16 }}>
              AI가 대신 결정하지 않습니다.
              <br />
              내가 나를 확인하도록 돕습니다.
            </h2>
            <p>기록하고, 묻고, 선택하고, 작은 행동을 실천하는 과정의 주인공은 사용자 자신입니다.</p>
          </div>
          <div className="formula-flow" aria-label="생활설계 순환">
            <span>확인</span>
            <span>→</span>
            <span>협의</span>
            <span>→</span>
            <span>실천</span>
            <span>→</span>
            <span>기록</span>
            <span>→</span>
            <span>개선</span>
          </div>
        </div>
      </div>
    </section>
  )
}

const STEPS = [
  { num: '1', title: '오늘 한 일', desc: '실제로 한 행동을 하나만 적습니다.' },
  { num: '2', title: '지금 감정', desc: '기쁨·걱정·화·피곤함처럼 마음에 이름을 붙입니다.' },
  { num: '3', title: '지금 원하는 것', desc: '나는 무엇을 원하고, 왜 원하는지 짧게 확인합니다.' },
  { num: '4', title: '내일 한 가지', desc: '할 수 있는 가장 작은 다음 행동을 정합니다.' },
  { num: '5', title: '나에게 한마디', desc: '칭찬·위로·감사·반성 중 필요한 말을 고릅니다.' },
]

export function DailySteps() {
  return (
    <section className="section" id="daily-intro">
      <div className="wrap">
        <div className="section-head">
          <div className="copy">
            <span className="eyebrow">오늘 3분</span>
            <h2 style={{ marginTop: 16 }}>복잡한 하루도 다섯 번의 확인으로 정리합니다.</h2>
          </div>
          <p>처음부터 긴 일기를 쓰지 않습니다. 오늘의 나를 짧게 확인하고, 가장 작은 다음 행동 하나를 정합니다.</p>
        </div>

        <div className="steps">
          {STEPS.map((step) => (
            <article key={step.num} className="card step-card">
              <div className="step-num">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </article>
          ))}
        </div>

        <div className="cta-actions" style={{ marginTop: 28, justifyContent: 'center' }}>
          <a className="btn btn-primary" href="#daily">
            다원 하루설계 3분 기록 하기
          </a>
        </div>
      </div>
    </section>
  )
}

export function AiSection() {
  return (
    <section className="section" id="ai">
      <div className="wrap">
        <div className="ai-grid">
          <article className="card ai-copy">
            <span className="eyebrow">AI 개인맞춤</span>
            <h2 style={{ marginTop: 16 }}>50권을 직접 찾지 않아도, 오늘 필요한 한 페이지를 만납니다.</h2>
            <p style={{ marginTop: 18 }}>
              사용자가 선택한 감정·상황·원하는 것·사용 가능한 시간을 바탕으로 다원작가 콘텐츠에서 오늘의 한 문장, 한
              콘텐츠, 한 실천을 연결합니다.
            </p>
            <ul className="check-list">
              <li>감정을 단정하지 않고 사용자가 직접 선택하게 합니다.</li>
              <li>추천 이유를 한 줄로 설명합니다.</li>
              <li>“해볼게요·나중에·다른 추천” 중 사용자가 결정합니다.</li>
              <li>7일 기록을 바탕으로 다음 주의 작은 실천을 제안합니다.</li>
            </ul>
          </article>

          <article className="personal-card">
            <div className="personal-top">
              <div>
                <small>오늘의 다원 생활설계</small>
                <h3 style={{ marginTop: 7, fontSize: '1.7rem' }}>지금은 새 목표보다 마음을 정리할 시간입니다.</h3>
              </div>
              <span className="personal-chip">걱정 · 3분</span>
            </div>

            <div className="personal-box">
              <strong>지금의 나</strong>
              <p>오늘 기록에서는 피곤함과 걱정이 함께 보입니다. 먼저 해야 할 일을 줄여보는 것이 좋겠습니다.</p>
            </div>
            <div className="personal-box">
              <strong>오늘의 한 줄</strong>
              <p>“모든 것을 끝내지 않아도 괜찮다. 오늘 하나면 충분하다.”</p>
            </div>
            <div className="personal-box">
              <strong>오늘의 콘텐츠</strong>
              <p>《마음을 정리하는 시간》 중 ‘더할 것과 뺄 것’ 1쪽 · 오디오 2분</p>
            </div>
            <div className="personal-box">
              <strong>오늘의 작은 실천</strong>
              <p>지금 해야 할 일 중 오늘 하지 않아도 되는 것 하나를 미뤄두기</p>
            </div>

            <div className="choice-row">
              <button className="btn btn-primary btn-small" type="button">
                해볼게요
              </button>
              <button className="btn btn-soft btn-small" type="button">
                나중에
              </button>
              <button className="btn btn-soft btn-small" type="button">
                다른 추천
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

const ROUTES = [
  {
    icon: '🌧',
    title: '불안 → 안전의 통로',
    desc: '실제 위험과 걱정을 나누고, 지금 통제할 수 있는 행동 하나를 찾습니다.',
    flow: '확인 → 구분 → 준비',
  },
  {
    icon: '🧩',
    title: '막막함 → 작은 시작의 통로',
    desc: '문제를 한 줄로 적고, 3분 안에 가능한 첫 행동으로 줄입니다.',
    flow: '메모 → 분해 → 시작',
  },
  {
    icon: '🌱',
    title: '상처 → 회복의 통로',
    desc: '자기비난보다 지금 필요한 보호·거리·도움을 확인합니다.',
    flow: '이름 붙이기 → 경계 → 회복',
  },
  {
    icon: '💬',
    title: '갈등 → 대화의 통로',
    desc: '사실·느낌·욕구·요청을 나누어 관계의 다음 문장을 찾습니다.',
    flow: '관찰 → 욕구 → 요청',
  },
  {
    icon: '🪙',
    title: '돈 걱정 → 생활경제의 통로',
    desc: '불안을 키우는 숫자보다 오늘 확인할 수입·지출·우선순위를 봅니다.',
    flow: '확인 → 분류 → 선택',
  },
  {
    icon: '🧭',
    title: '미래 걱정 → 배움의 통로',
    desc: '바꿀 수 없는 미래 대신 오늘 배울 한 가지와 시험할 한 가지를 정합니다.',
    flow: '질문 → 학습 → 작은 실험',
  },
]

export function RoutesSection() {
  return (
    <section className="section" id="routes">
      <div className="wrap">
        <div className="section-head">
          <div className="copy">
            <span className="eyebrow">다원만의 차별화 기능</span>
            <h2 style={{ marginTop: 16 }}>오늘의 통로 — 막힌 곳에서 다음 행동으로</h2>
          </div>
          <p>감정만 보여주고 끝내지 않습니다. 현재 상태를 확인한 뒤 지금 통과할 수 있는 작은 길을 연결합니다.</p>
        </div>

        <div className="route-grid">
          {ROUTES.map((route) => (
            <article key={route.title} className="card route-card">
              <div className="route-icon">{route.icon}</div>
              <h3>{route.title}</h3>
              <p>{route.desc}</p>
              <small>{route.flow}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function LibrarySection() {
  function openRandomShort() {
    const short = getRandomDawonShort()
    window.open(short.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="section" id="library">
      <div className="wrap">
        <div className="section-head">
          <div className="copy">
            <span className="eyebrow">다원 라이브러리</span>
            <h2 style={{ marginTop: 16 }}>콘텐츠는 많게, 오늘의 선택은 가볍게.</h2>
          </div>
          <p>AI는 사용자가 모든 자료를 뒤지게 하지 않습니다. 지금 필요한 형식과 시간에 맞춰 하나씩 연결합니다.</p>
        </div>

        <div className="library-grid">
          <a className="card library-card library-card-link" href="#paths" aria-label="전자책 — 50개의 길로 이동">
            <div className="icon">📚</div>
            <h3>전자책</h3>
            <p>50개의 길을 주제별로 읽고, 필요한 한 페이지부터 시작합니다.</p>
            <span className="library-go">50개의 길 보기 →</span>
          </a>
          <a className="card library-card library-card-link" href="#audiobook" aria-label="오디오북 페이지로 이동">
            <div className="icon">🎧</div>
            <h3>오디오북</h3>
            <p>텍스트 파일을 올리면 읽어 드립니다. 걷기·청소·휴식 중에도 들을 수 있습니다.</p>
            <span className="library-go">오디오북 열기 →</span>
          </a>
          <button
            type="button"
            className="card library-card library-card-link"
            onClick={openRandomShort}
            aria-label="다원작가 Shorts 중 랜덤 30초 노래 듣기"
          >
            <div className="icon">🎵</div>
            <h3>30초 노래</h3>
            <p>다원작가 YouTube Shorts 중 한 곡을 무작위로 듣습니다.</p>
            <span className="library-go">랜덤 Shorts 듣기 →</span>
          </button>
          <article className="card library-card library-card-soon">
            <div className="icon">🃏</div>
            <h3>카드·만화</h3>
            <p>감정카드, 365 실천카드, 가족대화카드, 만화전자책을 연결합니다.</p>
            <span className="library-go">준비 중</span>
          </article>
        </div>
      </div>
    </section>
  )
}

export function ReportSection() {
  return (
    <section className="section" id="report">
      <div className="wrap">
        <div className="section-head">
          <div className="copy">
            <span className="eyebrow">7일 자기확인 리포트</span>
            <h2 style={{ marginTop: 16 }}>평가보다 흐름을 봅니다.</h2>
          </div>
          <p>“잘했다·못했다”보다 어떤 감정과 행동이 반복되었는지 사용자가 스스로 볼 수 있게 정리합니다.</p>
        </div>

        <div className="report-grid">
          <article className="card report-preview">
            <div className="report-head">
              <div>
                <small className="muted">이번 주의 나</small>
                <h3 style={{ fontSize: '1.7rem', marginTop: 6 }}>피곤함 속에서도 걷기와 정리를 이어갔습니다.</h3>
              </div>
              <span className="tag">7일</span>
            </div>

            <div className="bar-list">
              <div className="bar-row">
                <span>피곤함</span>
                <div className="bar">
                  <span style={{ width: '82%' }} />
                </div>
                <strong>4회</strong>
              </div>
              <div className="bar-row">
                <span>감사</span>
                <div className="bar">
                  <span style={{ width: '58%' }} />
                </div>
                <strong>3회</strong>
              </div>
              <div className="bar-row">
                <span>걷기</span>
                <div className="bar">
                  <span style={{ width: '72%' }} />
                </div>
                <strong>4회</strong>
              </div>
              <div className="bar-row">
                <span>글쓰기</span>
                <div className="bar">
                  <span style={{ width: '28%' }} />
                </div>
                <strong>1회</strong>
              </div>
            </div>
          </article>

          <article className="card report-note">
            <span className="eyebrow">다음 주 제안</span>
            <h3 style={{ fontSize: '1.7rem', marginTop: 16 }}>글쓰기 목표를 더 작게 줄여보세요.</h3>
            <p className="muted" style={{ marginTop: 12 }}>
              30분 글쓰기 대신 “제목 한 줄 쓰기”로 시작하면 부담을 낮출 수 있습니다.
            </p>
            <div className="quote">“반복은 완벽함보다 오래 갑니다.”</div>
          </article>
        </div>
      </div>
    </section>
  )
}

export function AudienceSection() {
  return (
    <section className="section" id="audience">
      <div className="wrap">
        <div className="section-head">
          <div className="copy">
            <span className="eyebrow">개인·가족·기관</span>
            <h2 style={{ marginTop: 16 }}>한 사람의 오늘에서 가족과 공동체까지 확장합니다.</h2>
          </div>
          <p>개인 기록은 개인에게 안전하게 남기고, 가족·학교·기업에서는 공유할 것만 선택하는 구조를 권장합니다.</p>
        </div>

        <div className="audience-grid">
          <article className="card audience">
            <h3>개인</h3>
            <p>하루 3분 자기확인, AI 협의, 맞춤 콘텐츠, 7일 리포트.</p>
            <ul>
              <li>개인 기록과 달력</li>
              <li>감정·실천 흐름</li>
              <li>개인화 추천</li>
            </ul>
          </article>
          <article className="card audience">
            <h3>가족</h3>
            <p>부모자녀 대화카드와 가족회의를 연결하되 개인 기록은 분리합니다.</p>
            <ul>
              <li>가족 질문카드</li>
              <li>함께하는 실천</li>
              <li>공유 범위 선택</li>
            </ul>
          </article>
          <article className="card audience">
            <h3>학교·도서관·기업</h3>
            <p>방송용 오디오, 생활설계 교육, 단체 계정과 익명 통계로 확장합니다.</p>
            <ul>
              <li>기관용 콘텐츠</li>
              <li>교육 프로그램</li>
              <li>관리자 콘텐츠 CMS</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  )
}

export function TrustSection() {
  return (
    <section className="section" id="trust">
      <div className="wrap">
        <div className="section-head">
          <div className="copy">
            <span className="eyebrow">신뢰와 안전</span>
            <h2 style={{ marginTop: 16 }}>개인맞춤일수록 사용자가 통제할 수 있어야 합니다.</h2>
          </div>
          <p>감정과 생활 기록을 다루는 서비스이므로 기능만큼 데이터 통제와 AI 표현 원칙이 중요합니다.</p>
        </div>

        <div className="trust-grid">
          <article className="card trust-card">
            <h3>AI 기억을 사용자가 관리</h3>
            <p>개인화 켜기·끄기, 기억 항목 보기, 수정·삭제 기능을 제공합니다.</p>
          </article>
          <article className="card trust-card">
            <h3>진단보다 자기확인</h3>
            <p>“당신은 이런 사람입니다”가 아니라 “오늘 기록에서는 이런 흐름이 보입니다”라고 표현합니다.</p>
          </article>
          <article className="card trust-card">
            <h3>선택권이 있는 추천</h3>
            <p>추천 이유를 설명하고, 해볼게요·나중에·다른 추천 중 사용자가 고릅니다.</p>
          </article>
        </div>

        <div className="notice">
          <strong>안내:</strong> 다원 하루설계 AI는 의료·정신건강 진단이나 치료를 대신하지 않습니다. 사용자의
          자기확인과 생활실천을 돕는 콘텐츠·기록 도구로 설계하고, 위기 상황에서는 전문적인 도움을 받을 수 있는 안내
          경로를 별도로 마련하는 것이 좋습니다.
        </div>
      </div>
    </section>
  )
}

const FAQS = [
  {
    q: '다원 하루설계 AI는 무엇을 하는 서비스인가요?',
    a: '오늘 한 일·감정·원하는 것·다음 행동을 짧게 확인하고, 다원작가의 전자책·오디오북·노래·카드 중 지금 필요한 콘텐츠와 작은 실천을 연결하는 생활설계 플랫폼입니다.',
  },
  {
    q: 'AI가 제 감정을 진단하나요?',
    a: '아닙니다. AI는 감정을 단정하거나 의료적 진단을 내리는 역할이 아니라, 사용자가 자신의 상태를 확인할 수 있도록 질문과 선택지를 제안하는 보조 도구로 설계합니다.',
  },
  {
    q: '50권을 모두 읽어야 하나요?',
    a: '그럴 필요가 없습니다. 대표 1권은 전체 지도이고, 50권은 각각의 길입니다. 사용자는 지금 필요한 주제의 한 페이지·한 문장·한 오디오부터 시작할 수 있습니다.',
  },
  {
    q: '개인 기록은 어떻게 관리하나요?',
    a: '정식 서비스에서는 기록 보기·수정·삭제, 개인화 켜기·끄기, AI가 기억하는 항목 보기와 삭제처럼 사용자가 자신의 데이터를 통제할 수 있는 기능을 우선 제공합니다.',
  },
  {
    q: '가족이나 기관에서도 사용할 수 있나요?',
    a: '개인 기록은 분리하고, 사용자가 공유를 선택한 질문카드·공용 실천·교육 콘텐츠만 함께 쓰는 방식으로 가족·학교·도서관·기업용 확장을 계획할 수 있습니다.',
  },
]

export function FaqSection() {
  return (
    <section className="section" id="faq">
      <div className="wrap">
        <div className="section-head">
          <div className="copy">
            <span className="eyebrow">자주 묻는 질문</span>
            <h2 style={{ marginTop: 16 }}>처음 방문한 사람도 바로 이해할 수 있게</h2>
          </div>
          <p>서비스의 역할과 AI 개인맞춤 방식, 기록 관리 원칙을 짧게 설명합니다.</p>
        </div>

        <div className="faq-list">
          {FAQS.map((faq) => (
            <details key={faq.q} className="faq">
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function StartCta() {
  return (
    <section className="section" id="start">
      <div className="wrap">
        <div className="cta">
          <h2>
            50권의 책과 365일의 실천이
            <br />
            한 사람의 오늘을 만나는 곳
          </h2>
          <p>
            읽고, 듣고, 쓰고, 확인하고, 실천하는 다원작가 콘텐츠를 AI가 오늘의 필요에 맞춰 연결하도록 설계합니다. 답을
            대신 결정하지 않고, 사용자가 자신의 길을 선택하도록 돕습니다.
          </p>
          <span className="status-badge">로그인·3분 기록·구독 체험 가능</span>
          <div className="cta-actions" style={{ marginTop: 18 }}>
            <a className="btn btn-light" href="#daily">
              지금 시작하기
            </a>
            <a className="btn btn-light" href="https://dawon84.com/" target="_blank" rel="noopener noreferrer">
              다원작가 홈페이지
            </a>
          </div>
          <div className="launch-note">
            가입 후 2주(14일) 무료 체험, 이후 월 12,900원 구독 또는 광고 시청으로 일부 기능을 이용할 수 있습니다. 웹
            결제는 토스페이먼츠로 연결 예정입니다.
          </div>
        </div>
      </div>
    </section>
  )
}

export function DawonFooter() {
  return (
    <footer>
      <div className="wrap footer-grid">
        <div>
          <strong style={{ color: 'var(--ink)' }}>다원 하루설계 AI</strong>
          <br />
          나를 확인하고, 나와 협의하고, 오늘 하나를 실천합니다.
        </div>
        <div className="footer-links">
          <a href="#daily">오늘 3분</a>
          <a href="#auth">로그인</a>
          <a href="#pricing">구독</a>
          <a href="#terms">이용약관</a>
          <a href="#privacy">개인정보처리방침</a>
          <span>© 2026 DAWON. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}

export function TopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 700)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      className={`top-btn ${visible ? 'show' : ''}`}
      aria-label="맨 위로 이동"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </button>
  )
}
