import { useEffect, useState, type ReactNode } from 'react'
import { DawonNav } from './components/dawon/DawonNav'
import { DawonHero } from './components/dawon/DawonHero'
import { DawonDemo } from './components/dawon/DawonDemo'
import { DawonPaths } from './components/dawon/DawonPaths'
import {
  Metrics,
  Formula,
  DailySteps,
  AiSection,
  RoutesSection,
  LibrarySection,
  ReportSection,
  AudienceSection,
  TrustSection,
  FaqSection,
  StartCta,
  DawonFooter,
  TopButton,
} from './components/dawon/DawonSections'
import { PrivacyPage, TermsPage } from './components/LegalPages'
import { ProductWorkspace } from './components/ProductWorkspace'
import { TossPaymentReturnHandler } from './components/TossPaymentReturnHandler'
import { AuthSection } from './components/AuthSection'
import { DayRecordSection } from './components/DayRecordSection'
import { RecommendationSection } from './components/RecommendationSection'
import { PricingSection } from './components/PricingSection'
import { LoginGate } from './components/LoginGate'
import { DailyReminderRunner } from './components/DailyReminderRunner'
import { isPageHash } from './utils/scroll'

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    function onHashChange() {
      setHash(window.location.hash)
    }
    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('popstate', onHashChange)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('popstate', onHashChange)
    }
  }, [])

  return hash
}

function HomePage() {
  return (
    <>
      <TossPaymentReturnHandler />
      <main id="main">
        <DawonHero />
        <Metrics />
        <Formula />
        <DailySteps />
        <ProductWorkspace />
        <AiSection />
        <RoutesSection />
        <DawonDemo />
        <DawonPaths />
        <LibrarySection />
        <ReportSection />
        <AudienceSection />
        <TrustSection />
        <FaqSection />
        <StartCta />
      </main>
      <DawonFooter />
      <TopButton />
    </>
  )
}

function SectionPage({ children }: { children: ReactNode }) {
  return (
    <>
      <DawonNav />
      <main id="main" className="section-page">
        {children}
      </main>
      <DawonFooter />
      <TopButton />
    </>
  )
}

function pageForHash(hash: string): ReactNode | null {
  switch (hash) {
    case '#terms':
      return <TermsPage />
    case '#privacy':
      return <PrivacyPage />
    case '#daily':
      return (
        <>
          <DailyReminderRunner />
          <DayRecordSection />
          <AuthSection />
        </>
      )
    case '#auth':
      return <AuthSection />
    case '#ai':
      return <AiSection />
    case '#routes':
      return <RoutesSection />
    case '#paths':
      return <DawonPaths />
    case '#library':
      return <LibrarySection />
    case '#faq':
      return <FaqSection />
    case '#pricing':
      return <PricingSection />
    case '#recommendations':
      return (
        <LoginGate feature="맞춤 추천">
          <RecommendationSection />
        </LoginGate>
      )
    default:
      return null
  }
}

function App() {
  const hash = useHashRoute()
  const standalone = isPageHash(hash)
  const page = standalone ? pageForHash(hash) : null

  useEffect(() => {
    if (standalone) {
      window.scrollTo(0, 0)
    }
  }, [hash, standalone])

  if (standalone && page) {
    return <SectionPage>{page}</SectionPage>
  }

  return (
    <>
      <DawonNav />
      <HomePage />
    </>
  )
}

export default App
