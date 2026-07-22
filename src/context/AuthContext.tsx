import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from '../lib/supabase'

type AuthContextValue = {
  configured: boolean
  loading: boolean
  session: Session | null
  user: User | null
  isAdmin: boolean
  recoveryMode: boolean
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<{ error?: string }>
  updatePassword: (password: string) => Promise<{ error?: string }>
  clearRecoveryMode: () => void
  refreshAdmin: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function checkAdmin(): Promise<boolean> {
  if (!supabase) return false
  const { data, error } = await supabase.rpc('is_wish_admin')
  if (error) return false
  return Boolean(data)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [recoveryMode, setRecoveryMode] = useState(false)

  const refreshAdmin = useCallback(async () => {
    if (!supabase || !session?.user) {
      setIsAdmin(false)
      return
    }
    setIsAdmin(await checkAdmin())
  }, [session?.user])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true)
      }
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    void refreshAdmin()
  }, [refreshAdmin])

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: supabaseConfigured,
      loading,
      session,
      user: session?.user ?? null,
      isAdmin,
      recoveryMode,
      async signUp(email, password) {
        if (!supabase) return { error: 'Supabase 환경변수가 설정되지 않았습니다.' }
        const { error } = await supabase.auth.signUp({ email, password })
        return { error: error?.message }
      },
      async signIn(email, password) {
        if (!supabase) return { error: 'Supabase 환경변수가 설정되지 않았습니다.' }
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error?.message }
      },
      async signOut() {
        if (!supabase) return
        await supabase.auth.signOut()
        setIsAdmin(false)
        setRecoveryMode(false)
      },
      async requestPasswordReset(email) {
        if (!supabase) return { error: 'Supabase 환경변수가 설정되지 않았습니다.' }
        const redirectTo = `${window.location.origin}/reset-password`
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })
        return { error: error?.message }
      },
      async updatePassword(password) {
        if (!supabase) return { error: 'Supabase 환경변수가 설정되지 않았습니다.' }
        const { error } = await supabase.auth.updateUser({ password })
        if (!error) setRecoveryMode(false)
        return { error: error?.message }
      },
      clearRecoveryMode() {
        setRecoveryMode(false)
      },
      refreshAdmin,
    }),
    [loading, session, isAdmin, recoveryMode, refreshAdmin],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
