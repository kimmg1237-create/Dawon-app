export const DAY_RECORDS_KEY = 'dawonDayRecords_v1'
export const DAY_AREAS = ['나', '건강', '관계', '배움', '도전', '미래', '돈', '생활', '창작', '사업'] as const
export const DAY_MOODS = ['기쁨', '감사', '평온', '피곤', '불안', '서운', '화남'] as const

export type DayArea = (typeof DAY_AREAS)[number]
export type DayMood = (typeof DAY_MOODS)[number]

export type DayRecord = {
  date: string
  done: string
  mood: string
  area: string
  energy: number
  action: string
  result: string
  tomorrow: string
  selfWord: string
  memo: string
  score: number
  savedAt: string
}

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

export function koDate(dateKey: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(`${dateKey}T12:00:00`))
}

export function scoreDay(d: Pick<DayRecord, 'done' | 'mood' | 'action' | 'result' | 'tomorrow' | 'selfWord' | 'memo'>): number {
  let score = 0
  if (d.done) score += 18
  if (d.mood) score += 12
  if (d.action) score += 22
  if (d.result) score += 18
  if (d.tomorrow) score += 18
  if (d.selfWord) score += 7
  if (d.memo) score += 5
  return Math.min(100, score)
}

export function summaryText(d: DayRecord): string {
  const parts = [`[${koDate(d.date)} · ${d.area || '나'}]`]
  parts.push(d.done ? `오늘 확인: ${d.done}` : '오늘 한 일을 아직 기록하지 않았습니다.')
  parts.push(d.mood ? `현재 감정: ${d.mood}, 에너지 ${d.energy}/10` : `현재 에너지: ${d.energy}/10`)
  parts.push(d.action ? `하나의 실천: ${d.action}` : '오늘의 작은 실천을 정해 보세요.')
  if (d.result) parts.push(`결과와 배움: ${d.result}`)
  parts.push(d.tomorrow ? `내일의 첫 행동: ${d.tomorrow}` : '내일 할 일을 한 가지 정해 보세요.')
  if (d.selfWord) parts.push(`나에게: ${d.selfWord}`)
  return parts.join('\n')
}

export function emptyDay(date = todayKey()): DayRecord {
  return {
    date,
    done: '',
    mood: '',
    area: '나',
    energy: 6,
    action: '',
    result: '',
    tomorrow: '',
    selfWord: '',
    memo: '',
    score: 0,
    savedAt: '',
  }
}

export function readLocalDayRecords(): DayRecord[] {
  try {
    const raw = JSON.parse(localStorage.getItem(DAY_RECORDS_KEY) || '[]')
    if (!Array.isArray(raw)) return []
    return raw
      .filter((x) => x && typeof x === 'object' && typeof x.date === 'string')
      .map((x) => ({
        ...emptyDay(x.date),
        ...x,
        energy: Number(x.energy) || 6,
        score: Number(x.score) || scoreDay(x),
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
  } catch {
    return []
  }
}

export function writeLocalDayRecords(records: DayRecord[]) {
  localStorage.setItem(DAY_RECORDS_KEY, JSON.stringify(records))
}

export function upsertLocalDayRecord(record: DayRecord): DayRecord[] {
  const next = { ...record, score: scoreDay(record), savedAt: new Date().toISOString() }
  const all = readLocalDayRecords()
  const idx = all.findIndex((r) => r.date === next.date)
  if (idx >= 0) all[idx] = next
  else all.unshift(next)
  all.sort((a, b) => b.date.localeCompare(a.date))
  writeLocalDayRecords(all)
  return all
}

export function deleteLocalDayRecord(date: string): DayRecord[] {
  const all = readLocalDayRecords().filter((r) => r.date !== date)
  writeLocalDayRecords(all)
  return all
}

export function calcStreak(records: DayRecord[]): number {
  if (!records.length) return 0
  const set = new Set(records.map((r) => r.date))
  const d = new Date()
  let n = 0
  for (let i = 0; i < 365; i++) {
    const k = d.toISOString().slice(0, 10)
    if (set.has(k)) {
      n += 1
      d.setDate(d.getDate() - 1)
    } else if (i === 0) {
      d.setDate(d.getDate() - 1)
    } else break
  }
  return n
}

export function areaCounts(records: DayRecord[]): Record<string, number> {
  const counts = Object.fromEntries(DAY_AREAS.map((a) => [a, 0])) as Record<string, number>
  records.forEach((r) => {
    const key = DAY_AREAS.includes(r.area as DayArea) ? r.area : '나'
    counts[key] = (counts[key] || 0) + 1
  })
  return counts
}
