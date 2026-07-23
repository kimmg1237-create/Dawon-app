import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { initStrategySite } from '../newsite/initStrategy'
import { DawonLibrary } from '../newsite/DawonLibrary'
import sharedChrome from '../newsite/sections/sharedChrome.html?raw'
import { h2ToHtml, type PageCopy } from '../data/siteCopyDefaults'

type Props = {
  html: string
  title: string
  description?: string
  mountLibrary?: boolean
  prefixHtml?: string
  sectionCopy?: PageCopy
}

function applySectionCopy(host: HTMLElement, sectionCopy?: PageCopy) {
  if (!sectionCopy) return
  host.querySelectorAll('[data-copy="kicker"]').forEach((el) => {
    el.textContent = sectionCopy.kicker
  })
  host.querySelectorAll('[data-copy="h2"]').forEach((el) => {
    el.innerHTML = h2ToHtml(sectionCopy.h2)
  })
  host.querySelectorAll('[data-copy="lead"]').forEach((el) => {
    el.textContent = sectionCopy.lead
  })
}

/**
 * HTML 조각을 마운트합니다.
 * 라이브러리는 createRoot가 아니라 createPortal로 렌더해
 * Auth/Subscription/Router 컨텍스트를 그대로 물려받습니다.
 */
export function SectionPage({ html, title, description, mountLibrary, prefixHtml = '', sectionCopy }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [libraryHost, setLibraryHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    host.innerHTML = `${prefixHtml}${html}${sharedChrome}`
    applySectionCopy(host, sectionCopy)

    if (mountLibrary) {
      setLibraryHost(document.getElementById('dawonLibraryRoot'))
    } else {
      setLibraryHost(null)
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
      '#survey': '/quick-design#survey',
      '#result': '/quick-design#result',
      '#ai-hub': '/operations',
      '#team': '/operations',
      '#idea-lab': '/operations',
      '#strategy': '/operations',
    }
    host.querySelectorAll('a[href^="#"]').forEach((a) => {
      const href = a.getAttribute('href') || ''
      if ((href === '#survey' || href === '#result' || href === '#quick-design') && host.querySelector(href)) {
        return
      }
      const next = routeMap[href]
      if (!next) return
      a.setAttribute('href', next)
    })
    host.querySelectorAll('button#stageToSurvey').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        const surveyEl = host.querySelector('#survey')
        if (surveyEl) {
          surveyEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
        window.location.assign('/quick-design#survey')
      })
    })

    const hash = window.location.hash
    if (hash) {
      requestAnimationFrame(() => {
        host.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }

    document.body.classList.add('large-text')
    document.body.classList.remove('high-contrast')

    return () => {
      setLibraryHost(null)
      document.querySelectorAll('[data-dawon-stub="1"]').forEach((n) => n.remove())
      queueMicrotask(() => {
        if (hostRef.current === host) host.innerHTML = ''
      })
    }
  }, [html, mountLibrary, prefixHtml, sectionCopy])

  return (
    <div className="section-page">
      <div className="container page-banner">
        <div className="eyebrow">DAWON EXECUTION</div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      <div ref={hostRef} />
      {libraryHost ? createPortal(<DawonLibrary />, libraryHost) : null}
    </div>
  )
}
