const TRACKER_KEY = 'dawonSevenDayTracker_v5'

export type TrackerDay = {
  status: string
  emotion: string
  note: string
  date?: string
}

export type TrackerWeek = {
  startDate: string
  days: TrackerDay[]
  before?: number
  after?: number
  reaction?: string
  decision?: string
  next?: string
}

export type TrackerPayload = {
  weeks?: TrackerWeek[]
  currentWeekIndex?: number
  activeDay?: number
  savedAt?: string
  /** legacy flat shape */
  before?: number
  after?: number
  days?: TrackerDay[]
  reaction?: string
  decision?: string
  next?: string
  weekStart?: string
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function toYMD(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseYMD(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function addDaysYMD(s: string, n: number): string {
  const d = parseYMD(s)
  d.setDate(d.getDate() + n)
  return toYMD(d)
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

function emptyDays(startDate: string): TrackerDay[] {
  return Array.from({ length: 7 }, (_, i) => ({
    status: '',
    emotion: '',
    note: '',
    date: addDaysYMD(startDate, i),
  }))
}

export function normalizeTracker(data: TrackerPayload = {}): {
  weeks: TrackerWeek[]
  currentWeekIndex: number
  activeDay: number
} {
  if (data.weeks?.length) {
    const weeks = data.weeks.map((w) => {
      const startDate = w.startDate || toYMD(new Date())
      return {
        startDate,
        before: w.before ?? 5,
        after: w.after ?? 5,
        reaction: w.reaction || '',
        decision: w.decision || '유지한다',
        next: w.next || '',
        days: Array.from({ length: 7 }, (_, i) => {
          const d = w.days?.[i] || {}
          return {
            status: d.status || '',
            emotion: d.emotion || '',
            note: d.note || '',
            date: d.date || addDaysYMD(startDate, i),
          }
        }),
      }
    })
    return {
      weeks,
      currentWeekIndex: Math.min(Math.max(0, data.currentWeekIndex ?? weeks.length - 1), weeks.length - 1),
      activeDay: data.activeDay ?? 0,
    }
  }

  const startDate = data.weekStart || toYMD(new Date())
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = data.days?.[i] || {}
    return {
      status: d.status || '',
      emotion: d.emotion || '',
      note: d.note || '',
      date: d.date || addDaysYMD(startDate, i),
    }
  })
  return {
    weeks: [
      {
        startDate,
        days,
        before: data.before ?? 5,
        after: data.after ?? 5,
        reaction: data.reaction || '',
        decision: data.decision || '유지한다',
        next: data.next || '',
      },
    ],
    currentWeekIndex: 0,
    activeDay: data.activeDay ?? 0,
  }
}

/** 오늘설계 한 줄을 7일 트래커 활성 일차에 심습니다. */
export function seedTrackerFromDay(record: {
  action?: string
  done?: string
  mood?: string
  tomorrow?: string
}): void {
  let raw: TrackerPayload = {}
  try {
    raw = JSON.parse(localStorage.getItem(TRACKER_KEY) || '{}') || {}
  } catch {
    raw = {}
  }

  const normalized = normalizeTracker(raw)
  const week = normalized.weeks[normalized.currentWeekIndex]
  const days = week.days
  const doneSet = new Set(['완료', '어려움', '중단', '쉬어감'])
  let idx = days.findIndex((d) => !doneSet.has(d.status))
  if (idx === -1) idx = 0

  const noteParts = [record.action, record.done].filter(Boolean)
  const note = noteParts.join(' · ').slice(0, 280)
  if (!days[idx].note && note) days[idx].note = note
  if (!days[idx].emotion && record.mood) days[idx].emotion = moodToEmotion(record.mood)
  if (!days[idx].status) days[idx].status = ''

  const next: TrackerPayload = {
    weeks: normalized.weeks,
    currentWeekIndex: normalized.currentWeekIndex,
    activeDay: idx,
    savedAt: new Date().toISOString(),
    // keep legacy mirrors for older readers
    before: week.before,
    after: week.after,
    days,
    reaction: week.reaction,
    decision: week.decision,
    next: week.next || record.tomorrow || '',
    weekStart: week.startDate,
  }
  if (record.tomorrow && !week.next) week.next = record.tomorrow

  localStorage.setItem(TRACKER_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('dawon:tracker-seeded', { detail: { dayIndex: idx, note } }))
}
