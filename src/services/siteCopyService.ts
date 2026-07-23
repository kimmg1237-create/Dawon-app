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
  if (error || !data) {
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
