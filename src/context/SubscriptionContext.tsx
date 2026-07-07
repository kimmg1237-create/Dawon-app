import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { SubscriptionPlan, UserSubscription } from '../types'
import { useAuth } from './AuthContext'
import {
  downgradeToFree,
  fetchSubscription,
  isPremiumPlan,
  requestB2BPlan,
  upgradeToMonthly,
} from '../services/subscriptionService'

interface SubscriptionContextValue {
  subscription: UserSubscription | null
  plan: SubscriptionPlan
  isPremium: boolean
  loading: boolean
  subscribeMonthly: () => Promise<string | null>
  cancelSubscription: () => Promise<string | null>
  requestB2B: () => Promise<string | null>
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
  const isPremium = subscription
    ? isPremiumPlan(subscription.plan, subscription.expiresAt)
    : false

  const subscribeMonthly = useCallback(async () => {
    if (!user) return '로그인이 필요합니다.'
    try {
      const sub = await upgradeToMonthly(user.id)
      setSubscription(sub)
      return null
    } catch {
      return '구독 처리에 실패했습니다. subscriptions.sql을 실행했는지 확인해주세요.'
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

  const value = useMemo(
    () => ({
      subscription,
      plan,
      isPremium,
      loading,
      subscribeMonthly,
      cancelSubscription,
      requestB2B,
      refresh: load,
    }),
    [subscription, plan, isPremium, loading, subscribeMonthly, cancelSubscription, requestB2B, load],
  )

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider')
  return ctx
}
