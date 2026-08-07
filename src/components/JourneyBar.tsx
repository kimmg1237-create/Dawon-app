import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  clearJourney,
  ensureJourneyFromUrl,
  isJourneyActive,
  JOURNEY_STEPS,
  readJourney,
  stepFromPath,
  type JourneyState,
} from '../services/journeyService'
import './JourneyBar.css'

export function JourneyBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [state, setState] = useState<JourneyState>(() => readJourney())
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const next = ensureJourneyFromUrl()
    setState(next)
    setVisible(next.active || new URLSearchParams(location.search).get('journey') === '1')
  }, [location.pathname, location.search])

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<JourneyState>).detail
      setState(detail || readJourney())
      setVisible(isJourneyActive())
    }
    window.addEventListener('dawon:journey-changed', onChange)
    return () => window.removeEventListener('dawon:journey-changed', onChange)
  }, [])

  if (!visible) return null

  const current = stepFromPath(location.pathname) || state.step
  const currentIdx = JOURNEY_STEPS.findIndex((s) => s.id === current)

  function endJourney() {
    clearJourney()
    setVisible(false)
    navigate('/')
  }

  return (
    <div className="journey-bar" role="navigation" aria-label="원스톱 여정">
      <div className="journey-bar-inner container">
        <div className="journey-bar-label">
          <span className="journey-bar-kicker">원스톱 여정</span>
          <strong>계획방법 → 바람설계 → 7일 → 운영전략</strong>
        </div>
        <ol className="journey-bar-steps">
          {JOURNEY_STEPS.map((step, i) => {
            const done = i < currentIdx
            const active = i === currentIdx
            return (
              <li key={step.id} className={active ? 'active' : done ? 'done' : ''}>
                <Link to={step.path} aria-current={active ? 'step' : undefined}>
                  <b>{i + 1}</b>
                  <span>{step.label}</span>
                </Link>
              </li>
            )
          })}
        </ol>
        <button type="button" className="journey-bar-end" onClick={endJourney}>
          여정 종료
        </button>
      </div>
    </div>
  )
}
