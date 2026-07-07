import { createContext, useContext, type ReactNode } from 'react'
import { useDayRecords, type DayRecordsValue } from '../hooks/useDayRecords'

const DayRecordsContext = createContext<DayRecordsValue | null>(null)

export function DayRecordsProvider({ children }: { children: ReactNode }) {
  const value = useDayRecords()
  return <DayRecordsContext.Provider value={value}>{children}</DayRecordsContext.Provider>
}

export function useDayRecordsContext() {
  const ctx = useContext(DayRecordsContext)
  if (!ctx) throw new Error('useDayRecordsContext must be used within DayRecordsProvider')
  return ctx
}
