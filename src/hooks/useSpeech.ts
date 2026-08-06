import { useCallback, useEffect, useRef, useState } from 'react'

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((e: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

export function useSpeechInput() {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')
  const recRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    return () => {
      try {
        recRef.current?.stop()
      } catch {
        /* ignore */
      }
    }
  }, [])

  const listen = useCallback((onText: (text: string) => void) => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      setError('이 브라우저는 음성 입력을 지원하지 않습니다. Chrome 또는 Edge를 사용해 주세요.')
      return
    }
    setError('')
    try {
      recRef.current?.stop()
    } catch {
      /* ignore */
    }
    const rec = new Ctor()
    rec.lang = 'ko-KR'
    rec.interimResults = false
    rec.continuous = false
    rec.onresult = (e) => {
      const t = e.results[0]?.[0]?.transcript?.trim()
      if (t) onText(t)
    }
    rec.onerror = () => {
      setListening(false)
      setError('음성 인식이 중단되었습니다.')
    }
    rec.onend = () => setListening(false)
    recRef.current = rec
    setListening(true)
    try {
      rec.start()
    } catch {
      setListening(false)
      setError('마이크 권한을 확인해 주세요.')
    }
  }, [])

  return { listening, error, listen, clearError: () => setError('') }
}

export function useSpeechSpeak() {
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return false
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'ko-KR'
    utter.rate = 0.95
    window.speechSynthesis.speak(utter)
    return true
  }, [])

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [])

  useEffect(() => () => stop(), [stop])

  return { speak, stop }
}
