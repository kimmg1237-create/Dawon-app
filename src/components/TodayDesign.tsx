import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  DAY_AREAS,
  DAY_MOODS,
  calcStreak,
  emptyDay,
  koDate,
  scoreDay,
  summaryText,
  todayKey,
  type DayRecord,
} from '../data/dayRecords'
import { useSpeechInput, useSpeechSpeak } from '../hooks/useSpeech'
import { fetchDayRecords, removeDayRecord, saveDayRecord } from '../services/dayRecordService'
import { seedTrackerFromDay } from '../services/trackerHandoff'
import './TodayDesign.css'

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

type FieldKey = 'done' | 'action' | 'result' | 'tomorrow' | 'selfWord' | 'memo'

export function TodayDesign() {
  const { user } = useAuth()
  const [form, setForm] = useState<DayRecord>(() => emptyDay())
  const [records, setRecords] = useState<DayRecord[]>([])
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const { listening, error: speechError, listen, clearError } = useSpeechInput()
  const { speak, stop } = useSpeechSpeak()

  const liveScore = scoreDay(form)
  const streak = calcStreak(records)

  useEffect(() => {
    void (async () => {
      const list = await fetchDayRecords(user?.id || '')
      setRecords(list)
      const today = list.find((r) => r.date === todayKey())
      if (today) setForm(today)
    })()
  }, [user?.id])

  function patch<K extends keyof DayRecord>(key: K, value: DayRecord[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function voiceFill(field: FieldKey) {
    clearError()
    listen((text) => {
      setForm((prev) => {
        const cur = String(prev[field] || '')
        return { ...prev, [field]: cur ? `${cur} ${text}` : text }
      })
    })
  }

  async function onSave() {
    if (!form.action.trim() && !form.done.trim()) {
      setStatus('오늘 한 일 또는 하나의 실천을 적어 주세요.')
      return
    }
    setSaving(true)
    setStatus('')
    const next: DayRecord = {
      ...form,
      date: form.date || todayKey(),
      score: scoreDay(form),
      savedAt: new Date().toISOString(),
    }
    const list = await saveDayRecord(user?.id, next)
    setRecords(list)
    setForm(next)
    seedTrackerFromDay(next)
    setStatus('오늘설계를 저장했습니다.')
    setSaving(false)
  }

  async function onDelete() {
    if (!form.date || !confirm(`${koDate(form.date)} 기록을 지울까요?`)) return
    const list = await removeDayRecord(user?.id, form.date)
    setRecords(list)
    setForm(emptyDay())
    setStatus('기록을 삭제했습니다.')
  }

  function onCopy() {
    const text = summaryText({ ...form, score: liveScore })
    void navigator.clipboard.writeText(text).then(
      () => setStatus('요약 카드를 복사했습니다.'),
      () => setStatus('복사에 실패했습니다.'),
    )
  }

  function onDownload() {
    downloadText(`DAWON_오늘설계_${form.date || todayKey()}.txt`, summaryText({ ...form, score: liveScore }))
    setStatus('TXT 파일을 저장했습니다.')
  }

  function onSpeak() {
    stop()
    const ok = speak(summaryText({ ...form, score: liveScore }))
    setStatus(ok ? '요약을 읽어 드립니다.' : '이 브라우저는 음성 재생을 지원하지 않습니다.')
  }

  function loadRecord(r: DayRecord) {
    setForm(r)
    setStatus(`${koDate(r.date)} 기록을 불러왔습니다.`)
  }

  return (
    <section className="section today-design" id="today-design">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="kicker">TODAY DESIGN · CHECK → ACT → NEXT</div>
            <h2>
              오늘 하루를 확인하고
              <br />
              내일의 첫 행동을 정합니다
            </h2>
          </div>
          <p>
            길게 쓰지 않아도 됩니다. 한 일과 감정, 하나의 실천, 내일 할 일만 남기면 7일
            설계로 이어집니다.
          </p>
        </div>

        <div className="today-stats">
          <div>
            <span>연속 기록</span>
            <b>{streak}일</b>
          </div>
          <div>
            <span>오늘 완성도</span>
            <b>{liveScore}점</b>
          </div>
          <div>
            <span>누적 기록</span>
            <b>{records.length}일</b>
          </div>
        </div>

        <div className="today-layout">
          <form
            className="today-form"
            onSubmit={(e) => {
              e.preventDefault()
              void onSave()
            }}
          >
            <div className="today-date-row">
              <label htmlFor="todayDate">날짜</label>
              <input
                id="todayDate"
                type="date"
                value={form.date}
                onChange={(e) => patch('date', e.target.value || todayKey())}
              />
              <button type="button" className="btn btn-light btn-sm" onClick={() => setForm(emptyDay())}>
                오늘로
              </button>
            </div>

            <div className="compact-field wide">
              <label htmlFor="todayDone">
                오늘 확인한 것 <small>(한 일·느낀 점)</small>
                <button type="button" className="voice-btn" onClick={() => voiceFill('done')} disabled={listening}>
                  {listening ? '듣는 중…' : '말하기'}
                </button>
              </label>
              <textarea
                id="todayDone"
                value={form.done}
                onChange={(e) => patch('done', e.target.value)}
                placeholder="예: 아침 산책 15분, 책상 정리"
                maxLength={400}
              />
            </div>

            <div className="today-row-2">
              <div className="compact-field">
                <label>지금 감정</label>
                <div className="chip-row" role="group" aria-label="감정">
                  {DAY_MOODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`chip${form.mood === m ? ' active' : ''}`}
                      onClick={() => patch('mood', m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="compact-field">
                <label htmlFor="todayEnergy">에너지 {form.energy}/10</label>
                <input
                  id="todayEnergy"
                  type="range"
                  min={1}
                  max={10}
                  value={form.energy}
                  onChange={(e) => patch('energy', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="compact-field">
              <label>삶의 영역</label>
              <div className="chip-row wrap" role="group" aria-label="영역">
                {DAY_AREAS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={`chip${form.area === a ? ' active' : ''}`}
                    onClick={() => patch('area', a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="compact-field wide">
              <label htmlFor="todayAction">
                하나의 실천 <small>(필수에 가깝게)</small>
                <button type="button" className="voice-btn" onClick={() => voiceFill('action')} disabled={listening}>
                  {listening ? '듣는 중…' : '말하기'}
                </button>
              </label>
              <textarea
                id="todayAction"
                value={form.action}
                onChange={(e) => patch('action', e.target.value)}
                placeholder="예: 자기 전 휴대폰 없이 10분 호흡"
                maxLength={280}
                required
              />
            </div>

            <div className="compact-field wide">
              <label htmlFor="todayResult">
                결과와 배움
                <button type="button" className="voice-btn" onClick={() => voiceFill('result')} disabled={listening}>
                  {listening ? '듣는 중…' : '말하기'}
                </button>
              </label>
              <textarea
                id="todayResult"
                value={form.result}
                onChange={(e) => patch('result', e.target.value)}
                placeholder="예: 시작이 제일 어려웠다. 타이머가 도움이 됐다."
                maxLength={400}
              />
            </div>

            <div className="compact-field wide">
              <label htmlFor="todayTomorrow">
                내일의 첫 행동
                <button type="button" className="voice-btn" onClick={() => voiceFill('tomorrow')} disabled={listening}>
                  {listening ? '듣는 중…' : '말하기'}
                </button>
              </label>
              <input
                id="todayTomorrow"
                value={form.tomorrow}
                onChange={(e) => patch('tomorrow', e.target.value)}
                placeholder="예: 일어나자마자 물 한 잔"
                maxLength={200}
              />
            </div>

            <div className="today-row-2">
              <div className="compact-field">
                <label htmlFor="todaySelfWord">
                  나에게 한 마디
                  <button type="button" className="voice-btn" onClick={() => voiceFill('selfWord')} disabled={listening}>
                    {listening ? '듣는 중…' : '말하기'}
                  </button>
                </label>
                <input
                  id="todaySelfWord"
                  value={form.selfWord}
                  onChange={(e) => patch('selfWord', e.target.value)}
                  placeholder="예: 오늘도 충분히 잘했다"
                  maxLength={120}
                />
              </div>
              <div className="compact-field">
                <label htmlFor="todayMemo">
                  메모
                  <button type="button" className="voice-btn" onClick={() => voiceFill('memo')} disabled={listening}>
                    {listening ? '듣는 중…' : '말하기'}
                  </button>
                </label>
                <input
                  id="todayMemo"
                  value={form.memo}
                  onChange={(e) => patch('memo', e.target.value)}
                  placeholder="선택"
                  maxLength={200}
                />
              </div>
            </div>

            <div className="today-actions">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? '저장 중…' : '오늘설계 저장'}
              </button>
              <button className="btn btn-light" type="button" onClick={onCopy}>
                요약 복사
              </button>
              <button className="btn btn-light" type="button" onClick={onDownload}>
                TXT
              </button>
              <button className="btn btn-mint" type="button" onClick={onSpeak}>
                읽어주기
              </button>
              <Link className="btn btn-outline" to="/records">
                7일 설계로
              </Link>
              <Link className="btn btn-outline" to="/quick-design#survey">
                바람설계
              </Link>
              {form.savedAt ? (
                <button className="btn btn-danger" type="button" onClick={() => void onDelete()}>
                  삭제
                </button>
              ) : null}
            </div>
            {status ? <p className="today-status">{status}</p> : null}
            {speechError ? <p className="today-status warn">{speechError}</p> : null}
          </form>

          <aside className="today-summary" aria-live="polite">
            <div className="today-summary-card">
              <span className="pill">요약 카드 · {liveScore}점</span>
              <h3>{koDate(form.date || todayKey())}</h3>
              <p className="today-summary-meta">
                {form.area || '나'} · {form.mood || '감정 미선택'} · 에너지 {form.energy}/10
              </p>
              <dl>
                <div>
                  <dt>확인</dt>
                  <dd>{form.done || '—'}</dd>
                </div>
                <div>
                  <dt>실천</dt>
                  <dd>{form.action || '—'}</dd>
                </div>
                <div>
                  <dt>배움</dt>
                  <dd>{form.result || '—'}</dd>
                </div>
                <div>
                  <dt>내일</dt>
                  <dd>{form.tomorrow || '—'}</dd>
                </div>
              </dl>
              {form.selfWord ? <blockquote>{form.selfWord}</blockquote> : null}
              <div className="score-bar" aria-hidden="true">
                <em style={{ width: `${liveScore}%` }} />
              </div>
            </div>

            <div className="today-recent">
              <h4>최근 기록</h4>
              {records.length === 0 ? (
                <p className="muted">아직 저장된 날이 없습니다.</p>
              ) : (
                <ul>
                  {records.slice(0, 7).map((r) => (
                    <li key={r.date}>
                      <button type="button" onClick={() => loadRecord(r)}>
                        <b>{r.date}</b>
                        <span>
                          {r.area} · {r.score}점
                        </span>
                        <small>{r.action || r.done || '내용 없음'}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
