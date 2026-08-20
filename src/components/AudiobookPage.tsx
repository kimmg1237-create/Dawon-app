import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSubscription } from '../context/SubscriptionContext'
import {
  DAWON_VOICE_PROFILES,
  type DawonVoiceProfile,
} from '../data/dawonVoiceProfiles'
import { loadPdfFromBytes } from '../lib/loadPdf'
import { dawonT, getDawonLang, type DawonLang } from '../newsite/dawonOs/i18n'
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
    throw new Error('audioErrPdfNoText')
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

  const [lang, setLang] = useState<DawonLang>(() => getDawonLang())
  const t = (key: string) => dawonT(key, lang)
  const locale = lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : lang === 'en' ? 'en-US' : 'ko-KR'
  const tRef = useRef(t)
  tRef.current = t

  const [text, setText] = useState(firstProfile.sample)
  const [fileName, setFileName] = useState('')
  const [sourceLabel, setSourceLabel] = useState(() => dawonT('audioSourceManual', getDawonLang()))
  const [chapter, setChapter] = useState(() => dawonT('audioChapterDefault', getDawonLang()))
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
  const [status, setStatus] = useState(() => dawonT('audioStatusHint', getDawonLang()))
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
    const onLang = () => setLang(getDawonLang())
    window.addEventListener('dawon-lang-changed', onLang)
    return () => window.removeEventListener('dawon-lang-changed', onLang)
  }, [])

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
      setStatus(t('audioErrNoSpeech'))
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
    setStatus(t('audioStatusProfileSelected').replace('{name}', next.name))
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
    setStatus(t('audioStatusStopped'))
    setStatusKind('idle')
  }

  function speakNext(playId: number) {
    if (playId !== playIdRef.current) return
    const chunks = chunksRef.current
    if (indexRef.current >= chunks.length) {
      setSpeaking(false)
      setPaused(false)
      setProgress({ index: chunks.length, total: chunks.length })
      setStatus(previewRef.current ? tRef.current('audioStatusPreviewDone') : tRef.current('audioStatusReadDone'))
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
      setStatus(tRef.current('audioErrSpeech').replace('{error}', event.error || tRef.current('audioUnknownError')))
      setStatusKind('error')
    }
    window.speechSynthesis.speak(utter)
  }

  function playBody(body: string, preview = false) {
    const next = body.trim()
    if (!next) {
      setStatus(t('audioErrNeedText'))
      setStatusKind('error')
      return
    }
    if (previewOnly && !preview) {
      setStatus(t('audioErrPreviewOnly'))
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
        ? t('audioStatusPreviewing').replace('{name}', profile.name)
        : t('audioStatusStarting').replace('{name}', profile.name),
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
      setStatus(t('audioErrNeedStart'))
      return
    }
    if (paused) {
      pausedRef.current = false
      setPaused(false)
      setStatus(t('audioStatusResumed'))
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
    setStatus(t('audioStatusPaused'))
    setStatusKind('idle')
  }

  async function applyLoadedText(raw: string, name: string, source: string, pdfUrl = '') {
    haltSpeech()
    const limit = previewOnly ? PREVIEW_CHARS : MAX_CHARS
    const cleaned = raw.replace(/\u0000/g, '').slice(0, limit)
    setText(cleaned)
    setFileName(name)
    setSourceLabel(previewOnly ? t('audioSourcePreview').replace('{source}', source).replace('{chars}', String(PREVIEW_CHARS)) : source)
    setConnectedPdfUrl(pdfUrl)
    setProgress({ index: 0, total: 0 })
    setStatus(t('audioStatusLoaded').replace('{name}', name))
    setStatusKind('idle')
  }

  async function loadLibraryFile(name: string) {
    try {
      const res = await fetch(`/audiobook-texts/${encodeURIComponent(name)}`)
      if (!res.ok) throw new Error('not found')
      await applyLoadedText(await res.text(), name, t('audioSourceFolder').replace('{title}', displayTitle(name)))
    } catch {
      setStatus(t('audioErrFolderLoad').replace('{name}', name))
      setStatusKind('error')
    }
  }

  async function loadExtraText(item: AudiobookExtraText) {
    try {
      const res = await fetch(item.url)
      if (!res.ok) throw new Error('not found')
      await applyLoadedText(await res.text(), item.title, t('audioSourceWork').replace('{title}', item.title), item.pdfUrl || '')
    } catch {
      setStatus(t('audioErrWorkLoad').replace('{title}', item.title))
      setStatusKind('error')
    }
  }

  async function loadPdfBytes(data: ArrayBuffer, label: string) {
    setStatus(t('audioStatusExtracting').replace('{label}', label))
    setStatusKind('speaking')
    const extracted = await extractPdfText(data, (page, total) => {
      setProgress({ index: page, total })
    })
    await applyLoadedText(
      extracted.text,
      label,
      t('audioSourcePdfPages').replace('{label}', label).replace('{pages}', String(extracted.pages)),
      connectedPdfUrl,
    )
    setStatus(t('audioStatusReadyChars').replace('{pages}', String(extracted.pages)).replace('{chars}', extracted.chars.toLocaleString(locale)))
  }

  async function loadConnectedPdf() {
    if (!connectedPdfUrl) {
      setStatus(t('audioErrNeedBook'))
      setStatusKind('error')
      return
    }
    try {
      stop()
      const res = await fetch(connectedPdfUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await loadPdfBytes(await res.arrayBuffer(), fileName || t('audioConnectedPdf'))
    } catch (error) {
      setStatus(t('audioErrConnectedPdf').replace('{error}', error instanceof Error ? (error.message === 'audioErrPdfNoText' ? t('audioErrPdfNoText') : error.message) : t('audioUnknownError')))
      setStatusKind('error')
    }
  }

  async function onFile(file: File | null) {
    if (!file) return
    if (previewOnly) {
      setStatus(t('audioErrPreviewUpload'))
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
        setStatus(t('audioErrFileType'))
        setStatusKind('error')
        return
      }
      await applyLoadedText(await file.text(), file.name, file.name)
    } catch (error) {
      setStatus(t('audioErrFileRead').replace('{error}', error instanceof Error ? (error.message === 'audioErrPdfNoText' ? t('audioErrPdfNoText') : error.message) : t('audioUnknownError')))
      setStatusKind('error')
    }
  }

  async function serverRender() {
    if (!cfg.apiBase) {
      setStatus(t('audioErrMp3Server'))
      setStatusKind('error')
      return
    }
    const body = text.trim()
    if (!body) {
      setStatus(t('audioErrMp3NeedText'))
      setStatusKind('error')
      return
    }
    setMp3Busy(true)
    setStatus(t('audioStatusMp3Busy'))
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
      if (!res.ok) throw new Error(t('audioErrServerStatus').replace('{status}', String(res.status)))
      const type = res.headers.get('content-type') || ''
      let out = ''
      if (type.includes('audio/')) {
        const blob = await res.blob()
        mp3BlobRef.current = blob
        out = URL.createObjectURL(blob)
      } else {
        const data = (await res.json()) as { audioUrl?: string; url?: string }
        out = data.audioUrl || data.url || ''
        if (!out) throw new Error(t('audioErrNoAudioUrl'))
      }
      setMp3Url(out)
      setStatus(t('audioStatusMp3Ready'))
      setStatusKind('idle')
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === 'AbortError'
      setStatus(t('audioErrMp3Fail').replace('{error}', aborted ? t('audioErrTimeout') : error instanceof Error ? error.message : t('audioUnknownError')))
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
      a.download = `DAWON_${profile.name}_audiobook.mp3`
      a.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1200)
      return
    }
    if (mp3Url) {
      const a = document.createElement('a')
      a.href = mp3Url
      a.download = `DAWON_${profile.name}_audiobook.mp3`
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
              <h3 id="dvs7Title">{t('audioTitle')}</h3>
              <p>
                {t('audioDesc')}
              </p>
            </div>
            <div className="dvs7-badge" aria-label={t('audioBadgeAria')}>
              <b>7</b>
              <span>
                VOICE
                <br />
                DESIGN
              </span>
            </div>
          </header>

          <div className="dvs7-profile-grid" role="radiogroup" aria-label={t('audioProfilesAria')}>
            {DAWON_VOICE_PROFILES.map((item) => (
              <button
                key={item.id}
                type="button"
                className="dvs7-profile"
                role="radio"
                aria-checked={profileId === item.id}
                aria-label={t('audioProfileSelectAria').replace('{name}', item.name)}
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
            <section className="dvs7-editor" aria-label={t('audioEditorAria')}>
              {extraTexts.length > 0 && (
                <div className="audiobook-library">
                  <p className="audiobook-label">{t('audioBookList')}</p>
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
                  <p className="audiobook-label">{t('audioFolderText')}</p>
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
                <h4>{fileName ? t('audioToolbarWithFile').replace('{file}', fileName) : t('audioToolbarDefault')}</h4>
                <div className="dvs7-toolbar-actions">
                  <button type="button" className="btn btn-sm btn-soft" onClick={() => void loadConnectedPdf()}>
                    {t('audioLoadConnectedPdf')}
                  </button>
                  <button type="button" className="btn btn-sm btn-soft" onClick={() => fileRef.current?.click()}>
                    {t('audioLoadFile')}
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
                {t('audioTextLabel')}
              </label>
              <textarea
                id="audiobook-text"
                className="dvs7-text"
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                placeholder={t('audioTextPlaceholder')}
                rows={12}
                spellCheck
              />
              <div className="dvs7-source-line">
                <span>{sourceLabel}</span>
                <span>
                  <b>{text.length.toLocaleString(locale)}</b>{t('audioCharHint')}
                </span>
              </div>

              <div className="dvs7-select-grid">
                <div className="dvs7-field">
                  <label htmlFor="dvs7SystemVoice">{t('audioVoiceLabel')}</label>
                  <select
                    id="dvs7SystemVoice"
                    value={voiceUri}
                    onChange={(e) => setVoiceUri(e.target.value)}
                    disabled={koreanVoices.length === 0}
                  >
                    {koreanVoices.length === 0 && <option value="">{t('audioVoiceLoading')}</option>}
                    {koreanVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} · {v.lang}
                        {v.localService ? t('audioVoiceLocal') : t('audioVoiceOnline')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="dvs7-field">
                  <label htmlFor="dvs7Chapter">{t('audioChapterLabel')}</label>
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
                    {t('audioRate')} <output>{rate.toFixed(2)}×</output>
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
                    {t('audioPitch')} <output>{pitch.toFixed(2)}</output>
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
                    {t('audioPause')} <output>{Math.round(pauseMs)}ms</output>
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
                    {t('audioVolume')} <output>{Math.round(volume * 100)}%</output>
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

              <div className="dvs7-controls" role="group" aria-label={t('audioControlsAria')}>
                <button
                  type="button"
                  className="btn voice-primary"
                  onClick={() => playBody(text)}
                  disabled={(speaking && !paused) || previewOnly}
                  title={previewOnly ? t('audioFullTitleLocked') : undefined}
                >
                  {t('audioPlayFull')}
                </button>
                <button
                  type="button"
                  className={`btn dvs7-pause-btn${paused ? ' is-paused' : ''}`}
                  onClick={togglePause}
                  disabled={!speaking}
                  aria-pressed={paused}
                >
                  {paused ? t('audioResume') : t('audioPauseBtn')}
                </button>
                <button type="button" className="btn btn-soft" onClick={stop} disabled={!speaking}>
                  {t('audioStop')}
                </button>
                <button type="button" className="btn btn-soft" onClick={() => playBody(profile.sample, true)}>
                  {t('audioPreview10')}
                </button>
                <button type="button" className="btn voice-hope" onClick={() => void serverRender()} disabled={mp3Busy || previewOnly}>
                  {mp3Busy ? t('audioMp3Busy') : t('audioMp3Make')}
                </button>
              </div>

              {speaking ? (
                <div className="dvs7-now-playing" role="region" aria-label={t('audioNowPlayingAria')}>
                  <div>
                    <b>{paused ? t('audioPaused') : t('audioSpeaking')}</b>
                    <span>
                      {profile.name} · {progress.index} / {progress.total}
                    </span>
                  </div>
                  <div className="dvs7-now-playing-actions">
                    <button type="button" className="btn dvs7-pause-btn" onClick={togglePause}>
                      {paused ? t('audioResume') : t('audioPauseBtn')}
                    </button>
                    <button type="button" className="btn btn-soft" onClick={stop}>
                      {t('audioStop')}
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
                    {t('audioSaveMp3')}
                  </button>
                </div>
              ) : null}
            </section>

            <aside className="dvs7-detail" aria-label={t('audioDetailAria')}>
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
                <b>{t('audioGuidanceTitle')}</b>
                <p>{profile.guidance}</p>
              </div>
              <div className="dvs7-detail-block">
                <b>{t('audioUseTitle')}</b>
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
                <b>{t('audioStandardTitle')}</b>
                <p>
                  {t('audioStandardBody')}
                </p>
              </div>
              <div className="dvs7-mini-preview">
                <button type="button" className="btn btn-primary" onClick={() => playBody(profile.sample, true)}>
                  {t('audioHearSample')}
                </button>
                <button type="button" className="btn btn-soft" onClick={() => applyProfile(profile)}>
                  {t('audioResetDefaults')}
                </button>
              </div>
            </aside>
          </div>

          <details className="dvs7-disclosure">
            <summary>{t('audioDisclosureSummary')}</summary>
            <p>
              {t('audioDisclosureBody')}
            </p>
          </details>
        </article>
      </div>
    </section>
  )
}
