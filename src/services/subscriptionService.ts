import type {
  PremiumAccessReason,
  SubscriptionPlan,
  SubscriptionSource,
  UserSubscription,
} from '../types'
import { getSupabase } from '../lib/supabase'
import { PRODUCT_SPEC } from '../data/productSpec'

interface SubscriptionRow {
  user_id: string
  plan: string
  status: string
  expires_at: string | null
  trial_ends_at?: string | null
  ad_access_until?: string | null
  source?: string | null
  external_id?: string | null
  updated_at: string
}

const AD_UNLOCK_HOURS = 24

function isFuture(iso: string | null | undefined): boolean {
  if (!iso) return false
  return new Date(iso) > new Date()
}

function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function addHours(hours: number): string {
  const d = new Date()
  d.setHours(d.getHours() + hours)
  return d.toISOString()
}

function rowToSubscription(row: SubscriptionRow): UserSubscription {
  return {
    userId: row.user_id,
    plan: row.plan as SubscriptionPlan,
    status: row.status as UserSubscription['status'],
    expiresAt: row.expires_at,
    trialEndsAt: row.trial_ends_at ?? null,
    adAccessUntil: row.ad_access_until ?? null,
    source: (row.source as SubscriptionSource) || 'trial',
    externalId: row.external_id ?? null,
    updatedAt: row.updated_at,
  }
}

const FREE_SUBSCRIPTION: Omit<UserSubscription, 'userId'> = {
  plan: 'free',
  status: 'active',
  expiresAt: null,
  trialEndsAt: null,
  adAccessUntil: null,
  source: 'trial',
  externalId: null,
  updatedAt: new Date().toISOString(),
}

/** 유료 구독(월·B2B)이 아직 유효한가 */
export function isPaidActive(plan: SubscriptionPlan, expiresAt: string | null): boolean {
  if (plan === 'free') return false
  if (plan === 'b2b') return !expiresAt || isFuture(expiresAt)
  if (plan === 'monthly') return !expiresAt || isFuture(expiresAt)
  return false
}

/** 체험·유료·광고 중 하나라도 프리미엄 접근 가능하면 true */
export function hasPremiumAccess(sub: Pick<UserSubscription, 'plan' | 'expiresAt' | 'trialEndsAt' | 'adAccessUntil'>): boolean {
  return getPremiumAccessReason(sub) !== null
}

export function getPremiumAccessReason(
  sub: Pick<UserSubscription, 'plan' | 'expiresAt' | 'trialEndsAt' | 'adAccessUntil'>,
): PremiumAccessReason {
  if (isFuture(sub.trialEndsAt)) return 'trial'
  if (isPaidActive(sub.plan, sub.expiresAt)) return 'paid'
  if (isFuture(sub.adAccessUntil)) return 'ads'
  return null
}

/** @deprecated hasPremiumAccess 사용 권장 */
export function isPremiumPlan(plan: SubscriptionPlan, expiresAt: string | null): boolean {
  return isPaidActive(plan, expiresAt)
}

export function daysRemaining(iso: string | null | undefined): number | null {
  if (!iso) return null
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return 0
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

export async function fetchSubscription(userId: string): Promise<UserSubscription> {
  const supabase = getSupabase()
  if (!supabase) return { userId, ...FREE_SUBSCRIPTION, trialEndsAt: addDays(PRODUCT_SPEC.freeTrialDays) }

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) {
    return ensureTrialSubscription(userId)
  }

  const sub = rowToSubscription(data as SubscriptionRow)

  // 유료 월 구독 만료 시 플랜만 free로 (체험·광고 필드는 유지)
  if (sub.plan === 'monthly' && sub.expiresAt && !isFuture(sub.expiresAt)) {
    return expirePaidToFree(userId, sub)
  }

  return sub
}

export async function ensureTrialSubscription(userId: string): Promise<UserSubscription> {
  const supabase = getSupabase()
  if (!supabase) {
    return {
      userId,
      ...FREE_SUBSCRIPTION,
      trialEndsAt: addDays(PRODUCT_SPEC.freeTrialDays),
    }
  }

  const { data, error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan: 'free',
      status: 'active',
      expires_at: null,
      trial_ends_at: addDays(PRODUCT_SPEC.freeTrialDays),
      ad_access_until: null,
      source: 'trial',
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return rowToSubscription(data as SubscriptionRow)
}

async function expirePaidToFree(userId: string, current: UserSubscription): Promise<UserSubscription> {
  const supabase = getSupabase()
  if (!supabase) return { ...current, plan: 'free', status: 'expired' }

  const { data, error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan: 'free',
      status: 'expired',
      expires_at: current.expiresAt,
      trial_ends_at: current.trialEndsAt,
      ad_access_until: current.adAccessUntil,
      source: current.source,
      external_id: current.externalId,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return rowToSubscription(data as SubscriptionRow)
}

/** 개발용·토스 연동 전: 월 구독 30일 부여 */
export async function upgradeToMonthly(
  userId: string,
  options?: { source?: SubscriptionSource; externalId?: string | null },
): Promise<UserSubscription> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const { data: existing } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  const prev = existing ? rowToSubscription(existing as SubscriptionRow) : null

  const { data, error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan: 'monthly',
      status: 'active',
      expires_at: addDays(30),
      trial_ends_at: prev?.trialEndsAt ?? null,
      ad_access_until: null,
      source: options?.source ?? 'dev',
      external_id: options?.externalId ?? null,
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

  const { data: existing } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  const prev = existing ? rowToSubscription(existing as SubscriptionRow) : null

  const { data, error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan: 'free',
      status: 'cancelled',
      expires_at: null,
      trial_ends_at: prev?.trialEndsAt ?? null,
      ad_access_until: prev?.adAccessUntil ?? null,
      source: prev?.source === 'toss' || prev?.source === 'play' || prev?.source === 'app_store' ? prev.source : 'trial',
      external_id: null,
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

  const { data: existing } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  const prev = existing ? rowToSubscription(existing as SubscriptionRow) : null

  const { data, error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan: 'b2b',
      status: 'active',
      expires_at: null,
      trial_ends_at: prev?.trialEndsAt ?? null,
      ad_access_until: null,
      source: 'manual_b2b',
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return rowToSubscription(data as SubscriptionRow)
}

/**
 * 광고 시청 대체 이용 (실광고 SDK 연동 전: 확인 후 24시간 프리미엄 접근)
 */
export async function unlockViaAd(userId: string): Promise<UserSubscription> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const { data: existing } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  const prev = existing ? rowToSubscription(existing as SubscriptionRow) : null
  const until = addHours(AD_UNLOCK_HOURS)

  const { data, error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan: prev?.plan === 'monthly' || prev?.plan === 'b2b' ? prev.plan : 'free',
      status: 'active',
      expires_at: prev?.expiresAt ?? null,
      trial_ends_at: prev?.trialEndsAt ?? null,
      ad_access_until: until,
      source: isPaidActive(prev?.plan ?? 'free', prev?.expiresAt ?? null) ? (prev?.source ?? 'ads') : 'ads',
      external_id: prev?.externalId ?? null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return rowToSubscription(data as SubscriptionRow)
}

export { AD_UNLOCK_HOURS }
