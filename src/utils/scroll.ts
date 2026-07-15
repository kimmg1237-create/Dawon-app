const PAGE_HASHES = new Set(['#terms', '#privacy'])

export function isPageHash(hash: string): boolean {
  return PAGE_HASHES.has(hash)
}

export function getStickyNavOffset(): number {
  const nav = document.querySelector('.nav') as HTMLElement | null
  return (nav?.offsetHeight ?? 74) + 12
}

/** Scroll to in-page section, accounting for sticky nav */
export function scrollToHash(hash: string, behavior: ScrollBehavior = 'smooth'): boolean {
  const id = hash.replace(/^#/, '')
  if (!id || id === 'top') {
    window.scrollTo({ top: 0, behavior })
    return true
  }

  const el = document.getElementById(id)
  if (!el) return false

  const top = el.getBoundingClientRect().top + window.scrollY - getStickyNavOffset()
  window.scrollTo({ top: Math.max(0, top), behavior })
  return true
}
