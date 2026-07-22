export type SubscriptionPlan = 'free' | 'monthly' | 'b2b'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired'
export type SubscriptionSource = 'trial' | 'toss' | 'play' | 'app_store' | 'manual_b2b' | 'ads' | 'dev'

export type UserSubscription = {
  user_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  expires_at: string | null
  trial_ends_at: string | null
  ad_access_until: string | null
  content_first_used_at?: string | null
  cancel_at_period_end?: boolean
  cancelled_at?: string | null
  source: SubscriptionSource
  external_id: string | null
  updated_at: string
}

export type PremiumReason = 'trial' | 'paid' | 'ads' | 'none'
