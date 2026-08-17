import { useCallback, useEffect, useRef, useState } from 'react'
import { type PDFDocumentProxy, type RenderTask } from 'pdfjs-dist'
import { loadPdfDocument } from '../lib/loadPdf'
import { detectComicPanels, type NormBox } from '../lib/detectComicPanels'
import { createComicScore, type ScoreHandle } from '../lib/comicScore'
import './ComicMoviePlayer.css'

type CutMode = 4 | 7
type Ratio = '16:9' | '9:16'

const SIZE: Record<Ratio, { w: number; h: number }> = {
  '16:9': { w: 1280, h: 720 },
  '9:16': { w: 720, h: 1280 },
}

const KEN = ['ken-a', 'ken-b', 'ken-c'] as const

type ComicMoviePlayerProps = {
  url: string
  title: string
  subtitle?: string
  previewMaxPages?: number
  onClose: () => void
  onRequestFullAccess?: () => void
}

function cutDelay(cut: number, total: number, base: number) {
  if (cut === 1) return Math.round(base * 0.78)
  if (cut === total) return Math.round(base * 1.14)
  return base
}

export function ComicMoviePlayer({
  url,
  title,
  subtitle,
  previewMaxPages,
  onClose,
  onRequestFullAccess,
}: ComicMoviePlayerProps) {
  const canvasARef = useRef<HTMLCanvasElement>(null)
  const canvasBRef = useRef<HTMLCanvasElement>(null)
  const pdfRef = useRef<PDFDocumentProxy | null>(null)
  const pageBitmapRef = useRef<HTMLCanvasElement | null>(null)
  const boxesRef = useRef<NormBox[]>([])
  const renderedPageRef = useRef(0)
  const renderTaskRef = useRef<RenderTask | null>(null)
  const timerRef = useRef<number | null>(null)
  const tokenRef = useRef(0)
  const playingRef = useRef(true)
  const pageRef = useRef(1)
  const cutRef = useRef(1)
  const cutsRef = useRef<CutMode>(4)
  const delayRef = useRef(6500)
  const ratioRef = useRef<Ratio>('16:9')
  const maxPageRef = useRef(1)
  const frontRef = useRef<0 | 1>(0)
  const primedRef = useRef(false)
  const scoreRef = useRef<ScoreHandle | null>(null)

  const [page, setPage] = useState(1)
  const [cut, setCut] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [cuts, setCuts] = useState<CutMode>(4)
  const [playing, setPlaying] = useState(true)
  const [delay, setDelay] = useState(6500)
  const [ratio, setRatio] = useState<Ratio>('16:9')
  const [muted, setMuted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ken, setKen] = useState<(typeof KEN)[number]>('ken-a')
  const [front, setFront] = useState<0 | 1>(0)
  const [status, setStatus] = useState('준비 중')
  const [showTitle, setShowTitle] = useState(true)

  playingRef.current = playing
  pageRef.current = page
  cutRef.current = cut
  cutsRef.current = cuts
  delayRef.current = delay
  ratioRef.current = ratio
  frontRef.current = front

  const cappedCount =
    previewMaxPages && previewMaxPages > 0 ? Math.min(pageCount, previewMaxPages) : pageCount
  maxPageRef.current = Math.max(1, cappedCount || pageCount || 1)
  const previewEnded = Boolean(previewMaxPages && pageCount > 0 && page >= cappedCount && cut >= cuts)

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const paintCut = useCallback((target: HTMLCanvasElement, pageNo: number, cutNo: number, cutCount: CutMode) => {
    const src = pageBitmapRef.current
    const ctx = target.getContext('2d', { alpha: false })
    if (!src || !ctx) return
    const size = SIZE[ratioRef.current]
    target.width = size.w
    target.height = size.h
    ctx.fillStyle = '#05080f'
    ctx.fillRect(0, 0, size.w, size.h)
    const list = boxesRef.current.length === cutCount ? boxesRef.current : []
    const fallback: NormBox = [0.04, 0.12, 0.96, 0.9]
    const b = list[(cutNo - 1) % Math.max(list.length, 1)] || fallback
    const sx = src.width * b[0]
    const sy = src.height * b[1]
    const sw = Math.max(2, src.width * (b[2] - b[0]))
    const sh = Math.max(2, src.height * (b[3] - b[1]))
    const bar = ratioRef.current === '9:16' ? 0.08 : 0.07
    const frameW = size.w
    const frameH = size.h * (1 - bar * 2)
    const scale = Math.min(frameW / sw, frameH / sh)
    const dw = sw * scale
    const dh = sh * scale
    ctx.drawImage(src, sx, sy, sw, sh, (size.w - dw) / 2, (size.h - dh) / 2, dw, dh)
    ctx.fillStyle = '#05080f'
    ctx.fillRect(0, 0, size.w, size.h * bar)
    ctx.fillRect(0, size.h * (1 - bar), size.w, size.h * bar)
    setKen(KEN[(pageNo + cutNo) % KEN.length])
    setStatus(`${cutCount}컷 · ${pageNo}쪽 ${cutNo}컷`)
  }, [])

  const revealCut = useCallback(
    (pageNo: number, cutNo: number, cutCount: CutMode) => {
      if (!primedRef.current) {
        const first = canvasARef.current
        if (!first) return
        paintCut(first, pageNo, cutNo, cutCount)
        setFront(0)
        frontRef.current = 0
        primedRef.current = true
        return
      }
      const next = frontRef.current === 0 ? 1 : 0
      const target = next === 0 ? canvasARef.current : canvasBRef.current
      if (!target) return
      paintCut(target, pageNo, cutNo, cutCount)
      scoreRef.current?.whoosh()
      setFront(next)
      frontRef.current = next
    },
    [paintCut],
  )

  const scheduleAdvance = useCallback(() => {
    clearTimer()
    if (!playingRef.current) return
    const wait = cutDelay(cutRef.current, cutsRef.current, delayRef.current)
    timerRef.current = window.setTimeout(() => {
      if (!playingRef.current) return
      const cutCount = cutsRef.current
      if (cutRef.current < cutCount) {
        const nextCut = cutRef.current + 1
        cutRef.current = nextCut
        setCut(nextCut)
        revealCut(pageRef.current, nextCut, cutCount)
        scheduleAdvance()
        return
      }
      if (pageRef.current < maxPageRef.current) {
        void showScene(pageRef.current + 1, 1, true)
        return
      }
      playingRef.current = false
      setPlaying(false)
      setStatus('재생 완료')
    }, wait)
  }, [clearTimer, revealCut])

  const showScene = useCallback(
    async (pageNo: number, cutNo: number, autoplay: boolean) => {
      const pdf = pdfRef.current
      if (!pdf) return
      const token = ++tokenRef.current
      clearTimer()
      pageRef.current = pageNo
      cutRef.current = cutNo
      setPage(pageNo)
      setCut(cutNo)
      try {
        if (renderedPageRef.current !== pageNo || !pageBitmapRef.current) {
          setLoading(true)
          setError('')
          renderTaskRef.current?.cancel()
          const pdfPage = await pdf.getPage(pageNo)
          if (token !== tokenRef.current) return
          const base = pdfPage.getViewport({ scale: 1 })
          const scale = Math.min(2.4, 1600 / base.width)
          const vp = pdfPage.getViewport({ scale })
          const off = document.createElement('canvas')
          off.width = Math.floor(vp.width)
          off.height = Math.floor(vp.height)
          const offCtx = off.getContext('2d', { alpha: false })
          if (!offCtx) throw new Error('canvas')
          const task = pdfPage.render({ canvas: off, canvasContext: offCtx, viewport: vp })
          renderTaskRef.current = task
          await task.promise
          if (token !== tokenRef.current) return
          pageBitmapRef.current = off
          renderedPageRef.current = pageNo
          boxesRef.current = detectComicPanels(off, cutsRef.current)
        }
        revealCut(pageNo, cutNo, cutsRef.current)
        setLoading(false)
        if (autoplay && playingRef.current) scheduleAdvance()
      } catch (err) {
        if ((err as { name?: string })?.name === 'RenderingCancelledException') return
        if (token !== tokenRef.current) return
        setLoading(false)
        setError('만화 장면을 만들지 못했습니다.')
        setStatus('장면 변환 실패')
      }
    },
    [clearTimer, revealCut, scheduleAdvance],
  )

  useEffect(() => {
    let cancelled = false
    const titleTimer = window.setTimeout(() => setShowTitle(false), 1600)
    scoreRef.current = createComicScore()
    async function load() {
      setLoading(true)
      setError('')
      setPage(1)
      setCut(1)
      setPlaying(true)
      setShowTitle(true)
      playingRef.current = true
      primedRef.current = false
      renderedPageRef.current = 0
      pageBitmapRef.current = null
      try {
        const pdf = await loadPdfDocument(url)
        if (cancelled) {
          void pdf.cleanup()
          return
        }
        void pdfRef.current?.cleanup()
        pdfRef.current = pdf
        const total = pdf.numPages
        const capped = previewMaxPages && previewMaxPages > 0 ? Math.min(total, previewMaxPages) : total
        setPageCount(capped)
        maxPageRef.current = Math.max(1, capped)
        await showScene(1, 1, true)
      } catch {
        if (!cancelled) {
          setError('만화 PDF를 불러오지 못했습니다.')
          setLoading(false)
        }
      }
    }
    void load()
    return () => {
      cancelled = true
      tokenRef.current += 1
      window.clearTimeout(titleTimer)
      clearTimer()
      renderTaskRef.current?.cancel()
      scoreRef.current?.stop()
      scoreRef.current = null
      void pdfRef.current?.cleanup()
      pdfRef.current = null
    }
  }, [url, previewMaxPages, clearTimer, showScene])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  function togglePlay() {
    if (previewEnded && !playing) {
      playingRef.current = true
      setPlaying(true)
      setShowTitle(true)
      window.setTimeout(() => setShowTitle(false), 1400)
      void showScene(1, 1, true)
      return
    }
    const next = !playing
    setPlaying(next)
    playingRef.current = next
    if (next) scheduleAdvance()
    else {
      clearTimer()
      setStatus('일시정지')
    }
  }

  function changeCuts(next: CutMode) {
    setCuts(next)
    cutsRef.current = next
    renderedPageRef.current = 0
    void showScene(page, 1, playing)
  }

  function changeRatio(next: Ratio) {
    setRatio(next)
    ratioRef.current = next
    void showScene(page, cut, playing)
  }

  const size = SIZE[ratio]
  const durationSec = `${cutDelay(cut, cuts, delay) / 1000}s`

  return (
    <div
      className="comic-movie-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} 만화영화`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={`comic-movie-shell is-${ratio === '9:16' ? 'portrait' : 'landscape'}`}>
        <div className="comic-movie-head">
          <div className="comic-movie-title">
            <b>{title}</b>
            <span>{subtitle || '컷 인식 · 페이드 · BGM'}</span>
          </div>
          <button type="button" className="comic-movie-close" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>

        <div className="comic-movie-stage">
          <div
            className={`comic-movie-frame ${ken}`}
            style={{
              aspectRatio: `${size.w} / ${size.h}`,
              ['--motion-duration' as string]: durationSec,
            }}
          >
            <canvas ref={canvasARef} className={front === 0 ? 'is-front' : ''} />
            <canvas ref={canvasBRef} className={front === 1 ? 'is-front' : ''} />
            {showTitle ? (
              <div className="comic-movie-titlecard">
                <small>DAWON COMIC FILM</small>
                <strong>{title}</strong>
              </div>
            ) : null}
          </div>
          <div className="comic-movie-badge">{cuts}컷 LIVE</div>
          <div className="comic-movie-page">
            {page}쪽 · {cut}/{cuts}컷
          </div>
          {loading ? <div className="comic-movie-loading">컷을 찾고 장면을 만드는 중…</div> : null}
          {error ? <div className="comic-movie-loading">{error}</div> : null}
        </div>

        {previewMaxPages ? (
          <div className="comic-movie-preview">
            미리보기는 앞 {previewMaxPages}쪽까지입니다.
            {onRequestFullAccess ? (
              <button type="button" className="comic-movie-link" onClick={onRequestFullAccess}>
                전체 만화영화 보기
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="comic-movie-controls">
          <button
            type="button"
            onClick={() => {
              if (cut > 1) void showScene(page, cut - 1, playing)
              else if (page > 1) void showScene(page - 1, cuts, playing)
            }}
          >
            ◀ 이전
          </button>
          <button type="button" className="primary" onClick={togglePlay}>
            {playing ? '❚❚ 일시정지' : previewEnded ? '▶ 처음부터' : '▶ 재생'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (cut < cuts) void showScene(page, cut + 1, playing)
              else if (page < maxPageRef.current) void showScene(page + 1, 1, playing)
            }}
          >
            다음 ▶
          </button>
          <select
            value={String(cuts)}
            aria-label="컷 수"
            onChange={(e) => changeCuts(Number(e.target.value) === 7 ? 7 : 4)}
          >
            <option value="4">4컷 인식</option>
            <option value="7">7컷 인식</option>
          </select>
          <select value={ratio} aria-label="화면 비율" onChange={(e) => changeRatio(e.target.value as Ratio)}>
            <option value="16:9">유튜브 16:9</option>
            <option value="9:16">쇼츠 9:16</option>
          </select>
          <select
            value={String(delay)}
            aria-label="장면 속도"
            onChange={(e) => setDelay(Number(e.target.value))}
          >
            <option value="4500">빠르게</option>
            <option value="6500">기본</option>
            <option value="9000">천천히</option>
          </select>
          <button
            type="button"
            aria-pressed={muted}
            onClick={() => {
              const next = !muted
              setMuted(next)
              scoreRef.current?.setMuted(next)
            }}
          >
            {muted ? 'BGM 켜기' : 'BGM 끄기'}
          </button>
          <span className="comic-movie-status">{status}</span>
        </div>
      </div>
    </div>
  )
}
