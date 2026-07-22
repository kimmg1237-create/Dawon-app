/**
 * 배포 기능 스위치.
 * 구독·토스 결제: 기본 OFF. 나중에 켤 때 `.env`에
 * `VITE_ENABLE_PAYMENTS=true` 를 넣고 재배포하면 됩니다.
 */
export const FEATURES = {
  paymentsEnabled: import.meta.env.VITE_ENABLE_PAYMENTS === 'true',
} as const
