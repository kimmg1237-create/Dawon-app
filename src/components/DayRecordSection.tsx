import { useEffect, useState } from 'react'
import type { Emotion } from '../types'
import { EMOTIONS } from '../data/emotions'
import { useDayRecordsContext } from '../context/DayRecordsContext'
import './DayRecordSection.css'

const DEFAULT_MESSAGE = '오늘도 수고했어. 나는 내 하루의 작은 설계자다.'

export function DayRecordSection() {
  const { monthCount, streak, topEmotion, saveRecord, todayRecord, hasRecordedToday, syncing, isCloud } =
    useDayRecordsContext()

  const [task, setTask] = useState('')
  const [nextTask, setNextTask] = useState('')
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | ''>('')
  const [previewMsg, setPreviewMsg] = useState(
    '오늘의 기록이 여기에 표시됩니다. 저장하면 달력과 목록에 반영됩니다.',
  )

  useEffect(() => {
    if (todayRecord) {
      setTask(todayRecord.task)
      setNextTask(todayRecord.nextTask)
      setMessage(todayRecord.message)
      setSelectedEmotion(todayRecord.emotion)
      setPreviewMsg(`오늘 기록을 수정할 수 있습니다.\n오늘의 다짐: "${todayRecord.message}"`)
    }
  }, [todayRecord])

  async function handleSave() {
    if (!task || !selectedEmotion) {
      alert('오늘 한 일 기록과 오늘의 감정 선택은 성장을 위한 필수 입력 사항입니다.')
      return
    }

    try {
      await saveRecord({ task, emotion: selectedEmotion, nextTask, message })
      setPreviewMsg(
        `성공적으로 ${hasRecordedToday ? '수정' : '저장'}되었습니다!${isCloud ? ' (클라우드 동기화)' : ''}\n오늘의 다짐: "${message}"`,
      )
      document.getElementById('recommendations')?.scrollIntoView({ behavior: 'smooth' })
    } catch {
      alert('저장에 실패했습니다. 로그인 상태와 인터넷 연결을 확인해주세요.')
    }
  }

  return (
    <section id="daily" className="day-record-section">
      <h2 className="section-title">다원 하루설계 3분 기록</h2>
      <p className="section-subtitle">오늘의 나를 확인하는 3분, 내 삶을 설계하는 첫걸음입니다.</p>

      {syncing && (
        <p className="today-status pending">
          <i className="fa-solid fa-cloud-arrow-down" /> 클라우드에서 기록을 불러오는 중...
        </p>
      )}
      {!syncing && hasRecordedToday && (
        <p className="today-status done">
          <i className="fa-solid fa-circle-check" /> 오늘 기록 완료 — 수정 후 다시 저장할 수 있어요.
        </p>
      )}
      {!syncing && !hasRecordedToday && (
        <p className="today-status pending">
          <i className="fa-regular fa-circle" /> 오늘 아직 기록하지 않았어요.
        </p>
      )}

      <div className="app-box">
        <div className="app-form">
          <div className="form-group">
            <label htmlFor="taskInput">1. 오늘 한 일 기록</label>
            <input
              id="taskInput"
              type="text"
              className="input-text"
              placeholder="작아도 내가 해낸 일은 무엇인가요?"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>2. 지금 감정 선택</label>
            <div className="emotion-pool">
              {EMOTIONS.map((emo) => (
                <button
                  key={emo.value}
                  type="button"
                  className={`emotion-badge ${emo.className} ${selectedEmotion === emo.value ? 'active' : ''}`}
                  onClick={() => setSelectedEmotion(emo.value)}
                >
                  {emo.value}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="nextInput">3. 내일 할 일 메모</label>
            <input
              id="nextInput"
              type="text"
              className="input-text"
              placeholder="내일의 나를 위해 무엇을 해볼까요?"
              value={nextTask}
              onChange={(e) => setNextTask(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="messageInput">4. 나에게 한마디</label>
            <input
              id="messageInput"
              type="text"
              className="input-text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button type="button" className="btn-submit" onClick={handleSave}>
            {hasRecordedToday ? '오늘 기록 수정하기' : '오늘 기록하기'}
          </button>
        </div>

        <div className="live-report">
          <div>
            <h4 className="live-report-title">실시간 나의 기록 흐름</h4>
            <div className="stats-grid">
              <div className="stat-card">
                <h5>연속 실천</h5>
                <p>{streak}일</p>
              </div>
              <div className="stat-card">
                <h5>이번 달 기록</h5>
                <p>{monthCount}회</p>
              </div>
              <div className="stat-card">
                <h5>주요 감정</h5>
                <p className="stat-emo">{topEmotion}</p>
              </div>
              <div className="stat-card">
                <h5>소요 시간</h5>
                <p>3분</p>
              </div>
            </div>
          </div>
          <div className="live-report-footer">
            <p>
              <i className="fa-solid fa-quote-left" /> {previewMsg}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
