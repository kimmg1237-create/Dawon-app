import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionPage } from './SectionPage'
import { Seo } from '../components/Seo'
import { useSiteCopy } from '../context/SiteCopyContext'
import { siteConfig } from '../data/siteConfig'
import library from '../newsite/sections/library.html?raw'
import type { LibraryTab } from '../newsite/DawonLibrary'

type LibrarySeoKey = 'library' | 'ebooks' | 'audiobooks' | 'comics'

const TAB_PATH: Record<LibraryTab, string> = {
  ebook: '/library',
  audio: '/audiobooks',
  comic: '/comics',
}

export function LibraryPage({
  initialTab = 'ebook',
  seoPage = 'library',
}: {
  initialTab?: LibraryTab
  seoPage?: LibrarySeoKey
}) {
  const { copy } = useSiteCopy()
  const navigate = useNavigate()
  const page = copy.pages.library
  const [tab, setTab] = useState<LibraryTab>(initialTab)
  const seo = siteConfig.pages[seoPage]

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [seoPage])

  function onTabChange(next: LibraryTab) {
    setTab(next)
    const to = TAB_PATH[next]
    if (to !== TAB_PATH[initialTab]) navigate(to)
  }

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
        onLibraryTabChange={onTabChange}
      />
    </>
  )
}
