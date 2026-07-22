/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_TOSS_CLIENT_KEY?: string
  /** 'true' 일 때만 구독·토스 결제 UI 활성화 */
  readonly VITE_ENABLE_PAYMENTS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.html?raw' {
  const content: string
  export default content
}
