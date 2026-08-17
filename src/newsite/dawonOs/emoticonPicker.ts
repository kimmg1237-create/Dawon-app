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

function isWritableField(el: Element): el is HTMLInputElement | HTMLTextAreaElement {
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

function insertAtCursor(el: HTMLInputElement | HTMLTextAreaElement, snippet: string) {
  el.focus()
  const start = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? el.value.length
  const next = el.value.slice(0, start) + snippet + el.value.slice(end)
  el.value = next
  const pos = start + snippet.length
  try {
    el.setSelectionRange(pos, pos)
  } catch {
    /* some input types ignore selection */
  }
  el.dispatchEvent(new Event('input', { bubbles: true }))
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
  }
}

function bindPicker(root: HTMLElement, items: EmoticonItem[]): () => void {

  const fields = [...root.querySelectorAll('textarea, input')].filter(isWritableField)
  let active: HTMLInputElement | HTMLTextAreaElement | null = null
  let currentCat = categories(items)[0]?.[0] ?? ''

  const pop = document.createElement('div')
  pop.className = 'dawon-emo-pop'
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
    const host = root.getBoundingClientRect()
    const top = r.bottom - host.top + 8
    const left = Math.max(8, Math.min(r.left - host.left, host.width - 340))
    pop.style.top = `${top}px`
    pop.style.left = `${left}px`
  }

  function closePop() {
    pop.hidden = true
  }

  function attachButton(field: HTMLInputElement | HTMLTextAreaElement) {
    if (field.dataset.emoReady) return
    field.dataset.emoReady = '1'
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'dawon-emo-btn'
    btn.setAttribute('aria-label', '이모티콘 넣기')
    btn.textContent = '이모티콘'
    const row =
      field.closest('.field')?.querySelector('.label-row, .precision-domain-head, label') ??
      field.previousElementSibling
    if (row && row.parentElement) {
      if (row.classList.contains('label-row') || row.classList.contains('precision-domain-head')) {
        row.appendChild(btn)
      } else if (row.tagName === 'LABEL') {
        const wrap = document.createElement('div')
        wrap.className = 'label-row'
        row.replaceWith(wrap)
        wrap.appendChild(row)
        wrap.appendChild(btn)
      } else {
        field.insertAdjacentElement('beforebegin', btn)
      }
    } else {
      field.insertAdjacentElement('beforebegin', btn)
    }
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      active = field
      field.focus()
      if (!pop.hidden && pop.dataset.for === field.id) {
        closePop()
        return
      }
      pop.dataset.for = field.id
      openPop(btn)
    })
    field.addEventListener('focus', () => {
      active = field
    })
  }

  fields.forEach(attachButton)

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
    document.removeEventListener('mousedown', onDoc)
    pop.remove()
    root.querySelectorAll('.dawon-emo-btn').forEach((b) => b.remove())
  }
}
