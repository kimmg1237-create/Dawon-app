import { supabase } from '../lib/supabase'

export async function upsertQuickDesign(userId: string, payload: Record<string, unknown>) {
  if (!supabase) return { error: 'no-supabase' as const }
  const { error } = await supabase.from('user_quick_designs').upsert(
    {
      user_id: userId,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
  return { error }
}

export async function fetchQuickDesign(userId: string) {
  if (!supabase) return null
  const { data } = await supabase.from('user_quick_designs').select('payload').eq('user_id', userId).maybeSingle()
  return (data?.payload as Record<string, unknown>) || null
}

export async function upsertTracker(userId: string, payload: Record<string, unknown>) {
  if (!supabase) return { error: 'no-supabase' as const }
  const { error } = await supabase.from('user_trackers').upsert(
    {
      user_id: userId,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
  return { error }
}

export async function fetchTracker(userId: string) {
  if (!supabase) return null
  const { data } = await supabase.from('user_trackers').select('payload').eq('user_id', userId).maybeSingle()
  return (data?.payload as Record<string, unknown>) || null
}

export async function upsertLifeStagePref(userId: string, payload: Record<string, unknown>) {
  if (!supabase) return { error: 'no-supabase' as const }
  const { error } = await supabase.from('user_life_stage_prefs').upsert(
    {
      user_id: userId,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
  return { error }
}

export async function upsertOpsBundle(userId: string, kind: string, payload: unknown) {
  if (!supabase) return { error: 'no-supabase' as const }
  const { error } = await supabase.from('user_ops_data').upsert(
    {
      user_id: userId,
      kind,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,kind' },
  )
  return { error }
}

/** Migrate known localStorage keys once after login */
export async function migrateLocalDrafts(userId: string) {
  if (!supabase) return
  const flag = `dawonMigrated_${userId}`
  if (localStorage.getItem(flag) === '1') return

  const quick = localStorage.getItem('dawonQuickDesign_v5')
  if (quick) {
    try {
      await upsertQuickDesign(userId, JSON.parse(quick))
    } catch {
      /* ignore */
    }
  }
  const tracker = localStorage.getItem('dawonSevenDayTracker_v5')
  if (tracker) {
    try {
      await upsertTracker(userId, JSON.parse(tracker))
    } catch {
      /* ignore */
    }
  }
  const team = localStorage.getItem('dawonTeamOps_v1')
  if (team) {
    try {
      await upsertOpsBundle(userId, 'team', JSON.parse(team))
    } catch {
      /* ignore */
    }
  }
  const ideas = localStorage.getItem('dawonSavedIdeas_v1')
  if (ideas) {
    try {
      await upsertOpsBundle(userId, 'ideas', JSON.parse(ideas))
    } catch {
      /* ignore */
    }
  }

  // Clear local personal survey drafts after successful migrate attempt of non-PII ops
  localStorage.setItem(flag, '1')
}
