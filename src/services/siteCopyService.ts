import { supabase } from '../lib/supabase'
import { mergeSiteCopy, type SiteCopy } from '../data/siteCopyDefaults'

const COPY_ID = 'default'
const LOCAL_KEY = 'dawonSiteCopy_v1'

export async function fetchSiteCopy(): Promise<SiteCopy> {
  if (!supabase) {
    try {
      return mergeSiteCopy(JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null'))
    } catch {
      return mergeSiteCopy(null)
    }
  }
  const { data, error } = await supabase.from('site_copy').select('payload').eq('id', COPY_ID).maybeSingle()
  if (error) {
    // 테이블 미생성(PGRST205) 등은 기본/로컬 문구로 폴백
    if (error.code !== 'PGRST205' && !/Could not find the table/i.test(error.message)) {
      console.warn('[site_copy]', error.message)
    }
    try {
      return mergeSiteCopy(JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null'))
    } catch {
      return mergeSiteCopy(null)
    }
  }
  if (!data) {
    try {
      return mergeSiteCopy(JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null'))
    } catch {
      return mergeSiteCopy(null)
    }
  }
  return mergeSiteCopy(data.payload)
}

export async function saveSiteCopy(payload: SiteCopy): Promise<{ error?: string }> {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
  if (!supabase) return {}
  const { error } = await supabase.from('site_copy').upsert({
    id: COPY_ID,
    payload,
    updated_at: new Date().toISOString(),
  })
  return { error: error?.message }
}
