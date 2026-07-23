import { SectionPage } from './SectionPage'
import { AuthGate } from '../components/AuthGate'
import { useSiteCopy } from '../context/SiteCopyContext'
import opsTools from '../newsite/sections/opsTools.html?raw'

export function OperationsPage() {
  const { copy } = useSiteCopy()
  const page = copy.pages.operations
  return (
    <>
      <AuthGate action="운영 상담 데이터 저장" />
      <SectionPage title={page.title} description={page.description} sectionCopy={page} html={opsTools} />
    </>
  )
}
