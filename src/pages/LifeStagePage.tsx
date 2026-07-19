import { SectionPage } from './SectionPage'
import lifeStage from '../newsite/sections/lifeStage.html?raw'

export function LifeStagePage() {
  return (
    <SectionPage
      title="생애단계 자기설계"
      description="8단계 생애주기별 과제·질문·7일 계획과 추천 콘텐츠를 확인합니다."
      html={lifeStage}
    />
  )
}
