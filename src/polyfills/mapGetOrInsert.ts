/**
 * pdfjs-dist v6 uses Map.prototype.getOrInsertComputed (ES2025).
 * Older Chromium/Safari builds may not have it yet — polyfill for PDF rendering.
 */
if (typeof Map !== 'undefined' && !('getOrInsertComputed' in Map.prototype)) {
  // eslint-disable-next-line no-extend-native
  ;(Map.prototype as Map<unknown, unknown> & {
    getOrInsertComputed: (key: unknown, callbackFn: (key: unknown) => unknown) => unknown
  }).getOrInsertComputed = function getOrInsertComputed(key, callbackFn) {
    if (this.has(key)) return this.get(key)
    const value = callbackFn(key)
    this.set(key, value)
    return value
  }
}
