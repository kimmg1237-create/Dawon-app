export type Emotion = '기쁨' | '평안' | '감사' | '걱정' | '희망'

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
