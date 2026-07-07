import { useState } from 'react'
import { useNotification } from '../context/NotificationContext'
import './NotificationSettings.css'

export function NotificationSettings() {
  const { settings, loading, permission, updateSettings, enableReminders } = useNotification()
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleToggle() {
    setMessage('')
    setSaving(true)
    if (!settings.enabled) {
      const err = await enableReminders()
      setMessage(err ?? '매일 알림이 켜졌습니다.')
    } else {
      const err = await updateSettings({ enabled: false })
      setMessage(err ?? '알림이 꺼졌습니다.')
    }
    setSaving(false)
  }

  async function handleTimeChange(hour: number, minute: number) {
    setSaving(true)
    const err = await updateSettings({ reminderHour: hour, reminderMinute: minute })
    if (!err) setMessage(`알림 시간이 ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} 으로 저장되었습니다.`)
    setSaving(false)
  }

  if (loading) {
    return (
      <section id="notifications" className="notification-section">
        <p className="notification-loading">알림 설정 불러오는 중...</p>
      </section>
    )
  }

  return (
    <section id="notifications" className="notification-section">
      <h2 className="section-title">매일 기록 알림</h2>
      <p className="section-subtitle">
        정해진 시간에 오늘 기록을 잊지 않도록 알림을 보내드립니다. (앱이 열려 있을 때 동작)
      </p>

      <div className="notification-box">
        <div className="notification-row">
          <div>
            <h3>일일 리마인더</h3>
            <p className="notification-desc">
              {permission === 'denied'
                ? '브라우저에서 알림이 차단되었습니다. 주소창 옆 설정에서 허용해주세요.'
                : permission === 'unsupported'
                  ? '이 브라우저는 알림을 지원하지 않습니다.'
                  : '오늘 기록을 하지 않았다면 알림을 보냅니다.'}
            </p>
          </div>
          <button
            type="button"
            className={`notification-toggle ${settings.enabled ? 'on' : ''}`}
            onClick={handleToggle}
            disabled={saving || permission === 'unsupported'}
            aria-pressed={settings.enabled}
          >
            <span className="notification-toggle-knob" />
          </button>
        </div>

        <div className="notification-time">
          <label htmlFor="reminder-hour">알림 시간</label>
          <div className="notification-time-inputs">
            <select
              id="reminder-hour"
              value={settings.reminderHour}
              onChange={(e) => handleTimeChange(Number(e.target.value), settings.reminderMinute)}
              disabled={saving}
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, '0')}시
                </option>
              ))}
            </select>
            <select
              value={settings.reminderMinute}
              onChange={(e) => handleTimeChange(settings.reminderHour, Number(e.target.value))}
              disabled={saving}
            >
              {[0, 15, 30, 45].map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, '0')}분
                </option>
              ))}
            </select>
          </div>
        </div>

        {message && <p className="notification-message">{message}</p>}

        <p className="notification-note">
          <i className="fa-solid fa-circle-info" /> 앱을 켜 둔 상태에서 설정한 시간에 알림이 옵니다. 앱이 꺼진 상태
          알림은 Android 앱 출시 후 FCM으로 지원됩니다.
        </p>
      </div>
    </section>
  )
}
