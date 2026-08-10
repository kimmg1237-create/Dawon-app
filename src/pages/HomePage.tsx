import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mountDawonOs, scrollToDawonSection, syncDawonOsAccount } from '../newsite/dawonOs/initDawonOs'

export function HomePage() {
  const host = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut, configured } = useAuth()
  const authRef = useRef({ user, signOut, configured })
  authRef.current = { user, signOut, configured }

  useEffect(() => {
    const el = host.current
    if (!el) return
    return mountDawonOs(el, navigate, {
      isLoggedIn: () => Boolean(authRef.current.user),
      onSignOut: () => {
        void authRef.current.signOut()
      },
      account: {
        email: authRef.current.user?.email ?? null,
        configured: authRef.current.configured,
      },
    })
  }, [navigate])

  useEffect(() => {
    syncDawonOsAccount(host.current, {
      email: user?.email ?? null,
      configured,
    })
  }, [user, configured])

  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.replace(/^#/, '')
    if (!id) return
    const t = window.setTimeout(() => scrollToDawonSection(id, 'smooth'), 50)
    return () => window.clearTimeout(t)
  }, [location.hash, location.key])

  return <div ref={host} className="dawon-os-home" />
}
