import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import { FEATURES } from '../data/features'
import {
  cancelAtPeriodEnd,
  evaluatePremium,
  fetchSubscription,
  grantAdAccess,
  markContentFirstUsed,
  resumeSubscription,
} from '../services/subscriptionService'
import type { PremiumReason, UserSubscription } from '../types/subscription'

type SubscriptionContextValue = {
  loading: boolean
  subscription: UserSubscription | null
  isPremium: boolean
  premiumReason: PremiumReason
  statusLabel: string
  paymentsEnabled: boolean
  refresh: () => Promise<void>
  unlockWithAd: () => Promise<void>
  markContentUsed: () => Promise<void>
  scheduleCancel: () => Promise<void>
  undoCancel: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, configured } = useAuth()
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const paymentsEnabled = FEATURES.paymentsEnabled

  const refresh = useCallback(async () => {
    if (!paymentsEnabled || !configured || !user) {
      setSubscription(null)
      return
    }
    setLoading(true)
    try {
      setSubscription(await fetchSubscription(user.id))
    } catch (error) {
      console.error('구독 조회 실패', error)
      setSubscription(null)
    } finally {
      setLoading(false)
    }
  }, [configured, paymentsEnabled, user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const unlockWithAd = useCallback(async () => {
    if (!paymentsEnabled) return
    if (!user) throw new Error('로그인이 필요합니다.')
    await grantAdAccess(user.id)
    await refresh()
  }, [paymentsEnabled, refresh, user])

  const markContentUsed = useCallback(async () => {
    if (!paymentsEnabled || !user) return
    await markContentFirstUsed(user.id)
    await refresh()
  }, [paymentsEnabled, refresh, user])

  const scheduleCancel = useCallback(async () => {
    if (!paymentsEnabled) return
    if (!user) throw new Error('로그인이 필요합니다.')
    await cancelAtPeriodEnd(user.id)
    await refresh()
  }, [paymentsEnabled, refresh, user])

  const undoCancel = useCallback(async () => {
    if (!paymentsEnabled) return
    if (!user) throw new Error('로그인이 필요합니다.')
    await resumeSubscription(user.id)
    await refresh()
  }, [paymentsEnabled, refresh, user])

  const premium = useMemo(() => {
    if (!paymentsEnabled) {
      return { isPremium: true, reason: 'none' as PremiumReason, label: '공개 이용' }
    }
    return evaluatePremium(subscription)
  }, [paymentsEnabled, subscription])

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      loading: paymentsEnabled ? loading : false,
      subscription,
      isPremium: premium.isPremium,
      premiumReason: premium.reason,
      statusLabel: premium.label,
      paymentsEnabled,
      refresh,
      unlockWithAd,
      markContentUsed,
      scheduleCancel,
      undoCancel,
    }),
    [
      loading,
      subscription,
      premium,
      paymentsEnabled,
      refresh,
      unlockWithAd,
      markContentUsed,
      scheduleCancel,
      undoCancel,
    ],
  )

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider')
  return ctx
}
