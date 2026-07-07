import { DayRecordsProvider } from './context/DayRecordsContext'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { DayRecordSection } from './components/DayRecordSection'
import { RecordCalendar } from './components/RecordCalendar'
import { RecordHistory } from './components/RecordHistory'
import { BooksSection } from './components/BooksSection'
import { PaletteSection } from './components/PaletteSection'
import { MusicLibrarySection } from './components/MusicLibrarySection'
import { CalendarSection } from './components/CalendarSection'
import { PricingSection } from './components/PricingSection'
import { Footer } from './components/Footer'

function App() {
  return (
    <DayRecordsProvider>
      <Header />
      <Hero />
      <DayRecordSection />
      <RecordCalendar />
      <RecordHistory />
      <BooksSection />
      <PaletteSection />
      <MusicLibrarySection />
      <CalendarSection />
      <PricingSection />
      <Footer />
    </DayRecordsProvider>
  )
}

export default App
