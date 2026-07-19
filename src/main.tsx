import './polyfills/mapGetOrInsert'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 시제품 스크립트가 DOM 이벤트·타이머를 직접 관리하므로 StrictMode(이중 마운트)는 사용하지 않습니다.
createRoot(document.getElementById('root')!).render(<App />)
