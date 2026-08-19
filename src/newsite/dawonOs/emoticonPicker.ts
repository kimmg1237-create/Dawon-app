import './emoticonPicker.css'

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

function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto =
    el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  if (setter) setter.call(el, value)
  else el.value = value
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
    /* some input types ignore selection */
  }
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
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
  pop.setAttribute('aria-label', '다원 이모티콘')
  root.appendChild(pop)

  function renderPop() {
    const cats = categories(items)
    const shown = items.filter((i) => i.category === currentCat)
    pop.innerHTML = `
      <div class="dawon-emo-pop-head">
        <strong>다원 이모티콘</strong>
        <button type="button" class="dawon-emo-close" aria-label="닫기">×</button>
      </div>
      <div class="dawon-emo-cats" role="tablist">
        ${cats
          .map(
            ([name]) =>
              `<button type="button" class="dawon-emo-cat${name === currentCat ? ' active' : ''}" data-cat="${name}">${name}</button>`,
          )
          .join('')}
      </div>
      <div class="dawon-emo-grid">
        ${shown
          .map(
            (item) =>
              `<button type="button" class="dawon-emo-item" data-id="${item.id}" title="${item.label}">
                <img src="${item.src}" alt="${item.label}" width="72" height="72" loading="lazy">
                <span>${item.label}</span>
              </button>`,
          )
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

  function placeButton(
    field: HTMLInputElement | HTMLTextAreaElement,
    btn: HTMLButtonElement,
  ) {
    const fieldWrap = field.closest('.field, .compact-field, .question, .form-group, .survey-field')
    const labelRow = field.closest('.field')?.querySelector('.label-row, .precision-domain-head')
    const compactLabel = fieldWrap?.querySelector(':scope > label')
    const prev = field.previousElementSibling

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
    field.insertAdjacentElement('beforebegin', btn)
  }

  function attachButton(field: HTMLInputElement | HTMLTextAreaElement) {
    if (field.dataset.emoReady) return
    if (!isWritableField(field)) return
    field.dataset.emoReady = '1'
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'dawon-emo-btn'
    btn.setAttribute('aria-label', '이모티콘 넣기')
    btn.textContent = '이모티콘'
    placeButton(field, btn)
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      active = field
      field.focus()
      if (!pop.hidden && pop.dataset.for === field.id) {
        closePop()
        return
      }
      pop.dataset.for = field.id || field.name || 'field'
      openPop(btn)
    })
    field.addEventListener('focus', () => {
      active = field
    })
  }

  function scanFields(scope: ParentNode = root) {
    scope.querySelectorAll('textarea, input').forEach((el) => {
      if (isWritableField(el)) attachButton(el)
    })
  }

  scanFields(document)

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return
        if (node.matches('textarea, input') && isWritableField(node)) {
          attachButton(node)
          return
        }
        scanFields(node)
      })
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })

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
      insertAtCursor(active, `[[emo:${item.dataset.id}]]`)
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

  return () => {
    observer.disconnect()
    document.removeEventListener('mousedown', onDoc)
    pop.remove()
    document.querySelectorAll('.dawon-emo-btn').forEach((b) => b.remove())
    document.querySelectorAll('[data-emo-ready]').forEach((el) => {
      delete (el as HTMLElement).dataset.emoReady
    })
  }
}
