import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { useAuth } from '../context/AuthContext'
import { pageTitle, siteConfig } from '../data/siteConfig'
import { PASSWORD_HINT, validatePassword } from '../lib/password'

type Mode = 'in' | 'up' | 'forgot'

export function LoginPage() {
  const { signIn, signUp, requestPasswordReset, configured, user } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  function goHomeTop() {
    // Always home hero top + nav — never /#one (오늘설계).
    navigate('/', { replace: true })
    try {
      if (window.location.hash) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
      }
    } catch {
      /* ignore */
    }
    const pinTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    pinTop()
    requestAnimationFrame(pinTop)
    window.setTimeout(pinTop, 80)
    window.setTimeout(pinTop, 250)
  }

  useEffect(() => {
    if (user && mode !== 'forgot') goHomeTop()
    // Intentionally only react to auth/mode; goHomeTop uses stable navigate.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- post-login home redirect
  }, [user, mode, navigate])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')

    const emailValue = email.trim()
    if (!emailValue) {
      setError('이메일을 입력해 주세요.')
      return
    }

    if (mode === 'forgot') {
      setBusy(true)
      const result = await requestPasswordReset(emailValue)
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

    if (!password) {
      setError('비밀번호를 입력해 주세요.')
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
    const result =
      mode === 'in' ? await signIn(emailValue, password) : await signUp(emailValue, password)
    setBusy(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (mode === 'up') {
      setMode('in')
      setPassword('')
      setPasswordConfirm('')
      setInfo(
        '가입이 접수되었습니다. 이메일 확인 설정에 따라 바로 로그인하거나 메일 인증 후 로그인해 주세요.',
      )
      return
    }
    goHomeTop()
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

  const seo =
    mode === 'up'
      ? siteConfig.pages.signup
      : mode === 'forgot'
        ? {
            title: pageTitle('비밀번호 찾기'),
            description: '가입 이메일로 비밀번호 재설정 링크를 받습니다.',
            path: siteConfig.paths.login,
          }
        : siteConfig.pages.login

  return (
    <div className="container">
      <Seo
        title={seo.title}
        description={seo.description}
        path={seo.path}
        noIndex
      />
      <form className="login-card" onSubmit={onSubmit} noValidate>
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
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="예: name@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!configured}
            autoFocus
          />
        </label>
        {mode !== 'forgot' ? (
          <label>
            비밀번호
            <input
              type="password"
              name="password"
              required
              minLength={mode === 'up' ? 8 : 6}
              maxLength={20}
              pattern={mode === 'up' ? '(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,20}' : undefined}
              title={mode === 'up' ? PASSWORD_HINT : undefined}
              autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!configured}
              placeholder={mode === 'up' ? '예: dawon1234' : '비밀번호 입력'}
            />
          </label>
        ) : null}
        {mode === 'up' ? (
          <label>
            비밀번호 확인
            <input
              type="password"
              name="passwordConfirm"
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
