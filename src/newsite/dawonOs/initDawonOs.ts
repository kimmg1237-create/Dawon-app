import { createRoot, type Root } from 'react-dom/client'
import { createElement } from 'react'
import bodyHtml from './body.html?raw'
import scriptsRaw from './scripts.raw.js?raw'
import { siteConfig } from '../../data/siteConfig'
import { mountEmoticonPicker } from './emoticonPicker'
import { installDawonI18n, dawonT, getDawonLang } from './i18n'
import { DawonVideoStudio } from '../../components/DawonVideoStudio'
import './theme.css'
import './bridge.css'
import './dark-contrast.css'
import './readability.css'
import './adRail.css'

const THEME_KEY = 'dawon_os95_theme'

declare global {
  interface Window {
    dawonNavigateSection?: (id: string) => void
    dawonSetAccessState?: (next: {
      authenticated?: boolean
      active?: boolean
      planName?: string
      endsAt?: string | null
    }) => void
    __dawonOsChromeBound?: boolean
  }
}

export type DawonNavigate = (
  to: string | { pathname?: string; search?: string; hash?: string },
  options?: { replace?: boolean; preventScrollReset?: boolean },
) => void

export type OsFloor = 'today' | 'school' | 'create'

const FLOOR_SECTIONS: Record<OsFloor, readonly string[]> = {
  today: ['one', 'today', 'precision'],
  school: ['challenge', 'school', 'report', 'life'],
  create: ['works', 'studio'],
}

let scrollGen = 0
let scrollTimers: number[] = []
let mountGateUntil = 0
let mountGen = 0

function closeAllOsOverlays() {
  document.body.classList.remove('modal-open')
  document
    .querySelectorAll('.modal.open,.first-complete-overlay.open,.motion-comic-modal.open')
    .forEach((el) => {
      el.classList.remove('open')
      el.setAttribute('aria-hidden', 'true')
      if (el instanceof HTMLElement) el.inert = true
    })
}

export function cancelDawonSectionScroll() {
  scrollGen += 1
  for (const id of scrollTimers) window.clearTimeout(id)
  scrollTimers = []
}

function sectionIsHidden(el: Element | null) {
  if (!el || !(el instanceof HTMLElement)) return true
  if (!el.isConnected) return true
  const cs = getComputedStyle(el)
  return cs.display === 'none' || cs.visibility === 'hidden'
}

function stripInjectedNoscript(root: ParentNode) {
  root.querySelectorAll('noscript, .noscript-banner').forEach((n) => n.remove())
}

function htmlForFloor(floor?: OsFloor): string {
  const doc = new DOMParser().parseFromString(bodyHtml, 'text/html')
  stripInjectedNoscript(doc)
  if (!floor) return doc.body.innerHTML
  doc.querySelector('.topbar')?.remove()
  doc.querySelector('.home-ad-rail')?.remove()
  doc.querySelector('.floor-quick-nav')?.remove()
  doc.querySelector('.skip-link')?.remove()
  doc.querySelector('#menuModal')?.remove()
  doc.querySelector('footer')?.remove()
  const keep = new Set(FLOOR_SECTIONS[floor])
  const main = doc.getElementById('top')
  if (main) {
    ;[...main.children].forEach((child) => {
      if (child.tagName === 'SECTION' && !keep.has(child.id)) child.remove()
    })
  }
  return doc.body.innerHTML
}

export function openDawonStudioTab(page: string, root?: ParentNode | null) {
  const scope = root || document
  const tab = scope.querySelector(
    `.studio-tab[data-page="${CSS.escape(page)}"]`,
  ) as HTMLButtonElement | null
  tab?.click()
}

