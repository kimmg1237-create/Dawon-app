import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { PremiumAccessReason, SubscriptionPlan, UserSubscription } from '../types'
import { useAuth } from './AuthContext'
import {
  daysRemaining,
  downgradeToFree,
  fetchSubscription,
  getPremiumAccessReason,
  hasPremiumAccess,
  requestB2BPlan,
  unlockViaAd,
  upgradeToMonthly,
  AD_UNLOCK_HOURS,
} from '../services/subscriptionService'
import { PRODUCT_SPEC } from '../data/productSpec'

interface SubscriptionContextValue {
  subscription: UserSubscription | null
  plan: SubscriptionPlan
  isPremium: boolean
  accessReason: PremiumAccessReason
  trialDaysLeft: number | null
  adHoursLeftLabel: string | null
  monthlyPriceKrw: number
  loading: boolean
  subscribeMonthly: () => Promise<string | null>
  cancelSubscription: () => Promise<string | null>
  requestB2B: () => Promise<string | null>
  unlockWithAd: () => Promise<string | null>
  refresh: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, configured } = useAuth()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!user || !configured) {
      setSubscription(null)
      return
    }

    setLoading(true)
    try {
      const sub = await fetchSubscription(user.id)
      setSubscription(sub)
    } catch (err) {
      console.error('Subscription load failed:', err)
      setSubscription({
        userId: user.id,
        plan: 'free',
        status: 'active',
        expiresAt: null,
        trialEndsAt: null,
        adAccessUntil: null,
        source: 'trial',
        externalId: null,
        updatedAt: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }, [user, configured])

  useEffect(() => {
    load()
  }, [load])

  const plan: SubscriptionPlan = subscription?.plan ?? 'free'
  const isPremium = subscription ? hasPremiumAccess(subscription) : false
  const accessReason = subscription ? getPremiumAccessReason(subscription) : null
  const trialDaysLeft = daysRemaining(subscription?.trialEndsAt)

  const adHoursLeftLabel = useMemo(() => {
    if (!subscription?.adAccessUntil || accessReason !== 'ads') return null
    const ms = new Date(subscription.adAccessUntil).getTime() - Date.now()
    if (ms <= 0) return null
    const hours = Math.ceil(ms / (1000 * 60 * 60))
    return `약 ${hours}시간`
  }, [subscription, accessReason])

  const subscribeMonthly = useCallback(async () => {
    if (!user) return '로그인이 필요합니다.'
    try {
      const sub = await upgradeToMonthly(user.id, { source: 'dev' })
      setSubscription(sub)
      return null
    } catch {
      return '구독 처리에 실패했습니다. Supabase에서 subscriptions.sql을 다시 실행했는지 확인해주세요.'
    }
  }, [user])

  const cancelSubscription = useCallback(async () => {
    if (!user) return '로그인이 필요합니다.'
    try {
      const sub = await downgradeToFree(user.id)
      setSubscription(sub)
      return null
    } catch {
      return '구독 해지에 실패했습니다.'
    }
  }, [user])

  const requestB2B = useCallback(async () => {
    if (!user) return '로그인이 필요합니다.'
    try {
      const sub = await requestB2BPlan(user.id)
      setSubscription(sub)
      return null
    } catch {
      return 'B2B 신청 처리에 실패했습니다.'
    }
  }, [user])

  const unlockWithAd = useCallback(async () => {
    if (!user) return '로그인이 필요합니다.'
    try {
      const sub = await unlockViaAd(user.id)
      setSubscription(sub)
      return null
    } catch {
      return '광고 이용 처리에 실패했습니다. subscriptions.sql 마이그레이션을 확인해주세요.'
    }
  }, [user])

  const value = useMemo(
    () => ({
      subscription,
      plan,
      isPremium,
      accessReason,
      trialDaysLeft,
      adHoursLeftLabel,
      monthlyPriceKrw: PRODUCT_SPEC.monthlyPriceKrw,
      loading,
      subscribeMonthly,
      cancelSubscription,
      requestB2B,
      unlockWithAd,
      refresh: load,
    }),
    [
      subscription,
      plan,
      isPremium,
      accessReason,
      trialDaysLeft,
      adHoursLeftLabel,
      loading,
      subscribeMonthly,
      cancelSubscription,
      requestB2B,
      unlockWithAd,
      load,
    ],
  )

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider')
  return ctx
}

export { AD_UNLOCK_HOURS }
