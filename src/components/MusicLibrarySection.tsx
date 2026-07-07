import './ContentSections.css'

const LOOP_STEPS = [
  { icon: 'fa-brands fa-youtube', iconColor: '#ff0000', title: '유튜브 영상', desc: '쇼츠 및 감성 트래픽 유입 확보' },
  { icon: 'fa-solid fa-font', title: '노래가사', desc: '텍스트 공감 요소 웹 최적화' },
  { icon: 'fa-solid fa-book-open', title: '전자책', desc: '상황별 도서 라이브러리 연계' },
  { icon: 'fa-solid fa-search', iconColor: '#03cf5d', title: '네이버 자료', desc: '검색 최적화(SEO) 외부 유입 블록' },
]

export function MusicLibrarySection() {
  return (
    <section id="library">
      <h2 className="section-title">문화 음악도서관 Hub</h2>
      <p className="section-subtitle">
        유튜브 1000곡 가사, 50권 전자책/오디오북 및 네이버 검색 데이터를 유기적으로 연결합니다.
      </p>
      <div className="music-library-box">
        <div className="player-mockup">
          <div>
            <strong className="player-title">
              <i className="fa-solid fa-music" /> 오늘의 추천곡: 작아도 괜찮아
            </strong>
            <span className="player-subtitle">"걱정은 적어보고 마음 이름 불러봐"</span>
          </div>
          <button type="button" className="player-btn">
            <i className="fa-solid fa-play" /> 듣기 (30s)
          </button>
        </div>
        <h4 className="loop-heading">노래 한 곡의 7가지 상호 유기적 연결망 (OSMU)</h4>
        <div className="loop-system-grid">
          {LOOP_STEPS.map((step) => (
            <div key={step.title} className="loop-step">
              <i className={step.icon} style={step.iconColor ? { color: step.iconColor } : undefined} />{' '}
              <strong>{step.title}</strong>
              <br />
              {step.desc}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
