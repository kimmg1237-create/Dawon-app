import { useState } from 'react'
import { MONTH_CARDS } from '../data/months'
import './ContentSections.css'

export function CalendarSection() {
  const [openMonth, setOpenMonth] = useState<number | null>(null)

  return (
    <section id="calendar">
      <h2 className="section-title">다원작가 365일 실천카드</h2>
      <p className="section-subtitle">거대한 이론을 매일 하나의 카드로 낮춘 자기확인 생활 설계 시스템</p>
      <div className="months-container">
        {MONTH_CARDS.map((card) => (
          <div
            key={card.month}
            className={`month-row ${openMonth === card.month ? 'active' : ''}`}
            onClick={() => setOpenMonth(openMonth === card.month ? null : card.month)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setOpenMonth(openMonth === card.month ? null : card.month)
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="month-header">
              <span className="month-title">{card.title}</span>
              <i className="fa-solid fa-chevron-down" />
            </div>
            <div className="month-body">
              <strong>오늘의 질문:</strong> &ldquo;{card.question}&rdquo;
              <br />
              {card.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
