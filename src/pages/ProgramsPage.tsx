import { useEffect, useRef } from 'react'
import { Seo } from '../components/Seo'
import '../newsite/dawonOs/subpages.css'
import programsHtml from '../newsite/dawonOs/programs.html?raw'

export function ProgramsPage() {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    el.innerHTML = programsHtml

    el.querySelectorAll<HTMLElement>('.audience .card[data-aud-name]').forEach((card) => {
      card.addEventListener('click', () => {
        const modal = el.querySelector<HTMLElement>('#audienceModal')
        if (!modal) return
        const eN = modal.querySelector('#audienceName')
        const eD = modal.querySelector('#audienceDetail')
        const eC = modal.querySelector('#audienceCode')
        if (eN) eN.textContent = (card.dataset.audName || '') + ' 프로그램'
        if (eD) eD.textContent = card.dataset.audDetail || ''
        if (eC) eC.textContent = card.dataset.audCode || ''
        modal.classList.add('open')
      })
    })

    el.querySelectorAll<HTMLElement>('[data-close-modal]').forEach((b) => {
      b.addEventListener('click', () => {
        const m = el.querySelector<HTMLElement>('#' + b.dataset.closeModal)
        if (m) m.classList.remove('open')
      })
    })
    el.querySelectorAll<HTMLElement>('.modal').forEach((m) => {
      m.addEventListener('click', (e) => { if (e.target === m) m.classList.remove('open') })
    })

    window.scrollTo({ top: 0, behavior: 'auto' })
    return () => { el.innerHTML = '' }
  }, [])

  return (
    <>
      <Seo
        title="대상별 프로그램 | DAWON 다원 하루설계"
        description="초등학생부터 시니어까지 대상에 맞는 생활설계 프로그램을 확인하세요."
        path="/programs"
      />
      <div ref={host} />
    </>
  )
}
