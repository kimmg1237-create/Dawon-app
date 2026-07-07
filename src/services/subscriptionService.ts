import type { SubscriptionPlan, UserSubscription } from '../types'
import { getSupabase } from '../lib/supabase'

interface SubscriptionRow {
  user_id: string
  plan: string
  status: string
  expires_at: string | null
  updated_at: string
}

function rowToSubscription(row: SubscriptionRow): UserSubscription {
  return {
    userId: row.user_id,
    plan: row.plan as SubscriptionPlan,
    status: row.status as UserSubscription['status'],
    expiresAt: row.expires_at,
    updatedAt: row.updated_at,
  }
}

const FREE_SUBSCRIPTION: Omit<UserSubscription, 'userId'> = {
  plan: 'free',
  status: 'active',
  expiresAt: null,
  updatedAt: new Date().toISOString(),
}

export function isPremiumPlan(plan: SubscriptionPlan, expiresAt: string | null): boolean {
  if (plan === 'free') return false
  if (!expiresAt) return plan === 'b2b' || plan === 'monthly'
  return new Date(expiresAt) > new Date()
}

export async function fetchSubscription(userId: string): Promise<UserSubscription> {
  const supabase = getSupabase()
  if (!supabase) return { userId, ...FREE_SUBSCRIPTION }

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) {
    return ensureFreeSubscription(userId)
  }

  const sub = rowToSubscription(data as SubscriptionRow)

  if (sub.expiresAt && new Date(sub.expiresAt) <= new Date() && sub.plan === 'monthly') {
    return downgradeToFree(userId)
  }

  return sub
}

export async function ensureFreeSubscription(userId: string): Promise<UserSubscription> {
  const supabase = getSupabase()
  if (!supabase) return { userId, ...FREE_SUBSCRIPTION }

  const { data, error } = await supabase
    .from('user_subscriptions')
    .upsert({ user_id: userId, plan: 'free', status: 'active', expires_at: null })
    .select()
    .single()

  if (error) throw error
  return rowToSubscription(data as SubscriptionRow)
}

export async function upgradeToMonthly(userId: string): Promise<UserSubscription> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  const { data, error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan: 'monthly',
      status: 'active',
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return rowToSubscription(data as SubscriptionRow)
}

export async function downgradeToFree(userId: string): Promise<UserSubscription> {
  const supabase = getSupabase()
  if (!supabase) return { userId, ...FREE_SUBSCRIPTION }

  const { data, error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan: 'free',
      status: 'active',
      expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return rowToSubscription(data as SubscriptionRow)
}

export async function requestB2BPlan(userId: string): Promise<UserSubscription> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan: 'b2b',
      status: 'active',
      expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return rowToSubscription(data as SubscriptionRow)
}
