import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react'
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy, type RenderTask } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import './EbookViewer.css'

function installPdfWorker() {
  if (GlobalWorkerOptions.workerSrc) return
  const workerUrl = new URL(pdfWorker, window.location.origin).href
  const boot = `
if (typeof Map !== 'undefined' && typeof Map.prototype.getOrInsertComputed !== 'function') {
  Map.prototype.getOrInsertComputed = function (key, callbackFn) {
    if (this.has(key)) return this.get(key)
    const value = callbackFn(key)
    this.set(key, value)
    return value
  }
}
import ${JSON.stringify(workerUrl)};
`
  GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([boot], { type: 'text/javascript' }))
}

installPdfWorker()

const ZOOM_MIN = 0.7
const ZOOM_MAX = 1.8
const ZOOM_STEP = 0.1
const VIEW_MODE_KEY = 'dawonEbookViewMode'

type ViewMode = 'single' | 'dual'

interface EbookViewerProps {
  url: string
  title: string
  subtitle?: string
  onClose: () => void
}

function readSavedViewMode(): ViewMode {
  try {
    return localStorage.getItem(VIEW_MODE_KEY) === 'dual' ? 'dual' : 'single'
  } catch {
    return 'single'
  }
}

export function EbookViewer({ url, title, subtitle, onClose }: EbookViewerProps) {
  const canvasLeftRef = useRef<HTMLCanvasElement>(null)
  const canvasRightRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const pdfRef = useRef<PDFDocumentProxy | null>(null)
  const touchX = useRef<number | null>(null)
  const renderToken = useRef(0)
  const renderTasksRef = useRef<RenderTask[]>([])
  const pageRef = useRef(1)
  const pageCountRef = useRef(0)
  const viewModeRef = useRef<ViewMode>('single')

  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flip, setFlip] = useState<'none' | 'next' | 'prev'>('none')
  const [viewMode, setViewMode] = useState<ViewMode>(() => readSavedViewMode())
  const [jumpInput, setJumpInput] = useState('1')
  const [layoutTick, setLayoutTick] = useState(0)

  pageRef.current = page
  pageCountRef.current = pageCount
  viewModeRef.current = viewMode

  const dual = viewMode === 'dual'
  const rightPage = dual && page < pageCount ? page + 1 : null
  const canPrev = page > 1
  const canNext = dual ? page + 1 < pageCount : page < pageCount

  useEffect(() => {
    const onResize = () => setLayoutTick((n) => n + 1)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      setPage(1)
      setJumpInput('1')
      try {
        const loadingTask = getDocument({
          url,
          cMapUrl: '/pdfjs/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: '/pdfjs/standard_fonts/',
          wasmUrl: '/pdfjs/wasm/',
          useSystemFonts: true,
          useWorkerFetch: true,
        })
        const pdf = await loadingTask.promise
        if (cancelled) {
          void pdf.cleanup()
          return
        }
        void pdfRef.current?.cleanup()
        pdfRef.current = pdf
        setPageCount(pdf.numPages)
      } catch (err) {
        console.error('EbookViewer load 실패:', err)
        if (!cancelled) setError('전자책을 불러오지 못했습니다.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
      void pdfRef.current?.cleanup()
      pdfRef.current = null
    }
  }, [url])

  useEffect(() => {
    setJumpInput(String(page))
  }, [page])

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_MODE_KEY, viewMode)
    } catch {
      /* ignore */
    }
  }, [viewMode])

  useEffect(() => {
    const pdf = pdfRef.current
    if (!pdf || loading || page < 1 || pageCount < 1 || page > pageCount) return

    let cancelled = false
    const token = ++renderToken.current

    function cancelTasks() {
      for (const task of renderTasksRef.current) {
        try {
          task.cancel()
        } catch {
          /* ignore */
        }
      }
      renderTasksRef.current = []
    }

    async function renderOne(pageNum: number, canvas: HTMLCanvasElement, dualLayout: boolean) {
      const targetPdf = pdfRef.current
      if (!targetPdf) return
      const pdfPage = await targetPdf.getPage(pageNum)
      if (cancelled || token !== renderToken.current) return

      const context = canvas.getContext('2d')
      if (!context) throw new Error('no-2d')

      const stage = stageRef.current
      const base = pdfPage.getViewport({ scale: 1 })
      const gap = dualLayout ? 10 : 0
      const availableW = Math.max(240, (stage?.clientWidth ?? 800) - 24 - gap)
      const availableH = Math.max(240, (stage?.clientHeight ?? 600) - 24)
      const slotW = dualLayout ? availableW / 2 : availableW
      const fit = Math.min(slotW / base.width, availableH / base.height)
      const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1))
      const cssScale = fit * zoom
      const viewport = pdfPage.getViewport({ scale: cssScale * dpr })

      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      canvas.style.width = `${Math.floor(viewport.width / dpr)}px`
      canvas.style.height = `${Math.floor(viewport.height / dpr)}px`

      const task = pdfPage.render({ canvas, viewport })
      renderTasksRef.current.push(task)
      await task.promise
    }

    async function draw() {
      cancelTasks()
      const left = canvasLeftRef.current
      if (!left) return

      try {
        await renderOne(page, left, dual)
        if (cancelled || token !== renderToken.current) return

        const right = canvasRightRef.current
        if (dual && rightPage != null && right) {
          await renderOne(rightPage, right, true)
        }
        if (!cancelled) setError('')
      } catch (err) {
        if (err && (err as { name?: string }).name === 'RenderingCancelledException') return
        console.error('EbookViewer render 실패:', err)
        if (!cancelled) setError('페이지를 그리지 못했습니다.')
      } finally {
        renderTasksRef.current = []
      }
    }

    draw()
    return () => {
      cancelled = true
      cancelTasks()
    }
  }, [page, pageCount, zoom, loading, dual, rightPage, layoutTick])

  function bumpZoom(delta: number) {
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round((z + delta) * 10) / 10)))
  }

  function goNext() {
    const mode = viewModeRef.current
    const step = mode === 'dual' ? 2 : 1
    const current = pageRef.current
    const total = pageCountRef.current
    if (mode === 'dual' ? current + 1 >= total : current >= total) return
    setFlip('next')
    setPage(Math.min(total, current + step))
    window.setTimeout(() => setFlip('none'), 280)
  }

  function goPrev() {
    if (pageRef.current <= 1) return
    const step = viewModeRef.current === 'dual' ? 2 : 1
    setFlip('prev')
    setPage((p) => Math.max(1, p - step))
    window.setTimeout(() => setFlip('none'), 280)
  }

  function jumpToPage(raw?: string) {
    const n = Math.floor(Number(raw ?? jumpInput))
    if (!Number.isFinite(n) || pageCount < 1) return
    const clamped = Math.min(pageCount, Math.max(1, n))
    setPage(clamped)
    setJumpInput(String(clamped))
  }

  function onJumpSubmit(e: FormEvent) {
    e.preventDefault()
    jumpToPage()
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if (e.key === 'Escape') onClose()
        return
      }
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' || e.key === 'PageDown') goNext()
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') goPrev()
      if (e.key === '+' || e.key === '=') bumpZoom(ZOOM_STEP)
      if (e.key === '-' || e.key === '_') bumpZoom(-ZOOM_STEP)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  function onStageClick(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    if (x > rect.width * 0.62) goNext()
    else if (x < rect.width * 0.38) goPrev()
  }

  const pageLabel =
    pageCount > 0
      ? dual && rightPage != null
        ? `${page}–${rightPage} / ${pageCount}`
        : `${page} / ${pageCount}`
      : '—'

  return (
    <div
      className="ebook-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} 전자책`}
      onClick={onClose}
    >
      <div
        className={`ebook-modal-panel ebook-reader-panel${dual ? ' is-dual' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ebook-modal-bar">
          <div>
            <strong>{title}</strong>
            <span>{subtitle || '전자책'}</span>
          </div>
          <div className="ebook-toolbar">
            <div className="ebook-view-toggle" role="group" aria-label="보기 방식">
              <button
                type="button"
                className={`ebook-view-btn${viewMode === 'single' ? ' active' : ''}`}
                onClick={() => setViewMode('single')}
              >
                1쪽
              </button>
              <button
                type="button"
                className={`ebook-view-btn${viewMode === 'dual' ? ' active' : ''}`}
                onClick={() => setViewMode('dual')}
              >
                2쪽
              </button>
            </div>
            <div className="ebook-zoom" aria-label="크기 조절">
              <button type="button" className="ebook-tool-btn" onClick={() => bumpZoom(-ZOOM_STEP)} aria-label="축소">
                −
              </button>
              <input
                type="range"
                min={ZOOM_MIN}
                max={ZOOM_MAX}
                step={ZOOM_STEP}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                aria-label="확대 비율"
              />
              <button type="button" className="ebook-tool-btn" onClick={() => bumpZoom(ZOOM_STEP)} aria-label="확대">
                +
              </button>
              <span className="ebook-zoom-label">{Math.round(zoom * 100)}%</span>
            </div>
            <button type="button" className="btn btn-primary btn-small" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>

        <div
          className="ebook-stage"
          ref={stageRef}
          onClick={onStageClick}
          onTouchStart={(e) => {
            touchX.current = e.changedTouches[0]?.clientX ?? null
          }}
          onTouchEnd={(e) => {
            const start = touchX.current
            const end = e.changedTouches[0]?.clientX
            touchX.current = null
            if (start == null || end == null) return
            const dx = end - start
            if (dx < -48) goNext()
            if (dx > 48) goPrev()
          }}
        >
          {loading && <p className="ebook-status">전자책을 여는 중…</p>}
          {error && <p className="ebook-status ebook-error">{error}</p>}
          {!loading && (
            <div className={`ebook-page-shell flip-${flip}${dual ? ' is-dual' : ''}`} hidden={Boolean(error)}>
              <canvas ref={canvasLeftRef} className="ebook-canvas" />
              {dual && rightPage != null && <canvas ref={canvasRightRef} className="ebook-canvas" />}
            </div>
          )}

          <button
            type="button"
            className="ebook-nav ebook-nav-prev"
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
            }}
            disabled={!canPrev}
            aria-label="이전 페이지"
          >
            ‹
          </button>
          <button
            type="button"
            className="ebook-nav ebook-nav-next"
            onClick={(e) => {
              e.stopPropagation()
              goNext()
            }}
            disabled={!canNext}
            aria-label="다음 페이지"
          >
            ›
          </button>
        </div>

        <div className="ebook-footer">
          <button type="button" className="btn btn-soft btn-small" onClick={goPrev} disabled={!canPrev}>
            이전
          </button>

          <form className="ebook-jump" onSubmit={onJumpSubmit}>
            <label className="ebook-jump-label" htmlFor="ebookJumpPage">
              페이지
            </label>
            <input
              id="ebookJumpPage"
              className="ebook-jump-input"
              type="number"
              min={1}
              max={Math.max(1, pageCount)}
              inputMode="numeric"
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              aria-label="이동할 페이지 번호"
            />
            <span className="ebook-page-label ebook-page-total">/ {pageCount || '—'}</span>
            <button type="submit" className="btn btn-soft btn-small">
              이동
            </button>
            <span className="ebook-page-label ebook-page-spread" aria-live="polite">
              {pageLabel}
            </span>
          </form>

          <button type="button" className="btn btn-soft btn-small" onClick={goNext} disabled={!canNext}>
            다음
          </button>
        </div>
      </div>
    </div>
  )
}
