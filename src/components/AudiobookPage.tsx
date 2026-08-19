import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSubscription } from '../context/SubscriptionContext'
import {
  DAWON_VOICE_PROFILES,
  type DawonVoiceProfile,
} from '../data/dawonVoiceProfiles'
import { loadPdfFromBytes } from '../lib/loadPdf'
import './AudiobookPage.css'

const MAX_CHARS = 180_000
const PREVIEW_CHARS = 900
const PREFS_KEY = 'dawon_voice_studio_v1'

export type AudiobookExtraText = {
  id: string
  title: string
  url: string
  coverUrl?: string | null
  pdfUrl?: string | null
}

type VoicePrefs = {
  profileId?: string
  voiceURI?: string
  rate?: string
  pitch?: string
  pause?: string
  volume?: string
}

function pickKoreanVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const ko = voices.filter(
    (v) =>
      /^ko([_-]|$)/i.test(v.lang) ||
      /korean|한국|sunhi|seoyeon|heami|injun|hyunsu/i.test(v.name),
  )
  return ko.length ? ko : voices
}

function displayTitle(fileName: string): string {
  return fileName
    .replace(/\.txt$/i, '')
    .replace(/_50p_글로벌최종교정판$/i, '')
    .replace(/_50p_글로벌최종개정판$/i, '')
    .replace(/_/g, ' ')
    .trim()
}

function splitForSpeech(text: string): string[] {
  const clean = String(text || '')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  if (!clean) return []
  const parts = clean
    .split(/(?<=[.!?。？！])\s+|\n+/u)
    .map((x) => x.trim())
    .filter(Boolean)
  const out: string[] = []
  for (const part of parts) {
    if (part.length <= 190) {
      out.push(part)
      continue
    }
    let rest = part
    while (rest.length > 190) {
      const cutCandidates = [
        rest.lastIndexOf(' ', 190),
        rest.lastIndexOf(',', 190),
        rest.lastIndexOf('，', 190),
        rest.lastIndexOf('·', 190),
      ]
      let cut = Math.max(...cutCandidates)
      if (cut < 70) cut = 190
      out.push(rest.slice(0, cut).trim())
      rest = rest.slice(cut).trim()
    }
    if (rest) out.push(rest)
  }
  return out.slice(0, 1200)
}

function readPrefs(): VoicePrefs | null {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    return raw ? (JSON.parse(raw) as VoicePrefs) : null
  } catch {
    return null
  }
}

function voiceConfig() {
  const fromWindow =
    typeof window !== 'undefined' ? window.DAWON_VOICE_CONFIG : undefined
  return {
    apiBase: fromWindow?.apiBase || '',
    endpoint: fromWindow?.endpoint || '/api/tts/generate',
    timeoutMs: fromWindow?.timeoutMs || 120_000,
  }
}

declare global {
  interface Window {
    DAWON_VOICE_CONFIG?: {
      apiBase?: string
      endpoint?: string
      timeoutMs?: number
    }
  }
}

