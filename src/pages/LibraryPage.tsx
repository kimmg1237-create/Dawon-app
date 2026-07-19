import { SectionPage } from './SectionPage'
import library from '../newsite/sections/library.html?raw'

export function LibraryPage() {
  return (
    <SectionPage
      title="라이브러리"
      description="50개의 길 전자책, 오디오북, 만화형 전자책을 검색하고 바로 엽니다."
      html={library}
      mountLibrary
    />
  )
}
