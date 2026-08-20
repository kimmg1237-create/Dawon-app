import { useEffect, useRef } from 'react'
import { Seo } from '../components/Seo'
import '../newsite/dawonOs/subpages.css'
import programsHtml from '../newsite/dawonOs/programs.html?raw'
import { applyDawonI18n, dawonT, getDawonLang } from '../newsite/dawonOs/i18n'

export function ProgramsPage() {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    el.innerHTML = programsHtml
    applyDawonI18n(el)

    const onLang = () => applyDawonI18n(el)
    window.addEventListener('dawon-lang-changed', onLang)

    el.querySelectorAll<HTMLElement>('.audience .card[data-aud-name]').forEach((card) => {
      card.addEventListener('click', () => {
        const modal = el.querySelector<HTMLElement>('#audienceModal')
        if (!modal) return
        const eN = modal.querySelector('#audienceName')
        const eD = modal.querySelector('#audienceDetail')
        const eC = modal.querySelector('#audienceCode')
        const lang = getDawonLang()
        const suffix = lang === 'en' ? ' program' : lang === 'ja' ? ' プログラム' : lang === 'zh' ? ' 项目' : ' 프로그램'
        if (eN) eN.textContent = (card.dataset.audName || '') + suffix
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
    return () => {
      window.removeEventListener('dawon-lang-changed', onLang)
      el.innerHTML = ''
    }
  }, [])


  return (
    <>
      <Seo
        title={`${dawonT('programs', getDawonLang())} | DAWON`}
        description={dawonT('programsHeroDesc', getDawonLang())}
        path="/programs"
      />
      <div ref={host} />
    </>
  )
}
