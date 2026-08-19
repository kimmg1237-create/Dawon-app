import { useEffect, useRef } from 'react'
import { Seo } from '../components/Seo'
import '../newsite/dawonOs/subpages.css'
import reportHtml from '../newsite/dawonOs/report.html?raw'

export function ReportPage() {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    el.innerHTML = reportHtml
    window.scrollTo({ top: 0, behavior: 'auto' })
    return () => { el.innerHTML = '' }
  }, [])

  return (
    <>
      <Seo
        title="성장리포트 | DAWON 다원 하루설계"
        description="하루설계 사용 후 남는 성장리포트, 성과지표, 기대효과를 확인하세요."
        path="/report"
      />
      <div ref={host} />
    </>
  )
}
