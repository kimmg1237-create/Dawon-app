import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { NotificationSettings } from '../types'
import { useAuth } from './AuthContext'
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  fetchNotificationSettings,
  requestNotificationPermission,
  saveNotificationSettings,
} from '../services/notificationSettingsService'

interface NotificationContextValue {
  settings: NotificationSettings
  loading: boolean
  permission: NotificationPermission | 'unsupported'
  updateSettings: (patch: Partial<NotificationSettings>) => Promise<string | null>
  enableReminders: () => Promise<string | null>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported',
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchNotificationSettings(user?.id ?? null)
      .then((data) => {
        if (!cancelled) setSettings(data)
      })
      .catch(() => {
        if (!cancelled) setSettings(DEFAULT_NOTIFICATION_SETTINGS)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const updateSettings = useCallback(
    async (patch: Partial<NotificationSettings>) => {
      const next = { ...settings, ...patch }
      try {
        await saveNotificationSettings(user?.id ?? null, next)
        setSettings(next)
        return null
      } catch {
        return '알림 설정 저장에 실패했습니다. notification_settings.sql을 실행했는지 확인해주세요.'
      }
    },
    [settings, user?.id],
  )

  const enableReminders = useCallback(async () => {
    const result = await requestNotificationPermission()
    setPermission(result)
    if (result === 'unsupported') return '이 브라우저는 알림을 지원하지 않습니다.'
    if (result === 'denied') return '알림이 차단되어 있습니다. 브라우저 설정에서 허용해주세요.'
    return updateSettings({ enabled: true })
  }, [updateSettings])

  const value = useMemo(
    () => ({ settings, loading, permission, updateSettings, enableReminders }),
    [settings, loading, permission, updateSettings, enableReminders],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider')
  return ctx
}
