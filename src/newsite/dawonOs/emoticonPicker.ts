import './emoticonPicker.css'
import { currentEmoLang, emoCat, emoLabel } from './emoI18n'

type EmoticonItem = {
  id: string
  label: string
  category: string
  file: string
  src: string
}

const SKIP_TYPES = new Set([
  'hidden',
  'file',
  'range',
  'checkbox',
  'radio',
  'number',
  'email',
  'password',
  'url',
  'date',
  'datetime-local',
  'color',
  'month',
  'week',
  'time',
  'search',
])

const SKIP_IDS = new Set([
  'importJson',
  'stockCsv',
  'workAdminUrl',
  'workAdminAudioUrl',
  'workAdminVideoUrl',
  'worksSearch',
  'registerPassword',
  'registerEmail',
  'loginEmail',
  'loginPassword',
])

let globalDispose: (() => void) | null = null

function isWritableField(el: Element): el is HTMLInputElement | HTMLTextAreaElement {
  if (el.closest('.dawon-emo-pop')) return false
  if (el instanceof HTMLTextAreaElement) {
    return !SKIP_IDS.has(el.id)
  }
  if (!(el instanceof HTMLInputElement)) return false
  if (SKIP_IDS.has(el.id)) return false
  const type = (el.type || 'text').toLowerCase()
  if (SKIP_TYPES.has(type)) return false
  if (el.disabled || el.readOnly) return false
  return true
}

const EMO_TOKEN = /\[\[emo:?(\d{2})\]\]/g
const mirrors = new WeakMap<HTMLInputElement | HTMLTextAreaElement, HTMLElement>()
const flushHandlers = new WeakMap<HTMLInputElement | HTMLTextAreaElement, () => void>()

declare global {
  interface Window {
    __dawonFlushEmoticonField?: (field: HTMLInputElement | HTMLTextAreaElement) => void
    __dawonFlushEmoticons?: (root?: ParentNode) => void
  }
}

export function flushEmoticonField(field: HTMLInputElement | HTMLTextAreaElement) {
  flushHandlers.get(field)?.()
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] || ch,
  )
}

function nativeValueDescriptor(el: HTMLInputElement | HTMLTextAreaElement) {
  const proto =
    el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  return Object.getOwnPropertyDescriptor(proto, 'value')
}

function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const setter = nativeValueDescriptor(el)?.set
  if (setter) setter.call(el, value)
  else el.value = value
}

function tokensToHtml(raw: string) {
  return escapeHtml(raw).replace(
    EMO_TOKEN,
    (_m, id: string) =>
      `<img class="dawon-emo" src="/emoticons/${id}.png" alt="" data-emo-id="${id}" draggable="false">`,
  ).replace(/\n/g, '<br>')
}

function htmlToTokens(root: HTMLElement) {
  let out = ''
  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent || ''
      return
    }
    if (!(node instanceof HTMLElement)) return
    if (node.matches('img[data-emo-id]')) {
      out += `[[emo:${node.dataset.emoId}]]`
      return
    }
    if (node.tagName === 'BR') {
      out += '\n'
      return
    }
    if (node.tagName === 'DIV' || node.tagName === 'P') {
      if (out && !out.endsWith('\n')) out += '\n'
    }
    node.childNodes.forEach(walk)
  }
  walk(root)
  return out.replace(/\u00a0/g, ' ')
}

export function flushAllEmoticonFields(root: ParentNode = document.body) {
  root.querySelectorAll('.dawon-emo-src').forEach((el) => {
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      flushEmoticonField(el)
    }
  })
}

function isReactField(el: Element) {
  return Object.keys(el).some((key) => key.startsWith('__react'))
}

function isPickerMutation(node: Node) {
  if (!(node instanceof HTMLElement)) return false
  return Boolean(
    node.closest('.dawon-emo-wrap, .dawon-emo-pop, .dawon-emo-btn') ||
      node.classList.contains('dawon-emo-wrap') ||
      node.classList.contains('dawon-emo-pop') ||
      node.classList.contains('dawon-emo-btn') ||
      node.classList.contains('dawon-emo-mirror'),
  )
}

function insertAtCursor(el: HTMLInputElement | HTMLTextAreaElement, snippet: string) {
  el.focus()
  const start = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? el.value.length
  const next = el.value.slice(0, start) + snippet + el.value.slice(end)
  setNativeValue(el, next)
  const pos = start + snippet.length
  try {
    el.setSelectionRange(pos, pos)
  } catch {
    /* ignore */
  }
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
}

