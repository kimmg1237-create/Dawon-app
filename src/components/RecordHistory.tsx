import { useState } from 'react'
import type { DayRecord } from '../types'
import { useDayRecordsContext } from '../context/DayRecordsContext'
import { formatDateLabel } from '../utils/date'
import { EMOTIONS } from '../data/emotions'
import './RecordHistory.css'

function emotionClass(emotion: string) {
  return EMOTIONS.find((e) => e.value === emotion)?.className ?? ''
}

export function RecordHistory() {
  const { records, deleteRecord } = useDayRecordsContext()
  const [selected, setSelected] = useState<DayRecord | null>(null)

  function handleDelete(record: DayRecord) {
    if (!confirm(`${formatDateLabel(record.date)} 기록을 삭제할까요?`)) return
    deleteRecord(record.id)
    if (selected?.id === record.id) setSelected(null)
  }

  if (records.length === 0) {
    return (
      <section id="record-history" className="record-history-section">
        <h2 className="section-title">나의 기록 목록</h2>
        <p className="section-subtitle">아직 저장된 기록이 없습니다. 오늘 첫 기록을 남겨보세요.</p>
      </section>
    )
  }

  return (
    <section id="record-history" className="record-history-section">
      <h2 className="section-title">나의 기록 목록</h2>
      <p className="section-subtitle">과거 기록을 눌러 상세 내용을 확인할 수 있습니다.</p>

      <div className="history-layout">
        <ul className="history-list">
          {records.map((record) => (
            <li key={record.id}>
              <button
                type="button"
                className={`history-item ${selected?.id === record.id ? 'active' : ''}`}
                onClick={() => setSelected(record)}
              >
                <span className="history-date">{formatDateLabel(record.date)}</span>
                <span className={`history-emo-badge ${emotionClass(record.emotion)}`}>{record.emotion}</span>
                <span className="history-task">{record.task}</span>
              </button>
            </li>
          ))}
        </ul>

        {selected && (
          <div className="history-detail">
            <div className="history-detail-header">
              <h3>{formatDateLabel(selected.date)}</h3>
              <button
                type="button"
                className="history-delete"
                onClick={() => handleDelete(selected)}
                aria-label="기록 삭제"
              >
                <i className="fa-solid fa-trash" />
              </button>
            </div>
            <dl className="history-detail-body">
              <div>
                <dt>오늘 한 일</dt>
                <dd>{selected.task}</dd>
              </div>
              <div>
                <dt>감정</dt>
                <dd>
                  <span className={`history-emo-badge ${emotionClass(selected.emotion)}`}>
                    {selected.emotion}
                  </span>
                </dd>
              </div>
              {selected.nextTask && (
                <div>
                  <dt>내일 할 일</dt>
                  <dd>{selected.nextTask}</dd>
                </div>
              )}
              <div>
                <dt>나에게 한마디</dt>
                <dd>{selected.message}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </section>
  )
}
