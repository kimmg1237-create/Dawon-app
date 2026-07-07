import { useEffect } from 'react'
import { useDayRecordsContext } from '../context/DayRecordsContext'
import { useNotification } from '../context/NotificationContext'
import { showReminderNotification } from '../services/notificationSettingsService'
import { dateKey } from '../utils/date'

const LAST_REMINDER_KEY = 'my-day-design-last-reminder'

export function DailyReminderRunner() {
  const { settings } = useNotification()
  const { hasRecordedToday } = useDayRecordsContext()

  useEffect(() => {
    if (!settings.enabled) return

    function check() {
      if (hasRecordedToday) return
      if (!('Notification' in window) || Notification.permission !== 'granted') return

      const now = new Date()
      const today = dateKey(now)
      if (localStorage.getItem(LAST_REMINDER_KEY) === today) return

      if (now.getHours() === settings.reminderHour && now.getMinutes() === settings.reminderMinute) {
        showReminderNotification()
        localStorage.setItem(LAST_REMINDER_KEY, today)
      }
    }

    check()
    const id = window.setInterval(check, 30_000)
    return () => window.clearInterval(id)
  }, [settings.enabled, settings.reminderHour, settings.reminderMinute, hasRecordedToday])

  return null
}
