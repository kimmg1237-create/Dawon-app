import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './AuthSection.css'

export function AuthSection() {
  const { user, loading, configured, signIn, signUp, signOut } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    setSubmitting(true)

    const error =
      mode === 'login' ? await signIn(email, password) : await signUp(email, password)

    setSubmitting(false)

    if (error) {
      setMessage(error)
      return
    }

    if (mode === 'signup') {
      setMessage('가입 완료! 이메일 인증 후 로그인해주세요. (인증 없이 사용 설정이면 바로 로그인됩니다)')
    } else {
      setMessage('로그인되었습니다. 기록이 클라우드와 동기화됩니다.')
    }
  }

  if (loading) {
    return (
      <section id="auth" className="auth-section">
        <p className="auth-loading">계정 정보를 불러오는 중...</p>
      </section>
    )
  }

  if (!configured) {
    return (
      <section id="auth" className="auth-section">
        <div className="auth-box auth-warning">
          <h2 className="section-title">클라우드 연동 설정 필요</h2>
          <p className="section-subtitle">
            프로젝트 폴더에 <code>.env</code> 파일을 만들고 Supabase anon key를 입력해주세요.
          </p>
          <pre className="auth-code">
            VITE_SUPABASE_URL=https://zkxndxurporlkjssxqch.supabase.co{'\n'}
            VITE_SUPABASE_ANON_KEY=본인_anon_key
          </pre>
          <p className="auth-hint">
            Supabase → Project Settings → API → <strong>anon public</strong> 키를 복사하세요.
          </p>
        </div>
      </section>
    )
  }

  if (user) {
    return (
      <section id="auth" className="auth-section">
        <div className="auth-box auth-logged-in">
          <p>
            <i className="fa-solid fa-cloud" /> <strong>{user.email}</strong> 으로 로그인됨
          </p>
          <p className="auth-sync-note">기록이 클라우드에 자동 저장·동기화됩니다.</p>
          <button type="button" className="auth-btn-outline" onClick={() => signOut()}>
            로그아웃
          </button>
        </div>
      </section>
    )
  }

  return (
    <section id="auth" className="auth-section">
      <h2 className="section-title">로그인 / 회원가입</h2>
      <p className="section-subtitle">계정으로 로그인하면 기록이 클라우드에 안전하게 저장됩니다.</p>

      <div className="auth-box">
        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            로그인
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => setMode('signup')}
          >
            회원가입
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="auth-email">이메일</label>
          <input
            id="auth-email"
            type="email"
            className="input-text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <label htmlFor="auth-password">비밀번호</label>
          <input
            id="auth-password"
            type="password"
            className="input-text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          <button type="submit" className="auth-btn-filled" disabled={submitting}>
            {submitting ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}
      </div>
    </section>
  )
}
