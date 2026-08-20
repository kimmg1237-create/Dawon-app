import { useEffect, useRef } from 'react'
import { Seo } from '../components/Seo'
import '../newsite/dawonOs/subpages.css'
import institutionHtml from '../newsite/dawonOs/institution.html?raw'
import { applyDawonI18n, dawonT, getDawonLang } from '../newsite/dawonOs/i18n'

export function InstitutionPage() {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    el.innerHTML = institutionHtml
    applyDawonI18n(el)

    const openModal = (id: string) => {
      const m = el.querySelector<HTMLElement>('#' + id)
      if (m) m.classList.add('open')
    }
    el.querySelector('#openInquiryBtn')?.addEventListener('click', () => openModal('institutionModal'))
    el.querySelector('#openInquiryBtn2')?.addEventListener('click', () => openModal('institutionModal'))

    el.querySelectorAll<HTMLElement>('[data-close-modal]').forEach((b) => {
      b.addEventListener('click', () => {
        const m = el.querySelector<HTMLElement>('#' + b.dataset.closeModal)
        if (m) m.classList.remove('open')
      })
    })
    el.querySelectorAll<HTMLElement>('.modal').forEach((m) => {
      m.addEventListener('click', (e) => {
        if (e.target === m) m.classList.remove('open')
      })
    })

    el.querySelector('#submitInquiry')?.addEventListener('click', () => {
      const org = (el.querySelector<HTMLInputElement>('#inqOrg')?.value || '').trim()
      const target = el.querySelector<HTMLSelectElement>('#inqTarget')?.value || ''
      const period = el.querySelector<HTMLSelectElement>('#inqPeriod')?.value || ''
      const contact = (el.querySelector<HTMLInputElement>('#inqContact')?.value || '').trim()
      const body = (el.querySelector<HTMLTextAreaElement>('#inqBody')?.value || '').trim()
      const result = el.querySelector<HTMLElement>('#inquiryResult')
      const lang = getDawonLang()
      if (!org) {
        if (result) {
          result.style.display = 'block'
          result.textContent = dawonT('instNeedOrg', lang)
          result.style.background = '#fef3cd'
          result.style.color = '#856404'
        }
        return
      }
      localStorage.setItem('dawon_inquiry', JSON.stringify({ org, target, period, contact, body }))
      if (result) {
        result.style.display = 'block'
        result.textContent = dawonT('instSaved', lang)
      }
    })

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
        title={`${dawonT('institution', lang)} | DAWON`}
        description={dawonT('instHeroDesc', lang)}
        path="/institution"
      />
      <div ref={host} />
    </>
  )
}
