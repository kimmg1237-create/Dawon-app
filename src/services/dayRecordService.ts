import { supabase } from '../lib/supabase'
import {
  DAY_RECORDS_KEY,
  deleteLocalDayRecord,
  readLocalDayRecords,
  upsertLocalDayRecord,
  type DayRecord,
} from '../data/dayRecords'

function toRow(userId: string, record: DayRecord) {
  return {
    user_id: userId,
    date: record.date,
    task: record.action || record.done || '',
    emotion: record.mood || '',
    next_task: record.tomorrow || '',
    message: record.selfWord || '',
    payload: record,
    updated_at: new Date().toISOString(),
  }
}

function fromRow(row: {
  date: string
  task?: string
  emotion?: string
  next_task?: string
  message?: string
  payload?: DayRecord | null
}): DayRecord {
  if (row.payload && typeof row.payload === 'object' && row.payload.date) {
    return row.payload
  }
  return {
    date: row.date,
    done: row.task || '',
    mood: row.emotion || '',
    area: '나',
    energy: 6,
    action: row.task || '',
    result: '',
    tomorrow: row.next_task || '',
    selfWord: row.message || '',
    memo: '',
    score: 0,
    savedAt: '',
  }
}

export async function fetchDayRecords(userId: string): Promise<DayRecord[]> {
  if (!userId || !supabase) return readLocalDayRecords()
  const { data, error } = await supabase
    .from('day_records')
    .select('date,task,emotion,next_task,message,payload')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (error || !data) {
    console.warn('[day_records] fetch failed', error?.message)
    return readLocalDayRecords()
  }
  const remote = data.map(fromRow)
  // Merge: remote wins on same date
  const byDate = new Map(readLocalDayRecords().map((r) => [r.date, r]))
  remote.forEach((r) => byDate.set(r.date, r))
  const merged = [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date))
  localStorage.setItem(DAY_RECORDS_KEY, JSON.stringify(merged))
  return merged
}

export async function saveDayRecord(userId: string | null | undefined, record: DayRecord): Promise<DayRecord[]> {
  const local = upsertLocalDayRecord(record)
  window.dispatchEvent(new CustomEvent('dawon:day-saved', { detail: record }))
  if (!userId || !supabase) return local
  const { error } = await supabase.from('day_records').upsert(toRow(userId, record), {
    onConflict: 'user_id,date',
  })
  if (error) console.warn('[day_records] save failed', error.message)
  return local
}

export async function removeDayRecord(userId: string | null | undefined, date: string): Promise<DayRecord[]> {
  const local = deleteLocalDayRecord(date)
  if (!userId || !supabase) return local
  const { error } = await supabase.from('day_records').delete().eq('user_id', userId).eq('date', date)
  if (error) console.warn('[day_records] delete failed', error.message)
  return local
}
