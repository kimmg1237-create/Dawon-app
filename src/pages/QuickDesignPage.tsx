import { SectionPage } from './SectionPage'
import { AuthGate } from '../components/AuthGate'
import { useAuth } from '../context/AuthContext'
import quickDesign from '../newsite/sections/quickDesign.html?raw'
import { useEffect } from 'react'
import { upsertQuickDesign, fetchQuickDesign } from '../services/userDataService'

export function QuickDesignPage() {
  const { user } = useAuth()

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

  return (
    <>
      <AuthGate action="3분 설계 저장" />
      <SectionPage
        title="3분 빠른 자기설계"
        description="오늘 가능한 행동 하나를 실천카드로 만들고 7일 기록으로 이어갑니다."
        html={quickDesign}
      />
    </>
  )
}
