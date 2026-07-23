import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import survey from '../newsite/sections/survey.html?raw'
import { SectionPage } from '../pages/SectionPage'

type WishRow = {
  id: string
  user_id: string
  data: Record<string, unknown>
  scores: { completeness?: number; readiness?: number }
  submitted_at: string
  version: string
}

export function AdminResponsesPanel() {
  const [rows, setRows] = useState<WishRow[]>([])
  const [error, setError] = useState('')
  const [showSurvey, setShowSurvey] = useState(false)

  useEffect(() => {
    if (!supabase) return
    void (async () => {
      const { data, error: err } = await supabase
        .from('wish_survey_responses')
        .select('*')
        .order('submitted_at', { ascending: false })
      if (err) {
        setError(err.message)
        try {
          const local = JSON.parse(localStorage.getItem('dawonLifeStageWishResponses_v3') || '[]')
          setRows(
            local.map(
              (x: {
                id: string
                data: Record<string, unknown>
                scores: WishRow['scores']
                submittedAt: string
                version?: string
              }) => ({
                id: x.id,
                user_id: 'local',
                data: x.data,
                scores: x.scores,
                submitted_at: x.submittedAt,
                version: x.version || 'local',
              }),
            ),
          )
        } catch {
          /* ignore */
        }
        return
      }
      setRows((data || []) as WishRow[])
    })()
  }, [])

  function exportJson() {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `dawon-wish-responses-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function removeRow(id: string) {
    if (!confirm('이 응답을 삭제할까요?')) return
    if (supabase) {
      await supabase.from('wish_survey_responses').delete().eq('id', id)
    }
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>설문 응답</h2>
        <div className="admin-actions">
          <button type="button" className="btn btn-primary" onClick={exportJson}>
            JSON 내보내기
          </button>
          <button type="button" className="btn btn-light" onClick={() => setShowSurvey((v) => !v)}>
            {showSurvey ? '설문 작성기 닫기' : '설문 작성기 열기'}
          </button>
        </div>
      </div>
      {error ? <p className="admin-status">서버: {error} (로컬 백업 표시 가능)</p> : null}
      <div className="team-list">
        {rows.length === 0 ? (
          <div className="empty">저장된 제출 응답이 없습니다.</div>
        ) : (
          rows.map((x) => (
            <article key={x.id} className="admin-item">
              <header>
                <h4>{x.id}</h4>
                <small>{new Date(x.submitted_at).toLocaleString('ko-KR')}</small>
              </header>
              <p>
                <b>
                  {String(x.data.lifeStage || '단계 미선택')} · {String(x.data.lifeDomain || x.data.wishAreas || '')}
                </b>
                <br />
                {String(x.data.wishText || '').slice(0, 180)}
              </p>
              <div className="admin-actions">
                <span className="pill">완성도 {x.scores?.completeness ?? '-'}</span>
                <span className="pill">준비도 {x.scores?.readiness ?? '-'}</span>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => void removeRow(x.id)}>
                  삭제
                </button>
              </div>
            </article>
          ))
        )}
      </div>
      {showSurvey ? (
        <SectionPage title="바람설계 설문" description="관리자 미리보기·작성기" html={survey} />
      ) : null}
    </div>
  )
}
