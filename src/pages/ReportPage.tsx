import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthGate } from '../components/AuthGate'
import { useAuth } from '../context/AuthContext'
import { useSiteCopy } from '../context/SiteCopyContext'
import {
  areaCounts,
  calcStreak,
  DAY_AREAS,
  koDate,
  scoreDay,
  summaryText,
  type DayRecord,
} from '../data/dayRecords'
import { fetchDayRecords } from '../services/dayRecordService'
import './ReportPage.css'

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function avg(nums: number[]): number {
  if (!nums.length) return 0
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

export function ReportPage() {
  const { user } = useAuth()
  const { copy } = useSiteCopy()
  const page = copy.pages.report
  const [records, setRecords] = useState<DayRecord[]>([])

  useEffect(() => {
    void fetchDayRecords(user?.id || '').then(setRecords)
  }, [user?.id])

  const streak = calcStreak(records)
  const areas = areaCounts(records)
  const topArea = useMemo(() => {
    const entries = Object.entries(areas).sort((a, b) => b[1] - a[1])
    return entries[0]?.[1] ? entries[0][0] : '—'
  }, [areas])
  const scored = records.map((r) => ({ ...r, score: r.score || scoreDay(r) }))
  const avgScore = avg(scored.map((r) => r.score))
  const avgEnergy = avg(scored.map((r) => r.energy || 0))
  const last14 = scored.slice(0, 14)

  function exportAll() {
    const text =
      `DAWON 성장리포트\n${new Date().toLocaleString('ko-KR')}\n\n` +
      `연속 ${streak}일 · 누적 ${records.length}일 · 평균 ${avgScore}점 · 주요 영역 ${topArea}\n\n` +
      scored.map((r) => summaryText(r)).join('\n\n---\n\n')
    downloadText(`DAWON_성장리포트_${new Date().toISOString().slice(0, 10)}.txt`, text)
  }

  function exportCsv() {
    const header = 'date,area,mood,energy,score,action,tomorrow\n'
    const rows = scored
      .map((r) =>
        [r.date, r.area, r.mood, r.energy, r.score, JSON.stringify(r.action || ''), JSON.stringify(r.tomorrow || '')].join(
          ',',
        ),
      )
      .join('\n')
    downloadText(`DAWON_성장리포트_${new Date().toISOString().slice(0, 10)}.csv`, header + rows)
  }

  return (
    <>
      <AuthGate action="성장리포트 동기화" />
      <div className="section-page">
        <div className="container page-banner">
          <div className="eyebrow">DAWON GROWTH</div>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
        </div>

        <section className="section report-page">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="kicker">{page.kicker}</div>
                <h2 dangerouslySetInnerHTML={{ __html: page.h2.replace(/\n/g, '<br>') }} />
              </div>
              <p>{page.lead}</p>
            </div>

            <div className="report-kpis">
              <div>
                <span>연속 기록</span>
                <b>{streak}일</b>
              </div>
              <div>
                <span>누적 일수</span>
                <b>{records.length}일</b>
              </div>
              <div>
                <span>평균 완성도</span>
                <b>{avgScore}점</b>
              </div>
              <div>
                <span>평균 에너지</span>
                <b>{avgEnergy}/10</b>
              </div>
              <div>
                <span>가장 많이 다룬 영역</span>
                <b>{topArea}</b>
              </div>
            </div>

            <div className="report-actions">
              <button type="button" className="btn btn-primary" onClick={exportAll}>
                전체 TXT
              </button>
              <button type="button" className="btn btn-light" onClick={exportCsv}>
                CSV
              </button>
              <Link className="btn btn-mint" to="/quick-design">
                오늘설계 이어쓰기
              </Link>
              <Link className="btn btn-outline" to="/records">
                7일 설계
              </Link>
            </div>

            <div className="report-grid">
              <article className="report-panel">
                <h3>영역 분포</h3>
                <ul className="report-bars">
                  {DAY_AREAS.map((a) => {
                    const n = areas[a] || 0
                    const pct = records.length ? Math.round((n / records.length) * 100) : 0
                    return (
                      <li key={a}>
                        <div>
                          <b>{a}</b>
                          <span>
                            {n}회 · {pct}%
                          </span>
                        </div>
                        <i>
                          <em style={{ width: `${pct}%` }} />
                        </i>
                      </li>
                    )
                  })}
                </ul>
              </article>

              <article className="report-panel">
                <h3>최근 14일</h3>
                {last14.length === 0 ? (
                  <p className="muted">아직 기록이 없습니다. 오늘설계에서 첫날을 남겨 보세요.</p>
                ) : (
                  <ul className="report-days">
                    {last14.map((r) => (
                      <li key={r.date}>
                        <div>
                          <b>{koDate(r.date)}</b>
                          <span>
                            {r.area} · {r.mood || '—'} · {r.score}점
                          </span>
                        </div>
                        <p>{r.action || r.done || '—'}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
