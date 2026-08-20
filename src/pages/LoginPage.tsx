import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { useAuth } from '../context/AuthContext'
import { pageTitle, siteConfig } from '../data/siteConfig'
import { PASSWORD_HINT, validatePassword } from '../lib/password'
import { dawonT, getDawonLang, type DawonLang } from '../newsite/dawonOs/i18n'

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
  const [lang, setLang] = useState<DawonLang>(() => getDawonLang())
  const t = (key: string) => dawonT(key, lang)

  useEffect(() => {
    const onLang = () => setLang(getDawonLang())
    window.addEventListener('dawon-lang-changed', onLang)
    return () => window.removeEventListener('dawon-lang-changed', onLang)
  }, [])

  function goHomeTop() {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- post-login home redirect
  }, [user, mode, navigate])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')

    const emailValue = email.trim()
    if (!emailValue) {
      setError(t('loginErrEmail'))
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
      setInfo(t('loginResetSent'))
      return
    }

    if (!password) {
      setError(t('loginErrPassword'))
      return
    }

    if (mode === 'up') {
      if (password !== passwordConfirm) {
        setError(t('loginErrPasswordMatch'))
        return
      }
      const pwError = validatePassword(password)
      if (pwError) {
        setError(pwError)
        return
      }
      setBusy(true)
      const result = await signUp(emailValue, password)
      setBusy(false)
      if (result.error) {
        setError(result.error)
        return
      }
      setInfo(t('loginSignupOk'))
      return
    }

    setBusy(true)
    const result = await signIn(emailValue, password)
    setBusy(false)
    if (result.error) {
      setError(result.error)
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

  const title = mode === 'in' ? t('authLoginTitle') : mode === 'up' ? t('authRegisterTitle') : t('authForgotTitle')
  const submitLabel =
    mode === 'in' ? t('authLoginSubmit') : mode === 'up' ? t('authRegisterSubmit') : t('authForgotSubmit')

  const seo =
    mode === 'up'
      ? { title: pageTitle(t('authRegisterTitle')), description: t('authRegisterDesc'), path: siteConfig.paths.login }
      : mode === 'forgot'
        ? {
            title: pageTitle(t('authForgotTitle')),
            description: t('authForgotDesc'),
            path: siteConfig.paths.login,
          }
        : { title: pageTitle(t('authLoginTitle')), description: t('authLoginDesc'), path: siteConfig.paths.login }

  return (
    <div className="container">
      <Seo title={seo.title} description={seo.description} path={seo.path} noIndex />
      <form className="login-card" onSubmit={onSubmit} noValidate>
        <h1>{title}</h1>
        <p>
          {!configured
            ? t('loginLocalOnly')
            : mode === 'up'
              ? t('loginSignupHint')
              : mode === 'forgot'
                ? t('authForgotDesc')
                : t('authLoginDesc')}
        </p>
        <label>
          {t('labelEmail')}
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="name@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!configured}
            autoFocus
          />
        </label>
        {mode !== 'forgot' ? (
          <label>
            {t('labelPassword')}
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
              placeholder={t('labelPassword')}
            />
          </label>
        ) : null}
        {mode === 'up' ? (
          <label>
            {t('labelPasswordConfirm')}
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
              placeholder={t('labelPasswordConfirm')}
            />
          </label>
        ) : null}
        {mode === 'up' ? <p className="login-hint">{t('loginSignupHint')}</p> : null}
        {mode === 'in' ? (
          <p className="login-forgot">
            <button type="button" className="login-link-btn" onClick={() => setAuthMode('forgot')}>
              {t('loginForgotLink')}
            </button>
          </p>
        ) : null}
        {info ? <p className="login-success">{info}</p> : null}
        {error ? <p className="login-error">{error}</p> : null}
        <button className="btn btn-primary" type="submit" disabled={!configured || busy}>
          {busy ? t('loginBusy') : submitLabel}
        </button>
        {mode === 'forgot' ? (
          <button className="btn btn-light" type="button" onClick={() => setAuthMode('in')}>
            {t('loginBack')}
          </button>
        ) : (
          <button
            className="btn btn-light"
            type="button"
            onClick={() => setAuthMode(mode === 'in' ? 'up' : 'in')}
          >
            {mode === 'in' ? t('loginGoSignup') : t('loginGoSignin')}
          </button>
        )}
        <p style={{ marginTop: 14 }}>
          <Link to="/">{t('loginHome')}</Link>
        </p>
      </form>
    </div>
  )
}
