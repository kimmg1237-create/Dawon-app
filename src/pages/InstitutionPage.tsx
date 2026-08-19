import { useEffect, useRef } from 'react'
import { Seo } from '../components/Seo'
import '../newsite/dawonOs/subpages.css'
import institutionHtml from '../newsite/dawonOs/institution.html?raw'

export function InstitutionPage() {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    el.innerHTML = institutionHtml

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
      m.addEventListener('click', (e) => { if (e.target === m) m.classList.remove('open') })
    })

    el.querySelector('#submitInquiry')?.addEventListener('click', () => {
      const org = (el.querySelector<HTMLInputElement>('#inqOrg')?.value || '').trim()
      const target = el.querySelector<HTMLSelectElement>('#inqTarget')?.value || ''
      const period = el.querySelector<HTMLSelectElement>('#inqPeriod')?.value || ''
      const contact = (el.querySelector<HTMLInputElement>('#inqContact')?.value || '').trim()
      const body = (el.querySelector<HTMLTextAreaElement>('#inqBody')?.value || '').trim()
      const result = el.querySelector<HTMLElement>('#inquiryResult')
      if (!org) {
        if (result) { result.style.display = 'block'; result.textContent = '기관명을 입력해 주세요.'; result.style.background = '#fef3cd'; result.style.color = '#856404' }
        return
      }
      const data = { org, target, period, contact, body }
      localStorage.setItem('dawon_inquiry', JSON.stringify(data))
      if (result) { result.style.display = 'block'; result.textContent = '문의 내용이 임시 저장되었습니다. 실제 사이트에서는 담당자에게 자동 전송됩니다.' }
    })

    window.scrollTo({ top: 0, behavior: 'auto' })
    return () => { el.innerHTML = '' }
  }, [])

  return (
    <>
      <Seo
        title="학교·기관 도입 | DAWON 다원 하루설계"
        description="학교·기관 담당자를 위한 도입 절차, 운영 프로세스, 성과지표, 개인정보 보호 안내"
        path="/institution"
      />
      <div ref={host} />
    </>
  )
}