async function extractPdfText(data: ArrayBuffer, onProgress?: (page: number, total: number) => void) {
  const pdf = await loadPdfFromBytes(data)
  const pages = Math.min(pdf.numPages, 250)
  const rows: string[] = []
  let chars = 0
  for (let i = 1; i <= pages; i++) {
    const page = await pdf.getPage(i)
    const tc = await page.getTextContent()
    const line = tc.items
      .map((item) => ('str' in item ? String(item.str) : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (line) {
      rows.push(line)
      chars += line.length
    }
    onProgress?.(i, pages)
    if (chars > MAX_CHARS) break
  }
  if (!rows.length) {
    throw new Error('텍스트를 찾지 못했습니다. 스캔 PDF는 교정 원고 TXT가 필요합니다.')
  }
  return { text: rows.join('\n\n').slice(0, MAX_CHARS), pages, chars }
}

export function AudiobookPage({
  extraTexts = [],
  previewOnly = false,
}: {
  extraTexts?: AudiobookExtraText[]
  previewOnly?: boolean
}) {
  const { markContentUsed } = useSubscription()
  const location = useLocation()
  const saved = useMemo(() => readPrefs(), [])
  const firstProfile =
    DAWON_VOICE_PROFILES.find((p) => p.id === saved?.profileId) ?? DAWON_VOICE_PROFILES[0]

  const [text, setText] = useState(firstProfile.sample)
  const [fileName, setFileName] = useState('')
  const [sourceLabel, setSourceLabel] = useState('직접 입력 원고')
  const [chapter, setChapter] = useState('제1장 · 오늘을 다시 설계하다')
  const [library, setLibrary] = useState<string[]>([])
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceUri, setVoiceUri] = useState(saved?.voiceURI ?? '')
  const [profileId, setProfileId] = useState(firstProfile.id)
  const [rate, setRate] = useState(Number(saved?.rate ?? firstProfile.rate))
  const [pitch, setPitch] = useState(Number(saved?.pitch ?? firstProfile.pitch))
  const [pauseMs, setPauseMs] = useState(Number(saved?.pause ?? firstProfile.pauseMs))
  const [volume, setVolume] = useState(Number(saved?.volume ?? firstProfile.volume))
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [status, setStatus] = useState('성우를 선택하고 미리듣기를 눌러보세요.')
  const [statusKind, setStatusKind] = useState<'idle' | 'speaking' | 'error'>('idle')
  const [progress, setProgress] = useState({ index: 0, total: 0 })
  const [connectedPdfUrl, setConnectedPdfUrl] = useState('')
  const [mp3Url, setMp3Url] = useState('')
  const [mp3Busy, setMp3Busy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const chunksRef = useRef<string[]>([])
  const indexRef = useRef(0)
  const playIdRef = useRef(0)
  const pausedRef = useRef(false)
  const previewRef = useRef(false)
  const pauseTimerRef = useRef(0)
  const mp3BlobRef = useRef<Blob | null>(null)
  const settingsRef = useRef({ rate, pitch, pauseMs, volume, voiceUri, profileId })
  settingsRef.current = { rate, pitch, pauseMs, volume, voiceUri, profileId }

  const profile = DAWON_VOICE_PROFILES.find((p) => p.id === profileId) ?? DAWON_VOICE_PROFILES[0]
  const koreanVoices = useMemo(() => pickKoreanVoices(voices), [voices])
  const cfg = voiceConfig()

  useEffect(() => {
    fetch('/audiobook-texts/index.json')
      .then((res) => (res.ok ? res.json() : []))
      .then((list: unknown) => {
        if (Array.isArray(list)) {
          setLibrary(list.filter((item): item is string => typeof item === 'string'))
        }
      })
      .catch(() => setLibrary([]))
  }, [])

  useEffect(() => {
    if (location.hash !== '#voice-studio') return
    document.getElementById('voice-studio')?.scrollIntoView({ behavior: 'auto', block: 'start' })
  }, [location.hash])

  useEffect(() => {
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({
          profileId,
          voiceURI: voiceUri,
          rate: String(rate),
          pitch: String(pitch),
          pause: String(pauseMs),
          volume: String(volume),
        } satisfies VoicePrefs),
      )
    } catch {
      /* ignore */
    }
  }, [profileId, voiceUri, rate, pitch, pauseMs, volume])

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setStatus('이 브라우저는 음성 읽기를 지원하지 않습니다. Chrome 또는 Edge를 사용해 주세요.')
      setStatusKind('error')
      return
    }

    function loadVoices() {
      const list = window.speechSynthesis.getVoices()
      setVoices((prev) => {
        if (prev.length === list.length && prev.every((v, i) => v.voiceURI === list[i]?.voiceURI)) {
          return prev
        }
        return list
      })
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
      playIdRef.current += 1
      window.clearTimeout(pauseTimerRef.current)
      window.speechSynthesis.cancel()
    }
  }, [])

  useEffect(() => {
    if (!koreanVoices.length) return
    setVoiceUri((cur) => {
      if (cur && koreanVoices.some((v) => v.voiceURI === cur)) return cur
      const idx = Math.max(
        0,
        DAWON_VOICE_PROFILES.findIndex((p) => p.id === profileId),
      )
      return koreanVoices[idx % koreanVoices.length]?.voiceURI || ''
    })
  }, [koreanVoices, profileId])

  useEffect(() => {
    if (!speaking || paused) return
    const id = window.setInterval(() => {
      if (pausedRef.current || window.speechSynthesis.paused) return
      try {
        window.speechSynthesis.resume()
      } catch {
        /* Chrome 장시간 재생 끊김 방지 */
      }
    }, 8000)
    return () => window.clearInterval(id)
  }, [speaking, paused])

  function applyProfile(next: DawonVoiceProfile, keepVoice = false) {
    setProfileId(next.id)
    setRate(next.rate)
    setPitch(next.pitch)
    setPauseMs(next.pauseMs)
    setVolume(next.volume)
    if (!keepVoice && koreanVoices.length) {
      const idx = Math.max(
        0,
        DAWON_VOICE_PROFILES.findIndex((p) => p.id === next.id),
      )
      const chosen = koreanVoices[idx % koreanVoices.length]
      if (chosen) setVoiceUri(chosen.voiceURI)
    }
    setStatus(`${next.name} 목소리를 선택했습니다. 예문 미리듣기로 음색을 확인해 보세요.`)
    setStatusKind('idle')
  }

  function haltSpeech() {
    playIdRef.current += 1
    pausedRef.current = false
    previewRef.current = false
    window.clearTimeout(pauseTimerRef.current)
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* ignore */
    }
    setSpeaking(false)
    setPaused(false)
  }

  function stop() {
    haltSpeech()
    setProgress({ index: 0, total: 0 })
    setStatus('낭독을 정지했습니다.')
    setStatusKind('idle')
  }

  function speakNext(playId: number) {
    if (playId !== playIdRef.current) return
    const chunks = chunksRef.current
    if (indexRef.current >= chunks.length) {
      setSpeaking(false)
      setPaused(false)
      setProgress({ index: chunks.length, total: chunks.length })
      setStatus(previewRef.current ? '미리듣기를 마쳤습니다.' : '원고 낭독을 마쳤습니다.')
      setStatusKind('idle')
      return
    }
    const selected = voices.find((v) => v.voiceURI === settingsRef.current.voiceUri)
    const utter = new SpeechSynthesisUtterance(chunks[indexRef.current])
    utter.rate = settingsRef.current.rate
    utter.pitch = settingsRef.current.pitch
    utter.volume = settingsRef.current.volume
    utter.lang = selected?.lang || 'ko-KR'
    if (selected) utter.voice = selected
    setProgress({ index: indexRef.current + 1, total: chunks.length })
    utter.onstart = () => {
      if (playId !== playIdRef.current) return
      setSpeaking(true)
      setPaused(false)
    }
    utter.onend = () => {
      if (playId !== playIdRef.current) return
      if (pausedRef.current) return
      indexRef.current += 1
      const pause = previewRef.current
        ? Math.min(350, settingsRef.current.pauseMs)
        : settingsRef.current.pauseMs
      pauseTimerRef.current = window.setTimeout(() => {
        if (pausedRef.current || playId !== playIdRef.current) return
        speakNext(playId)
      }, pause)
    }
    utter.onerror = (event) => {
      if (playId !== playIdRef.current) return
      if (event.error === 'interrupted' || event.error === 'canceled') return
      setSpeaking(false)
      setPaused(false)
      setStatus(`음성 재생 중 문제가 발생했습니다: ${event.error || '알 수 없는 오류'}`)
      setStatusKind('error')
    }
    window.speechSynthesis.speak(utter)
  }

  function playBody(body: string, preview = false) {
    const next = body.trim()
    if (!next) {
      setStatus('낭독할 원고를 입력하거나 불러와 주세요.')
      setStatusKind('error')
      return
    }
    if (previewOnly && !preview) {
      setStatus('미리보기 모드입니다. 예문 미리듣기를 이용하거나, 가입 후 7일 무료 체험으로 전체 낭독을 이용하세요.')
      setStatusKind('error')
      return
    }
    if (!('speechSynthesis' in window)) return
    void markContentUsed()
    playIdRef.current += 1
    const playId = playIdRef.current
    previewRef.current = preview
    chunksRef.current = splitForSpeech(next.slice(0, MAX_CHARS))
    indexRef.current = 0
    pausedRef.current = false
    setSpeaking(true)
    setPaused(false)
    setStatusKind('speaking')
    setStatus(
      preview
        ? `${profile.name} 목소리 예문을 미리듣습니다.`
        : `${profile.name} 목소리로 낭독을 시작합니다.`,
    )
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* ignore */
    }
    window.setTimeout(() => {
      if (playId !== playIdRef.current) return
      speakNext(playId)
    }, 80)
  }

  function togglePause() {
    if (!speaking) {
      setStatus('먼저 전체 낭독 또는 미리듣기를 시작해 주세요.')
      return
    }
    if (paused) {
      pausedRef.current = false
      setPaused(false)
      setStatus('낭독을 이어갑니다.')
      setStatusKind('speaking')
      speakNext(playIdRef.current)
      return
    }
    pausedRef.current = true
    window.clearTimeout(pauseTimerRef.current)
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* ignore */
    }
    setPaused(true)
    setStatus('낭독을 잠시 멈췄습니다. 이어듣기로 중간부터 계속할 수 있습니다.')
    setStatusKind('idle')
  }

  async function applyLoadedText(raw: string, name: string, source: string, pdfUrl = '') {
    haltSpeech()
    const limit = previewOnly ? PREVIEW_CHARS : MAX_CHARS
    const cleaned = raw.replace(/\u0000/g, '').slice(0, limit)
    setText(cleaned)
    setFileName(name)
    setSourceLabel(previewOnly ? `${source} · 미리보기 ${PREVIEW_CHARS}자` : source)
    setConnectedPdfUrl(pdfUrl)
    setProgress({ index: 0, total: 0 })
    setStatus(`${name} 원고를 불러왔습니다.`)
    setStatusKind('idle')
  }

  async function loadLibraryFile(name: string) {
    try {
      const res = await fetch(`/audiobook-texts/${encodeURIComponent(name)}`)
      if (!res.ok) throw new Error('not found')
      await applyLoadedText(await res.text(), name, `${displayTitle(name)} · 폴더 텍스트`)
    } catch {
      setStatus(`폴더에서 "${name}"을(를) 불러오지 못했습니다.`)
      setStatusKind('error')
    }
  }

  async function loadExtraText(item: AudiobookExtraText) {
    try {
      const res = await fetch(item.url)
      if (!res.ok) throw new Error('not found')
      await applyLoadedText(await res.text(), item.title, `${item.title} · 작품 원고`, item.pdfUrl || '')
    } catch {
      setStatus(`“${item.title}” 텍스트를 불러오지 못했습니다.`)
      setStatusKind('error')
    }
  }

  async function loadPdfBytes(data: ArrayBuffer, label: string) {
    setStatus(`${label}에서 낭독 원고를 추출하고 있습니다.`)
    setStatusKind('speaking')
    const extracted = await extractPdfText(data, (page, total) => {
      setProgress({ index: page, total })
    })
    await applyLoadedText(
      extracted.text,
      label,
      `${label} · ${extracted.pages}쪽 원고`,
      connectedPdfUrl,
    )
    setStatus(`${extracted.pages}쪽, ${extracted.chars.toLocaleString('ko-KR')}자를 준비했습니다.`)
  }

  async function loadConnectedPdf() {
    if (!connectedPdfUrl) {
      setStatus('작품 목록에서 책을 고르거나 PDF 파일을 직접 불러와 주세요.')
      setStatusKind('error')
      return
    }
    try {
      stop()
      const res = await fetch(connectedPdfUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await loadPdfBytes(await res.arrayBuffer(), fileName || '연결 PDF')
    } catch (error) {
      setStatus(`연결 PDF 원고를 불러오지 못했습니다: ${error instanceof Error ? error.message : '오류'}`)
      setStatusKind('error')
    }
  }

  async function onFile(file: File | null) {
    if (!file) return
    if (previewOnly) {
      setStatus('미리보기 모드에서는 파일 업로드 대신 예문 미리듣기를 이용해 주세요.')
      setStatusKind('error')
      return
    }
    const lower = file.name.toLowerCase()
    try {
      if (file.type === 'application/pdf' || lower.endsWith('.pdf')) {
        await loadPdfBytes(await file.arrayBuffer(), file.name)
        return
      }
      if (!lower.endsWith('.txt') && !lower.endsWith('.md') && file.type && !file.type.startsWith('text/')) {
        setStatus('텍스트(.txt) 또는 PDF 파일만 업로드할 수 있습니다.')
        setStatusKind('error')
        return
      }
      await applyLoadedText(await file.text(), file.name, file.name)
    } catch (error) {
      setStatus(`파일을 읽지 못했습니다: ${error instanceof Error ? error.message : '오류'}`)
      setStatusKind('error')
    }
  }

  async function serverRender() {
    if (!cfg.apiBase) {
      setStatus('MP3 생성 서버가 아직 연결되지 않았습니다. 브라우저 미리듣기는 바로 사용할 수 있습니다.')
      setStatusKind('error')
      return
    }
    const body = text.trim()
    if (!body) {
      setStatus('MP3로 만들 원고를 입력해 주세요.')
      setStatusKind('error')
      return
    }
    setMp3Busy(true)
    setStatus('운영 TTS 서버에서 MP3를 만들고 있습니다. 이 창을 닫지 마세요.')
    setStatusKind('speaking')
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), cfg.timeoutMs)
    try {
      const url = new URL(cfg.endpoint, cfg.apiBase).href
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json, audio/mpeg, audio/wav',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: body,
          bookTitle: fileName,
          chapter,
          profileId,
          profile,
          settings: { rate, pitch, pauseMs, volume },
        }),
        signal: controller.signal,
      })
      if (!res.ok) throw new Error(`서버 응답 ${res.status}`)
      const type = res.headers.get('content-type') || ''
      let out = ''
      if (type.includes('audio/')) {
        const blob = await res.blob()
        mp3BlobRef.current = blob
        out = URL.createObjectURL(blob)
      } else {
        const data = (await res.json()) as { audioUrl?: string; url?: string }
        out = data.audioUrl || data.url || ''
        if (!out) throw new Error('완성 음원 주소가 없습니다.')
      }
      setMp3Url(out)
      setStatus('완성 음원을 재생해 확인한 뒤 저장할 수 있습니다.')
      setStatusKind('idle')
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === 'AbortError'
      setStatus(`MP3 생성에 실패했습니다: ${aborted ? '시간이 초과되었습니다.' : error instanceof Error ? error.message : '오류'}`)
      setStatusKind('error')
    } finally {
      window.clearTimeout(timer)
      setMp3Busy(false)
    }
  }

  function downloadAudio() {
    if (mp3BlobRef.current) {
      const url = URL.createObjectURL(mp3BlobRef.current)
      const a = document.createElement('a')
      a.href = url
      a.download = `DAWON_${profile.name}_오디오북.mp3`
      a.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1200)
      return
    }
    if (mp3Url) {
      const a = document.createElement('a')
      a.href = mp3Url
      a.download = `DAWON_${profile.name}_오디오북.mp3`
      a.target = '_blank'
      a.rel = 'noopener'
      a.click()
    }
  }

  const percent = progress.total ? Math.round((progress.index / progress.total) * 100) : 0

  return (
    <section className="section" id="audiobook">
      <div className="wrap audiobook-wrap">
        <article className="dvs7-shell" id="voice-studio" aria-labelledby="dvs7Title">
          <header className="dvs7-head">
            <div>
              <small>DAWON 7 VOICE STUDIO · AUDIOBOOK NARRATION</small>
              <h3 id="dvs7Title">마음을 이해하고, 가능성을 깨우는 성우 7명</h3>
              <p>
                프로의 창조상담부터 집중·공감·이해·희망·소망·통합까지, 원고의 목적에 맞는 목소리를 고릅니다.
                브라우저에서는 즉시 미리듣고, 운영 TTS 서버를 연결하면 같은 설계로 MP3 오디오북을 만들 수 있습니다.
              </p>
            </div>
            <div className="dvs7-badge" aria-label="7가지 목소리">
              <b>7</b>
              <span>
                VOICE
                <br />
                DESIGN
              </span>
            </div>
          </header>

          <div className="dvs7-profile-grid" role="radiogroup" aria-label="다원 성우 목소리 7종">
            {DAWON_VOICE_PROFILES.map((item) => (
              <button
                key={item.id}
                type="button"
                className="dvs7-profile"
                role="radio"
                aria-checked={profileId === item.id}
                aria-label={`${item.name} 목소리 선택`}
                onClick={() => applyProfile(item)}
              >
                <span className="dvs7-profile-top">
                  <span className="dvs7-profile-no">VOICE {item.no}</span>
                  <span className="dvs7-profile-icon" aria-hidden="true">
                    {item.symbol}
                  </span>
                </span>
                <strong>{item.name}</strong>
                <small>{item.tagline}</small>
                <em>{item.tone}</em>
              </button>
            ))}
          </div>

          <div className="dvs7-workspace">
            <section className="dvs7-editor" aria-label="오디오북 낭독 원고와 재생 설정">
              {extraTexts.length > 0 && (
                <div className="audiobook-library">
                  <p className="audiobook-label">책 목록 (기본 + 업로드)</p>
                  <div className="audiobook-library-list">
                    {extraTexts.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`audiobook-library-item ${fileName === item.title ? 'active' : ''}`}
                        onClick={() => void loadExtraText(item)}
                      >
                        {item.coverUrl ? (
                          <img className="audiobook-library-cover" src={item.coverUrl} alt="" loading="lazy" />
                        ) : null}
                        <span>{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {library.length > 0 && (
                <div className="audiobook-library">
                  <p className="audiobook-label">폴더 텍스트</p>
                  <div className="audiobook-library-list">
                    {library.map((name) => (
                      <button
                        key={name}
                        type="button"
                        className={`audiobook-library-item ${fileName === name ? 'active' : ''}`}
                        onClick={() => void loadLibraryFile(name)}
                      >
                        {displayTitle(name)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="dvs7-toolbar">
                <h4>{fileName ? `${fileName} · 성우 7명 낭독` : '오디오북 낭독 원고'}</h4>
                <div className="dvs7-toolbar-actions">
                  <button type="button" className="btn btn-sm btn-soft" onClick={() => void loadConnectedPdf()}>
                    연결 PDF 원고
                  </button>
                  <button type="button" className="btn btn-sm btn-soft" onClick={() => fileRef.current?.click()}>
                    PDF·TXT 불러오기
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/pdf,text/plain,.txt,.md"
                    hidden
                    onChange={(e) => {
                      void onFile(e.target.files?.[0] ?? null)
                      e.target.value = ''
                    }}
                  />
                </div>
              </div>

              <label className="sr-only" htmlFor="audiobook-text">
                낭독할 오디오북 원고
              </label>
              <textarea
                id="audiobook-text"
                className="dvs7-text"
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                placeholder="여기에 텍스트를 붙여 넣거나, 위에서 파일을 올려 주세요."
                rows={12}
                spellCheck
              />
              <div className="dvs7-source-line">
                <span>{sourceLabel}</span>
                <span>
                  <b>{text.length.toLocaleString('ko-KR')}</b>자 · 장문은 문장별로 나누어 낭독합니다.
                </span>
              </div>

              <div className="dvs7-select-grid">
                <div className="dvs7-field">
                  <label htmlFor="dvs7SystemVoice">이 기기에서 사용할 실제 한국어 음성</label>
                  <select
                    id="dvs7SystemVoice"
                    value={voiceUri}
                    onChange={(e) => setVoiceUri(e.target.value)}
                    disabled={koreanVoices.length === 0}
                  >
                    {koreanVoices.length === 0 && <option value="">불러오는 중…</option>}
                    {koreanVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} · {v.lang}
                        {v.localService ? ' · 기기' : ' · 온라인'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="dvs7-field">
                  <label htmlFor="dvs7Chapter">장·회차 이름</label>
                  <input
                    id="dvs7Chapter"
                    type="text"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                  />
                </div>
              </div>

              <div className="dvs7-sliders">
                <div className="dvs7-slider">
                  <label htmlFor="dvs7Rate">
                    속도 <output>{rate.toFixed(2)}×</output>
                  </label>
                  <input
                    id="dvs7Rate"
                    type="range"
                    min={0.65}
                    max={1.25}
                    step={0.01}
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                  />
                </div>
                <div className="dvs7-slider">
                  <label htmlFor="dvs7Pitch">
                    높낮이 <output>{pitch.toFixed(2)}</output>
                  </label>
                  <input
                    id="dvs7Pitch"
                    type="range"
                    min={0.75}
                    max={1.25}
                    step={0.01}
                    value={pitch}
                    onChange={(e) => setPitch(Number(e.target.value))}
                  />
                </div>
                <div className="dvs7-slider">
                  <label htmlFor="dvs7Pause">
                    문장 쉼 <output>{Math.round(pauseMs)}ms</output>
                  </label>
                  <input
                    id="dvs7Pause"
                    type="range"
                    min={150}
                    max={1200}
                    step={10}
                    value={pauseMs}
                    onChange={(e) => setPauseMs(Number(e.target.value))}
                  />
                </div>
                <div className="dvs7-slider">
                  <label htmlFor="dvs7Volume">
                    음량 <output>{Math.round(volume * 100)}%</output>
                  </label>
                  <input
                    id="dvs7Volume"
                    type="range"
                    min={0.35}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="dvs7-controls" role="group" aria-label="오디오북 재생 조절">
                <button
                  type="button"
                  className="btn voice-primary"
                  onClick={() => playBody(text)}
                  disabled={(speaking && !paused) || previewOnly}
                  title={previewOnly ? '전체 낭독은 7일 무료 체험 또는 이용권이 필요합니다' : undefined}
                >
                  ▶ 전체 낭독
                </button>
                <button
                  type="button"
                  className={`btn dvs7-pause-btn${paused ? ' is-paused' : ''}`}
                  onClick={togglePause}
                  disabled={!speaking}
                  aria-pressed={paused}
                >
                  {paused ? '▶ 이어듣기' : '⏸ 일시정지'}
                </button>
                <button type="button" className="btn btn-soft" onClick={stop} disabled={!speaking}>
                  ■ 정지
                </button>
                <button type="button" className="btn btn-soft" onClick={() => playBody(profile.sample, true)}>
                  10초 미리듣기
                </button>
                <button type="button" className="btn voice-hope" onClick={() => void serverRender()} disabled={mp3Busy || previewOnly}>
                  {mp3Busy ? 'MP3 만드는 중…' : 'MP3 만들기'}
                </button>
              </div>

              {speaking ? (
                <div className="dvs7-now-playing" role="region" aria-label="지금 낭독 중">
                  <div>
                    <b>{paused ? '일시정지' : '낭독 중'}</b>
                    <span>
                      {profile.name} · {progress.index} / {progress.total}
                    </span>
                  </div>
                  <div className="dvs7-now-playing-actions">
                    <button type="button" className="btn dvs7-pause-btn" onClick={togglePause}>
                      {paused ? '▶ 이어듣기' : '⏸ 일시정지'}
                    </button>
                    <button type="button" className="btn btn-soft" onClick={stop}>
                      ■ 정지
                    </button>
                  </div>
                </div>
              ) : null}

              <div className={`dvs7-status ${statusKind}`} role="status" aria-live="polite">
                <i className="dvs7-status-dot" aria-hidden="true" />
                <span>{status}</span>
                <strong>
                  {progress.index} / {progress.total}
                </strong>
              </div>
              <div className="dvs7-progress" aria-hidden="true">
                <span style={{ width: `${percent}%` }} />
              </div>
              {mp3Url ? (
                <div className="dvs7-mp3-result">
                  <audio src={mp3Url} controls />
                  <button type="button" className="btn btn-sm btn-soft" onClick={downloadAudio}>
                    완성 음원 저장
                  </button>
                </div>
              ) : null}
            </section>

            <aside className="dvs7-detail" aria-label="선택한 목소리의 전문 연출 기준">
              <div className="dvs7-current">
                <span className="dvs7-current-icon" aria-hidden="true">
                  {profile.symbol}
                </span>
                <div>
                  <small>VOICE {profile.no}</small>
                  <h4>{profile.name}</h4>
                  <p>{profile.tagline}</p>
                </div>
              </div>
              <div className="dvs7-detail-block">
                <b>목소리 연출 원칙</b>
                <p>{profile.guidance}</p>
              </div>
              <div className="dvs7-detail-block">
                <b>추천 활용</b>
                <p>{profile.use}</p>
                <div className="dvs7-chip-row">
                  {profile.tone.split('·').map((chip) => (
                    <span key={chip} className="dvs7-chip">
                      {chip.trim()}
                    </span>
                  ))}
                </div>
              </div>
              <div className="dvs7-detail-block">
                <b>전문 낭독 기준</b>
                <p>
                  사실을 과장하지 않고, 쉼표와 마침표에서 충분히 호흡합니다. 듣는 사람을 평가하거나 몰아붙이지 않으며,
                  공감 → 이해 → 가능성 → 오늘 한 행동의 순서로 마무리합니다.
                </p>
              </div>
              <div className="dvs7-mini-preview">
                <button type="button" className="btn btn-primary" onClick={() => playBody(profile.sample, true)}>
                  선택 목소리 예문 듣기
                </button>
                <button type="button" className="btn btn-soft" onClick={() => applyProfile(profile)}>
                  기본값 복원
                </button>
              </div>
            </aside>
          </div>

          <details className="dvs7-disclosure">
            <summary>제작 방식·저작권·실제 성우 음성 안내</summary>
            <p>
              이 화면의 즉시 낭독은 브라우저가 제공하는 합성 음성을 사용하므로 기기마다 음색 수와 품질이 다를 수 있습니다.
              실제 성우의 목소리를 복제하려면 본인의 명시적 동의와 사용계약이 필요합니다. 운영용 MP3는 서버가
              원고·목소리 프로필·속도·쉼 설정을 받아 생성하고, 오디오 파일 또는 안전한 재생 주소를 반환하도록 연결합니다.
            </p>
          </details>
        </article>
      </div>
    </section>
  )
}
