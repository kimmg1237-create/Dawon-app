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

function mapAuthError(message?: string): string | undefined {
  if (!message) return undefined
  const m = message.toLowerCase()
  if (/invalid login credentials|invalid_credentials/.test(m)) {
    return '이메일 또는 비밀번호가 올바르지 않습니다. 다시 확인해 주세요.'
  }
  if (/email not confirmed|email_not_confirmed/.test(m)) {
    return '이메일 인증이 필요합니다. 가입 메일함을 확인하거나, Supabase에서 이메일 확인을 끄고 다시 시도해 주세요.'
  }
  if (/user already registered|already been registered/.test(m)) {
    return '이미 가입된 이메일입니다. 로그인해 주세요.'
  }
  if (/password/.test(m) && /weak|least|characters/.test(m)) {
    return '비밀번호 조건을 확인해 주세요. 영문·숫자 포함 8자 이상이어야 합니다.'
  }
  if (/rate limit|too many requests/.test(m)) {
    return '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
  }
  return message
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
        return { error: mapAuthError(error?.message) }
      },
      async signIn(email, password) {
        if (!supabase) return { error: 'Supabase 환경변수가 설정되지 않았습니다.' }
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        return { error: mapAuthError(error?.message) }
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
        return { error: mapAuthError(error?.message) }
      },
      async updatePassword(password) {
        if (!supabase) return { error: 'Supabase 환경변수가 설정되지 않았습니다.' }
        const { error } = await supabase.auth.updateUser({ password })
        if (!error) setRecoveryMode(false)
        return { error: mapAuthError(error?.message) }
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