function stickyNavOffset(): number {
  const topbar = document.querySelector(
    '.dawon-os-root .topbar, .app-nav-header.dawon-os-topbar',
  ) as HTMLElement | null
  const banner = document.querySelector('.local-mode-banner') as HTMLElement | null
  let offset = 12
  if (topbar) offset += topbar.getBoundingClientRect().height
  const subnav = document.querySelector('.section-subnav') as HTMLElement | null
  if (subnav) {
    const cs = getComputedStyle(subnav)
    if (cs.display !== 'none' && cs.visibility !== 'hidden') {
      offset += subnav.getBoundingClientRect().height
    }
  }
  if (banner) {
    const cs = getComputedStyle(banner)
    if (cs.display !== 'none' && cs.visibility !== 'hidden') {
      offset += banner.getBoundingClientRect().height
    }
  }
  return Math.max(offset, 88)
}

/** Scroll a visible section into view below sticky nav. Cancels any in-flight scroll. */
export function scrollToDawonSection(
  idOrEl: string | Element | null | undefined,
  behavior: ScrollBehavior = 'auto',
) {
  cancelDawonSectionScroll()
  const gen = scrollGen
  const el =
    typeof idOrEl === 'string'
      ? document.getElementById(String(idOrEl).replace(/^#/, ''))
      : idOrEl
  if (!el || sectionIsHidden(el)) return

  const run = (mode: ScrollBehavior) => {
    if (gen !== scrollGen || sectionIsHidden(el)) return
    const offset = stickyNavOffset()
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top: Math.max(0, top), behavior: mode })
  }

  run(behavior)
  const later = (ms: number) => {
    const id = window.setTimeout(() => run('auto'), ms)
    scrollTimers.push(id)
  }
  later(behavior === 'smooth' ? 420 : 50)
  later(behavior === 'smooth' ? 900 : 120)
}

export const OS_SECTION_PATH: Record<string, string> = {
  top: '/',
  layers: '/',
  publisher: '/',
  guide: '/',
  one: '/today',
  today: '/today',
  precision: '/today',
  lifeMissions: '/today',
  onePrinciple: '/today',
  ideaLab: '/today',
  challenge: '/school',
  school: '/school',
  schoolProgram: '/school',
  report: '/school',
  life: '/school',
  audienceBridge: '/school',
  transfer: '/school',
  works: '/create',
  libraryBridge: '/create',
  studio: '/create',
  subscription: '/subscribe',
}

function goToSection(navigate: DawonNavigate, path: string, key: string) {
  navigate(
    { pathname: path, hash: `#${key}` },
    { preventScrollReset: true },
  )
}

function ensureNavigateHelper(navigate?: DawonNavigate) {
  window.dawonNavigateSection = (id: string) => {
    const key = String(id || '').replace(/^#/, '')
    if (!key) return
    const path = OS_SECTION_PATH[key]
    const here = window.location.pathname
    const el = document.getElementById(key)
    const visible = !sectionIsHidden(el)
    const mounting = Date.now() < mountGateUntil

    if (path && here !== path) {
      if (mounting || !navigate) return
      goToSection(navigate, path, key)
      return
    }
    if (!visible) {
      if (mounting) return
      if (path && navigate) {
        goToSection(navigate, path, key)
        return
      }
      return
    }
    scrollToDawonSection(key, 'auto')
  }
}

function patchInternalLinks(root: HTMLElement, navigate: DawonNavigate, signal?: AbortSignal) {
  const opts = signal ? { signal } : undefined
  root.addEventListener(
    'click',
    (e) => {
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
      if (a.target === '_blank') return
      e.preventDefault()
      navigate(href)
      return
    }
    if (href.startsWith('movie-studio')) {
      e.preventDefault()
      const url = href.startsWith('/') ? href : `/${href.replace(/\.html/, '')}`
      if (a.target === '_blank') {
        window.open(url.replace('movie-studio.html', 'movie-studio'), '_blank', 'noopener')
        return
      }
      navigate(url.replace('movie-studio.html', 'movie-studio'))
      return
    }
    if (href.startsWith('#')) {
      const id = href.slice(1)
      const target = root.querySelector(`#${CSS.escape(id)}`)
      const path = OS_SECTION_PATH[id]
      if (path && (!target || sectionIsHidden(target))) {
        e.preventDefault()
        navigate(`${path}#${id}`)
        return
      }
      if (target) {
        e.preventDefault()
        window.dawonNavigateSection?.(id)
      }
    }
  },
    opts,
  )
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
    if (chip instanceof HTMLElement) chip.hidden = true
    return
  }
  btn.hidden = false

  if (state.email) {
    const label = state.email.split('@')[0] || state.email
    btn.textContent = dawonT('logout', getDawonLang())
    if (name) name.textContent = label
    if (chip instanceof HTMLElement) {
      chip.hidden = false
      chip.classList.add('show')
    }
    dot?.classList.add('online')
  } else {
    btn.textContent = dawonT('login', getDawonLang())
    if (chip instanceof HTMLElement) {
      chip.hidden = true
      chip.classList.remove('show')
    }
    dot?.classList.remove('online')
  }
}

