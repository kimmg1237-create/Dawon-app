export type JourneyStep = 'life-stage' | 'quick-design' | 'records' | 'operations'

export type JourneyState = {
  active: boolean
  step: JourneyStep
  lifeStage?: string
  wishText?: string
  todayAction?: string
  successMetric?: string
  responseId?: string
  trackerNext?: string
  updatedAt?: string
}

export const JOURNEY_KEY = 'dawonJourney_v1'

export const JOURNEY_STEPS: {
  id: JourneyStep
  label: string
  path: string
}[] = [
  { id: 'life-stage', label: '계획방법', path: '/life-stage?journey=1' },
  { id: 'quick-design', label: '바람설계', path: '/quick-design?journey=1#survey' },
  { id: 'records', label: '7일 설계', path: '/records?journey=1' },
  { id: 'operations', label: '운영전략', path: '/operations?journey=1#strategy' },
]

const STEP_ORDER: JourneyStep[] = JOURNEY_STEPS.map((s) => s.id)

function empty(): JourneyState {
  return { active: false, step: 'life-stage' }
}

export function readJourney(): JourneyState {
  try {
    const raw = sessionStorage.getItem(JOURNEY_KEY)
    if (!raw) return empty()
    const parsed = JSON.parse(raw) as JourneyState
    if (!parsed || typeof parsed !== 'object') return empty()
    return {
      ...empty(),
      ...parsed,
      active: Boolean(parsed.active),
      step: STEP_ORDER.includes(parsed.step) ? parsed.step : 'life-stage',
    }
  } catch {
    return empty()
  }
}

export function writeJourney(next: JourneyState): JourneyState {
  const state: JourneyState = {
    ...next,
    updatedAt: new Date().toISOString(),
  }
  try {
    sessionStorage.setItem(JOURNEY_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('dawon:journey-changed', { detail: state }))
  return state
}

export function startJourney(step: JourneyStep = 'life-stage'): JourneyState {
  const prev = readJourney()
  return writeJourney({
    ...prev,
    active: true,
    step,
  })
}

export function ensureJourneyFromUrl(): JourneyState {
  const params = new URLSearchParams(window.location.search)
  const fromQuery = params.get('journey') === '1'
  const path = window.location.pathname
  const step = stepFromPath(path)
  if (fromQuery) {
    const prev = readJourney()
    return writeJourney({
      ...prev,
      active: true,
      step: step ?? prev.step ?? 'life-stage',
    })
  }
  return readJourney()
}

export function isJourneyActive(): boolean {
  if (readJourney().active) return true
  try {
    return new URLSearchParams(window.location.search).get('journey') === '1'
  } catch {
    return false
  }
}

export function patchJourney(patch: Partial<JourneyState>): JourneyState {
  const prev = readJourney()
  return writeJourney({
    ...prev,
    ...patch,
    active: typeof patch.active === 'boolean' ? patch.active : Boolean(prev.active),
  })
}

export function advanceJourney(step: JourneyStep): JourneyState {
  return patchJourney({ active: true, step })
}

export function clearJourney(): void {
  try {
    sessionStorage.removeItem(JOURNEY_KEY)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('dawon:journey-changed', { detail: empty() }))
}

export function stepFromPath(pathname: string): JourneyStep | null {
  if (pathname.startsWith('/life-stage')) return 'life-stage'
  if (pathname.startsWith('/quick-design') || pathname.startsWith('/survey')) return 'quick-design'
  if (pathname.startsWith('/records')) return 'records'
  if (pathname.startsWith('/operations')) return 'operations'
  return null
}

export function stepIndex(step: JourneyStep): number {
  return STEP_ORDER.indexOf(step)
}

export function journeyPath(step: JourneyStep): string {
  return JOURNEY_STEPS.find((s) => s.id === step)?.path || '/life-stage?journey=1'
}

/** 바람설계 제출 상세에서 여정 핸드오프 필드 채움 */
export function captureWishForJourney(item: {
  id?: string
  data?: Record<string, unknown>
}): JourneyState {
  const data = item.data || {}
  const firstAction = String(data.firstAction || '').trim()
  const wishText = String(data.wishText || '').trim()
  const successMetric = String(data.successMetric || '').trim()
  const lifeStage = String(data.lifeStage || '').trim()
  return patchJourney({
    active: true,
    step: 'quick-design',
    responseId: item.id,
    lifeStage: lifeStage || undefined,
    wishText: wishText || undefined,
    todayAction: firstAction || undefined,
    successMetric: successMetric || undefined,
  })
}