function insertEmoticonImage(host: HTMLElement, id: string) {
  const img = document.createElement('img')
  img.className = 'dawon-emo'
  img.src = `/emoticons/${id}.png`
  img.alt = ''
  img.dataset.emoId = id
  img.draggable = false
  host.focus()
  const sel = window.getSelection()
  if (sel && sel.rangeCount && host.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0)
    range.deleteContents()
    range.insertNode(img)
    range.setStartAfter(img)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
  } else {
    host.appendChild(img)
  }
}

function categories(items: EmoticonItem[]) {
  const map = new Map<string, EmoticonItem[]>()
  for (const item of items) {
    const list = map.get(item.category) ?? []
    list.push(item)
    map.set(item.category, list)
  }
  return [...map.entries()]
}

export function ensureGlobalEmoticonPicker(): () => void {
  if (globalDispose) return globalDispose
  globalDispose = mountEmoticonPicker(document.body)
  return globalDispose
}

export function mountEmoticonPicker(root: HTMLElement): () => void {
  let cancelled = false
  let disposeInner: (() => void) | null = null

  void fetch('/emoticons/index.json')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no-catalog'))))
    .then((data: { items?: EmoticonItem[] }) => {
      if (cancelled) return
      const items = data.items ?? []
      if (!items.length) return
      disposeInner = bindPicker(root, items)
    })
    .catch(() => {
      /* catalog missing — skip picker */
    })

  return () => {
    cancelled = true
    disposeInner?.()
    if (globalDispose && root === document.body) globalDispose = null
  }
}

