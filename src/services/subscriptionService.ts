import { supabase } from '../lib/supabase'
import type { PremiumReason, UserSubscription } from '../types/subscription'

function isFuture(iso: string | null | undefined): boolean {
  if (!iso) return false
  return new Date(iso).getTime() > Date.now()
}

export function evaluatePremium(sub: UserSubscription | null): {
  isPremium: boolean
  reason: PremiumReason
  label: string
} {
  if (!sub) {
    return { isPremium: false, reason: 'none', label: '무료 이용' }
  }

  if (sub.status === 'cancelled' && !isFuture(sub.expires_at)) {
    return { isPremium: false, reason: 'none', label: '해지·만료됨' }
  }

  // 기간 종료형 해지: 만료일까지 이용 가능
  if (sub.status === 'active' || (sub.cancel_at_period_end && isFuture(sub.expires_at))) {
    if (sub.plan === 'monthly' || sub.plan === 'b2b') {
      if (sub.plan === 'b2b' && !sub.expires_at) {
        return {
          isPremium: true,
          reason: 'paid',
          label: sub.cancel_at_period_end ? '기관 이용 중(기간 종료 해지)' : '기관·B2B 이용 중',
        }
      }
      if (isFuture(sub.expires_at)) {
        return {
          isPremium: true,
          reason: 'paid',
          label: sub.cancel_at_period_end
            ? '월 구독 이용 중(기간 종료 후 해지)'
            : sub.plan === 'b2b'
              ? '기관·B2B 이용 중'
              : '월 구독 이용 중',
        }
      }
    }
  }

  if (sub.status === 'active' || sub.status === 'cancelled') {
    if (isFuture(sub.trial_ends_at) && sub.status === 'active') {
      return { isPremium: true, reason: 'trial', label: '첫 달 무료 체험 중' }
    }
    if (isFuture(sub.ad_access_until) && sub.status === 'active') {
      return { isPremium: true, reason: 'ads', label: '광고 시청 이용 중' }
    }
  }

  if (sub.status !== 'active') {
    return { isPremium: false, reason: 'none', label: '해지·만료됨' }
  }

  return { isPremium: false, reason: 'none', label: '유료 전환 필요' }
}

export async function fetchSubscription(userId: string): Promise<UserSubscription | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as UserSubscription | null) ?? null
}

export async function grantAdAccess(userId: string, hours = 24): Promise<void> {
  if (!supabase) throw new Error('Supabase가 설정되지 않았습니다.')
  const until = new Date()
  until.setHours(until.getHours() + hours)
  const { error } = await supabase.from('user_subscriptions').upsert({
    user_id: userId,
    plan: 'free',
    status: 'active',
    ad_access_until: until.toISOString(),
    source: 'ads',
    updated_at: new Date().toISOString(),
  })
  if (error) throw new Error(error.message)
}

/** 디지털 콘텐츠 첫 이용 시각 기록 (청약철회 제한 근거) */
export async function markContentFirstUsed(userId: string): Promise<void> {
  if (!supabase) return
  const { data } = await supabase
    .from('user_subscriptions')
    .select('content_first_used_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (data?.content_first_used_at) return
  await supabase
    .from('user_subscriptions')
    .update({
      content_first_used_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .is('content_first_used_at', null)
}

/** 기간 종료형 해지 — 남은 기간 이용 후 자동 만료, 환불 없음 */
export async function cancelAtPeriodEnd(userId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase가 설정되지 않았습니다.')
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      cancel_at_period_end: true,
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

/** 기간 종료 해지 예약 철회 */
export async function resumeSubscription(userId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase가 설정되지 않았습니다.')
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      cancel_at_period_end: false,
      cancelled_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}
