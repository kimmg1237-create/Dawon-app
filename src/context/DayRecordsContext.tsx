import { createContext, useContext, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { useDayRecords, type DayRecordsValue } from '../hooks/useDayRecords'

const DayRecordsContext = createContext<DayRecordsValue | null>(null)

export function DayRecordsProvider({ children }: { children: ReactNode }) {
  const { user, configured } = useAuth()
  const value = useDayRecords(user?.id ?? null, configured)
  return <DayRecordsContext.Provider value={value}>{children}</DayRecordsContext.Provider>
}

export function useDayRecordsContext() {
  const ctx = useContext(DayRecordsContext)
  if (!ctx) throw new Error('useDayRecordsContext must be used within DayRecordsProvider')
  return ctx
}
