import { useEffect, useRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { initStrategySite } from '../newsite/initStrategy'
import { DawonLibrary } from '../newsite/DawonLibrary'
import sharedChrome from '../newsite/sections/sharedChrome.html?raw'

type Props = {
  html: string
  title: string
  description?: string
  mountLibrary?: boolean
  prefixHtml?: string
}

export function SectionPage({ html, title, description, mountLibrary, prefixHtml = '' }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const libraryRoot = useRef<Root | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    host.innerHTML = `${prefixHtml}${html}${sharedChrome}`

    if (mountLibrary) {
      const libraryHost = document.getElementById('dawonLibraryRoot')
      if (libraryHost) {
        libraryRoot.current = createRoot(libraryHost)
        libraryRoot.current.render(<DawonLibrary />)
      }
    }

    try {
      initStrategySite()
    } catch (error) {
      console.error('섹션 초기화 오류', error)
    }

    const routeMap: Record<string, string> = {
      '#quick-design': '/quick-design',
      '#life-stage': '/life-stage',
      '#integrated-strategy': '/strategy',
      '#action-log': '/records',
      '#library': '/library',
      '#ops-tools': '/operations',
      '#survey': '/survey',
      '#ai-hub': '/operations',
      '#team': '/operations',
      '#idea-lab': '/operations',
      '#strategy': '/operations',
    }
    host.querySelectorAll('a[href^="#"]').forEach((a) => {
      const href = a.getAttribute('href') || ''
      const next = routeMap[href]
      if (!next) return
      a.setAttribute('href', next)
    })
    host.querySelectorAll('button#stageToSurvey').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        window.location.assign('/survey')
      })
    })

    if (localStorage.getItem('dawonLargeText') === '1') document.body.classList.add('large-text')
    if (localStorage.getItem('dawonHighContrast') === '1') document.body.classList.add('high-contrast')

    return () => {
      libraryRoot.current?.unmount()
      libraryRoot.current = null
      document.querySelectorAll('[data-dawon-stub="1"]').forEach((n) => n.remove())
      host.innerHTML = ''
    }
  }, [html, mountLibrary, prefixHtml])

  return (
    <div className="section-page">
      <div className="container page-banner">
        <div className="eyebrow">DAWON EXECUTION</div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      <div ref={hostRef} />
    </div>
  )
}
