import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PATH_CARDS } from '../data/paths'
import './MovieStudioPage.css'

type MediaKind = 'image' | 'video'
type Preset = 'shorts' | 'cf' | 'product' | 'book'
type Ratio = '9:16' | '16:9' | '1:1' | '4:5'
type ThemeName = 'dawn' | 'clean' | 'luxury' | 'warm'

type Asset = {
  id: string
  kind: MediaKind
  name: string
  url: string
}

type Scene = {
  id: string
  caption: string
  duration: number
  assetId: string | null
}

const DEFAULT_SCRIPT = `오늘 무엇을 했는지 기억나시나요?
바쁜 하루 속에서 나의 노력은 쉽게 사라집니다.
오늘 한 일을 한 문장으로 적어보세요.
지금 가능한 행동 하나를 정하세요.
실천 결과와 배운 점을 기록하세요.
기록은 나를 믿는 증거가 됩니다.`

const PRESET_RATIO: Record<Preset, Ratio> = {
  shorts: '9:16',
  cf: '16:9',
  product: '4:5',
  book: '4:5',
}

const CANVAS_SIZE: Record<Ratio, { w: number; h: number }> = {
  '9:16': { w: 720, h: 1280 },
  '16:9': { w: 1280, h: 720 },
  '1:1': { w: 1080, h: 1080 },
  '4:5': { w: 864, h: 1080 },
}

const THEMES: Record<ThemeName, { a: string; b: string; text: string; muted: string }> = {
  dawn: { a: '#071a33', b: '#1c4a6e', text: '#f7fbff', muted: '#d5e4f4' },
  clean: { a: '#f6f3ec', b: '#e7eef6', text: '#132a45', muted: '#4a5d70' },
  luxury: { a: '#120e0a', b: '#3b2a16', text: '#f8efd8', muted: '#e2cf9f' },
  warm: { a: '#3a2214', b: '#b8894a', text: '#fff8ee', muted: '#f3e0c4' },
}

const MEDIA_OK = /^(image\/(jpeg|png|webp)|video\/(mp4|webm))$/i
const AUDIO_OK = /^audio\/(mpeg|mp4|wav|ogg|webm|x-wav|x-m4a)$/i
const LOGO_OK = /^image\/(jpeg|png|webp)$/i

function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function formatTime(sec: number) {
  const s = Math.max(0, sec)
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = []
  for (const paragraph of text.split(/\n/)) {
    let current = ''
    for (const ch of paragraph) {
      const next = current + ch
      if (current && ctx.measureText(next).width > maxWidth) {
        lines.push(current)
        current = ch
      } else {
        current = next
      }
    }
    lines.push(current || '')
  }
  return lines.filter((l, i, arr) => l || i === arr.length - 1)
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 800)
}

