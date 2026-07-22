import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PASSWORD_HINT, validatePassword } from '../lib/password'

export function ResetPasswordPage() {
  const { configured, loading, session, updatePassword, signOut } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (loading) return
    // 메일 링크의 해시 세션이 잡힐 때까지 잠시 대기
    const t = window.setTimeout(() => setReady(true), 400)
    return () => window.clearTimeout(t)
  }, [loading])

  const canReset = Boolean(session)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const ruleError = validatePassword(password)
    if (ruleError) {
      setError(ruleError)
      return
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다. 다시 확인해 주세요.')
      return
    }
    if (!canReset) {
      setError('재설정 링크가 유효하지 않거나 만료되었습니다. 비밀번호 찾기를 다시 요청해 주세요.')
      return
    }

    setBusy(true)
    const result = await updatePassword(password)
    setBusy(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setDone(true)
    await signOut()
  }

  if (!configured) {
    return (
      <div className="container">
        <div className="login-card">
          <h1>비밀번호 재설정</h1>
          <p>Supabase 환경변수가 설정되지 않았습니다.</p>
          <Link to="/login">로그인으로</Link>
        </div>
      </div>
    )
  }

  if (!ready || loading) {
    return (
      <div className="container">
        <div className="login-card">
          <h1>비밀번호 재설정</h1>
          <p>인증 정보를 확인하는 중…</p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="container">
        <div className="login-card">
          <h1>재설정 완료</h1>
          <p className="login-success">새 비밀번호가 저장되었습니다. 새 비밀번호로 로그인해 주세요.</p>
          <button className="btn btn-primary" type="button" onClick={() => navigate('/login')}>
            로그인하기
          </button>
        </div>
      </div>
    )
  }

  if (!canReset) {
    return (
      <div className="container">
        <div className="login-card">
          <h1>링크가 만료됨</h1>
          <p>
            비밀번호 재설정 링크가 유효하지 않거나 이미 사용되었습니다. 로그인 화면에서 다시
            요청해 주세요.
          </p>
          <button className="btn btn-primary" type="button" onClick={() => navigate('/login')}>
            비밀번호 다시 찾기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <form className="login-card" onSubmit={onSubmit} noValidate>
        <h1>새 비밀번호 설정</h1>
        <p>이메일로 받은 링크가 확인되었습니다. 새 비밀번호를 입력해 주세요.</p>
        <label>
          새 비밀번호
          <input
            type="password"
            required
            minLength={8}
            maxLength={20}
            autoComplete="new-password"
            title={PASSWORD_HINT}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="예: dawon1234"
          />
        </label>
        <label>
          새 비밀번호 확인
          <input
            type="password"
            required
            minLength={8}
            maxLength={20}
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="비밀번호를 한 번 더 입력"
          />
        </label>
        <p className="login-hint">영문 알파벳과 숫자를 모두 포함하고, 8~20자로 입력하세요.</p>
        {error ? <p className="login-error">{error}</p> : null}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? '저장 중…' : '비밀번호 변경'}
        </button>
        <p style={{ marginTop: 14 }}>
          <Link to="/login">로그인으로</Link>
        </p>
      </form>
    </div>
  )
}
