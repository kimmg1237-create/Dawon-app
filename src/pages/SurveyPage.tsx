import { SectionPage } from './SectionPage'
import { AuthGate } from '../components/AuthGate'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import survey from '../newsite/sections/survey.html?raw'
import { useEffect } from 'react'

export function SurveyPage() {
  const { user } = useAuth()

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
            // remove local PII copy after successful server save
            try {
              const all = JSON.parse(localStorage.getItem('dawonLifeStageWishResponses_v3') || '[]') as { id: string }[]
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
      <AuthGate action="설문 제출" />
      <SectionPage
        title="바람설계 정밀 설문"
        description="8단계 설문을 작성하고 보고서를 생성합니다. 로그인 시 서버에 저장됩니다."
        html={survey}
      />
    </>
  )
}
