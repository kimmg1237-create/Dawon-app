import type { NotificationSettings } from '../types'
import { getSupabase } from '../lib/supabase'

const LOCAL_KEY = 'my-day-design-notification'

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  reminderHour: 21,
  reminderMinute: 0,
}

function loadLocal(): NotificationSettings {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? { ...DEFAULT_NOTIFICATION_SETTINGS, ...(JSON.parse(raw) as NotificationSettings) } : DEFAULT_NOTIFICATION_SETTINGS
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS
  }
}

function saveLocal(settings: NotificationSettings) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(settings))
}

interface SettingsRow {
  enabled: boolean
  reminder_hour: number
  reminder_minute: number
}

export async function fetchNotificationSettings(userId: string | null): Promise<NotificationSettings> {
  if (!userId) return loadLocal()

  const supabase = getSupabase()
  if (!supabase) return loadLocal()

  const { data, error } = await supabase
    .from('notification_settings')
    .select('enabled, reminder_hour, reminder_minute')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return DEFAULT_NOTIFICATION_SETTINGS

  const row = data as SettingsRow
  return {
    enabled: row.enabled,
    reminderHour: row.reminder_hour,
    reminderMinute: row.reminder_minute,
  }
}

export async function saveNotificationSettings(
  userId: string | null,
  settings: NotificationSettings,
): Promise<void> {
  saveLocal(settings)

  if (!userId) return

  const supabase = getSupabase()
  if (!supabase) return

  const { error } = await supabase.from('notification_settings').upsert({
    user_id: userId,
    enabled: settings.enabled,
    reminder_hour: settings.reminderHour,
    reminder_minute: settings.reminderMinute,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

export function showReminderNotification() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  new Notification('나의 하루설계', {
    body: '오늘의 3분 기록 시간이에요. 오늘 한 일과 기분을 남겨보세요.',
    icon: '/favicon.svg',
    tag: 'my-day-design-daily-reminder',
  })
}
