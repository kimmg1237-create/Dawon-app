import bodyHtml from './body.html?raw'
import scriptsRaw from './scripts.raw.js?raw'
import './theme.css'
import './bridge.css'
import './dark-contrast.css'

const THEME_KEY = 'dawon_os95_theme'

declare global {
  interface Window {
    dawonNavigateSection?: (id: string) => void
  }
}

function stickyNavOffset(): number {
  const topbar = document.querySelector(
    '.dawon-os-root .topbar, .app-nav-header.dawon-os-topbar',
  ) as HTMLElement | null
  const banner = document.querySelector('.local-mode-banner') as HTMLElement | null
  let offset = 12
  if (topbar) offset += topbar.getBoundingClientRect().height
  if (banner) {
    const cs = getComputedStyle(banner)
    if (cs.display !== 'none' && cs.visibility !== 'hidden') {
      offset += banner.getBoundingClientRect().height
    }
  }
  return Math.max(offset, 88)
}

/** Scroll a section into view below sticky nav; correct again after layout settles. */
export function scrollToDawonSection(
  idOrEl: string | Element | null | undefined,
  behavior: ScrollBehavior = 'smooth',
) {
  const el =
    typeof idOrEl === 'string'
      ? document.getElementById(String(idOrEl).replace(/^#/, ''))
      : idOrEl
  if (!el) return

  const run = (mode: ScrollBehavior) => {
    const offset = stickyNavOffset()
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top: Math.max(0, top), behavior: mode })
  }

  run(behavior)
  // Smooth scroll + late layout (fonts/images) often leave the section clipped.
  window.setTimeout(() => run('auto'), behavior === 'smooth' ? 420 : 80)
  window.setTimeout(() => run('auto'), behavior === 'smooth' ? 900 : 160)
}

function ensureNavigateHelper() {
  window.dawonNavigateSection = (id: string) => {
    const key = String(id || '').replace(/^#/, '')
    if (!key) return
    scrollToDawonSection(key, 'smooth')
    try {
      history.replaceState(null, '', `#${key}`)
    } catch {
      /* ignore */
    }
  }
}

function patchInternalLinks(root: HTMLElement, navigate: (to: string) => void) {
  root.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null
    if (!a) return
    const href = a.getAttribute('href') || ''
    if (
      !href ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('http') ||
      href.startsWith('file:')
    ) {
      return
    }
    if (href.startsWith('/')) {
      e.preventDefault()
      navigate(href)
      return
    }
    if (href.startsWith('#')) {
      const id = href.slice(1)
      const target = root.querySelector(`#${CSS.escape(id)}`)
      if (target) {
        e.preventDefault()
        window.dawonNavigateSection?.(id)
      }
    }
  })
}

export type DawonOsAccountState = {
  email: string | null
  configured: boolean
}

/** Keep OS topbar account chip in sync with React AuthContext. */
export function syncDawonOsAccount(root: HTMLElement | null, state: DawonOsAccountState) {
  if (!root) return
  const btn = root.querySelector('#accountBtn') as HTMLButtonElement | null
  const name = root.querySelector('#accountName')
  const chip = root.querySelector('#accountChip')
  const dot = root.querySelector('#cloudDot')
  if (!btn) return

  if (!state.configured) {
    btn.hidden = true
    return
  }
  btn.hidden = false

  if (state.email) {
    const label = state.email.split('@')[0] || '회원'
    btn.textContent = '로그아웃'
    if (name) name.textContent = label
    chip?.classList.add('show')
    dot?.classList.add('online')
  } else {
    btn.textContent = '로그인'
    if (name) name.textContent = '게스트'
    chip?.classList.remove('show')
    dot?.classList.remove('online')
  }
}

function bridgeChrome(
  root: HTMLElement,
  navigate: (to: string) => void,
  auth?: { isLoggedIn: () => boolean; onSignOut: () => void },
) {
  const accountBtn = root.querySelector('#accountBtn') as HTMLButtonElement | null
  if (accountBtn) {
    // Capture phase so React auth wins over removed HTML auth modal handlers.
    accountBtn.addEventListener(
      'click',
      (e) => {
        e.preventDefault()
        e.stopImmediatePropagation()
        if (auth?.isLoggedIn()) {
          auth.onSignOut()
          return
        }
        navigate('/login')
      },
      true,
    )
  }

  root.querySelectorAll('a[href="#subscription"]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const target = root.querySelector('#subscription')
      if (target) {
        e.preventDefault()
        window.dawonNavigateSection?.('subscription')
      } else {
        e.preventDefault()
        navigate('/subscribe')
      }
    })
  })

  // Deep-link plan buttons already use /subscribe?plan=...
}

function ensureDarkDefault() {
  try {
    if (!localStorage.getItem('dawon_os_theme_v2')) {
      localStorage.setItem(THEME_KEY, 'dark')
      localStorage.setItem('dawon_os_theme_v2', '1')
    }
    const saved = localStorage.getItem(THEME_KEY) || 'dark'
    document.body.classList.toggle('dark', saved === 'dark')
  } catch {
    document.body.classList.add('dark')
  }
}

function runOsScripts() {
  try {
    // eslint-disable-next-line no-new-func
    new Function(scriptsRaw)()
  } catch (error) {
    console.warn('[dawon-os] script init error, retrying chunks:', error)
    const chunks = scriptsRaw
      .split(/\n;\n(?=\s*(?:\(\(\)|\/\*|\/\*))/g)
      .map((s) => s.trim())
      .filter(Boolean)
    for (const chunk of chunks) {
      try {
        // eslint-disable-next-line no-new-func
        new Function(chunk)()
      } catch (chunkError) {
        console.warn('[dawon-os] script chunk skipped:', chunkError)
      }
    }
  }
}

type MountAuth = {
  isLoggedIn: () => boolean
  onSignOut: () => void
  account: DawonOsAccountState
}

/** Mount DAWON OS HTML + non-payment scripts. Payments stay on React /subscribe. */
export function mountDawonOs(
  host: HTMLElement,
  navigate: (to: string) => void,
  auth?: MountAuth,
): () => void {
  ensureDarkDefault()
  ensureNavigateHelper()
  host.classList.add('dawon-os-root')
  host.innerHTML = bodyHtml
  patchInternalLinks(host, navigate)
  bridgeChrome(host, navigate, auth)
  runOsScripts()
  ensureNavigateHelper()
  ensureDarkDefault()
  if (auth) syncDawonOsAccount(host, auth.account)

  // Integration mode: keep full OS navigable (first-run focus hides major sections/nav).
  document.body.classList.remove('first-run-focus', 'first-step-1', 'first-step-2')
  document.getElementById('firstCompleteOverlay')?.classList.remove('show')

  const hash = window.location.hash
  if (hash) {
    requestAnimationFrame(() => {
      scrollToDawonSection(hash, 'smooth')
    })
  }

  return () => {
    host.classList.remove('dawon-os-root')
    queueMicrotask(() => {
      if (host.isConnected) host.innerHTML = ''
    })
  }
}
