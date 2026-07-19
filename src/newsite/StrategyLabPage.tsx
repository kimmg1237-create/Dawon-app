import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import strategyBody from './strategyBody.html?raw'
import { initStrategySite } from './initStrategy'
import { DawonLibrary } from './DawonLibrary'

export function StrategyLabPage() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const libraryHost = document.getElementById('dawonLibraryRoot')
    const libraryRoot = libraryHost ? createRoot(libraryHost) : null
    libraryRoot?.render(<DawonLibrary />)

    try {
      initStrategySite()
    } catch (error) {
      console.error('DAWON 페이지 동작 초기화 중 오류가 발생했습니다.', error)
    }

    return () => libraryRoot?.unmount()
  }, [])

  return (
    <>
      {/* 제공된 시제품 마크업을 그대로 렌더링하고, 동작은 initStrategySite 가 연결합니다. */}
      <div dangerouslySetInnerHTML={{ __html: strategyBody }} />
    </>
  )
}
