import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionPage } from './SectionPage'
import { Seo } from '../components/Seo'
import { siteConfig } from '../data/siteConfig'
import library from '../newsite/sections/library.html?raw'
import type { LibraryTab } from '../newsite/DawonLibrary'
import { dawonT, getDawonLang, type DawonLang } from '../newsite/dawonOs/i18n'

type LibrarySeoKey = 'library' | 'ebooks' | 'audiobooks' | 'comics'

const TAB_PATH: Record<LibraryTab, string> = {
  ebook: '/library',
  audio: '/audiobooks',
  comic: '/comics',
}

const TAB_TITLE: Record<LibraryTab, string> = {
  ebook: 'libraryPageTitleEbook',
  audio: 'libraryPageTitleAudio',
  comic: 'libraryPageTitleComic',
}

const TAB_DESC: Record<LibraryTab, string> = {
  ebook: 'libraryPageDescEbook',
  audio: 'libraryPageDescAudio',
  comic: 'libraryPageDescComic',
}

const SEO_TITLE: Record<LibrarySeoKey, string> = {
  library: 'librarySeoLibrary',
  ebooks: 'librarySeoEbook',
  audiobooks: 'librarySeoAudio',
  comics: 'librarySeoComic',
}

export function LibraryPage({
  initialTab = 'ebook',
  seoPage = 'library',
}: {
  initialTab?: LibraryTab
  seoPage?: LibrarySeoKey
}) {
  const navigate = useNavigate()
  const [tab, setTab] = useState<LibraryTab>(initialTab)
  const [lang, setLang] = useState<DawonLang>(() => getDawonLang())
  const t = (key: string) => dawonT(key, lang)
  const seo = siteConfig.pages[seoPage]

  useEffect(() => {
    const onLang = () => setLang(getDawonLang())
    window.addEventListener('dawon-lang-changed', onLang)
    return () => window.removeEventListener('dawon-lang-changed', onLang)
  }, [])

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

  const titleKey = seoPage === 'library' ? 'libraryPageTitle' : TAB_TITLE[tab]
  const descKey = seoPage === 'library' ? 'libraryPageDesc' : TAB_DESC[tab]

  return (
    <>
      <Seo
        title={`${t(SEO_TITLE[seoPage])} | DAWON`}
        description={t(descKey)}
        path={seo.path}
      />
      <SectionPage
        title={t(titleKey)}
        description={t(descKey)}
        html={library}
        mountLibrary
        libraryTab={tab}
        onLibraryTabChange={onTabChange}
      />
    </>
  )
}