function bindAccountControl(
  el: HTMLElement | null,
  navigate: DawonNavigate,
  auth?: { isLoggedIn: () => boolean; onSignOut: () => void },
  mode: 'button' | 'chip' = 'button',
  signal?: AbortSignal,
) {
  if (!el) return
  const opts = signal ? { capture: true, signal } : { capture: true }
  el.addEventListener(
    'click',
    (e) => {
      e.preventDefault()
      e.stopImmediatePropagation()
      if (auth?.isLoggedIn()) {
        if (mode === 'button') auth.onSignOut()
        else navigate('/subscribe')
        return
      }
      navigate('/login')
    },
    opts,
  )
}

function bridgeChrome(
  root: HTMLElement,
  navigate: DawonNavigate,
  auth?: { isLoggedIn: () => boolean; onSignOut: () => void },
  signal?: AbortSignal,
) {
  bindAccountControl(root.querySelector('#accountBtn'), navigate, auth, 'button', signal)
  bindAccountControl(root.querySelector('#accountChip'), navigate, auth, 'chip', signal)

  root.querySelectorAll('a[href="#subscription"]').forEach((el) => {
    const linkOpts = signal ? { signal } : undefined
    el.addEventListener(
      'click',
      (e) => {
        const target = root.querySelector('#subscription')
        if (target) {
          e.preventDefault()
          window.dawonNavigateSection?.('subscription')
        } else {
          e.preventDefault()
          navigate('/subscribe')
        }
      },
      linkOpts,
    )
  })
}

function syncHomeTheme() {
  try {
    const saved =
      localStorage.getItem('dawon_theme_v28') || localStorage.getItem(THEME_KEY) || 'light'
    document.documentElement.dataset.theme = saved === 'dark' ? 'dark' : 'light'
    document.body.classList.remove('dark')
  } catch {
    document.body.classList.remove('dark')
  }
}

export type DawonOsAccessState = {
  authenticated: boolean
  active: boolean
  planName?: string
  endsAt?: string | null
}

export function syncDawonOsAccess(state: DawonOsAccessState) {
  window.dawonSetAccessState?.({
    authenticated: state.authenticated,
    active: state.active,
    // Store locale-neutral keys; renderSubscription localizes for display.
    planName: state.planName || (state.active ? 'Paid' : 'Free'),
    endsAt: state.endsAt ?? null,
  })
}

function runOsScripts() {
  if (window.Dawon?.bindPage) {
    window.Dawon.bindPage()
    window.Dawon.bindFeatures?.()
    return
  }
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
  access?: DawonOsAccessState
}

