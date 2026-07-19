import { SectionPage } from './SectionPage'
import { AuthGate } from '../components/AuthGate'
import integratedStrategy from '../newsite/sections/integratedStrategy.html?raw'

export function StrategyPage() {
  return (
    <>
      <SectionPage
        title="통합전략"
        description="3분 설계·퀘스트·7일 기록·보고서를 모아 실행신호를 확인합니다."
        html={integratedStrategy}
      />
      <AuthGate action="실행신호 서버 동기화" />
    </>
  )
}
