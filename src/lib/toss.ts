const key = import.meta.env.VITE_TOSS_CLIENT_KEY as string | undefined

export const tossClientKey = key?.trim() || ''
export const tossConfigured = Boolean(
  tossClientKey && !/여기에|your-|xxx/i.test(tossClientKey) && /^test_|^live_/.test(tossClientKey),
)
