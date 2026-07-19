import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { signIn, signUp, configured, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/quick-design'
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, from, navigate])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const result = mode === 'in' ? await signIn(email, password) : await signUp(email, password)
    setBusy(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (mode === 'up') {
      setMode('in')
      setError('가입이 접수되었습니다. 이메일 확인 설정에 따라 바로 로그인하거나 메일 인증 후 로그인해 주세요.')
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="container">
      <form className="login-card" onSubmit={onSubmit}>
        <h1>{mode === 'in' ? '로그인' : '회원가입'}</h1>
        <p>
          {configured
            ? '이메일과 비밀번호로 계정에 접속합니다. 설계·기록·응답은 로그인 후 서버에 저장됩니다.'
            : 'Supabase 환경변수가 없어 로컬 전용 모드입니다. .env에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY를 설정하세요.'}
        </p>
        <label>
          이메일
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!configured}
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!configured}
          />
        </label>
        {error ? <p className="login-error">{error}</p> : null}
        <button className="btn btn-primary" type="submit" disabled={!configured || busy}>
          {busy ? '처리 중…' : mode === 'in' ? '로그인' : '회원가입'}
        </button>
        <button
          className="btn btn-light"
          type="button"
          onClick={() => {
            setMode(mode === 'in' ? 'up' : 'in')
            setError('')
          }}
        >
          {mode === 'in' ? '계정이 없나요? 회원가입' : '이미 계정이 있나요? 로그인'}
        </button>
        <p style={{ marginTop: 14 }}>
          <Link to="/">홈으로</Link>
        </p>
      </form>
    </div>
  )
}
