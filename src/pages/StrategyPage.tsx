import { SectionPage } from './SectionPage'
import { AuthGate } from '../components/AuthGate'
import { useSiteCopy } from '../context/SiteCopyContext'
import integratedStrategy from '../newsite/sections/integratedStrategy.html?raw'

export function StrategyPage() {
  const { copy } = useSiteCopy()
  const page = copy.pages.strategy
  return (
    <>
      <SectionPage
        title={page.title}
        description={page.description}
        sectionCopy={page}
        html={integratedStrategy}
      />
      <AuthGate action="실행신호 서버 동기화" />
    </>
  )
}
