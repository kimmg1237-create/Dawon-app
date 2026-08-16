import { useEffect, useState } from 'react'
import { SectionPage } from './SectionPage'
import { Seo } from '../components/Seo'
import { useSiteCopy } from '../context/SiteCopyContext'
import { siteConfig } from '../data/siteConfig'
import library from '../newsite/sections/library.html?raw'
import type { LibraryTab } from '../newsite/DawonLibrary'

type LibrarySeoKey = 'library' | 'ebooks' | 'audiobooks'

export function LibraryPage({
  initialTab = 'ebook',
  seoPage = 'library',
}: {
  initialTab?: LibraryTab
  seoPage?: LibrarySeoKey
}) {
  const { copy } = useSiteCopy()
  const page = copy.pages.library
  const [tab, setTab] = useState<LibraryTab>(initialTab)
  const seo = siteConfig.pages[seoPage]

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  return (
    <>
      <Seo title={seo.title} description={seo.description} path={seo.path} />
      <SectionPage
        title={page.title}
        description={page.description}
        sectionCopy={page}
        html={library}
        mountLibrary
        libraryTab={tab}
        onLibraryTabChange={setTab}
      />
    </>
  )
}
