import { SectionPage } from './SectionPage'
import { AuthGate } from '../components/AuthGate'
import { TodayDesign } from '../components/TodayDesign'
import { useAuth } from '../context/AuthContext'
import { useSiteCopy } from '../context/SiteCopyContext'
import { supabase } from '../lib/supabase'
import survey from '../newsite/sections/survey.html?raw'
import { useEffect } from 'react'

export function QuickDesignPage() {
  const { user } = useAuth()
  const { copy } = useSiteCopy()
  const page = copy.pages.quickDesign

  useEffect(() => {
    function onSubmit(e: Event) {
      const item = (e as CustomEvent).detail as {
        id: string
        submittedAt: string
        data: Record<string, unknown>
        scores: Record<string, unknown>
        version: string
      }
      if (!user || !supabase || !item) return
      void supabase
        .from('wish_survey_responses')
        .upsert({
          id: item.id,
          user_id: user.id,
          data: item.data,
          scores: item.scores,
          version: item.version,
          submitted_at: item.submittedAt,
        })
        .then(({ error }) => {
          if (!error) {
            try {
              const all = JSON.parse(localStorage.getItem('dawonLifeStageWishResponses_v3') || '[]') as {
                id: string
              }[]
              localStorage.setItem(
                'dawonLifeStageWishResponses_v3',
                JSON.stringify(all.filter((x) => x.id !== item.id)),
              )
            } catch {
              /* ignore */
            }
          }
        })
    }
    window.addEventListener('dawon:wish-submitted', onSubmit)
    return () => window.removeEventListener('dawon:wish-submitted', onSubmit)
  }, [user])

  return (
    <>
      <AuthGate action="오늘설계·설문 저장" />
      <div className="section-page">
        <div className="container page-banner">
          <div className="eyebrow">DAWON EXECUTION</div>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
        </div>
        <TodayDesign />
        <SectionPage title="" description="" html={survey} hideBanner />
      </div>
    </>
  )
}
