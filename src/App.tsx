import { AuthProvider } from './context/AuthContext'
import { SubscriptionProvider } from './context/SubscriptionContext'
import { NotificationProvider } from './context/NotificationContext'
import { DayRecordsProvider } from './context/DayRecordsContext'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { AuthSection } from './components/AuthSection'
import { DayRecordSection } from './components/DayRecordSection'
import { RecommendationSection } from './components/RecommendationSection'
import { RecordCalendar } from './components/RecordCalendar'
import { RecordHistory } from './components/RecordHistory'
import { MonthlyReportSection } from './components/MonthlyReportSection'
import { NotificationSettings } from './components/NotificationSettings'
import { DailyReminderRunner } from './components/DailyReminderRunner'
import { BooksSection } from './components/BooksSection'
import { PaletteSection } from './components/PaletteSection'
import { MusicLibrarySection } from './components/MusicLibrarySection'
import { CalendarSection } from './components/CalendarSection'
import { PricingSection } from './components/PricingSection'
import { Footer } from './components/Footer'

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <NotificationProvider>
          <DayRecordsProvider>
            <DailyReminderRunner />
            <Header />
            <Hero />
            <AuthSection />
            <DayRecordSection />
            <RecommendationSection />
            <RecordCalendar />
            <RecordHistory />
            <MonthlyReportSection />
            <NotificationSettings />
            <BooksSection />
            <PaletteSection />
            <MusicLibrarySection />
            <CalendarSection />
            <PricingSection />
            <Footer />
          </DayRecordsProvider>
        </NotificationProvider>
      </SubscriptionProvider>
    </AuthProvider>
  )
}

export default App
