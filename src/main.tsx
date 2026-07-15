import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { SubscriptionProvider } from './context/SubscriptionContext'
import { NotificationProvider } from './context/NotificationContext'
import { DayRecordsProvider } from './context/DayRecordsContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SubscriptionProvider>
        <NotificationProvider>
          <DayRecordsProvider>
            <App />
          </DayRecordsProvider>
        </NotificationProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </StrictMode>,
)
