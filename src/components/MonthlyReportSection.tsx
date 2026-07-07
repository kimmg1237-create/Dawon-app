import { useMemo } from 'react'
import { useDayRecordsContext } from '../context/DayRecordsContext'
import { PremiumGate } from './PremiumGate'
import { EMOTIONS } from '../data/emotions'
import './MonthlyReportSection.css'

export function MonthlyReportSection() {
  const { monthRecords, topEmotion, monthCount, calendarMonth } = useDayRecordsContext()

  const emotionStats = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of monthRecords) {
      counts[r.emotion] = (counts[r.emotion] ?? 0) + 1
    }
    return EMOTIONS.map((e) => ({
      emotion: e.value,
      count: counts[e.value] ?? 0,
      className: e.className,
    })).sort((a, b) => b.count - a.count)
  }, [monthRecords])

  const maxCount = Math.max(...emotionStats.map((s) => s.count), 1)
  const monthLabel = `${calendarMonth.year}년 ${calendarMonth.month + 1}월`

  return (
    <section id="monthly-report">
      <h2 className="section-title">월간 감정 분석 리포트</h2>
      <p className="section-subtitle">이번 달 기록을 바탕으로 감정 흐름을 한눈에 확인합니다.</p>

      <PremiumGate feature="월간 감정 분석 리포트">
        <div className="report-box">
          <div className="report-summary">
            <div className="report-stat">
              <span>분석 기간</span>
              <strong>{monthLabel}</strong>
            </div>
            <div className="report-stat">
              <span>기록 횟수</span>
              <strong>{monthCount}회</strong>
            </div>
            <div className="report-stat">
              <span>주요 감정</span>
              <strong>{topEmotion}</strong>
            </div>
          </div>

          {monthCount === 0 ? (
            <p className="report-empty">이번 달 기록이 없습니다. 기록을 쌓으면 리포트가 채워집니다.</p>
          ) : (
            <div className="report-bars">
              {emotionStats.map((stat) => (
                <div key={stat.emotion} className="report-bar-row">
                  <span className={`report-emo ${stat.className}`}>{stat.emotion}</span>
                  <div className="report-bar-track">
                    <div
                      className="report-bar-fill"
                      style={{ width: `${(stat.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="report-count">{stat.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </PremiumGate>
    </section>
  )
}
