import { SectionPage } from './SectionPage'
import { Seo } from '../components/Seo'
import { useSiteCopy } from '../context/SiteCopyContext'
import { pageTitle, siteConfig } from '../data/siteConfig'
import library from '../newsite/sections/library.html?raw'

export function LibraryPage() {
  const { copy } = useSiteCopy()
  const page = copy.pages.library
  return (
    <>
      <Seo
        title={pageTitle('작품관')}
        description="전자책·오디오북·만화를 표지와 소개로 먼저 살펴보고, 로그인 후 전체 작품을 이용하세요."
        path={siteConfig.paths.library}
      />
      <SectionPage
        title={page.title}
        description={page.description}
        sectionCopy={page}
        html={library}
        mountLibrary
      />
    </>
  )
}