function bindPicker(root: HTMLElement, items: EmoticonItem[]): () => void {
  const useFixed = root === document.body
  let active: HTMLInputElement | HTMLTextAreaElement | null = null
  let currentCat = categories(items)[0]?.[0] ?? ''

  const pop = document.createElement('div')
  pop.className = 'dawon-emo-pop'
  if (useFixed) pop.classList.add('dawon-emo-pop-fixed')
  pop.hidden = true
  pop.setAttribute('role', 'dialog')
  pop.setAttribute('aria-label', window.__dawonI18n?.t?.('emoTitle', '다원 이모티콘') || '다원 이모티콘')
  root.appendChild(pop)

  function renderPop() {
    const cats = categories(items)
    const shown = items.filter((i) => i.category === currentCat)
    const lang = currentEmoLang()
    const title = window.__dawonI18n?.t?.('emoTitle', '다원 이모티콘') || '다원 이모티콘'
    const closeLabel = window.__dawonI18n?.t?.('close', '닫기') || '닫기'
    pop.setAttribute('aria-label', title)
    pop.innerHTML = `
      <div class="dawon-emo-pop-head">
        <strong>${title}</strong>
        <button type="button" class="dawon-emo-close" aria-label="${closeLabel}">×</button>
      </div>
      <div class="dawon-emo-cats" role="tablist">
        ${cats
          .map(
            ([name]) =>
              `<button type="button" class="dawon-emo-cat${name === currentCat ? ' active' : ''}" data-cat="${name}">${emoCat(lang, name)}</button>`,
          )
          .join('')}
      </div>
      <div class="dawon-emo-grid">
        ${shown
          .map((item) => {
            const label = emoLabel(lang, item.id, item.label)
            return `<button type="button" class="dawon-emo-item" data-id="${item.id}" title="${label}">
                <img src="${item.src}" alt="${label}" width="72" height="72" loading="lazy">
                <span>${label}</span>
              </button>`
          })
          .join('')}
      </div>
    `
  }

  function openPop(anchor: HTMLElement) {
    renderPop()
    pop.hidden = false
    const r = anchor.getBoundingClientRect()
    if (useFixed) {
      const top = Math.min(r.bottom + 8, window.innerHeight - 420)
      const left = Math.max(8, Math.min(r.left, window.innerWidth - 348))
      pop.style.top = `${Math.max(8, top)}px`
      pop.style.left = `${left}px`
      return
    }
    const host = root.getBoundingClientRect()
    const top = r.bottom - host.top + 8
    const left = Math.max(8, Math.min(r.left - host.left, host.width - 340))
    pop.style.top = `${top}px`
    pop.style.left = `${left}px`
  }

  function closePop() {
    pop.hidden = true
  }

  function wrapField(field: HTMLInputElement | HTMLTextAreaElement) {
    if (isReactField(field) || !field.closest('.dawon-os-root')) return null
    const existing = field.closest('.dawon-emo-wrap')
    if (existing) {
      return (mirrors.get(field) || existing.querySelector('.dawon-emo-mirror')) as HTMLElement | null
    }
    try {
    const wrap = document.createElement('div')
    wrap.className = `dawon-emo-wrap${field instanceof HTMLTextAreaElement ? ' is-multiline' : ' is-single'}`
    field.classList.add('dawon-emo-src')
    field.tabIndex = -1
    field.parentNode?.insertBefore(wrap, field)
    wrap.appendChild(field)

    const mirror = document.createElement('div')
    mirror.className = 'dawon-emo-mirror'
    mirror.contentEditable = 'true'
    mirror.setAttribute('role', 'textbox')
    if (field instanceof HTMLTextAreaElement) mirror.setAttribute('aria-multiline', 'true')
    if (field.getAttribute('aria-label')) {
      mirror.setAttribute('aria-label', field.getAttribute('aria-label') || '')
    }
    const placeholder = field.getAttribute('placeholder')
    if (placeholder) mirror.dataset.placeholder = placeholder
    wrap.appendChild(mirror)

    let syncing = false
    function pull() {
      if (syncing) return
      if (document.activeElement === mirror) return
      const html = tokensToHtml(field.value)
      if (mirror.innerHTML !== html) mirror.innerHTML = html || ''
    }
    function push(silent = false) {
      if (syncing) return
      syncing = true
      setNativeValue(field, htmlToTokens(mirror))
      if (!silent) {
        field.dispatchEvent(new Event('input', { bubbles: true }))
        field.dispatchEvent(new Event('change', { bubbles: true }))
      }
      syncing = false
    }

    const desc = nativeValueDescriptor(field)
    if (desc?.get && desc.set) {
      Object.defineProperty(field, 'value', {
        configurable: true,
        get() {
          return desc.get!.call(field)
        },
        set(next: string) {
          desc.set!.call(field, next ?? '')
          pull()
        },
      })
    }

    field.focus = () => {
      if (document.activeElement === mirror) return
      mirror.focus()
    }

    flushHandlers.set(field, () => push(true))
    mirror.addEventListener('input', () => push(false))
    mirror.addEventListener('blur', () => push(true))
    mirror.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !(field instanceof HTMLTextAreaElement)) {
        e.preventDefault()
      }
    })
    field.addEventListener('focus', () => {
      if (document.activeElement !== mirror) mirror.focus()
    })
    pull()
    mirrors.set(field, mirror)
    return mirror
    } catch (error) {
      console.warn('이모티콘 입력칸을 이미지 모드로 바꾸지 못했습니다.', error)
      return null
    }
  }

  function placeButton(
    field: HTMLInputElement | HTMLTextAreaElement,
    btn: HTMLButtonElement,
  ) {
    const wrap = field.closest('.dawon-emo-wrap')
    const fieldWrap = field.closest('.field, .compact-field, .question, .form-group, .survey-field')
    const labelRow = field.closest('.field')?.querySelector('.label-row, .precision-domain-head')
    const compactLabel = fieldWrap?.querySelector(':scope > label')
    const prev = wrap?.previousElementSibling || field.previousElementSibling

    if (labelRow) {
      labelRow.appendChild(btn)
      return
    }
    if (compactLabel) {
      compactLabel.appendChild(btn)
      return
    }
    if (prev?.tagName === 'LABEL') {
      prev.appendChild(btn)
      return
    }
    if (prev && (prev.classList.contains('label-row') || prev.classList.contains('precision-domain-head'))) {
      prev.appendChild(btn)
      return
    }
    ;(wrap || field).insertAdjacentElement('beforebegin', btn)
  }

  function attachButton(field: HTMLInputElement | HTMLTextAreaElement) {
    if (field.dataset.emoReady) return
    if (!isWritableField(field)) return
    try {
      field.dataset.emoReady = '1'
      if (!isReactField(field) && field.closest('.dawon-os-root')) wrapField(field)
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'dawon-emo-btn'
      btn.setAttribute('aria-label', window.__dawonI18n?.t?.('emoInsert', '이모티콘 넣기') || '이모티콘 넣기')
      btn.textContent = window.__dawonI18n?.t?.('emoShort', '이모티콘') || '이모티콘'
      placeButton(field, btn)
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        active = field
        const host = wrapField(field)
        host?.focus()
        if (!host) field.focus()
        const key = field.id || field.name || `field-${items.length}`
        if (!pop.hidden && pop.dataset.for === key) {
          closePop()
          return
        }
        pop.dataset.for = key
        openPop(btn)
      })
      field.addEventListener('focus', () => {
        active = field
      })
    } catch (error) {
      delete field.dataset.emoReady
      console.warn('이모티콘 버튼을 붙이지 못했습니다.', error)
    }
  }

  function scanFields(scope: ParentNode = root) {
    scope.querySelectorAll('textarea, input').forEach((el) => {
      if (isWritableField(el)) attachButton(el)
    })
  }

  window.__dawonFlushEmoticonField = flushEmoticonField
  window.__dawonFlushEmoticons = flushAllEmoticonFields

  const observeTarget = useFixed ? document.body : root
  scanFields(observeTarget)

  let scanScheduled = false
  const pendingScanRoots = new Set<ParentNode>()

  function scheduleScan(scope: ParentNode) {
    pendingScanRoots.add(scope)
    if (scanScheduled) return
    scanScheduled = true
    requestAnimationFrame(() => {
      scanScheduled = false
      pendingScanRoots.forEach((scopeRoot) => scanFields(scopeRoot))
      pendingScanRoots.clear()
    })
  }

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (isPickerMutation(node)) return
        if (!(node instanceof HTMLElement)) return
        if (node.matches('textarea, input') && isWritableField(node)) {
          attachButton(node)
          return
        }
        if (node.querySelector?.('textarea, input')) scheduleScan(node)
      })
    }
  })
  observer.observe(observeTarget, { childList: true, subtree: true })

  pop.addEventListener('click', (e) => {
    const t = e.target as HTMLElement
    if (t.closest('.dawon-emo-close')) {
      closePop()
      return
    }
    const cat = t.closest('[data-cat]') as HTMLElement | null
    if (cat?.dataset.cat) {
      currentCat = cat.dataset.cat
      renderPop()
      return
    }
    const item = t.closest('[data-id]') as HTMLElement | null
    if (item?.dataset.id && active) {
      const id = item.dataset.id
      const host = wrapField(active)
      if (host) {
        insertEmoticonImage(host, id)
        flushEmoticonField(active)
        active.dispatchEvent(new Event('input', { bubbles: true }))
        active.dispatchEvent(new Event('change', { bubbles: true }))
      } else {
        insertAtCursor(active, `[[emo:${id}]]`)
      }
    }
  })

  const onDoc = (e: MouseEvent) => {
    if (pop.hidden) return
    const t = e.target as Node
    if (pop.contains(t)) return
    if (t instanceof Element && t.closest('.dawon-emo-btn')) return
    closePop()
  }
  document.addEventListener('mousedown', onDoc)

  const onLang = () => {
    if (!pop.hidden) renderPop()
    document.querySelectorAll('.dawon-emo-btn').forEach((btn) => {
      const t = window.__dawonI18n?.t
      if (!t) return
      btn.setAttribute('aria-label', t('emoInsert', '이모티콘 넣기'))
      btn.textContent = t('emoShort', '이모티콘')
    })
  }
  window.addEventListener('dawon-lang-changed', onLang)

  return () => {
    observer.disconnect()
    document.removeEventListener('mousedown', onDoc)
    window.removeEventListener('dawon-lang-changed', onLang)
    if (window.__dawonFlushEmoticonField === flushEmoticonField) {
      delete window.__dawonFlushEmoticonField
    }
    if (window.__dawonFlushEmoticons === flushAllEmoticonFields) {
      delete window.__dawonFlushEmoticons
    }
    pop.remove()
    document.querySelectorAll('.dawon-emo-btn').forEach((b) => b.remove())
    document.querySelectorAll('.dawon-emo-wrap').forEach((wrap) => {
      const field = wrap.querySelector('.dawon-emo-src')
      if (field instanceof HTMLElement) {
        field.classList.remove('dawon-emo-src')
        wrap.parentNode?.insertBefore(field, wrap)
      }
      wrap.remove()
    })
    document.querySelectorAll('[data-emo-ready]').forEach((el) => {
      delete (el as HTMLElement).dataset.emoReady
    })
  }
}
