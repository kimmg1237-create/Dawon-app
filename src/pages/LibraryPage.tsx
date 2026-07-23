import { SectionPage } from './SectionPage'
import { useSiteCopy } from '../context/SiteCopyContext'
import library from '../newsite/sections/library.html?raw'

export function LibraryPage() {
  const { copy } = useSiteCopy()
  const page = copy.pages.library
  return (
    <SectionPage
      title={page.title}
      description={page.description}
      sectionCopy={page}
      html={library}
      mountLibrary
    />
  )
}
