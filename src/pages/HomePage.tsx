import { useEffect, useRef } from 'react'
import lifeDesignHome from '../newsite/sections/lifeDesignHome.html?raw'
import { initLifeDesignSite } from '../newsite/initLifeDesign'
import '../newsite/lifeDesign.css'

export function HomePage() {
  const host = useRef<HTMLDivElement>(null)
  const done = useRef(false)

  useEffect(() => {
    const el = host.current
    if (!el || done.current) return
    done.current = true
    el.innerHTML = lifeDesignHome

    try {
      initLifeDesignSite()
    } catch (e) {
      console.warn(e)
    }

    document.body.classList.add('large-text')
    document.body.classList.remove('high-contrast')

    return () => {
      document.querySelectorAll('[data-dawon-stub="1"]').forEach((n) => n.remove())
      queueMicrotask(() => {
        if (host.current === el) el.innerHTML = ''
      })
      done.current = false
    }
  }, [])

  return <div ref={host} className="life-design-home" />
}
