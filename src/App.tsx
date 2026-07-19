import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppShell } from './layout/AppShell'
import { HomePage } from './pages/HomePage'
import { StrategyPage } from './pages/StrategyPage'
import { LifeStagePage } from './pages/LifeStagePage'
import { QuickDesignPage } from './pages/QuickDesignPage'
import { RecordsPage } from './pages/RecordsPage'
import { LibraryPage } from './pages/LibraryPage'
import { OperationsPage } from './pages/OperationsPage'
import { AdminResponsesPage } from './pages/AdminResponsesPage'
import { LoginPage } from './pages/LoginPage'
import { SurveyPage } from './pages/SurveyPage'
import { useEffect } from 'react'
import { migrateLocalDrafts } from './services/userDataService'

function AuthMigration() {
  const { user } = useAuth()
  useEffect(() => {
    if (user) void migrateLocalDrafts(user.id)
  }, [user])
  return null
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
          <Route path="library" element={<LibraryPage />} />
          <Route path="operations" element={<OperationsPage />} />
          <Route path="survey" element={<SurveyPage />} />
          <Route path="admin/responses" element={<AdminResponsesPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