function syncBusinessDisclosure(root: HTMLElement) {
  const { business, urls } = siteConfig
  const setText = (id: string, value: string) => {
    const el = root.querySelector(`#${id}`)
    if (el) el.textContent = value
  }
  setText('bizName', business.companyName)
  setText('bizRepresentative', business.representative)
  setText('bizRegistration', business.businessNumber)
  setText('bizEcommerce', business.mailOrderNumber)
  setText('bizAuthority', business.mailOrderAuthority)
  setText('bizPublishing', business.publishingCertificate)
  setText('bizPublishingAuthority', business.publishingAuthority)
  setText('bizAddress', business.address)
  setText('bizPhone', business.phone)
  setText('bizEmail', business.email)

  const lead = root.querySelector('.business-disclosure-lead')
  if (lead) {
    lead.innerHTML = `<b>${business.companyName}</b> · 사업자 ${business.businessNumber} · 고객센터 ${business.phone}`
  }
  root.querySelectorAll('.business-grid > div').forEach((row) => {
    const label = row.querySelector('b')?.textContent?.trim()
    if (label === '홈페이지') {
      const span = row.querySelector('span')
      if (span) span.innerHTML = `<a href="${urls.home}">www.dawon84.com</a>`
    }
  })
}

/** Mount DAWON OS HTML + non-payment scripts. Payments stay on React /subscribe. */
export function mountDawonOs(
  host: HTMLElement,
  navigate: DawonNavigate,
  auth?: MountAuth,
  floor?: OsFloor,
): () => void {
  cancelDawonSectionScroll()
  const gen = ++mountGen
  mountGateUntil = Date.now() + 450
  closeAllOsOverlays()
  syncHomeTheme()
  ensureNavigateHelper(navigate)
  host.classList.add('dawon-os-root')
  if (floor) host.classList.add('os-floor-page', `os-page-${floor}`)
  host.innerHTML = htmlForFloor(floor)
  stripInjectedNoscript(host)
  syncBusinessDisclosure(host)
  const mountAbort = new AbortController()
  patchInternalLinks(host, navigate, mountAbort.signal)
  bridgeChrome(host, navigate, auth, mountAbort.signal)

  // Integration mode: unlock first-run before scripts so they do not auto-scroll to #one.
  // (scripts.raw.js setStep(1) scrolls to 오늘설계 when first-run-focus is active.)
  try {
    localStorage.setItem('dawon_v17_first_core_complete', '1')
  } catch {
    /* ignore quota / private mode */
  }

  runOsScripts()
  installDawonI18n(host, mountAbort.signal)
  const unmountEmo = mountEmoticonPicker(host)
  queueMicrotask(() => {
    window.Dawon?.bindFeatures?.()
  })
  const search = new URLSearchParams(window.location.search)
  const studioTab = search.get('tab')
  const bookId = search.get('book')
  const dvsHost =
    floor === 'today' || floor === 'school'
      ? null
      : host.querySelector('#dawon-video-studio-root')
  let dvsRoot: Root | null = null
  if (dvsHost) {
    dvsRoot = createRoot(dvsHost)
    dvsRoot.render(createElement(DawonVideoStudio, { embedded: true, bookId }))
  }
  if ((studioTab || bookId) && floor !== 'today' && floor !== 'school') {
    openDawonStudioTab(studioTab || 'video', host)
  }
  ensureNavigateHelper(navigate)
  syncHomeTheme()
  if (auth) syncDawonOsAccount(host, auth.account)
  if (auth?.access) syncDawonOsAccess(auth.access)

  // Keep full OS navigable (first-run focus hides major sections/nav).
  document.body.classList.remove('first-run-focus', 'first-step-1', 'first-step-2')
  closeAllOsOverlays()

  return () => {
    const cleanupGen = gen
    cancelDawonSectionScroll()
    mountAbort.abort()
    unmountEmo()
    dvsRoot?.unmount()
    closeAllOsOverlays()
    host.classList.remove('os-floor-page', 'os-page-today', 'os-page-school', 'os-page-create')
    queueMicrotask(() => {
      // Skip stale cleanup when switching /today ↔ /school ↔ /create on the same host.
      if (cleanupGen !== mountGen) return
      if (host.isConnected) host.innerHTML = ''
      host.classList.remove('dawon-os-root')
    })
  }
}
