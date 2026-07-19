import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy, type RenderTask } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import './EbookViewer.css'

GlobalWorkerOptions.workerSrc = pdfWorker

const ZOOM_MIN = 0.7
const ZOOM_MAX = 1.8
const ZOOM_STEP = 0.1

interface EbookViewerProps {
  url: string
  title: string
  subtitle?: string
  onClose: () => void
}

export function EbookViewer({ url, title, subtitle, onClose }: EbookViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const pdfRef = useRef<PDFDocumentProxy | null>(null)
  const touchX = useRef<number | null>(null)
  const renderToken = useRef(0)
  const renderTaskRef = useRef<RenderTask | null>(null)
  const pageRef = useRef(1)
  const pageCountRef = useRef(0)

  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flip, setFlip] = useState<'none' | 'next' | 'prev'>('none')

  pageRef.current = page
  pageCountRef.current = pageCount

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      setPage(1)
      try {
        const loadingTask = getDocument({
          url,
          cMapUrl: '/pdfjs/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: '/pdfjs/standard_fonts/',
          useSystemFonts: true,
        })
        const pdf = await loadingTask.promise
        if (cancelled) {
          void pdf.cleanup()
          return
        }
        void pdfRef.current?.cleanup()
        pdfRef.current = pdf
        setPageCount(pdf.numPages)
      } catch {
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
    const pdf = pdfRef.current
    const canvas = canvasRef.current
    if (!pdf || !canvas || loading || page < 1 || pageCount < 1 || page > pageCount) return

    let cancelled = false
    const token = ++renderToken.current

    async function draw() {
      const targetPdf = pdfRef.current
      const targetCanvas = canvasRef.current
      if (!targetPdf || !targetCanvas) return

      // 같은 canvas에서 이전 렌더가 진행 중이면 취소해 충돌을 방지합니다.
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel()
        } catch {
          /* 이미 종료된 태스크는 무시합니다. */
        }
        renderTaskRef.current = null
      }

      try {
        const pdfPage = await targetPdf.getPage(page)
        if (cancelled || token !== renderToken.current) return

        const context = targetCanvas.getContext('2d')
        if (!context) {
          if (!cancelled) setError('페이지를 그리지 못했습니다.')
          return
        }

        const stage = stageRef.current
        const base = pdfPage.getViewport({ scale: 1 })
        const availableW = Math.max(240, (stage?.clientWidth ?? 800) - 24)
        const availableH = Math.max(240, (stage?.clientHeight ?? 600) - 24)
        const fit = Math.min(availableW / base.width, availableH / base.height)
        const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1))
        const cssScale = fit * zoom
        const viewport = pdfPage.getViewport({ scale: cssScale * dpr })

        targetCanvas.width = Math.floor(viewport.width)
        targetCanvas.height = Math.floor(viewport.height)
        targetCanvas.style.width = `${Math.floor(viewport.width / dpr)}px`
        targetCanvas.style.height = `${Math.floor(viewport.height / dpr)}px`

        const task = pdfPage.render({
          canvas: targetCanvas,
          viewport,
        })
        renderTaskRef.current = task
        await task.promise
        renderTaskRef.current = null
        if (!cancelled) setError('')
      } catch (err) {
        if (err && (err as { name?: string }).name === 'RenderingCancelledException') return
        console.error('EbookViewer render 실패:', err)
        if (!cancelled) setError('페이지를 그리지 못했습니다.')
      }
    }

    draw()
    return () => {
      cancelled = true
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel()
        } catch {
          /* 이미 종료된 태스크는 무시합니다. */
        }
        renderTaskRef.current = null
      }
    }
  }, [page, pageCount, zoom, loading])

  function bumpZoom(delta: number) {
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round((z + delta) * 10) / 10)))
  }

  function goNext() {
    if (pageRef.current >= pageCountRef.current) return
    setFlip('next')
    setPage((p) => Math.min(pageCountRef.current, p + 1))
    window.setTimeout(() => setFlip('none'), 280)
  }

  function goPrev() {
    if (pageRef.current <= 1) return
    setFlip('prev')
    setPage((p) => Math.max(1, p - 1))
    window.setTimeout(() => setFlip('none'), 280)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
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

  return (
    <div
      className="ebook-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} 전자책`}
      onClick={onClose}
    >
      <div className="ebook-modal-panel ebook-reader-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ebook-modal-bar">
          <div>
            <strong>{title}</strong>
            <span>{subtitle || '전자책'}</span>
          </div>
          <div className="ebook-toolbar">
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
          {/* 에러가 나도 canvas는 유지해 다음 페이지/재시도 렌더가 가능해야 합니다. */}
          {!loading && (
            <div className={`ebook-page-shell flip-${flip}`} hidden={Boolean(error)}>
              <canvas ref={canvasRef} className="ebook-canvas" />
            </div>
          )}

          <button
            type="button"
            className="ebook-nav ebook-nav-prev"
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
            }}
            disabled={page <= 1}
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
            disabled={page >= pageCount}
            aria-label="다음 페이지"
          >
            ›
          </button>
        </div>

        <div className="ebook-footer">
          <button type="button" className="btn btn-soft btn-small" onClick={goPrev} disabled={page <= 1}>
            이전
          </button>
          <span className="ebook-page-label">{pageCount > 0 ? `${page} / ${pageCount}` : '—'}</span>
          <button type="button" className="btn btn-soft btn-small" onClick={goNext} disabled={page >= pageCount}>
            다음
          </button>
        </div>
      </div>
    </div>
  )
}
