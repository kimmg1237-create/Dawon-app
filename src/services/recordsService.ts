import type { DayRecord, Emotion } from '../types'
import { getSupabase } from '../lib/supabase'

interface DayRecordRow {
  id: string
  user_id: string
  date: string
  task: string
  emotion: string
  next_task: string
  message: string
  created_at: string
  updated_at: string
}

function rowToRecord(row: DayRecordRow): DayRecord {
  return {
    id: row.id,
    date: row.date,
    task: row.task,
    emotion: row.emotion as Emotion,
    nextTask: row.next_task,
    message: row.message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchRecordsFromCloud(userId: string): Promise<DayRecord[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('day_records')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) throw error
  return (data as DayRecordRow[]).map(rowToRecord)
}

export async function upsertRecordToCloud(userId: string, record: DayRecord): Promise<DayRecord> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const payload = {
    id: record.id,
    user_id: userId,
    date: record.date,
    task: record.task,
    emotion: record.emotion,
    next_task: record.nextTask,
    message: record.message,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('day_records')
    .upsert(payload, { onConflict: 'user_id,date' })
    .select()
    .single()

  if (error) throw error
  return rowToRecord(data as DayRecordRow)
}

export async function deleteRecordFromCloud(id: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const { error } = await supabase.from('day_records').delete().eq('id', id)
  if (error) throw error
}

export async function mergeLocalRecordsToCloud(userId: string, localRecords: DayRecord[]): Promise<void> {
  if (localRecords.length === 0) return

  const supabase = getSupabase()
  if (!supabase) return

  const cloudRecords = await fetchRecordsFromCloud(userId)
  const cloudDates = new Set(cloudRecords.map((r) => r.date))

  const toUpload = localRecords.filter((r) => !cloudDates.has(r.date))
  if (toUpload.length === 0) return

  const rows = toUpload.map((r) => ({
    user_id: userId,
    date: r.date,
    task: r.task,
    emotion: r.emotion,
    next_task: r.nextTask,
    message: r.message,
  }))

  const { error } = await supabase.from('day_records').upsert(rows, { onConflict: 'user_id,date' })
  if (error) throw error
}
