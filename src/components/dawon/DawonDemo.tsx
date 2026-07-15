import { useState, type FormEvent } from 'react'

const EMOTIONS = ['걱정', '피곤함', '답답함', '감사', '설렘'] as const
const TIMES = ['3분', '10분', '30분'] as const

type DemoEmotion = (typeof EMOTIONS)[number]
type DemoTime = (typeof TIMES)[number]

const DEMO_ACTIONS: Record<DemoEmotion, string> = {
  걱정: '걱정되는 일을 한 문장으로 적고, 오늘 내가 할 수 있는 행동 하나에 동그라미를 쳐보세요.',
  피곤함: '새로운 일을 더하기보다 오늘 하지 않아도 되는 일 하나를 빼고 잠깐 쉬어보세요.',
  답답함: '문제를 해결하려 하기 전에 “지금 막힌 것은 무엇인가?”를 한 줄로 적어보세요.',
  감사: '오늘 고마웠던 사람이나 일 하나를 적고, 가능하면 짧게 표현해보세요.',
  설렘: '하고 싶은 일을 가장 작은 첫 단계로 나누고 지금 바로 시작할 한 가지를 정해보세요.',
}

export function DawonDemo() {
  const [emotion, setEmotion] = useState<DemoEmotion>('걱정')
  const [time, setTime] = useState<DemoTime>('3분')
  const [issue, setIssue] = useState('')
  const [result, setResult] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const prefix = issue.trim()
      ? `“${issue.trim().slice(0, 42)}${issue.trim().length > 42 ? '…' : ''}”를 적어주셨군요. `
      : ''
    setResult(
      `${prefix}지금은 ${emotion}에 맞춰 ${time} 안에 할 수 있는 실천으로 시작해보세요. ${DEMO_ACTIONS[emotion]}`,
    )
  }

  return (
    <section className="section-tight" id="demo">
      <div className="wrap">
        <div className="section-head">
          <div className="copy">
            <span className="eyebrow">체험형 예시</span>
            <h2 style={{ marginTop: 16 }}>AI와 나의 협의, 이렇게 시작합니다.</h2>
          </div>
          <p>아래 예시는 브라우저 안에서만 작동하는 화면 시연입니다. 서버로 저장되지 않습니다.</p>
        </div>

        <div className="demo-shell">
          <aside className="card demo-side">
            <h3>오늘의 협의 질문</h3>
            <p>큰 해결보다 지금 할 수 있는 가장 작은 행동을 찾습니다.</p>
            <div className="personal-box">
              <strong>핵심 질문</strong>
              <p>
                나는 무엇을 원하는가?
                <br />
                왜 원하는가?
                <br />
                오늘 할 수 있는 것은 무엇인가?
              </p>
            </div>
          </aside>

          <form className="card demo-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="doneInput">오늘 한 일 또는 고민</label>
              <textarea
                id="doneInput"
                placeholder="예: 운동을 해야 하는데 계속 미루고 있습니다."
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
              />
            </div>

            <div className="field">
              <label>지금 감정</label>
              <div className="chips">
                {EMOTIONS.map((chip) => (
                  <button
                    key={chip}
                    className={`chip-btn ${emotion === chip ? 'active' : ''}`}
                    type="button"
                    onClick={() => setEmotion(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>사용 가능한 시간</label>
              <div className="chips">
                {TIMES.map((chip) => (
                  <button
                    key={chip}
                    className={`chip-btn ${time === chip ? 'active' : ''}`}
                    type="button"
                    onClick={() => setTime(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" type="submit">
              오늘의 작은 실천 보기
            </button>

            <div className={`demo-result ${result ? 'show' : ''}`} aria-live="polite">
              <h4>오늘의 작은 실천</h4>
              <p>{result}</p>
            </div>
            <div className="privacy-note">
              ※ 실제 서비스에서는 사용자가 선택한 설정과 동의 범위 안에서만 개인화를 적용하도록 설계합니다.
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
