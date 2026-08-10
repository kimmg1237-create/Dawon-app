import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { mountDawonOs, scrollToDawonSection } from '../newsite/dawonOs/initDawonOs'

export function HomePage() {
  const host = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const el = host.current
    if (!el) return
    return mountDawonOs(el, navigate)
  }, [navigate])

  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.replace(/^#/, '')
    if (!id) return
    const t = window.setTimeout(() => scrollToDawonSection(id, 'smooth'), 50)
    return () => window.clearTimeout(t)
  }, [location.hash, location.key])

  return <div ref={host} className="dawon-os-home" />
}
