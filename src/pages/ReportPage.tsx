import { useEffect, useRef } from 'react'
import { Seo } from '../components/Seo'
import '../newsite/dawonOs/subpages.css'
import reportHtml from '../newsite/dawonOs/report.html?raw'
import { applyDawonI18n, dawonT, getDawonLang } from '../newsite/dawonOs/i18n'

export function ReportPage() {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    el.innerHTML = reportHtml
    applyDawonI18n(el)
    const onLang = () => applyDawonI18n(el)
    window.addEventListener('dawon-lang-changed', onLang)
    window.scrollTo({ top: 0, behavior: 'auto' })
    return () => {
      window.removeEventListener('dawon-lang-changed', onLang)
      el.innerHTML = ''
    }
  }, [])

  const lang = getDawonLang()

  return (
    <>
      <Seo
        title={`${dawonT('report', lang)} | DAWON`}
        description={dawonT('reportHeroDesc', lang)}
        path="/report"
      />
      <div ref={host} />
    </>
  )
}
