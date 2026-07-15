import { useMemo, useState } from 'react'

type HeroEmotion = '편안함' | '걱정' | '화남' | '피곤함'

const HERO_EMOTIONS: { value: HeroEmotion; label: string }[] = [
  { value: '편안함', label: '😊 편안함' },
  { value: '걱정', label: '🌧 걱정' },
  { value: '화남', label: '🔥 화남' },
  { value: '피곤함', label: '🌙 피곤함' },
]

const HERO_MAP: Record<HeroEmotion, { quote: string; title: string; text: string }> = {
  편안함: {
    quote: '오늘 한 일을 하나만 확인해도 충분합니다.',
    title: '오늘의 작은 실천',
    text: '오늘 잘한 일 하나를 한 줄로 적어보세요.',
  },
  걱정: {
    quote: '걱정을 모두 해결하지 않아도 됩니다. 먼저 하나만 적어보세요.',
    title: '오늘의 작은 실천',
    text: '지금 걱정되는 것과 내가 할 수 있는 것을 각각 한 줄로 나눠보세요.',
  },
  화남: {
    quote: '말하기 전에 감정의 이름부터 확인해도 늦지 않습니다.',
    title: '오늘의 작은 실천',
    text: '“나는 지금 화가 났다”라고 쓰고, 원하는 것을 한 단어로 적어보세요.',
  },
  피곤함: {
    quote: '쉬는 것도 확인한 선택이 될 수 있습니다.',
    title: '오늘의 작은 실천',
    text: '오늘 하지 않아도 되는 일 하나를 빼고 3분만 쉬어보세요.',
  },
}

export function DawonHero() {
  const [emotion, setEmotion] = useState<HeroEmotion>('편안함')
  const item = HERO_MAP[emotion]

  const today = useMemo(
    () =>
      new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }),
    [],
  )

  return (
    <header className="hero" id="top">
      <div className="wrap hero-grid">
        <div>
          <span className="eyebrow">🌿 자기확인 · 자기협의 · 생활실천</span>
          <h1>
            오늘을 확인하고,
            <br />
            나와 협의하고,
            <br />
            하나를 실천합니다.
          </h1>
          <p className="hero-lead">
            다원작가의 전자책·오디오북·노래·감정카드·365 실천카드를 한 사람의 오늘에 맞춰 연결하는 AI 개인맞춤형
            생활설계 플랫폼을 지향합니다.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#daily">
              오늘 3분 시작
            </a>
            <a className="btn btn-soft" href="#paths">
              50개의 길 보기
            </a>
          </div>
          <div className="hero-meta">
            <span>한 문장</span>
            <span>한 콘텐츠</span>
            <span>한 실천</span>
            <span>7일 리포트</span>
            <span>AI와 나의 협의</span>
          </div>
        </div>

        <div className="phone" aria-label="다원 하루설계 앱 화면 예시">
          <div className="phone-top">
            <span className="speaker" />
          </div>
          <div className="screen">
            <div className="screen-header">
              <div>
                <div className="date">{today}</div>
                <div className="question">오늘, 지금 마음은 어떤가요?</div>
              </div>
              <span className="streak">다시 시작 1일</span>
            </div>

            <div className="daily">
              <small>오늘의 한 줄</small>
              <p>{item.quote}</p>
            </div>

            <div className="emotion-grid" aria-label="감정 선택 예시">
              {HERO_EMOTIONS.map((emo) => (
                <button
                  key={emo.value}
                  type="button"
                  className={`emotion ${emotion === emo.value ? 'active' : ''}`}
                  onClick={() => setEmotion(emo.value)}
                >
                  {emo.label}
                </button>
              ))}
            </div>

            <div className="mini-reco">
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </div>

            <a className="btn btn-primary" href="#daily">
              오늘 3분 시작
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
