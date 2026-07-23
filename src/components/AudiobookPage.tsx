import { useEffect, useRef, useState } from 'react'
import { useSubscription } from '../context/SubscriptionContext'
import './AudiobookPage.css'

const MAX_CHARS = 120_000

export type AudiobookExtraText = {
  id: string
  title: string
  url: string
  coverUrl?: string | null
}

function pickKoreanVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith('ko')) ??
    voices.find((v) => /korean|한국어/i.test(v.name)) ??
    null
  )
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
  const chunks: string[] = []
  const parts = text.split(/(?<=[.。!?？\n])\s*/)
  let buf = ''
  for (const part of parts) {
    if (!part.trim()) continue
    if ((buf + part).length > 1800) {
      if (buf.trim()) chunks.push(buf.trim())
      buf = part
    } else {
      buf += (buf ? ' ' : '') + part
    }
  }
  if (buf.trim()) chunks.push(buf.trim())
  return chunks.length > 0 ? chunks : [text.slice(0, 1800)]
}

export function AudiobookPage({ extraTexts = [] }: { extraTexts?: AudiobookExtraText[] }) {
  const { markContentUsed } = useSubscription()
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState('')
  const [library, setLibrary] = useState<string[]>([])
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceUri, setVoiceUri] = useState('')
  const [rate, setRate] = useState(1)
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

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
    if (!('speechSynthesis' in window)) {
      setError('이 브라우저는 음성 읽기를 지원하지 않습니다. Chrome 등을 사용해 주세요.')
      return
    }

    function loadVoices() {
      const list = window.speechSynthesis.getVoices()
      setVoices(list)
      const korean = pickKoreanVoice(list)
      if (korean) setVoiceUri((prev) => prev || korean.voiceURI)
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
      window.speechSynthesis.cancel()
    }
  }, [])

  async function loadLibraryFile(name: string) {
    try {
      const res = await fetch(`/audiobook-texts/${encodeURIComponent(name)}`)
      if (!res.ok) throw new Error('not found')
      const raw = await res.text()
      setText(raw.replace(/\u0000/g, '').slice(0, MAX_CHARS))
      setFileName(name)
      setError('')
      stop()
    } catch {
      setError(`폴더에서 "${name}"을(를) 불러오지 못했습니다.`)
    }
  }

  async function loadExtraText(item: AudiobookExtraText) {
    try {
      const res = await fetch(item.url)
      if (!res.ok) throw new Error('not found')
      const raw = await res.text()
      setText(raw.replace(/\u0000/g, '').slice(0, MAX_CHARS))
      setFileName(item.title)
      setError('')
      stop()
    } catch {
      setError(`“${item.title}” 텍스트를 불러오지 못했습니다.`)
    }
  }

  function stop() {
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setPaused(false)
  }

  function play() {
    const body = text.trim()
    if (!body) {
      setError('읽을 텍스트가 없습니다. 파일을 올리거나 내용을 붙여 넣어 주세요.')
      return
    }
    if (!('speechSynthesis' in window)) return

    setError('')
    void markContentUsed()
    window.speechSynthesis.cancel()

    const chunks = splitForSpeech(body.slice(0, MAX_CHARS))
    const selected = voices.find((v) => v.voiceURI === voiceUri)

    let index = 0
    const speakNext = () => {
      if (index >= chunks.length) {
        setSpeaking(false)
        setPaused(false)
        return
      }
      const utter = new SpeechSynthesisUtterance(chunks[index])
      utter.rate = rate
      utter.lang = 'ko-KR'
      if (selected) utter.voice = selected
      utter.onstart = () => {
        setSpeaking(true)
        setPaused(false)
      }
      utter.onend = () => {
        index += 1
        speakNext()
      }
      utter.onerror = () => {
        setSpeaking(false)
        setPaused(false)
        setError('재생 중 오류가 발생했습니다. 다시 시도해 주세요.')
      }
      window.speechSynthesis.speak(utter)
    }

    speakNext()
  }

  function togglePause() {
    if (!speaking) return
    if (paused) {
      window.speechSynthesis.resume()
      setPaused(false)
    } else {
      window.speechSynthesis.pause()
      setPaused(true)
    }
  }

  async function onFile(file: File | null) {
    if (!file) return
    const lower = file.name.toLowerCase()
    if (!lower.endsWith('.txt') && file.type && !file.type.startsWith('text/')) {
      setError('텍스트 파일(.txt)만 업로드할 수 있습니다.')
      return
    }
    try {
      const raw = await file.text()
      const cleaned = raw.replace(/\u0000/g, '').slice(0, MAX_CHARS)
      setText(cleaned)
      setFileName(file.name)
      setError('')
      stop()
    } catch {
      setError('파일을 읽지 못했습니다. 다른 텍스트 파일로 시도해 주세요.')
    }
  }

  return (
    <section className="section" id="audiobook">
      <div className="wrap audiobook-wrap">
        <div className="section-head">
          <div className="copy">
            <span className="eyebrow">오디오북</span>
            <h2 style={{ marginTop: 16 }}>텍스트를 올리면, 읽어 드립니다.</h2>
          </div>
          <p>
            관리자가 올린 텍스트와 기본 폴더 텍스트를 고르거나, 아래에서 바로 파일을 올린 뒤 재생하세요.
            (브라우저 음성 읽기)
          </p>
        </div>

        <div className="audiobook-panel card">
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
                    onClick={() => loadLibraryFile(name)}
                  >
                    {displayTitle(name)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="audiobook-upload">
            <input
              ref={fileRef}
              type="file"
              accept=".txt,text/plain"
              hidden
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => fileRef.current?.click()}
            >
              텍스트 파일 올리기
            </button>
            {fileName ? (
              <span className="audiobook-file">{fileName}</span>
            ) : (
              <span className="audiobook-file muted">.txt 파일 지원 · 최대 약 {MAX_CHARS.toLocaleString()}자</span>
            )}
          </div>

          <label className="audiobook-label" htmlFor="audiobook-text">
            읽을 내용
          </label>
          <textarea
            id="audiobook-text"
            className="audiobook-text"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            placeholder="여기에 텍스트를 붙여 넣거나, 위에서 파일을 올려 주세요."
            rows={12}
          />
          <div className="audiobook-meta">
            <span>{text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}자</span>
          </div>

          <div className="audiobook-controls">
            <label>
              목소리
              <select
                value={voiceUri}
                onChange={(e) => setVoiceUri(e.target.value)}
                disabled={voices.length === 0}
              >
                {voices.length === 0 && <option value="">불러오는 중…</option>}
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </label>
            <label>
              속도 {rate.toFixed(1)}x
              <input
                type="range"
                min={0.7}
                max={1.4}
                step={0.1}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
              />
            </label>
          </div>

          <div className="audiobook-actions">
            {!speaking ? (
              <button type="button" className="btn btn-primary" onClick={play}>
                읽어 주기
              </button>
            ) : (
              <>
                <button type="button" className="btn btn-soft" onClick={togglePause}>
                  {paused ? '계속' : '일시정지'}
                </button>
                <button type="button" className="btn btn-primary" onClick={stop}>
                  정지
                </button>
              </>
            )}
            <button
              type="button"
              className="btn btn-soft"
              onClick={() => {
                stop()
                setText('')
                setFileName('')
                setError('')
                if (fileRef.current) fileRef.current.value = ''
              }}
            >
              비우기
            </button>
          </div>

          {error ? <p className="audiobook-error">{error}</p> : null}
        </div>
      </div>
    </section>
  )
}
