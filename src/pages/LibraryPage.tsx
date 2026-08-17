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

  useEffect(() => {
    const pinTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    pinTop()
    const t1 = window.setTimeout(pinTop, 40)
    const t2 = window.setTimeout(pinTop, 160)
    const t3 = window.setTimeout(pinTop, 320)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
  }, [seoPage])

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
