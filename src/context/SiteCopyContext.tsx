import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { SITE_COPY_DEFAULTS, type SiteCopy } from '../data/siteCopyDefaults'
import { fetchSiteCopy, saveSiteCopy } from '../services/siteCopyService'

type SiteCopyContextValue = {
  copy: SiteCopy
  loading: boolean
  refresh: () => Promise<void>
  save: (next: SiteCopy) => Promise<{ error?: string }>
}

const SiteCopyContext = createContext<SiteCopyContextValue | null>(null)

export function SiteCopyProvider({ children }: { children: ReactNode }) {
  const [copy, setCopy] = useState<SiteCopy>(SITE_COPY_DEFAULTS)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const next = await fetchSiteCopy()
    setCopy(next)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const save = useCallback(async (next: SiteCopy) => {
    const result = await saveSiteCopy(next)
    if (!result.error) setCopy(next)
    return result
  }, [])

  const value = useMemo(
    () => ({
      copy,
      loading,
      refresh,
      save,
    }),
    [copy, loading, refresh, save],
  )

  return <SiteCopyContext.Provider value={value}>{children}</SiteCopyContext.Provider>
}

export function useSiteCopy() {
  const ctx = useContext(SiteCopyContext)
  if (!ctx) throw new Error('useSiteCopy must be used within SiteCopyProvider')
  return ctx
}
