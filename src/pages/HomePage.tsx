import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import lifeDesignHome from '../newsite/sections/lifeDesignHome.html?raw'
import '../newsite/lifeDesign.css'
import { startJourney, stepFromPath } from '../services/journeyService'

function routeForQuery(q: string): string {
  if (/생애|단계|나이|학생|성인|중년|노후|청년|진로/.test(q)) return '/life-stage'
  if (/7일|기록|도전|실천/.test(q)) return '/records'
  if (/책|전자책|만화|노래|음악|오디오|콘텐츠|서재|라이브러리/.test(q)) return '/library'
  if (/구독|결제|이용권/.test(q)) return '/subscribe'
  if (/마음|생활|가족|일|관계|돈/.test(q)) return '/quick-design#survey'
  return '/quick-design#survey'
}

export function HomePage() {
  const host = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const el = host.current
    if (!el) return
    el.innerHTML = lifeDesignHome

    document.body.classList.add('large-text')
    document.body.classList.remove('high-contrast')

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href^="/"]') as HTMLAnchorElement | null
      if (!a) return
      const href = a.getAttribute('href')
      if (!href || href.startsWith('//') || href.includes(':')) return
      e.preventDefault()
      if (href.includes('journey=1')) {
        const path = href.split('?')[0] || '/life-stage'
        startJourney(stepFromPath(path) || 'life-stage')
      }
      navigate(href)
    }

    const form = el.querySelector('#portalSearch') as HTMLFormElement | null
    const input = el.querySelector('#searchInput') as HTMLInputElement | null

    const onSubmit = (e: Event) => {
      e.preventDefault()
      const q = input?.value.trim() || ''
      if (!q) return
      navigate(routeForQuery(q))
    }

    const onKeyword = (e: Event) => {
      const btn = (e.target as HTMLElement | null)?.closest?.('[data-search-keyword]') as HTMLElement | null
      if (!btn || !input) return
      const keyword = btn.getAttribute('data-search-keyword') || btn.textContent || ''
      input.value = keyword
      input.focus()
      navigate(routeForQuery(keyword))
    }

    el.addEventListener('click', onClick)
    form?.addEventListener('submit', onSubmit)
    el.querySelector('.hero-keywords')?.addEventListener('click', onKeyword)

    return () => {
      el.removeEventListener('click', onClick)
      form?.removeEventListener('submit', onSubmit)
      el.querySelector('.hero-keywords')?.removeEventListener('click', onKeyword)
      queueMicrotask(() => {
        if (host.current === el) el.innerHTML = ''
      })
    }
  }, [navigate])

  return <div ref={host} className="life-design-home home-hero-only" />
}
