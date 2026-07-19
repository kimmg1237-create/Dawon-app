import { SectionPage } from './SectionPage'
import { AuthGate } from '../components/AuthGate'
import opsTools from '../newsite/sections/opsTools.html?raw'

export function OperationsPage() {
  return (
    <>
      <AuthGate action="운영도구 데이터 저장" />
      <SectionPage
        title="운영도구"
        description="AI 안내(규칙형), 직원·업무, 아이디어, 전략설계, 안전 실행안, 기관 운영안을 다룹니다."
        html={opsTools}
      />
    </>
  )
}
