import { useEffect } from 'react'
import { ensureGlobalEmoticonPicker } from '../newsite/dawonOs/emoticonPicker'

export function GlobalEmoticonPicker() {
  useEffect(() => ensureGlobalEmoticonPicker(), [])
  return null
}
