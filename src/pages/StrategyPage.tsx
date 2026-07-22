import { SectionPage } from './SectionPage'
import { AuthGate } from '../components/AuthGate'
import integratedStrategy from '../newsite/sections/integratedStrategy.html?raw'

export function StrategyPage() {
  return (
    <>
      <SectionPage
        title="실행지도"
        description="전략 관점과 행동 루프를 한눈에 보고, 실천카드·7일 설계·보고서로 이어지는 실행신호를 확인합니다."
        html={integratedStrategy}
      />
      <AuthGate action="실행신호 서버 동기화" />
    </>
  )
}
