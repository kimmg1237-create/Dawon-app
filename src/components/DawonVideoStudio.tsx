import { useCallback, useEffect, useRef, useState } from 'react'
import { getComicUrl } from '../data/comicFiles'
import { PATH_CARDS } from '../data/paths'
import { loadPdfFromBytes } from '../lib/loadPdf'
import './DawonVideoStudio.css'

type Ratio = '9:16' | '16:9' | '1:1' | '4:5'
type Motion = 'cinema' | 'gentle' | 'still'

type Slide = {
  image: HTMLImageElement
  label: string
}

type DayRecord = {
  date?: string
  done?: string
  mood?: string
  action?: string
  result?: string
  learn?: string
  tomorrow?: string
  selfWord?: string
}

const RATIO: Record<Ratio, [number, number]> = {
  '9:16': [720, 1280],
  '16:9': [1280, 720],
  '1:1': [900, 900],
  '4:5': [864, 1080],
}

const DEFAULT_STORY = `생각만으로 달라지지 않았다
오늘의 사실 확인
감정은 잘못이 아니라 정보
10분 안에 할 한 가지
행동은 결과를 남긴다
경험은 나만의 답을 만든다
오늘을 확인하고, 내일을 설계하세요`

const MIME_CANDIDATES = [
  'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
]

function supportedMime() {
  return MIME_CANDIDATES.find((x) => window.MediaRecorder?.isTypeSupported?.(x)) || ''
}

function formatTime(sec: number) {
  const s = Math.max(0, Math.floor(sec))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function slug(text: string) {
  return (
    String(text || 'dawon-video')
      .toLowerCase()
      .replace(/[^\w가-힣]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48) || 'dawon-video'
  )
}

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  content: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3,
) {
  const words = String(content || '').split(/\s+/)
  let line = ''
  const lines: string[] = []
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  const shown = lines.slice(0, maxLines)
  shown.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight))
  return shown.length
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, r)
    return
  }
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function coverDraw(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  progress: number,
  motion: Motion,
) {
  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  if (!iw || !ih) return
  const base = Math.max(w / iw, h / ih)
  const zoom = motion === 'still' ? 1 : motion === 'gentle' ? 1.02 + progress * 0.025 : 1.05 + progress * 0.08
  const dw = iw * base * zoom
  const dh = ih * base * zoom
  let dx = (w - dw) / 2
  let dy = (h - dh) / 2
  if (motion === 'gentle') {
    dx += Math.sin(progress * Math.PI * 2) * w * 0.018
    dy += Math.cos(progress * Math.PI) * h * 0.012
  } else if (motion === 'cinema') {
    dx -= progress * w * 0.03
    dy -= progress * h * 0.018
  }
  ctx.drawImage(img, dx, dy, dw, dh)
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function fieldValue(id: string) {
  const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
  return el?.value?.trim() || ''
}

function readTodayRecord(): DayRecord {
  const live: DayRecord = {
    done: fieldValue('done'),
    mood: '',
    action: fieldValue('action'),
    result: fieldValue('result'),
    learn: fieldValue('learn'),
    tomorrow: fieldValue('tomorrow'),
    selfWord: fieldValue('selfWord'),
  }
  const moodBtn = document.querySelector('.mood.active') as HTMLElement | null
  live.mood = moodBtn?.dataset.mood || moodBtn?.textContent?.replace(/\s+/g, ' ').trim() || ''
  if (live.done || live.action || live.tomorrow) return live

  const records = readJson<DayRecord[]>('dawon_os95_records', [])
  const today = todayKey()
  return records.find((r) => String(r.date || '').replace(/-/g, '') === today) || records[0] || live
}

function captionsFromOutput(text: string) {
  return String(text || '')
    .split('\n')
    .map((line) => {
      const idx = line.indexOf('자막')
      if (idx < 0) return ''
      return line
        .slice(idx)
        .replace(/^자막\s*[:：]\s*/, '')
        .replace(/^["“'‘]+|["”'’]+$/g, '')
        .trim()
    })
    .filter(Boolean)
}

async function imageFromFile(file: File) {
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.decoding = 'async'
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(file.name))
    img.src = url
  })
  return { image: img, label: file.name, url }
}

