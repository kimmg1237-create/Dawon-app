import { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import survey from '../newsite/sections/survey.html?raw'
import { SectionPage } from './SectionPage'

type WishRow = {
  id: string
  user_id: string
  data: Record<string, unknown>
  scores: { completeness?: number; readiness?: number }
  submitted_at: string
  version: string
}

export function AdminResponsesPage() {
  const { user, isAdmin, loading, configured } = useAuth()
  const [rows, setRows] = useState<WishRow[]>([])
  const [error, setError] = useState('')
  const [showSurvey, setShowSurvey] = useState(false)

  useEffect(() => {
    if (!user || !isAdmin || !supabase) return
    void (async () => {
      const { data, error: err } = await supabase
        .from('wish_survey_responses')
        .select('*')
        .order('submitted_at', { ascending: false })
      if (err) {
        setError(err.message)
        // fallback local
        try {
          const local = JSON.parse(localStorage.getItem('dawonLifeStageWishResponses_v3') || '[]')
          setRows(
            local.map((x: { id: string; data: Record<string, unknown>; scores: WishRow['scores']; submittedAt: string; version?: string }) => ({
              id: x.id,
              user_id: 'local',
              data: x.data,
              scores: x.scores,
              submitted_at: x.submittedAt,
              version: x.version || 'local',
            })),
          )
        } catch {
          /* ignore */
        }
        return
      }
      setRows((data || []) as WishRow[])
    })()
  }, [user, isAdmin])

  if (loading) return <div className="container page-banner">권한 확인 중…</div>
  if (!configured) return <Navigate to="/login" replace state={{ from: '/admin/responses' }} />
  if (!user) return <Navigate to="/login" replace state={{ from: '/admin/responses' }} />
  if (!isAdmin) {
    return (
      <div className="container page-banner">
        <h1>응답관리</h1>
        <p>관리자 권한이 필요합니다. Supabase `admin_users` 테이블에 본인 user_id를 등록하세요.</p>
        <p>
          <Link to="/">홈으로</Link>
        </p>
      </div>
    )
  }

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
    <div className="container" style={{ paddingBottom: 48 }}>
      <div className="page-banner">
        <div className="eyebrow">ADMIN</div>
        <h1>응답관리</h1>
        <p>제출된 바람설계 설문을 조회·내보내기·삭제합니다. 관리자만 접근할 수 있습니다.</p>
      </div>
      <div className="tool-actions" style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={exportJson}>
          JSON 내보내기
        </button>
        <button type="button" className="btn btn-light" onClick={() => setShowSurvey((v) => !v)}>
          {showSurvey ? '설문 작성기 닫기' : '설문 작성기 열기'}
        </button>
      </div>
      {error ? <p className="login-error">서버: {error} (로컬 백업 표시 가능)</p> : null}
      <div className="team-list">
        {rows.length === 0 ? (
          <div className="empty">저장된 제출 응답이 없습니다.</div>
        ) : (
          rows.map((x) => (
            <article key={x.id} className="admin-item" style={{ border: '1px solid var(--line)', borderRadius: 16, padding: 16, marginBottom: 10, background: '#fff' }}>
              <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <h4 style={{ margin: 0 }}>{x.id}</h4>
                <small>{new Date(x.submitted_at).toLocaleString('ko-KR')}</small>
              </header>
              <p>
                <b>
                  {String(x.data.lifeStage || '단계 미선택')} · {String(x.data.lifeDomain || x.data.wishAreas || '')}
                </b>
                <br />
                {String(x.data.wishText || '').slice(0, 180)}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