export function MovieStudioPage() {
  const [params] = useSearchParams()
  const bookParam = params.get('book')

  const [brand, setBrand] = useState('다원작가 · DAWON')
  const [title, setTitle] = useState('하루 한 줄이 내일을 바꿉니다')
  const [message, setMessage] = useState('기록은 나를 믿는 증거가 됩니다')
  const [script, setScript] = useState(DEFAULT_SCRIPT)
  const [cta, setCta] = useState('다원 하루설계에서 오늘 하나를 시작하세요')
  const [linkUrl, setLinkUrl] = useState('dawon84.com')
  const [preset, setPreset] = useState<Preset>('shorts')
  const [ratio, setRatio] = useState<Ratio>('9:16')
  const [duration, setDuration] = useState(30)
  const [theme, setTheme] = useState<ThemeName>('dawn')
  const [accent, setAccent] = useState('#e86553')
  const [volume, setVolume] = useState(35)
  const [assets, setAssets] = useState<Asset[]>([])
  const [scenes, setScenes] = useState<Scene[]>([])
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null)
  const [status, setStatus] = useState('샘플 프로젝트가 준비되었습니다.')
  const [statusKind, setStatusKind] = useState<'ok' | 'busy' | 'error'>('ok')
  const [musicName, setMusicName] = useState('선택된 음악 없음')
  const [logoName, setLogoName] = useState('기본 금빛 심벌 사용')
  const [playing, setPlaying] = useState(false)
  const [recording, setRecording] = useState(false)
  const [time, setTime] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mediaInputRef = useRef<HTMLInputElement | null>(null)
  const musicInputRef = useRef<HTMLInputElement | null>(null)
  const logoInputRef = useRef<HTMLInputElement | null>(null)
  const projectInputRef = useRef<HTMLInputElement | null>(null)
  const musicRef = useRef<HTMLAudioElement | null>(null)
  const logoImgRef = useRef<HTMLImageElement | null>(null)
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map())
  const videosRef = useRef<Map<string, HTMLVideoElement>>(new Map())
  const playRef = useRef(false)
  const timeRef = useRef(0)
  const lastTsRef = useRef(0)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const assetsRef = useRef(assets)
  const scenesRef = useRef(scenes)

  assetsRef.current = assets
  scenesRef.current = scenes

  const scriptCount = script.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).length
  const totalDuration = useMemo(
    () => Math.max(0.5, scenes.reduce((sum, s) => sum + (Number(s.duration) || 0), 0) || duration),
    [scenes, duration],
  )

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      logoImgRef.current = img
      drawAt(timeRef.current)
    }
    img.src = '/brand/dawon-logo.png'
  }, [])

  useEffect(() => {
    if (!bookParam) return
    const id = bookParam.padStart(2, '0')
    const card = PATH_CARDS.find((c) => c.id === id)
    if (!card) return
    setPreset('book')
    setRatio('4:5')
    setTitle(card.title)
    setMessage(card.description)
    setScript(`${card.title}\n${card.description}\n오늘 한 문장으로 나를 확인하세요.\n지금 가능한 행동 하나를 정하세요.\n다원 하루설계에서 오늘 하나를 시작하세요.`)
    setStatus(`BOOK ${id} 《${card.title}》 샘플을 불러왔습니다.`)
    window.setTimeout(() => composeScenes(true), 0)
  }, [bookParam])

  useEffect(() => {
    if (scenes.length === 0) composeScenes(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const size = CANVAS_SIZE[ratio]
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = size.w
    canvas.height = size.h
    drawAt(timeRef.current)
  }, [ratio, theme, accent, brand, title, cta, linkUrl, scenes, assets, logoName])

  useEffect(() => {
    if (musicRef.current) musicRef.current.volume = volume / 100
  }, [volume])

  useEffect(() => {
    return () => {
      playRef.current = false
      musicRef.current?.pause()
      assetsRef.current.forEach((a) => URL.revokeObjectURL(a.url))
      if (musicRef.current?.src) URL.revokeObjectURL(musicRef.current.src)
    }
  }, [])

  function setNotice(text: string, kind: 'ok' | 'busy' | 'error' = 'ok') {
    setStatus(text)
    setStatusKind(kind)
  }

  function sceneAt(t: number) {
    let acc = 0
    for (const scene of scenesRef.current) {
      const next = acc + scene.duration
      if (t < next || scene === scenesRef.current[scenesRef.current.length - 1]) {
        return { scene, local: Math.max(0, t - acc), start: acc }
      }
      acc = next
    }
    return { scene: scenesRef.current[0], local: 0, start: 0 }
  }

  function drawAt(t: number) {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const { w, h } = { w: canvas.width, h: canvas.height }
    const pal = THEMES[theme]
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, pal.a)
    grad.addColorStop(1, pal.b)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    if (!scenesRef.current.length) return
    const { scene, local } = sceneAt(t)
    const asset = assetsRef.current.find((a) => a.id === scene.assetId)

    if (asset?.kind === 'image') {
      const img = imagesRef.current.get(asset.id)
      if (img) drawCover(ctx, img, w, h)
    } else if (asset?.kind === 'video') {
      const video = videosRef.current.get(asset.id)
      if (video) {
        if (Math.abs((video.currentTime || 0) - local) > 0.25) {
          try {
            video.currentTime = Math.min(video.duration || local, local)
          } catch {
            /* ignore seek */
          }
        }
        if (video.readyState >= 2) drawCover(ctx, video, w, h)
      }
    }

    ctx.fillStyle = 'rgba(0,0,0,0.28)'
    ctx.fillRect(0, 0, w, h)

    const logo = logoImgRef.current
    if (logo) {
      const lw = Math.min(86, w * 0.14)
      ctx.drawImage(logo, 36, 36, lw, lw)
    }

    ctx.fillStyle = accent
    ctx.fillRect(0, 0, 8, h)

    ctx.fillStyle = pal.muted
    ctx.font = `700 ${Math.max(18, w * 0.022)}px "Noto Sans KR", sans-serif`
    ctx.fillText(brand || 'DAWON', 36, h * 0.18)

    ctx.fillStyle = pal.text
    ctx.font = `900 ${Math.max(28, w * 0.048)}px "Noto Sans KR", sans-serif`
    const caption = scene.caption || title
    const lines = wrapLines(ctx, caption, w - 72)
    lines.slice(0, 8).forEach((line, i) => {
      ctx.fillText(line, 36, h * 0.42 + i * Math.max(36, w * 0.055))
    })

    const lastTwo = scenesRef.current.slice(-2).some((s) => s.id === scene.id)
    if (lastTwo) {
      ctx.fillStyle = accent
      const pillW = Math.min(w - 72, Math.max(220, ctx.measureText(cta).width + 48))
      roundRect(ctx, 36, h - 140, pillW, 52, 26)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = `800 ${Math.max(16, w * 0.024)}px "Noto Sans KR", sans-serif`
      ctx.fillText(cta || '오늘 하나 시작', 56, h - 106)
      ctx.fillStyle = pal.muted
      ctx.font = `700 ${Math.max(14, w * 0.02)}px "Noto Sans KR", sans-serif`
      ctx.fillText(linkUrl || 'dawon84.com', 36, h - 54)
    }
  }

  function drawCover(
    ctx: CanvasRenderingContext2D,
    source: CanvasImageSource & { width?: number; height?: number; videoWidth?: number; videoHeight?: number },
    w: number,
    h: number,
  ) {
    const sw = ('videoWidth' in source && source.videoWidth ? source.videoWidth : source.width) || w
    const sh = ('videoHeight' in source && source.videoHeight ? source.videoHeight : source.height) || h
    const scale = Math.max(w / sw, h / sh)
    const dw = sw * scale
    const dh = sh * scale
    ctx.drawImage(source, (w - dw) / 2, (h - dh) / 2, dw, dh)
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }

  function addFiles(fileList: FileList | File[]) {
    const next: Asset[] = []
    for (const file of Array.from(fileList)) {
      if (!MEDIA_OK.test(file.type)) {
        setNotice('이미지(JPG·PNG·WEBP) 또는 영상(MP4·WEBM)만 올릴 수 있습니다.', 'error')
        continue
      }
      const kind: MediaKind = file.type.startsWith('video/') ? 'video' : 'image'
      const asset: Asset = { id: uid('asset'), kind, name: file.name, url: URL.createObjectURL(file) }
      next.push(asset)
      if (kind === 'image') {
        const img = new Image()
        img.onload = () => drawAt(timeRef.current)
        img.src = asset.url
        imagesRef.current.set(asset.id, img)
      } else {
        const video = document.createElement('video')
        video.src = asset.url
        video.muted = true
        video.playsInline = true
        video.preload = 'auto'
        video.onloadeddata = () => drawAt(timeRef.current)
        videosRef.current.set(asset.id, video)
      }
    }
    if (!next.length) return
    setAssets((prev) => [...prev, ...next])
    setNotice(`${next.length}개 자료를 추가했습니다.`)
  }

  function removeAsset(id: string) {
    setAssets((prev) => {
      const found = prev.find((a) => a.id === id)
      if (found) URL.revokeObjectURL(found.url)
      return prev.filter((a) => a.id !== id)
    })
    imagesRef.current.delete(id)
    videosRef.current.delete(id)
    setScenes((prev) => prev.map((s) => (s.assetId === id ? { ...s, assetId: null } : s)))
  }

  function composeScenes(silent = false) {
    const lines = script.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    const fallback = [title, message, cta, linkUrl || 'dawon84.com'].filter(Boolean)
    const captions = lines.length ? [...lines] : [...fallback]
    while (captions.length < 4) captions.push(fallback[captions.length % fallback.length] || '오늘 하나를 시작하세요')
    const n = captions.length
    const base = Math.max(0.5, duration / n)
    const built: Scene[] = captions.map((caption, i) => ({
      id: uid('scene'),
      caption,
      duration: Math.round(base * 10) / 10,
      assetId: assets[i % Math.max(assets.length, 1)]?.id ?? null,
    }))
    const sum = built.reduce((s, sc) => s + sc.duration, 0)
    built[built.length - 1].duration = Math.max(0.5, Math.round((duration - (sum - built[built.length - 1].duration)) * 10) / 10)
    setScenes(built)
    setActiveSceneId(built[0]?.id ?? null)
    timeRef.current = 0
    setTime(0)
    if (!silent) setNotice(`${built.length}개 장면을 ${duration}초에 맞춰 구성했습니다.`)
    window.requestAnimationFrame(() => drawAt(0))
  }

  function updateScene(id: string, patch: Partial<Scene>) {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  function moveScene(id: string, dir: -1 | 1) {
    setScenes((prev) => {
      const i = prev.findIndex((s) => s.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= prev.length) return prev
      const copy = [...prev]
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
      return copy
    })
  }

  function addScene() {
    const scene: Scene = { id: uid('scene'), caption: title, duration: 3, assetId: null }
    setScenes((prev) => [...prev, scene])
    setActiveSceneId(scene.id)
  }

  function removeScene(id: string) {
    setScenes((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.id !== id)))
  }

  function sceneRangeLabel(index: number) {
    const start = scenes.slice(0, index).reduce((s, sc) => s + sc.duration, 0)
    const end = start + scenes[index].duration
    return `${formatTime(start)}–${formatTime(end)}`
  }

  function seekTo(next: number) {
    timeRef.current = Math.min(totalDuration, Math.max(0, next))
    setTime(timeRef.current)
    if (musicRef.current) musicRef.current.currentTime = timeRef.current
    drawAt(timeRef.current)
  }

  function tick(ts: number) {
    if (!playRef.current) return
    const dt = Math.min(0.08, (ts - lastTsRef.current) / 1000 || 0)
    lastTsRef.current = ts
    timeRef.current = Math.min(totalDuration, timeRef.current + dt)
    setTime(timeRef.current)
    drawAt(timeRef.current)
    if (timeRef.current >= totalDuration - 0.01) {
      stopPlayback()
      if (recorderRef.current && recorderRef.current.state === 'recording') recorderRef.current.stop()
      return
    }
    window.requestAnimationFrame(tick)
  }

  function startPlayback(from = timeRef.current) {
    timeRef.current = from
    setTime(from)
    playRef.current = true
    setPlaying(true)
    lastTsRef.current = performance.now()
    if (musicRef.current) {
      musicRef.current.currentTime = from
      void musicRef.current.play().catch(() => undefined)
    }
    window.requestAnimationFrame(tick)
  }

  function stopPlayback() {
    playRef.current = false
    setPlaying(false)
    musicRef.current?.pause()
  }

  async function recordWebm() {
    const canvas = canvasRef.current
    if (!canvas || !scenes.length) {
      setNotice('장면을 먼저 구성해 주세요.', 'error')
      return
    }
    if (!('MediaRecorder' in window) || !canvas.captureStream) {
      setNotice('이 브라우저는 WebM 녹화를 지원하지 않습니다.', 'error')
      return
    }
    setRecording(true)
    setNotice('WebM 영상을 녹화 중입니다. 창을 닫지 마세요.', 'busy')
    seekTo(0)
    const stream = canvas.captureStream(30)
    let mixed: MediaStream = stream
    let audioCtx: AudioContext | null = null
    try {
      if (musicRef.current) {
        audioCtx = new AudioContext()
        await audioCtx.resume()
        const src = audioCtx.createMediaElementSource(musicRef.current)
        const gain = audioCtx.createGain()
        gain.gain.value = volume / 100
        const dest = audioCtx.createMediaStreamDestination()
        src.connect(gain)
        gain.connect(dest)
        gain.connect(audioCtx.destination)
        mixed = new MediaStream([...stream.getVideoTracks(), ...dest.stream.getAudioTracks()])
      }
    } catch {
      mixed = stream
    }

    const recorder = new MediaRecorder(mixed, { mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm' })
    chunksRef.current = []
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      downloadBlob(blob, `dawon-studio-${Date.now()}.webm`)
      setRecording(false)
      setNotice('WebM 영상을 저장했습니다.')
      void audioCtx?.close()
    }
    recorderRef.current = recorder
    recorder.start(200)
    startPlayback(0)
  }

  function savePng() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      downloadBlob(blob, `dawon-studio-frame-${Date.now()}.png`)
      setNotice('현재 장면을 PNG로 저장했습니다.')
    }, 'image/png')
  }

  function saveProject() {
    const data = {
      version: 1,
      brand,
      title,
      message,
      script,
      cta,
      linkUrl,
      preset,
      ratio,
      duration,
      theme,
      accent,
      volume,
      scenes: scenes.map(({ caption, duration: d, assetId }) => ({
        caption,
        duration: d,
        assetName: assets.find((a) => a.id === assetId)?.name ?? null,
      })),
    }
    downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `dawon-studio-${Date.now()}.json`)
    setNotice('프로젝트 JSON을 저장했습니다. 사진·음악은 다시 올리면 됩니다.')
  }

  function loadProject(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || '{}'))
        setBrand(String(data.brand || brand))
        setTitle(String(data.title || title))
        setMessage(String(data.message || message))
        setScript(String(data.script || script))
        setCta(String(data.cta || cta))
        setLinkUrl(String(data.linkUrl || linkUrl))
        if (data.preset) setPreset(data.preset)
        if (data.ratio) setRatio(data.ratio)
        if (data.duration) setDuration(Number(data.duration) || 30)
        if (data.theme) setTheme(data.theme)
        if (data.accent) setAccent(String(data.accent))
        if (typeof data.volume === 'number') setVolume(data.volume)
        if (Array.isArray(data.scenes)) {
          setScenes(
            data.scenes.map((s: { caption?: string; duration?: number }) => ({
              id: uid('scene'),
              caption: String(s.caption || ''),
              duration: Number(s.duration) || 3,
              assetId: null,
            })),
          )
        }
        setNotice('프로젝트를 불러왔습니다. 자료 파일이 있으면 다시 올려 주세요.')
      } catch {
        setNotice('프로젝트 파일을 읽지 못했습니다.', 'error')
      }
    }
    reader.readAsText(file)
  }

  function resetAll() {
    stopPlayback()
    assets.forEach((a) => URL.revokeObjectURL(a.url))
    imagesRef.current.clear()
    videosRef.current.clear()
    if (musicRef.current?.src) URL.revokeObjectURL(musicRef.current.src)
    musicRef.current = null
    setAssets([])
    setMusicName('선택된 음악 없음')
    setLogoName('기본 금빛 심벌 사용')
    const img = new Image()
    img.onload = () => {
      logoImgRef.current = img
      drawAt(0)
    }
    img.src = '/brand/dawon-logo.png'
    setBrand('다원작가 · DAWON')
    setTitle('하루 한 줄이 내일을 바꿉니다')
    setMessage('기록은 나를 믿는 증거가 됩니다')
    setScript(DEFAULT_SCRIPT)
    setCta('다원 하루설계에서 오늘 하나를 시작하세요')
    setLinkUrl('dawon84.com')
    setPreset('shorts')
    setRatio('9:16')
    setDuration(30)
    setTheme('dawn')
    setAccent('#e86553')
    setVolume(35)
    window.setTimeout(() => composeScenes(true), 0)
    setNotice('샘플 프로젝트로 다시 시작했습니다.')
  }

  const size = CANVAS_SIZE[ratio]

  return (
    <section className="movie-studio-page container studio-section section-pad" id="studio" aria-labelledby="studioTitle">
      <div className="section-heading wide">
        <p className="eyebrow">DAWON ONE-STOP STUDIO</p>
        <h2 id="studioTitle">한 화면에서 만드는 브라우저 영상 제작기</h2>
        <p>
          업로드한 자료는 외부 서버로 전송하지 않고 현재 브라우저 안에서만 처리됩니다. HTML·실행파일·SVG는 받지 않고
          이미지·영상·음악만 허용합니다.
        </p>
      </div>

      <div className={`studio-status ${statusKind === 'ok' ? '' : statusKind}`} id="studioStatus" role="status" aria-live="polite">
        <span className="status-dot" />
        <strong>{status}</strong>
        <span>사진이 없어도 디자인 배경으로 바로 미리볼 수 있습니다.</span>
      </div>

      <div className="studio-grid">
        <section className="studio-panel input-panel" aria-labelledby="inputPanelTitle">
          <div className="panel-heading">
            <span className="step-number">1</span>
            <div>
              <h3 id="inputPanelTitle">자료 입력</h3>
              <p>사진·영상과 메시지를 준비합니다.</p>
            </div>
          </div>

          <div className="form-block">
            <div className="field-label-row">
              <label className="field-label" htmlFor="mediaInput">
                사진·영상
              </label>
              <span>{assets.length}개</span>
            </div>
            <input
              ref={mediaInputRef}
              className="visually-hidden"
              id="mediaInput"
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
              multiple
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files)
                e.target.value = ''
              }}
            />
            <button
              className={`dropzone${dragOver ? ' dragover' : ''}`}
              id="mediaDropzone"
              type="button"
              aria-describedby="mediaHelp"
              onClick={() => mediaInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
              }}
            >
              <span className="upload-icon" aria-hidden="true">
                ＋
              </span>
              <strong>사진·영상을 선택하거나 끌어놓기</strong>
              <small id="mediaHelp">JPG·PNG·WEBP·MP4·WEBM · 업로드 순서대로 배치</small>
            </button>
            <div className="asset-list">
              {assets.map((asset) => (
                <div className="asset-chip" key={asset.id}>
                  <span>
                    {asset.kind === 'video' ? '🎬' : '🖼'} {asset.name}
                  </span>
                  <button type="button" onClick={() => removeAsset(asset.id)} aria-label={`${asset.name} 삭제`}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-grid two">
            <div className="field">
              <label htmlFor="brandInput">브랜드·작품명</label>
              <input id="brandInput" type="text" maxLength={60} value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="titleInput">영상 제목</label>
              <input id="titleInput" type="text" maxLength={90} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="messageInput">핵심 메시지</label>
            <textarea id="messageInput" rows={2} maxLength={180} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>

          <div className="field">
            <div className="field-label-row">
              <label htmlFor="scriptInput">대본·자막 원고</label>
              <span>{scriptCount}문장</span>
            </div>
            <textarea id="scriptInput" rows={8} maxLength={1800} value={script} onChange={(e) => setScript(e.target.value)} />
            <small className="field-help">한 줄이 한 장면의 자막이 됩니다. 문장이 없으면 제목과 메시지로 기본 장면을 만듭니다.</small>
          </div>

          <div className="form-grid two">
            <div className="field">
              <label htmlFor="ctaInput">마지막 행동 문구</label>
              <input id="ctaInput" type="text" maxLength={100} value={cta} onChange={(e) => setCta(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="urlInput">연결 주소</label>
              <input id="urlInput" type="text" maxLength={100} value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
            </div>
          </div>

          <div className="form-grid two">
            <div className="field file-field">
              <label htmlFor="musicInput">배경음악</label>
              <input
                ref={musicInputRef}
                id="musicInput"
                type="file"
                accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (!file) return
                  if (!AUDIO_OK.test(file.type)) {
                    setNotice('음악은 MP3·WAV·OGG·WEBM만 가능합니다.', 'error')
                    return
                  }
                  if (musicRef.current?.src) URL.revokeObjectURL(musicRef.current.src)
                  const audio = new Audio()
                  audio.src = URL.createObjectURL(file)
                  audio.volume = volume / 100
                  musicRef.current = audio
                  setMusicName(file.name)
                  setNotice('배경음악을 연결했습니다.')
                }}
              />
              <small>{musicName}</small>
            </div>
            <div className="field file-field">
              <label htmlFor="logoInput">로고 이미지</label>
              <input
                ref={logoInputRef}
                id="logoInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (!file) return
                  if (!LOGO_OK.test(file.type)) {
                    setNotice('로고는 JPG·PNG·WEBP만 가능합니다.', 'error')
                    return
                  }
                  const img = new Image()
                  img.onload = () => {
                    logoImgRef.current = img
                    setLogoName(file.name)
                    drawAt(timeRef.current)
                  }
                  img.src = URL.createObjectURL(file)
                }}
              />
              <small>{logoName}</small>
            </div>
          </div>

          <div className="field range-field">
            <div className="field-label-row">
              <label htmlFor="musicVolume">음악 음량</label>
              <output id="musicVolumeValue">{volume}%</output>
            </div>
            <input id="musicVolume" type="range" min={0} max={100} value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
          </div>
        </section>

        <section className="studio-panel settings-panel" aria-labelledby="settingsPanelTitle">
          <div className="panel-heading">
            <span className="step-number">2</span>
            <div>
              <h3 id="settingsPanelTitle">형식과 장면</h3>
              <p>목적을 고르고 장면을 자동 구성합니다.</p>
            </div>
          </div>

          <fieldset className="preset-group">
            <legend>영상 형식</legend>
            {(
              [
                ['shorts', '쇼츠·릴스', '9:16 · 큰 자막 · 빠른 전환'],
                ['cf', '브랜드 CF', '16:9 · 감성 · 브랜드 중심'],
                ['product', '제품 광고', '4:5 · 특징 · 사용 변화'],
                ['book', '작품·도서 홍보', '표지 · 대표 문장 · 작품관'],
              ] as const
            ).map(([value, label, hint]) => (
              <label className="preset-card" key={value}>
                <input
                  type="radio"
                  name="preset"
                  value={value}
                  checked={preset === value}
                  onChange={() => {
                    setPreset(value)
                    setRatio(PRESET_RATIO[value])
                  }}
                />
                <span>
                  <strong>{label}</strong>
                  <small>{hint}</small>
                </span>
              </label>
            ))}
          </fieldset>

          <div className="form-grid two compact">
            <div className="field">
              <label htmlFor="ratioSelect">화면 비율</label>
              <select id="ratioSelect" value={ratio} onChange={(e) => setRatio(e.target.value as Ratio)}>
                <option value="9:16">9:16 세로 쇼츠</option>
                <option value="16:9">16:9 가로 CF</option>
                <option value="1:1">1:1 정사각형</option>
                <option value="4:5">4:5 제품 광고</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="durationSelect">목표 길이</label>
              <select id="durationSelect" value={String(duration)} onChange={(e) => setDuration(Number(e.target.value))}>
                <option value="15">15초</option>
                <option value="30">30초</option>
                <option value="40">40초</option>
                <option value="60">60초</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="themeSelect">디자인 분위기</label>
              <select id="themeSelect" value={theme} onChange={(e) => setTheme(e.target.value as ThemeName)}>
                <option value="dawn">다원 새벽빛</option>
                <option value="clean">깨끗한 제품형</option>
                <option value="luxury">고급 CF형</option>
                <option value="warm">따뜻한 생활형</option>
              </select>
            </div>
            <div className="field color-field">
              <label htmlFor="accentInput">강조 색상</label>
              <div>
                <input id="accentInput" type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
                <output>{accent.toUpperCase()}</output>
              </div>
            </div>
          </div>

          <div className="compose-box">
            <button className="primary-button full" type="button" onClick={() => composeScenes(false)}>
              장면 자동 구성
            </button>
            <button className="ghost-button full" type="button" onClick={resetAll}>
              샘플 다시 불러오기
            </button>
            <p>대본 문장과 업로드 자료를 비교해 최소 4개 장면을 만들고 시간을 자동 분배합니다.</p>
          </div>

          <div className="scene-heading">
            <div>
              <h4>장면 목록</h4>
              <p>
                {scenes.length}개 장면 · {Math.round(totalDuration)}초
              </p>
            </div>
            <button className="icon-text-button" type="button" onClick={addScene}>
              ＋ 장면 추가
            </button>
          </div>
          <div className="scene-list">
            {scenes.map((scene, index) => (
              <article className={`scene-item${activeSceneId === scene.id ? ' active' : ''}`} key={scene.id}>
                <div className="scene-top">
                  <button
                    type="button"
                    className="scene-number"
                    onClick={() => {
                      const start = scenes.slice(0, index).reduce((s, sc) => s + sc.duration, 0)
                      setActiveSceneId(scene.id)
                      seekTo(start)
                    }}
                  >
                    <strong>{String(index + 1).padStart(2, '0')}</strong>
                    <span>{sceneRangeLabel(index)}</span>
                  </button>
                  <div className="scene-actions">
                    <button type="button" className="mini-button" disabled={index === 0} onClick={() => moveScene(scene.id, -1)}>
                      ↑
                    </button>
                    <button
                      type="button"
                      className="mini-button"
                      disabled={index === scenes.length - 1}
                      onClick={() => moveScene(scene.id, 1)}
                    >
                      ↓
                    </button>
                    <button type="button" className="mini-button danger" onClick={() => removeScene(scene.id)}>
                      ×
                    </button>
                  </div>
                </div>
                <textarea
                  maxLength={240}
                  rows={3}
                  value={scene.caption}
                  onChange={(e) => updateScene(scene.id, { caption: e.target.value })}
                />
                <div className="scene-options">
                  <label>
                    장면 자료
                    <select value={scene.assetId || ''} onChange={(e) => updateScene(scene.id, { assetId: e.target.value || null })}>
                      <option value="">디자인 배경</option>
                      {assets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    시간(초)
                    <input
                      type="number"
                      min={0.5}
                      max={30}
                      step={0.1}
                      value={scene.duration}
                      onChange={(e) => updateScene(scene.id, { duration: Math.max(0.5, Number(e.target.value) || 0.5) })}
                    />
                  </label>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="studio-panel preview-panel" aria-labelledby="previewPanelTitle">
          <div className="panel-heading">
            <span className="step-number">3</span>
            <div>
              <h3 id="previewPanelTitle">미리보기와 저장</h3>
              <p>재생 후 WebM·PNG로 저장합니다.</p>
            </div>
          </div>

          <div className="preview-frame" style={{ aspectRatio: `${size.w} / ${size.h}` }}>
            <canvas ref={canvasRef} id="previewCanvas" width={size.w} height={size.h} aria-label="영상 미리보기 화면" />
            <div className="preview-badge">
              {ratio} · {size.h}p
            </div>
            {scenes.length === 0 ? <div className="canvas-empty">장면 자동 구성을 눌러주세요.</div> : null}
          </div>

          <div className="play-controls">
            <button
              className="control-button"
              type="button"
              onClick={() => (playing ? stopPlayback() : startPlayback(timeRef.current))}
              disabled={recording}
            >
              {playing ? '⏸ 일시정지' : '▶ 재생'}
            </button>
            <button
              className="control-button"
              type="button"
              onClick={() => {
                stopPlayback()
                seekTo(0)
              }}
              disabled={recording}
            >
              ↺ 처음
            </button>
            <span className="time-display">
              {formatTime(time)} / {formatTime(totalDuration)}
            </span>
          </div>
          <input
            className="timeline"
            type="range"
            min={0}
            max={Math.max(0.1, totalDuration)}
            step={0.01}
            value={Math.min(time, totalDuration)}
            onChange={(e) => seekTo(Number(e.target.value))}
            disabled={recording}
          />

          <div className="save-grid">
            <button className="primary-button" type="button" onClick={() => void recordWebm()} disabled={recording}>
              {recording ? '녹화 중…' : 'WebM 영상 저장'}
            </button>
            <button className="secondary-button" type="button" onClick={savePng}>
              현재 장면 PNG
            </button>
            <button className="secondary-button" type="button" onClick={saveProject}>
              프로젝트 JSON
            </button>
            <button className="secondary-button" type="button" onClick={() => projectInputRef.current?.click()}>
              프로젝트 불러오기
            </button>
            <input
              ref={projectInputRef}
              className="visually-hidden"
              type="file"
              accept="application/json,.json"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) loadProject(file)
              }}
            />
            <button className="danger-button full-span" type="button" onClick={resetAll} disabled={recording}>
              새로 시작
            </button>
          </div>

          <div className="notice-card">
            <strong>브라우저 저장 안내</strong>
            <p>WebM 영상은 선택한 길이만큼 실시간으로 녹화됩니다. 저장 중에는 이 창을 닫거나 다른 탭으로 이동하지 마세요.</p>
            <p>MP4 자동 변환·AI 음성·클라우드 보관은 별도 서버 또는 영상 변환 API가 필요한 확장 기능입니다.</p>
          </div>
        </section>
      </div>
    </section>
  )
}
