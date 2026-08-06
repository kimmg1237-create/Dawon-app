/**
 * 배포 기능 스위치.
 * 구독·토스 결제: 기본 ON.
 * 끄려면 `.env` / Vercel에 `VITE_ENABLE_PAYMENTS=false` 후 재배포.
 */
export const FEATURES = {
  paymentsEnabled: import.meta.env.VITE_ENABLE_PAYMENTS !== 'false',
} as const
