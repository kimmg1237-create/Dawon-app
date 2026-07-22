import { SectionPage } from './SectionPage'
import lifeStage from '../newsite/sections/lifeStage.html?raw'

export function LifeStagePage() {
  return (
    <SectionPage
      title="계획방법"
      description="생애단계별 과제·질문·7일 계획과 추천 콘텐츠로, 나에게 맞는 설계 방법을 확인합니다."
      html={lifeStage}
    />
  )
}
