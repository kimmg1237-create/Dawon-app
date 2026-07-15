import { AuthSection } from './AuthSection'
import { DayRecordSection } from './DayRecordSection'
import { RecommendationSection } from './RecommendationSection'
import { RecordCalendar } from './RecordCalendar'
import { RecordHistory } from './RecordHistory'
import { MonthlyReportSection } from './MonthlyReportSection'
import { NotificationSettings } from './NotificationSettings'
import { PricingSection } from './PricingSection'
import { LoginGate } from './LoginGate'
import { DailyReminderRunner } from './DailyReminderRunner'

/** 마케팅 스토리 아래 실제 기록·로그인·구독 UI */
export function ProductWorkspace() {
  return (
    <div id="app">
      <DailyReminderRunner />
      {/* 3분 기록이 첫 도착점 — 로그인 배너가 위를 가리지 않도록 순서 고정 */}
      <DayRecordSection />
      <AuthSection />
      <LoginGate feature="맞춤 추천">
        <RecommendationSection />
      </LoginGate>
      <LoginGate feature="기록 달력">
        <RecordCalendar />
      </LoginGate>
      <LoginGate feature="기록 목록">
        <RecordHistory />
      </LoginGate>
      <LoginGate feature="월간 리포트">
        <MonthlyReportSection />
      </LoginGate>
      <LoginGate feature="알림 설정">
        <NotificationSettings />
      </LoginGate>
      <PricingSection />
    </div>
  )
}
