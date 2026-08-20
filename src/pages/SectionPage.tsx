import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { initStrategySite } from '../newsite/initStrategy'
import { DawonLibrary, type LibraryTab } from '../newsite/DawonLibrary'
import sharedChrome from '../newsite/sections/sharedChrome.html?raw'
import { h2ToHtml, type PageCopy } from '../data/siteCopyDefaults'
import {
  advanceJourney,
  ensureJourneyFromUrl,
  isJourneyActive,
  patchJourney,
} from '../services/journeyService'

type Props = {
  html: string
  title: string
  description?: string
  mountLibrary?: boolean
  libraryTab?: LibraryTab
  onLibraryTabChange?: (tab: LibraryTab) => void
  prefixHtml?: string
  sectionCopy?: PageCopy
  hideBanner?: boolean
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
export function SectionPage({
  html,
  title,
  description,
  mountLibrary,
  libraryTab,
  onLibraryTabChange,
  prefixHtml = '',
  sectionCopy,
  hideBanner = false,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [libraryHost, setLibraryHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    host.innerHTML = `${prefixHtml}${html}${sharedChrome}`
    applySectionCopy(host, sectionCopy)
    ensureJourneyFromUrl()

    if (mountLibrary) {
      setLibraryHost(document.getElementById('dawonLibraryRoot'))
    } else {
      setLibraryHost(null)
      try {
        initStrategySite()
      } catch (error) {
        console.error('섹션 초기화 오류', error)
      }
    }

    const journeyQs = isJourneyActive() ? '?journey=1' : ''
    const strategyHref = isJourneyActive() ? '/operations?journey=1#strategy' : '/operations#strategy'
    const routeMap: Record<string, string> = {
      '#quick-design': `/quick-design${journeyQs}`,
      '#life-stage': `/life-stage${journeyQs}`,
      '#integrated-strategy': '/strategy',
      '#action-log': `/records${journeyQs}`,
      '#library': '/library',
      '#ops-tools': `/operations${journeyQs}`,
      '#survey': `/quick-design${journeyQs}#survey`,
      '#result': `/quick-design${journeyQs}#result`,
      '#ai-hub': '/operations#ai-hub',
      '#team': '/operations#team',
      '#idea-lab': '/operations#idea-lab',
      '#strategy': strategyHref,
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

    const wishHref = `/quick-design${isJourneyActive() ? '?journey=1' : ''}#survey`
    host.querySelectorAll('a#stageToWishLink, a[href="/quick-design#survey"]').forEach((a) => {
      a.setAttribute('href', wishHref)
      a.addEventListener('click', () => {
        const active = document.querySelector('.stage-tab.active') as HTMLElement | null
        const stage = active?.dataset.stage
        if (stage && isJourneyActive()) {
          patchJourney({ lifeStage: stage, step: 'quick-design' })
          advanceJourney('quick-design')
        }
      })
    })

    host.querySelectorAll('button#stageToSurvey').forEach((btn) => {
      btn.addEventListener(
        'click',
        (e) => {
          e.preventDefault()
          e.stopImmediatePropagation()
          const active = host.querySelector('.stage-tab.active') as HTMLElement | null
          const stage = active?.dataset.stage
          const surveyEl = host.querySelector('#survey')
          if (stage && isJourneyActive()) {
            patchJourney({ lifeStage: stage, step: 'quick-design' })
            advanceJourney('quick-design')
          } else if (stage) {
            patchJourney({ lifeStage: stage })
          }
          if (surveyEl && host.querySelector('#surveyForm') && !host.querySelector('#surveyForm')?.closest('[hidden]')) {
            const realForm = document.querySelector('#survey #surveyForm')
            if (realForm && host.contains(realForm)) {
              surveyEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
              return
            }
          }
          window.location.assign(`/quick-design${isJourneyActive() ? '?journey=1' : ''}#survey`)
        },
        true,
      )
    })

    const hash = window.location.hash
    if (hash && !(mountLibrary && (hash === '#library' || hash === '#dawonLibraryRoot'))) {
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
      {hideBanner ? null : (
        <div className={`container page-banner${mountLibrary ? ' page-banner-library' : ''}`}>
          <div className={mountLibrary ? 'kicker' : 'eyebrow'}>
            {mountLibrary ? sectionCopy?.kicker || '3F · LIBRARY & STUDIO' : 'DAWON EXECUTION'}
          </div>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
      )}
      <div ref={hostRef} />
      {libraryHost ? (
        createPortal(
          <DawonLibrary initialTab={libraryTab} onTabChange={onLibraryTabChange} hideTabs={mountLibrary} />,
          libraryHost,
        )
      ) : null}
    </div>
  )
}
