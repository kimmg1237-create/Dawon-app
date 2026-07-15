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
import { isPageHash, scrollToHash } from './utils/scroll'

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    function onHashChange() {
      setHash(window.location.hash)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
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

function App() {
  const hash = useHashRoute()
  const isLegalPage = isPageHash(hash)

  useEffect(() => {
    if (isLegalPage || !hash) {
      if (isLegalPage) window.scrollTo(0, 0)
      return
    }

    const timer = window.setTimeout(() => {
      scrollToHash(hash, 'smooth')
    }, 60)

    return () => window.clearTimeout(timer)
  }, [hash, isLegalPage])

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
      <HomePage />
    </>
  )
}

export default App
