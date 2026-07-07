import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DayRecord, Emotion } from '../types'
import { dateKey } from '../utils/date'

const STORAGE_KEY = 'my-day-design-records'

function loadRecords(): DayRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as DayRecord[]) : []
  } catch {
    return []
  }
}

function saveRecords(records: DayRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

function calcStreak(records: DayRecord[]): number {
  if (records.length === 0) return 0

  const dates = new Set(records.map((r) => r.date))
  let streak = 0
  const cursor = new Date()

  while (dates.has(dateKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

function calcTopEmotion(records: DayRecord[]): Emotion | '—' {
  if (records.length === 0) return '—'

  const counts = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.emotion] = (acc[r.emotion] ?? 0) + 1
    return acc
  }, {})

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return (sorted[0]?.[0] as Emotion) ?? '—'
}

export type DayRecordsValue = ReturnType<typeof useDayRecords>

export function useDayRecords() {
  const [records, setRecords] = useState<DayRecord[]>(loadRecords)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  useEffect(() => {
    saveRecords(records)
  }, [records])

  const today = dateKey()
  const todayRecord = useMemo(() => records.find((r) => r.date === today) ?? null, [records, today])
  const hasRecordedToday = todayRecord !== null

  const recordDateSet = useMemo(() => new Set(records.map((r) => r.date)), [records])

  const monthRecords = useMemo(() => {
    const { year, month } = calendarMonth
    return records.filter((r) => {
      const [y, m] = r.date.split('-').map(Number)
      return y === year && m - 1 === month
    })
  }, [records, calendarMonth])

  const streak = useMemo(() => calcStreak(records), [records])
  const topEmotion = useMemo(() => calcTopEmotion(monthRecords), [monthRecords])

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => b.date.localeCompare(a.date)),
    [records],
  )

  const saveRecord = useCallback(
    (data: { task: string; emotion: Emotion; nextTask: string; message: string }) => {
      const date = today
      const existing = records.find((r) => r.date === date)

      const record: DayRecord = {
        id: existing?.id ?? crypto.randomUUID(),
        date,
        task: data.task,
        emotion: data.emotion,
        nextTask: data.nextTask,
        message: data.message,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setRecords((prev) => [record, ...prev.filter((r) => r.date !== date)])
      return record
    },
    [records, today],
  )

  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const getRecordByDate = useCallback(
    (date: string) => records.find((r) => r.date === date) ?? null,
    [records],
  )

  const prevMonth = useCallback(() => {
    setCalendarMonth(({ year, month }) => {
      if (month === 0) return { year: year - 1, month: 11 }
      return { year, month: month - 1 }
    })
  }, [])

  const nextMonth = useCallback(() => {
    setCalendarMonth(({ year, month }) => {
      if (month === 11) return { year: year + 1, month: 0 }
      return { year, month: month + 1 }
    })
  }, [])

  return {
    records: sortedRecords,
    todayRecord,
    hasRecordedToday,
    recordDateSet,
    monthRecords,
    monthCount: monthRecords.length,
    streak,
    topEmotion,
    calendarMonth,
    saveRecord,
    deleteRecord,
    getRecordByDate,
    prevMonth,
    nextMonth,
  }
}
