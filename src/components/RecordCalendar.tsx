import { useDayRecordsContext } from '../context/DayRecordsContext'
import { getCalendarDays, dateKey } from '../utils/date'
import './RecordCalendar.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export function RecordCalendar() {
  const { calendarMonth, recordDateSet, prevMonth, nextMonth } = useDayRecordsContext()
  const { year, month } = calendarMonth
  const days = getCalendarDays(year, month)
  const monthLabel = `${year}년 ${month + 1}월`

  function dayKey(day: number) {
    const m = String(month + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${year}-${m}-${d}`
  }

  const recordedCount = days.filter((d) => d !== null && recordDateSet.has(dayKey(d))).length

  return (
    <section id="record-calendar" className="record-calendar-section">
      <h2 className="section-title">매일 실천 체크</h2>
      <p className="section-subtitle">
        기록한 날은 색으로 표시됩니다. 이번 달 {recordedCount}일 실천 중이에요.
      </p>

      <div className="calendar-box">
        <div className="calendar-header">
          <button type="button" className="calendar-nav" onClick={prevMonth} aria-label="이전 달">
            <i className="fa-solid fa-chevron-left" />
          </button>
          <h3 className="calendar-month">{monthLabel}</h3>
          <button type="button" className="calendar-nav" onClick={nextMonth} aria-label="다음 달">
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>

        <div className="calendar-weekdays">
          {WEEKDAYS.map((w) => (
            <span key={w} className="calendar-weekday">
              {w}
            </span>
          ))}
        </div>

        <div className="calendar-grid">
          {days.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="calendar-cell empty" />

            const key = dayKey(day)
            const recorded = recordDateSet.has(key)
            const isToday = key === dateKey()

            return (
              <div
                key={key}
                className={`calendar-cell ${recorded ? 'recorded' : ''} ${isToday ? 'today' : ''}`}
                title={recorded ? `${month + 1}/${day} 기록 완료` : `${month + 1}/${day}`}
              >
                <span className="calendar-day">{day}</span>
                {recorded && <i className="fa-solid fa-check calendar-check" />}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
