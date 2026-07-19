import { Link, useNavigate } from 'react-router-dom'
import homeHero from '../newsite/sections/homeHero.html?raw'
import { useEffect, useRef } from 'react'
import { initStrategySite } from '../newsite/initStrategy'
import sharedChrome from '../newsite/sections/sharedChrome.html?raw'

const STARTS = [
  { to: '/quick-design', num: '01', title: '3분 설계', desc: '오늘 할 가장 작은 행동 하나를 카드로 만듭니다.' },
  { to: '/life-stage', num: '02', title: '생애단계', desc: '나의 단계·세부유형·집중 분야를 확인합니다.' },
  { to: '/strategy', num: '03', title: '통합전략', desc: '실행신호를 읽고 다음 행동을 고릅니다.' },
  { to: '/records', num: '04', title: '7일 기록', desc: '실행 결과와 감정 변화를 증거로 남깁니다.' },
  { to: '/library', num: '05', title: '라이브러리', desc: '전자책·오디오북·만화를 바로 엽니다.' },
  { to: '/operations', num: '06', title: '운영도구', desc: '팀·아이디어·전략·안전 실행안을 다룹니다.' },
]

export function HomePage() {
  const host = useRef<HTMLDivElement>(null)
  const done = useRef(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!host.current || done.current) return
    done.current = true
    host.current.innerHTML = `${homeHero}${sharedChrome}`
    host.current.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href') || ''
      const map: Record<string, string> = {
        '#quick-design': '/quick-design',
        '#life-stage': '/life-stage',
        '#integrated-strategy': '/strategy',
        '#trust': '/operations',
        '#home': '/',
      }
      const next = map[href] || (href.startsWith('/') ? href : '')
      if (!next) return
      a.setAttribute('href', next)
      a.addEventListener('click', (ev) => {
        const e = ev as MouseEvent
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        navigate(next)
      })
    })
    try {
      initStrategySite()
    } catch (e) {
      console.warn(e)
    }
  }, [navigate])

  return (
    <div>
      <div ref={host} />
      <section className="section soft">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">START HERE</div>
            <h2>독립 실행 페이지로 바로 들어가기</h2>
          </div>
          <div className="start-grid">
            {STARTS.map((s) => (
              <Link key={s.to} to={s.to} className="start-card">
                <span className="start-num">{s.num}</span>
                <b>{s.title}</b>
                <p>{s.desc}</p>
                <span className="arrow">열기 →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