async function pdfFallbackSlide(file: File): Promise<Slide & { url?: string }> {
  const c = document.createElement('canvas')
  c.width = 1000
  c.height = 1400
  const ctx = c.getContext('2d')
  if (!ctx) throw new Error('canvas')
  ctx.fillStyle = '#143b31'
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.fillStyle = '#e8c76a'
  ctx.font = 'bold 80px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('PDF', 500, 540)
  ctx.fillStyle = '#fff'
  ctx.font = '34px sans-serif'
  wrapCanvasText(ctx, file.name, 500, 650, 800, 48)
  const img = new Image()
  img.src = c.toDataURL('image/jpeg', 0.9)
  await img.decode()
  return { image: img, label: file.name }
}

async function pdfSlides(file: File): Promise<Slide[]> {
  try {
    const pdf = await loadPdfFromBytes(await file.arrayBuffer())
    const count = Math.min(7, pdf.numPages)
    const pages =
      count === pdf.numPages
        ? Array.from({ length: count }, (_, i) => i + 1)
        : Array.from({ length: count }, (_, i) => Math.round(1 + (i * (pdf.numPages - 1)) / (count - 1)))
    const slides: Slide[] = []
    for (const pageNo of pages) {
      const page = await pdf.getPage(pageNo)
      const base = page.getViewport({ scale: 1 })
      const scale = Math.min(2, 1100 / Math.max(base.width, base.height))
      const viewport = page.getViewport({ scale })
      const c = document.createElement('canvas')
      c.width = Math.ceil(viewport.width)
      c.height = Math.ceil(viewport.height)
      const ctx = c.getContext('2d')
      if (!ctx) continue
      await page.render({ canvas: c, canvasContext: ctx, viewport }).promise
      const img = new Image()
      img.src = c.toDataURL('image/jpeg', 0.9)
      await img.decode()
      slides.push({ image: img, label: `${file.name} · ${pageNo}/${pdf.numPages}` })
    }
    return slides
  } catch (error) {
    console.warn('PDF render fallback', error)
    return [await pdfFallbackSlide(file)]
  }
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1200)
}

type Props = {
  bookId?: string | null
  embedded?: boolean
}

