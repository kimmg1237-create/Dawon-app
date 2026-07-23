import { SectionPage } from './SectionPage'
import { AuthGate } from '../components/AuthGate'
import { useAuth } from '../context/AuthContext'
import { useSiteCopy } from '../context/SiteCopyContext'
import { supabase } from '../lib/supabase'
import quickDesign from '../newsite/sections/quickDesign.html?raw'
import survey from '../newsite/sections/survey.html?raw'
import { useEffect } from 'react'
import { upsertQuickDesign, fetchQuickDesign } from '../services/userDataService'

export function QuickDesignPage() {
  const { user } = useAuth()
  const { copy } = useSiteCopy()
  const page = copy.pages.quickDesign

  useEffect(() => {
    if (!user) return
    void (async () => {
      const remote = await fetchQuickDesign(user.id)
      if (remote) {
        localStorage.setItem('dawonQuickDesign_v5', JSON.stringify(remote))
      }
    })()

    const onStorage = () => {
      try {
        const raw = localStorage.getItem('dawonQuickDesign_v5')
        if (!raw || !user) return
        void upsertQuickDesign(user.id, JSON.parse(raw))
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('dawon:quick-saved', onStorage)
    const timer = window.setInterval(onStorage, 8000)
    return () => {
      window.removeEventListener('dawon:quick-saved', onStorage)
      window.clearInterval(timer)
    }
  }, [user])

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
      <AuthGate action="실천카드·설문 저장" />
      <SectionPage
        title={page.title}
        description={page.description}
        sectionCopy={page}
        html={`${quickDesign}${survey}`}
      />
    </>
  )
}
