export type Emotion = '기쁨' | '평안' | '감사' | '걱정' | '희망'

export type SubscriptionPlan = 'free' | 'monthly' | 'b2b'

export interface UserSubscription {
  userId: string
  plan: SubscriptionPlan
  status: 'active' | 'cancelled' | 'expired'
  expiresAt: string | null
  updatedAt: string
}

export type ContentType = 'book' | 'video' | 'song'

export interface ContentItem {
  id: string
  type: ContentType
  title: string
  description: string
  url: string
  emotion: Emotion
}

export interface RecommendationSet {
  emotion: Emotion
  book: ContentItem
  video: ContentItem
  song: ContentItem
}

export interface DayRecord {
  id: string
  date: string
  task: string
  emotion: Emotion
  nextTask: string
  message: string
  createdAt: string
  updatedAt?: string
}

export interface MonthCard {
  month: number
  title: string
  question: string
  description: string
}

export interface BookCard {
  tag: string
  tagColor: string
  title: string
  description: string
  links: { label: string; href: string }[]
}

export interface PaletteItem {
  name: string
  meaning: string
  color: string
}

export interface NotificationSettings {
  enabled: boolean
  reminderHour: number
  reminderMinute: number
}
