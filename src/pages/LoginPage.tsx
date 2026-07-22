import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PASSWORD_HINT, validatePassword } from '../lib/password'

type Mode = 'in' | 'up' | 'forgot'

export function LoginPage() {
  const { signIn, signUp, requestPasswordReset, configured, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/quick-design'
  const [mode, setMode] = useState<Mode>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (user && mode !== 'forgot') navigate(from, { replace: true })
  }, [user, from, navigate, mode])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')

    if (mode === 'forgot') {
      if (!email.trim()) {
        setError('가입한 이메일을 입력해 주세요.')
        return
      }
      setBusy(true)
      const result = await requestPasswordReset(email)
      setBusy(false)
      if (result.error) {
        setError(result.error)
        return
      }
      setInfo(
        '비밀번호 재설정 메일을 보냈습니다. 메일함(스팸함 포함)을 확인한 뒤 링크를 눌러 새 비밀번호를 설정해 주세요.',
      )
      return
    }

    if (mode === 'up') {
      const ruleError = validatePassword(password)
      if (ruleError) {
        setError(ruleError)
        return
      }
      if (password !== passwordConfirm) {
        setError('비밀번호가 일치하지 않습니다. 다시 확인해 주세요.')
        return
      }
    }

    setBusy(true)
    const result = mode === 'in' ? await signIn(email, password) : await signUp(email, password)
    setBusy(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (mode === 'up') {
      setMode('in')
      setPassword('')
      setPasswordConfirm('')
      setInfo('가입이 접수되었습니다. 이메일 확인 설정에 따라 바로 로그인하거나 메일 인증 후 로그인해 주세요.')
      return
    }
    navigate(from, { replace: true })
  }

  function setAuthMode(next: Mode) {
    setMode(next)
    setError('')
    setInfo('')
    setPasswordConfirm('')
    if (next === 'forgot') setPassword('')
  }

  const title = mode === 'in' ? '로그인' : mode === 'up' ? '회원가입' : '비밀번호 찾기'
  const submitLabel =
    mode === 'in' ? '로그인' : mode === 'up' ? '회원가입' : '재설정 메일 보내기'

  return (
    <div className="container">
      <form className="login-card" onSubmit={onSubmit} noValidate={mode !== 'in'}>
        <h1>{title}</h1>
        <p>
          {!configured
            ? 'Supabase 환경변수가 없어 로컬 전용 모드입니다. .env에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY를 설정하세요.'
            : mode === 'up'
              ? '비밀번호는 영문과 숫자를 조합해 8자 이상 20자 이내로 만들어 주세요.'
              : mode === 'forgot'
                ? '가입에 사용한 이메일을 입력하면 비밀번호 재설정 링크를 보내 드립니다.'
                : '이메일과 비밀번호로 계정에 접속합니다. 설계·기록·응답은 로그인 후 서버에 저장됩니다.'}
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
        {mode !== 'forgot' ? (
          <label>
            비밀번호
            <input
              type="password"
              required
              minLength={mode === 'up' ? 8 : 6}
              maxLength={20}
              pattern={mode === 'up' ? '(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,20}' : undefined}
              title={mode === 'up' ? PASSWORD_HINT : undefined}
              autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!configured}
              placeholder={mode === 'up' ? '예: dawon1234' : undefined}
            />
          </label>
        ) : null}
        {mode === 'up' ? (
          <label>
            비밀번호 확인
            <input
              type="password"
              required
              minLength={8}
              maxLength={20}
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              disabled={!configured}
              placeholder="비밀번호를 한 번 더 입력"
            />
          </label>
        ) : null}
        {mode === 'up' ? (
          <p className="login-hint">영문 알파벳과 숫자를 모두 포함하고, 8~20자로 입력하세요.</p>
        ) : null}
        {mode === 'in' ? (
          <p className="login-forgot">
            <button type="button" className="login-link-btn" onClick={() => setAuthMode('forgot')}>
              비밀번호를 잊으셨나요?
            </button>
          </p>
        ) : null}
        {info ? <p className="login-success">{info}</p> : null}
        {error ? <p className="login-error">{error}</p> : null}
        <button className="btn btn-primary" type="submit" disabled={!configured || busy}>
          {busy ? '처리 중…' : submitLabel}
        </button>
        {mode === 'forgot' ? (
          <button className="btn btn-light" type="button" onClick={() => setAuthMode('in')}>
            로그인으로 돌아가기
          </button>
        ) : (
          <button
            className="btn btn-light"
            type="button"
            onClick={() => setAuthMode(mode === 'in' ? 'up' : 'in')}
          >
            {mode === 'in' ? '계정이 없나요? 회원가입' : '이미 계정이 있나요? 로그인'}
          </button>
        )}
        <p style={{ marginTop: 14 }}>
          <Link to="/">홈으로</Link>
        </p>
      </form>
    </div>
  )
}