export function DawonVideoStudio({ bookId, embedded = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const progressRef = useRef<HTMLSpanElement | null>(null)
  const resultVideoRef = useRef<HTMLVideoElement | null>(null)
  const mediaInputRef = useRef<HTMLInputElement | null>(null)
  const musicInputRef = useRef<HTMLInputElement | null>(null)
  const narrationInputRef = useRef<HTMLInputElement | null>(null)
  const slidesRef = useRef<Slide[]>([])
  const objectUrlsRef = useRef<string[]>([])
  const previewRafRef = useRef(0)
  const renderRafRef = useRef(0)
  const blobRef = useRef<Blob | null>(null)
  const previewingRef = useRef(false)
  const renderingRef = useRef(false)

  const [duration, setDuration] = useState(30)
  const [ratio, setRatio] = useState<Ratio>('9:16')
  const [motion, setMotion] = useState<Motion>('cinema')
  const [title, setTitle] = useState('')
  const [story, setStory] = useState(DEFAULT_STORY)
  const [showCaptions, setShowCaptions] = useState(true)
  const [showBrand, setShowBrand] = useState(true)
  const [slideCount, setSlideCount] = useState(0)
  const [fileSummary, setFileSummary] = useState('선택한 파일이 없습니다.')
  const [status, setStatus] = useState('사진·PDF를 선택하면 준비 상태를 확인합니다.')
  const [capability, setCapability] = useState('실제 영상 생성 지원')
  const [formatChip, setFormatChip] = useState('MP4 직접 저장 가능')
  const [progressText, setProgressText] = useState('대기')
  const [timeText, setTimeText] = useState('00:00 / 00:30')
  const [resultOpen, setResultOpen] = useState(false)
  const [resultType, setResultType] = useState('VIDEO')
  const [saveLabel, setSaveLabel] = useState('MP4 저장')
  const [exportNote, setExportNote] = useState('MP4 직접 저장 지원 여부는 현재 브라우저에서 자동 판별합니다.')
  const [busy, setBusy] = useState(false)
  const [canSave, setCanSave] = useState(false)

  const settingsRef = useRef({ title, story, motion, showCaptions, showBrand, duration, ratio })
  settingsRef.current = { title, story, motion, showCaptions, showBrand, duration, ratio }

  const clearObjectUrls = useCallback(() => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    objectUrlsRef.current = []
  }, [])

  const drawVideoFrame = useCallback((slideIndex = 0, progress = 0) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    const cfg = settingsRef.current
    const slides = slidesRef.current
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#0a251f'
    ctx.fillRect(0, 0, w, h)
    const slide = slides.length ? slides[slideIndex % slides.length] : undefined
    if (slide?.image) {
      coverDraw(ctx, slide.image, w, h, progress, cfg.motion)
    } else {
      const g = ctx.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, '#0c332b')
      g.addColorStop(1, '#b7953f')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }
    const shade = ctx.createLinearGradient(0, h * 0.25, 0, h)
    shade.addColorStop(0, 'rgba(0,0,0,0)')
    shade.addColorStop(0.58, 'rgba(0,0,0,.16)')
    shade.addColorStop(1, 'rgba(0,0,0,.78)')
    ctx.fillStyle = shade
    ctx.fillRect(0, 0, w, h)

    const lines = cfg.story
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean)
    const heading = cfg.title.trim() || '다원 하루설계'
    const caption =
      lines[slideIndex % Math.max(1, lines.length)] || slide?.label || '오늘을 확인하고, 내일을 설계하세요'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#f2d985'
    ctx.font = `800 ${Math.max(20, w * 0.028)}px sans-serif`
    ctx.fillText('DAWON LIFE DESIGN', w * 0.07, h * 0.09)
    ctx.fillStyle = '#fff'
    ctx.font = `800 ${Math.max(34, w * 0.054)}px sans-serif`
    wrapCanvasText(ctx, heading, w * 0.07, h * 0.17, w * 0.86, Math.max(44, w * 0.066), 2)

    if (cfg.showCaptions) {
      ctx.fillStyle = 'rgba(0,0,0,.55)'
      roundRect(ctx, w * 0.055, h * 0.7, w * 0.89, h * 0.17, w * 0.025)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'
      ctx.font = `700 ${Math.max(30, w * 0.045)}px sans-serif`
      wrapCanvasText(ctx, caption, w * 0.5, h * 0.765, w * 0.78, Math.max(42, w * 0.057), 3)
    }
    if (cfg.showBrand) {
      ctx.textAlign = 'left'
      ctx.fillStyle = '#e8c76a'
      ctx.fillRect(w * 0.07, h * 0.925, w * 0.12, Math.max(3, h * 0.004))
      ctx.fillStyle = '#fff'
      ctx.font = `700 ${Math.max(18, w * 0.025)}px sans-serif`
      ctx.fillText('dawon84.com', w * 0.07, h * 0.96)
      ctx.textAlign = 'right'
      ctx.fillText(`${slideIndex + 1} / ${Math.max(1, slides.length)}`, w * 0.93, h * 0.96)
    }
  }, [])

  const updateCanvasSize = useCallback(() => {
    const dims = RATIO[settingsRef.current.ratio] || RATIO['9:16']
    const canvas = canvasRef.current
    const stage = stageRef.current
    if (canvas) {
      canvas.width = dims[0]
      canvas.height = dims[1]
    }
    if (stage) stage.style.aspectRatio = `${dims[0]} / ${dims[1]}`
    drawVideoFrame(0, 0)
  }, [drawVideoFrame])

  const stopPreview = useCallback(() => {
    previewingRef.current = false
    if (previewRafRef.current) cancelAnimationFrame(previewRafRef.current)
    previewRafRef.current = 0
  }, [])

  const applySlides = useCallback(
    (slides: Slide[], summary: string, nextStatus: string) => {
      slidesRef.current = slides
      setSlideCount(slides.length)
      setFileSummary(summary)
      setStatus(nextStatus)
      drawVideoFrame(0, 0)
    },
    [drawVideoFrame],
  )

  const handleMedia = useCallback(
    async (files: File[]) => {
      if (!files.length) return
      stopPreview()
      clearObjectUrls()
      setStatus('사진·PDF를 장면으로 준비하고 있습니다.')
      const slides: Slide[] = []
      for (const file of files.slice(0, 20)) {
        if (file.type.startsWith('image/')) {
          try {
            const item = await imageFromFile(file)
            objectUrlsRef.current.push(item.url)
            slides.push({ image: item.image, label: item.label })
          } catch {
            setStatus(`${file.name} 이미지를 읽지 못했습니다.`)
          }
        } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          slides.push(...(await pdfSlides(file)))
        }
      }
      applySlides(
        slides,
        slides.length
          ? `${files.length}개 파일에서 ${slides.length}개 영상 장면을 준비했습니다.`
          : '지원되는 사진 또는 PDF가 없습니다.',
        slides.length ? '미리보기와 영상 만들기를 사용할 수 있습니다.' : '사진·PDF를 다시 선택해 주세요.',
      )
    },
    [applySlides, clearObjectUrls, stopPreview],
  )

  const importStory = useCallback(() => {
    try {
      const savedTitle = localStorage.getItem('dawon_dvs_title')
      const savedStory = localStorage.getItem('dawon_dvs_story')
      if (savedTitle) setTitle(savedTitle)
      if (savedStory) setStory(savedStory)
      const output = document.getElementById('contentOutput')?.textContent || ''
      if (!savedStory && output) {
        const caps = captionsFromOutput(output)
        if (caps.length) setStory(caps.join('\n'))
      }
    } catch {
      /* ignore */
    }
    window.setTimeout(() => drawVideoFrame(0, 0), 0)
  }, [drawVideoFrame])

  const useToday = useCallback(() => {
    const day = readTodayRecord()
    setTitle(day.action || '오늘의 생활설계')
    setStory(
      [
        day.done || '오늘의 사실을 확인합니다',
        day.mood ? `지금 감정은 ${day.mood}` : '감정을 알아차립니다',
        day.action || '오늘 하나를 정합니다',
        day.result || '작은 행동을 실천합니다',
        day.learn || '결과에서 배웁니다',
        day.tomorrow || '내일 첫 행동을 정합니다',
        day.selfWord || '나는 내 생활의 설계자',
      ].join('\n'),
    )
    window.setTimeout(() => drawVideoFrame(0, 0), 0)
  }, [drawVideoFrame])

  const previewVideo = useCallback(() => {
    if (!slidesRef.current.length) {
      setStatus('사진 또는 PDF를 먼저 선택해 주세요.')
      return
    }
    if (previewingRef.current) {
      stopPreview()
      setProgressText('미리보기 일시정지')
      return
    }
    previewingRef.current = true
    const start = performance.now()
    const previewDuration = Math.min(14, Math.max(7, slidesRef.current.length * 2)) * 1000
    const tick = (now: number) => {
      if (!previewingRef.current) return
      const elapsed = (now - start) % previewDuration
      const overall = elapsed / previewDuration
      const pos = overall * slidesRef.current.length
      const index = Math.min(slidesRef.current.length - 1, Math.floor(pos))
      drawVideoFrame(index, pos - index)
      if (progressRef.current) progressRef.current.style.width = `${overall * 100}%`
      setProgressText('빠른 미리보기')
      setTimeText(`${formatTime(elapsed / 1000)} / ${formatTime(previewDuration / 1000)}`)
      previewRafRef.current = requestAnimationFrame(tick)
    }
    previewRafRef.current = requestAnimationFrame(tick)
  }, [drawVideoFrame, stopPreview])

  const audioMix = useCallback(async (stream: MediaStream) => {
    const music = musicInputRef.current?.files?.[0]
    const narration = narrationInputRef.current?.files?.[0]
    const files: Array<[File, number, boolean]> = []
    if (music) files.push([music, 0.35, true])
    if (narration) files.push([narration, 0.95, false])
    if (!files.length) return { stream, cleanup: () => {} }

    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const context = new AC()
    const dest = context.createMediaStreamDestination()
    const elements: HTMLAudioElement[] = []
    for (const [file, vol, loop] of files) {
      const url = URL.createObjectURL(file)
      objectUrlsRef.current.push(url)
      const audio = new Audio(url)
      audio.volume = vol
      audio.loop = loop
      audio.crossOrigin = 'anonymous'
      const src = context.createMediaElementSource(audio)
      const gain = context.createGain()
      gain.gain.value = vol
      src.connect(gain)
      gain.connect(dest)
      gain.connect(context.destination)
      elements.push(audio)
    }
    dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t))
    await context.resume()
    await Promise.all(elements.map((a) => a.play().catch(() => {})))
    return {
      stream,
      cleanup: () => {
        elements.forEach((a) => {
          a.pause()
          a.currentTime = 0
        })
        void context.close().catch(() => {})
      },
    }
  }, [])

  const renderVideo = useCallback(async () => {
    if (renderingRef.current) return
    if (!slidesRef.current.length) {
      setStatus('사진 또는 PDF를 먼저 선택해 주세요.')
      return
    }
    const canvas = canvasRef.current
    if (!window.MediaRecorder || !canvas || typeof canvas.captureStream !== 'function') {
      setStatus('이 브라우저는 영상 파일 생성을 지원하지 않습니다. 최신 Chrome 또는 Edge를 이용해 주세요.')
      return
    }
    stopPreview()
    renderingRef.current = true
    blobRef.current = null
    setBusy(true)
    setCanSave(false)
    setResultOpen(false)
    const fps = 30
    let stream = canvas.captureStream(fps)
    const mix = await audioMix(stream)
    stream = mix.stream
    const mime = supportedMime()
    setFormatChip(mime.includes('mp4') ? 'MP4 직접 저장' : 'WebM 안전 저장')
    setStatus(`${settingsRef.current.duration}초 영상을 실시간 렌더링합니다. 이 탭을 닫지 마세요.`)
    const chunks: Blob[] = []
    let recorder: MediaRecorder
    try {
      recorder = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 5_000_000 } : undefined)
    } catch (error) {
      renderingRef.current = false
      setBusy(false)
      mix.cleanup()
      setStatus(`영상 녹화를 시작하지 못했습니다: ${error instanceof Error ? error.message : 'unknown'}`)
      return
    }
    recorder.ondataavailable = (e) => {
      if (e.data?.size) chunks.push(e.data)
    }
    const finished = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve()
    })
    recorder.start(500)
    const start = performance.now()
    const total = settingsRef.current.duration * 1000
    await new Promise<void>((resolve) => {
      const tick = (now: number) => {
        const elapsed = Math.min(total, now - start)
        const overall = elapsed / total
        const pos = overall * slidesRef.current.length
        const index = Math.min(slidesRef.current.length - 1, Math.floor(pos))
        drawVideoFrame(index, Math.min(1, pos - index))
        if (progressRef.current) progressRef.current.style.width = `${overall * 100}%`
        setProgressText(`렌더링 ${Math.round(overall * 100)}%`)
        setTimeText(`${formatTime(elapsed / 1000)} / ${formatTime(settingsRef.current.duration)}`)
        if (elapsed >= total) {
          resolve()
          return
        }
        renderRafRef.current = requestAnimationFrame(tick)
      }
      renderRafRef.current = requestAnimationFrame(tick)
    })
    recorder.stop()
    await finished
    mix.cleanup()
    stream.getTracks().forEach((t) => t.stop())
    const blob = new Blob(chunks, { type: recorder.mimeType || mime || 'video/webm' })
    blobRef.current = blob
    const url = URL.createObjectURL(blob)
    objectUrlsRef.current.push(url)
    if (resultVideoRef.current) resultVideoRef.current.src = url
    const ext = (recorder.mimeType || '').includes('mp4') ? 'MP4' : 'WEBM'
    setResultType(ext)
    setSaveLabel(`${ext} 저장`)
    setExportNote(
      ext === 'MP4'
        ? '이 브라우저가 MP4 녹화를 지원해 MP4로 생성했습니다.'
        : '현재 브라우저는 MP4 직접 녹화를 지원하지 않아 표준 WebM으로 안전하게 생성했습니다.',
    )
    setStatus('영상 파일 생성이 완료되었습니다. 미리 확인한 뒤 저장하세요.')
    setResultOpen(true)
    setCanSave(true)
    renderingRef.current = false
    setBusy(false)
  }, [audioMix, drawVideoFrame, stopPreview])

  const saveVideo = useCallback(() => {
    if (!blobRef.current) {
      setStatus('먼저 영상을 만들어 주세요.')
      return
    }
    const ext = blobRef.current.type.includes('mp4') ? 'mp4' : 'webm'
    downloadBlob(blobRef.current, `${slug(settingsRef.current.title || 'dawon-video')}-${todayKey()}.${ext}`)
  }, [])

  const resetVideo = useCallback(() => {
    stopPreview()
    if (renderRafRef.current) cancelAnimationFrame(renderRafRef.current)
    clearObjectUrls()
    slidesRef.current = []
    blobRef.current = null
    renderingRef.current = false
    if (mediaInputRef.current) mediaInputRef.current.value = ''
    if (musicInputRef.current) musicInputRef.current.value = ''
    if (narrationInputRef.current) narrationInputRef.current.value = ''
    if (resultVideoRef.current) resultVideoRef.current.removeAttribute('src')
    setSlideCount(0)
    setFileSummary('선택한 파일이 없습니다.')
    setStatus('사진·PDF를 선택하면 준비 상태를 확인합니다.')
    setResultOpen(false)
    setCanSave(false)
    setBusy(false)
    if (progressRef.current) progressRef.current.style.width = '0%'
    setProgressText('대기')
    drawVideoFrame(0, 0)
  }, [clearObjectUrls, drawVideoFrame, stopPreview])

  useEffect(() => {
    const canRecord = Boolean(window.MediaRecorder && HTMLCanvasElement.prototype.captureStream)
    setCapability(canRecord ? '실제 영상 생성 지원' : '미리보기만 지원')
    setFormatChip(supportedMime().includes('mp4') ? 'MP4 직접 저장 가능' : 'WebM 저장 · MP4는 브라우저에 따라 다를 수 있습니다')
    updateCanvasSize()
  }, [updateCanvasSize])

  useEffect(() => {
    updateCanvasSize()
    setTimeText(`00:00 / ${formatTime(duration)}`)
  }, [ratio, duration, updateCanvasSize])

  useEffect(() => {
    drawVideoFrame(0, 0)
  }, [title, story, motion, showCaptions, showBrand, drawVideoFrame])

  useEffect(() => {
    const onImport = () => importStory()
    const onTab = (event: Event) => {
      const page = (event as CustomEvent<string>).detail
      if (page === 'video') window.setTimeout(updateCanvasSize, 50)
    }
    window.addEventListener('dawon:dvs-import', onImport)
    window.addEventListener('dawon:studio-tab', onTab)
    return () => {
      window.removeEventListener('dawon:dvs-import', onImport)
      window.removeEventListener('dawon:studio-tab', onTab)
    }
  }, [importStory, updateCanvasSize])

  useEffect(() => {
    if (!bookId) return
    const id = bookId.padStart(2, '0')
    const url = getComicUrl(id)
    const card = PATH_CARDS.find((c) => c.id === id)
    if (card) {
      setTitle(card.title)
      setStory(`${card.title}\n${card.description}\n오늘 한 문장으로 나를 확인하세요.\n지금 가능한 행동 하나를 정하세요.\n다원 하루설계에서 오늘 하나를 시작하세요.\n경험은 나만의 답을 만든다\n오늘을 확인하고, 내일을 설계하세요`)
    }
    if (!url) return
    let cancelled = false
    ;(async () => {
      try {
        setStatus(`BOOK ${id} PDF를 장면으로 준비하고 있습니다.`)
        const res = await fetch(url, { cache: 'no-store' })
        const blob = await res.blob()
        const pdfFile = new File([blob], `${id}.pdf`, { type: 'application/pdf' })
        const slides = await pdfSlides(pdfFile)
        if (cancelled) return
        applySlides(
          slides,
          `BOOK ${id}에서 ${slides.length}개 장면을 준비했습니다.`,
          '미리보기와 영상 만들기를 사용할 수 있습니다.',
        )
      } catch {
        if (!cancelled) setStatus('만화 PDF를 불러오지 못했습니다. 사진 또는 PDF를 직접 선택해 주세요.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [applySlides, bookId])

  useEffect(() => {
    return () => {
      stopPreview()
      if (renderRafRef.current) cancelAnimationFrame(renderRafRef.current)
      clearObjectUrls()
    }
  }, [clearObjectUrls, stopPreview])

  const dims = RATIO[ratio]

  return (
    <div className={`dvs-root${embedded ? ' dvs-embedded' : ''}`}>
      <div className="dvs-head">
        <div>
          <div className="kicker">3F · DAWON VIDEO STUDIO · REAL EXPORT</div>
          <h3>사진·PDF 한 번 넣고, 실제 영상 파일로 만듭니다.</h3>
          <p>
            사진 또는 PDF → 제목 → 음악 → 15·30·60초 → 영상 만들기 → 미리보기 → 저장. 기존 7장면 흐름을 Canvas 모션·자막·DAWON
            브랜딩에 연결합니다.
          </p>
        </div>
        <span className="dvs-capability">{capability}</span>
      </div>

      <div className="dvs-flow" aria-label="영상 제작 7단계">
        <span>
          <b>1</b>사진·PDF
        </span>
        <i>→</i>
        <span>
          <b>2</b>제목
        </span>
        <i>→</i>
        <span>
          <b>3</b>음악
        </span>
        <i>→</i>
        <span>
          <b>4</b>길이
        </span>
        <i>→</i>
        <span>
          <b>5</b>영상 만들기
        </span>
        <i>→</i>
        <span>
          <b>6</b>미리보기
        </span>
        <i>→</i>
        <span>
          <b>7</b>저장
        </span>
      </div>

      <div className="dvs-grid">
        <aside className="panel panel-pad dvs-form">
          <div className="field">
            <label htmlFor="dvsMedia">① 사진 또는 PDF</label>
            <input
              id="dvsMedia"
              ref={mediaInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              multiple
              onChange={(e) => void handleMedia(Array.from(e.target.files || []))}
            />
            <small className="dvs-note">
              사진은 여러 장 선택할 수 있습니다. PDF는 영상 길이에 맞춰 최대 7개 대표 페이지를 자동 선택합니다.
            </small>
          </div>

          <div className="dvs-file-summary">{fileSummary}</div>

          <div className="field">
            <label htmlFor="dvsTitle">② 제목 한 줄</label>
            <input
              id="dvsTitle"
              type="text"
              maxLength={60}
              placeholder="예: 오늘 한 걸음이 내일을 바꿉니다"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <details className="dvs-story-details">
            <summary>7장면 자막·스토리보드</summary>
            <div className="dvs-story-actions">
              <button className="btn btn-sm btn-soft" type="button" onClick={importStory}>
                기존 7장면 가져오기
              </button>
              <button className="btn btn-sm btn-soft" type="button" onClick={useToday}>
                오늘 기록 연결
              </button>
            </div>
            <div className="field" style={{ marginTop: 10 }}>
              <label htmlFor="dvsStory">장면별 자막 · 한 줄에 한 장면</label>
              <textarea id="dvsStory" rows={8} value={story} onChange={(e) => setStory(e.target.value)} />
            </div>
          </details>

          <div className="field">
            <label htmlFor="dvsMusic">③ 음악 선택 · 선택사항</label>
            <input id="dvsMusic" ref={musicInputRef} type="file" accept="audio/*" />
            <small className="dvs-note">
              본인이 사용 권한을 가진 MP3·M4A·WAV 등을 사용하세요. 선택하지 않으면 무음 영상으로 제작됩니다.
            </small>
          </div>

          <details className="dvs-story-details">
            <summary>내레이션 음원 · 선택사항</summary>
            <div className="field">
              <label htmlFor="dvsNarrationAudio">저장 영상에 넣을 내레이션 MP3/WAV</label>
              <input id="dvsNarrationAudio" ref={narrationInputRef} type="file" accept="audio/*" />
              <small className="dvs-note">
                브라우저 음성합성은 미리듣기에는 쓸 수 있지만 파일에 안정적으로 녹음되지 않아, 저장 영상에 음성을 넣으려면 실제
                음원 파일을 선택하도록 설계했습니다.
              </small>
            </div>
          </details>

          <div className="field">
            <label>④ 영상 길이</label>
            <div className="dvs-choice-row" role="group" aria-label="영상 길이">
              {[15, 30, 60].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  className={duration === sec ? 'active' : ''}
                  onClick={() => setDuration(sec)}
                >
                  {sec}초
                </button>
              ))}
            </div>
          </div>

          <div className="dvs-two">
            <div className="field">
              <label htmlFor="dvsRatio">화면 비율</label>
              <select id="dvsRatio" value={ratio} onChange={(e) => setRatio(e.target.value as Ratio)}>
                <option value="9:16">9:16 쇼츠</option>
                <option value="16:9">16:9 유튜브</option>
                <option value="1:1">1:1 정사각</option>
                <option value="4:5">4:5 피드</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="dvsMotion">모션</label>
              <select id="dvsMotion" value={motion} onChange={(e) => setMotion(e.target.value as Motion)}>
                <option value="cinema">시네마틱 줌</option>
                <option value="gentle">부드러운 이동</option>
                <option value="still">정지 화면</option>
              </select>
            </div>
          </div>

          <div className="dvs-two">
            <label className="dvs-check">
              <input type="checkbox" checked={showCaptions} onChange={(e) => setShowCaptions(e.target.checked)} /> 자막 표시
            </label>
            <label className="dvs-check">
              <input type="checkbox" checked={showBrand} onChange={(e) => setShowBrand(e.target.checked)} /> DAWON 로고·주소
            </label>
          </div>

          <div className="maker-actions">
            <button className="btn btn-soft" type="button" onClick={previewVideo} disabled={busy}>
              ▶ 빠른 미리보기
            </button>
            <button className="btn btn-primary" type="button" onClick={() => void renderVideo()} disabled={busy}>
              🎬 영상 만들기
            </button>
          </div>
          <div className="dvs-status" role="status" aria-live="polite">
            {status}
          </div>
        </aside>

        <section className="dvs-preview-panel">
          <div className="dvs-preview-top">
            <div>
              <small>LIVE CANVAS PREVIEW</small>
              <strong>
                {ratio} · {duration}초
              </strong>
            </div>
            <div className="dvs-format-chip">{formatChip}</div>
          </div>
          <div className="dvs-stage" ref={stageRef} style={{ aspectRatio: `${dims[0]} / ${dims[1]}` }}>
            <canvas ref={canvasRef} width={dims[0]} height={dims[1]} aria-label="DAWON 영상 미리보기" />
            {slideCount === 0 ? <div className="dvs-stage-empty">사진 또는 PDF를 선택하세요.</div> : null}
          </div>
          <div className="dvs-progress">
            <span ref={progressRef} />
          </div>
          <div className="dvs-progress-meta">
            <span>{progressText}</span>
            <span>{timeText}</span>
          </div>

          <div className="dvs-result" hidden={!resultOpen}>
            <div className="dvs-result-head">
              <div>
                <small>RENDER COMPLETE</small>
                <strong>완성 영상 미리보기</strong>
              </div>
              <span>{resultType}</span>
            </div>
            <video ref={resultVideoRef} controls playsInline preload="metadata" />
            <div className="maker-actions">
              <button className="btn btn-primary" type="button" onClick={saveVideo} disabled={!canSave}>
                {saveLabel}
              </button>
              <button className="btn btn-soft" type="button" onClick={resetVideo}>
                새 영상
              </button>
            </div>
            <p className="dvs-export-note">{exportNote}</p>
          </div>
        </section>
      </div>

      <div className="dvs-trust">
        <div>
          <b>로컬 제작</b>
          <span>선택한 사진·PDF·음악은 이 브라우저 안에서 처리합니다.</span>
        </div>
        <div>
          <b>실제 렌더링</b>
          <span>Canvas captureStream + MediaRecorder로 영상 파일을 생성합니다.</span>
        </div>
        <div>
          <b>정직한 MP4 처리</b>
          <span>브라우저가 MP4 녹화를 지원하면 MP4, 그렇지 않으면 WebM으로 안전하게 저장합니다.</span>
        </div>
      </div>
    </div>
  )
}
