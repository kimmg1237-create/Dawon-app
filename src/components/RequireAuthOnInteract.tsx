import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ReactNode, SyntheticEvent } from 'react'

type Props = {
  children: ReactNode
  /** 로그인 후 돌아올 경로. 없으면 현재 location 사용 */
  from?: string
  className?: string
}

/**
 * 콘텐츠는 보여 주되, 클릭·입력 등 상호작용 시 로그인으로 유도합니다.
 */
export function RequireAuthOnInteract({ children, from, className }: Props) {
  const { user, configured, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function guard(e: SyntheticEvent) {
    if (!configured || loading || user) return
    const el = e.target as HTMLElement | null
    if (!el) return
    const interactive = el.closest(
      'button, a, input, select, textarea, label, summary, [role="button"], [role="tab"], [role="link"]',
    )
    if (!interactive) return
    e.preventDefault()
    e.stopPropagation()
    navigate('/login', {
      state: { from: from || `${location.pathname}${location.hash}` },
    })
  }

  return (
    <div className={className} onClickCapture={guard} onChangeCapture={guard} onSubmitCapture={guard}>
      {children}
    </div>
  )
}
