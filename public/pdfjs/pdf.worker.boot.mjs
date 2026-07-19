/**
 * pdf.js worker entry with Map.getOrInsertComputed polyfill.
 * Workers do not inherit main-thread prototype patches.
 */
if (typeof Map !== 'undefined' && !Object.prototype.hasOwnProperty.call(Map.prototype, 'getOrInsertComputed')) {
  Map.prototype.getOrInsertComputed = function getOrInsertComputed(key, callbackFn) {
    if (this.has(key)) return this.get(key)
    const value = callbackFn(key)
    this.set(key, value)
    return value
  }
}

import './pdf.worker.min.mjs'
