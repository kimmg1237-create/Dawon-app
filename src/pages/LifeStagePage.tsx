import { SectionPage } from './SectionPage'
import { useSiteCopy } from '../context/SiteCopyContext'
import lifeStage from '../newsite/sections/lifeStage.html?raw'

export function LifeStagePage() {
  const { copy } = useSiteCopy()
  const page = copy.pages.lifeStage
  return (
    <SectionPage title={page.title} description={page.description} sectionCopy={page} html={lifeStage} />
  )
}
