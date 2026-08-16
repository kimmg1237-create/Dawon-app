import { BrowserRouter, Navigate, Route, Routes, useSearchParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SubscriptionProvider } from './context/SubscriptionContext'
import { AppShell } from './layout/AppShell'
import { HomePage } from './pages/HomePage'
import { StrategyPage } from './pages/StrategyPage'
import { LifeStagePage } from './pages/LifeStagePage'
import { QuickDesignPage } from './pages/QuickDesignPage'
import { RecordsPage } from './pages/RecordsPage'
import { LibraryPage } from './pages/LibraryPage'
import { OperationsPage } from './pages/OperationsPage'
import { AdminPage } from './pages/AdminPage'
import { AdminResponsesPage } from './pages/AdminResponsesPage'
import { LoginPage } from './pages/LoginPage'
import { SiteCopyProvider } from './context/SiteCopyContext'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { SubscribePage } from './pages/SubscribePage'
import { PaymentSuccessPage } from './pages/PaymentSuccessPage'
import { PaymentFailPage } from './pages/PaymentFailPage'
import { TermsPage } from './pages/TermsPage'
import { RefundPolicyPage } from './pages/RefundPolicyPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { MovieStudioPage } from './pages/MovieStudioPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { FEATURES } from './data/features'
import { useEffect } from 'react'
import { migrateLocalDrafts } from './services/userDataService'

function AuthMigration() {
  const { user } = useAuth()
  useEffect(() => {
    if (user) void migrateLocalDrafts(user.id)
  }, [user])
  return null
}

function MovieStudioLegacyRedirect() {
  const [params] = useSearchParams()
  const qs = params.toString()
  return <Navigate to={qs ? `/movie-studio?${qs}` : '/movie-studio'} replace />
}

function AppRoutes() {
  return (
    <>
      <AuthMigration />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="strategy" element={<StrategyPage />} />
          <Route path="life-stage" element={<LifeStagePage />} />
          <Route path="quick-design" element={<QuickDesignPage />} />
          <Route path="records" element={<RecordsPage />} />
          <Route path="library" element={<LibraryPage initialTab="ebook" seoPage="library" />} />
          <Route path="ebooks" element={<LibraryPage initialTab="ebook" seoPage="ebooks" />} />
          <Route path="audiobooks" element={<LibraryPage initialTab="audio" seoPage="audiobooks" />} />
          <Route path="store" element={<Navigate to="/subscribe" replace />} />
          <Route path="profile" element={<Navigate to="/login" replace />} />
          <Route path="board" element={<Navigate to="/" replace />} />
          <Route path="operations" element={<OperationsPage />} />
          <Route path="survey" element={<Navigate to="/quick-design#survey" replace />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="admin/responses" element={<AdminResponsesPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route
            path="subscribe"
            element={FEATURES.paymentsEnabled ? <SubscribePage /> : <Navigate to="/" replace />}
          />
          <Route
            path="payment/success"
            element={FEATURES.paymentsEnabled ? <PaymentSuccessPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="payment/fail"
            element={FEATURES.paymentsEnabled ? <PaymentFailPage /> : <Navigate to="/" replace />}
          />
          <Route path="terms" element={<TermsPage />} />
          <Route path="refund" element={<RefundPolicyPage />} />
          <Route path="refund-policy" element={<Navigate to="/refund" replace />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="movie-studio" element={<MovieStudioPage />} />
          <Route path="movie-studio.html" element={<MovieStudioLegacyRedirect />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SubscriptionProvider>
          <SiteCopyProvider>
            <AppRoutes />
          </SiteCopyProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
