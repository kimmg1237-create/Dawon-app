const TRACKER_KEY = 'dawonSevenDayTracker_v5'

type TrackerDay = { status: string; emotion: string; note: string }
type TrackerPayload = {
  before?: number
  after?: number
  days?: TrackerDay[]
  reaction?: string
  decision?: string
  next?: string
  activeDay?: number
  savedAt?: string
}

function moodToEmotion(mood: string): string {
  const map: Record<string, string> = {
    기쁨: '기쁨',
    감사: '감사',
    평온: '편안함',
    피곤: '피곤함',
    불안: '불안',
    서운: '속상함',
    화남: '속상함',
  }
  return map[mood] || '자신감'
}

/** 오늘설계 한 줄을 7일 트래커 활성 일차에 심습니다. */
export function seedTrackerFromDay(record: {
  action?: string
  done?: string
  mood?: string
  tomorrow?: string
}): void {
  let data: TrackerPayload = {}
  try {
    data = JSON.parse(localStorage.getItem(TRACKER_KEY) || '{}') || {}
  } catch {
    data = {}
  }

  const days: TrackerDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = data.days?.[i]
    return {
      status: d?.status || '',
      emotion: d?.emotion || '',
      note: d?.note || '',
    }
  })

  const doneSet = new Set(['완료', '어려움', '중단', '쉬어감'])
  let idx = days.findIndex((d) => !doneSet.has(d.status))
  if (idx === -1) idx = 0

  const noteParts = [record.action, record.done].filter(Boolean)
  const note = noteParts.join(' · ').slice(0, 280)
  if (!days[idx].note && note) days[idx].note = note
  if (!days[idx].emotion && record.mood) days[idx].emotion = moodToEmotion(record.mood)
  if (!days[idx].status) days[idx].status = ''

  const next: TrackerPayload = {
    before: data.before ?? 5,
    after: data.after ?? 5,
    days,
    reaction: data.reaction || '',
    decision: data.decision || '유지한다',
    next: data.next || record.tomorrow || '',
    activeDay: idx,
    savedAt: new Date().toISOString(),
  }

  localStorage.setItem(TRACKER_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('dawon:tracker-seeded', { detail: { dayIndex: idx, note } }))
}
