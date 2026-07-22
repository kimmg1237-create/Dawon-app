import './polyfills/mapGetOrInsert'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 기본 가독성: 항시 글자 크게 유지
document.body.classList.add('large-text')
document.body.classList.remove('high-contrast')

// 시제품 스크립트가 DOM 이벤트·타이머를 직접 관리하므로 StrictMode(이중 마운트)는 사용하지 않습니다.
createRoot(document.getElementById('root')!).render(<App />)
