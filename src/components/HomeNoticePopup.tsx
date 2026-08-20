import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { siteConfig } from '../data/siteConfig'
import { dawonT, getDawonLang, type DawonLang } from '../newsite/dawonOs/i18n'
import './HomeNoticePopup.css'

const STORAGE_KEY = 'dawon_home_notice_hide_until'
const MOBILE_MQ = '(max-width: 720px)'

type HideMode = 'none' | 'today' | 'hours6'

function hideUntilMs(mode: HideMode) {
  if (mode === 'hours6') return Date.now() + 6 * 60 * 60 * 1000
  if (mode === 'today') {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    return end.getTime()
  }
  return 0
}

function shouldShowNotice() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return true
    const until = Number(raw)
    if (!Number.isFinite(until)) return true
    return Date.now() >= until
  } catch {
    return true
  }
}

function isDragIgnoredTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest('a, button, input, label, textarea, select'))
}

export function HomeNoticePopup() {
  const titleId = useId()
  const [open, setOpen] = useState(false)
  const [hideMode, setHideMode] = useState<HideMode>('none')
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [lang, setLang] = useState<DawonLang>(() =>
    typeof document !== 'undefined' ? getDawonLang() : 'ko',
  )
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    origX: number
    origY: number
  } | null>(null)

  useEffect(() => {
    const onLang = () => setLang(getDawonLang())
    window.addEventListener('dawon-lang-changed', onLang)
    return () => window.removeEventListener('dawon-lang-changed', onLang)
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (shouldShowNotice()) setOpen(true)
    }, 280)
    return () => window.clearTimeout(t)
  }, [])

  function persistHide() {
    if (hideMode === 'none') return
    try {
      localStorage.setItem(STORAGE_KEY, String(hideUntilMs(hideMode)))
    } catch {
      /* ignore */
    }
  }

  function close() {
    persistHide()
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, hideMode])

  function startDrag(e: ReactPointerEvent<HTMLDivElement>) {
    if (window.matchMedia(MOBILE_MQ).matches) return
    if (e.button !== 0) return
    if (isDragIgnoredTarget(e.target)) return
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origX: offset.x,
      origY: offset.y,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }

  function moveDrag(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    setOffset({
      x: drag.origX + (e.clientX - drag.startX),
      y: drag.origY + (e.clientY - drag.startY),
    })
  }

  function endDrag(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    dragRef.current = null
    setDragging(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  if (!open) return null

  const { urls } = siteConfig
  const t = (key: string) => dawonT(key, lang)

  return (
    <div className="home-notice" role="dialog" aria-modal="false" aria-labelledby={titleId}>
      <div
        className={`home-notice-card${dragging ? ' is-dragging' : ''}`}
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="home-notice-handle" aria-hidden="true" />
        <button type="button" className="home-notice-close" aria-label={t('close')} onClick={close}>
          ×
        </button>
        <img className="home-notice-logo" src="/brand/dawon-logo.png" alt="" width={72} height={72} />
        <p className="home-notice-kicker">{t('brandNav')}</p>
        <h2 id={titleId}>{t('noticeTitle')}</h2>
        <p className="home-notice-copy">{t('noticeCopy')}</p>
        <div className="home-notice-actions">
          <a className="btn btn-primary home-notice-cta" href="#one" onClick={() => close()}>
            {t('noticeStart')}
          </a>
          <a
            className="btn btn-soft"
            href={urls.publisherSite}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => persistHide()}
          >
            {t('noticePublisher')}
          </a>
        </div>
        <div className="home-notice-hide" role="group" aria-label={t('noticeHideGroup')}>
          <label>
            <input
              type="checkbox"
              checked={hideMode === 'today'}
              onChange={(e) => setHideMode(e.target.checked ? 'today' : 'none')}
            />
            {t('noticeHideToday')}
          </label>
          <label>
            <input
              type="checkbox"
              checked={hideMode === 'hours6'}
              onChange={(e) => setHideMode(e.target.checked ? 'hours6' : 'none')}
            />
            {t('noticeHide6h')}
          </label>
        </div>
      </div>
    </div>
  )
}
