import { useEffect, useState } from 'react'
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

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    function onHashChange() {
      setHash(window.location.hash)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return hash
}

function App() {
  const hash = useHashRoute()

  if (hash === '#terms') {
    return (
      <>
        <DawonNav />
        <main id="main">
          <TermsPage />
        </main>
        <DawonFooter />
      </>
    )
  }

  if (hash === '#privacy') {
    return (
      <>
        <DawonNav />
        <main id="main">
          <PrivacyPage />
        </main>
        <DawonFooter />
      </>
    )
  }

  return (
    <>
      <DawonNav />
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

export default App
