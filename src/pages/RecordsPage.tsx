import { SectionPage } from './SectionPage'
import { RequireAuthOnInteract } from '../components/RequireAuthOnInteract'
import { useAuth } from '../context/AuthContext'
import { useSiteCopy } from '../context/SiteCopyContext'
import actionLog from '../newsite/sections/actionLog.html?raw'
import { useEffect } from 'react'
import { fetchTracker, upsertTracker } from '../services/userDataService'

export function RecordsPage() {
  const { user } = useAuth()
  const { copy } = useSiteCopy()
  const page = copy.pages.records

  useEffect(() => {
    if (!user) return
    void (async () => {
      const remote = await fetchTracker(user.id)
      if (remote) localStorage.setItem('dawonSevenDayTracker_v5', JSON.stringify(remote))
    })()
    const sync = () => {
      try {
        const raw = localStorage.getItem('dawonSevenDayTracker_v5')
        if (!raw) return
        void upsertTracker(user.id, JSON.parse(raw))
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('dawon:tracker-saved', sync)
    window.addEventListener('dawon:tracker-seeded', sync)
    const timer = window.setInterval(sync, 8000)
    return () => {
      window.removeEventListener('dawon:tracker-saved', sync)
      window.removeEventListener('dawon:tracker-seeded', sync)
      window.clearInterval(timer)
    }
  }, [user])

  return (
    <RequireAuthOnInteract from="/records">
      <SectionPage title={page.title} description={page.description} sectionCopy={page} html={actionLog} />
    </RequireAuthOnInteract>
  )
}
