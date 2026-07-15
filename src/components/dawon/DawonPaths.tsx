import { useEffect, useMemo, useState } from 'react'
import { PATH_CARDS, type PathCategory } from '../../data/paths'
import { getEbookUrl } from '../../data/ebookFiles'

const TABS: { value: PathCategory | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'life', label: '생활실천' },
  { value: 'mind', label: '마음정리' },
  { value: 'relation', label: '관계·가족' },
  { value: 'future', label: '공부·일·미래' },
  { value: 'age', label: '생애주기' },
]

export function DawonPaths() {
  const [tab, setTab] = useState<PathCategory | 'all'>('all')
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PATH_CARDS.filter((card) => {
      const matchesTab = tab === 'all' || card.category === tab
      const searchable = `${card.searchTitle} ${card.title} ${card.description} ${card.tag}`.toLowerCase()
      const matchesQuery = !q || searchable.includes(q)
      return matchesTab && matchesQuery
    })
  }, [tab, query])

  const activeCard = activeId ? PATH_CARDS.find((c) => c.id === activeId) ?? null : null
  const activePdf = activeId ? getEbookUrl(activeId) : null

  useEffect(() => {
    if (!activeId) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setActiveId(null)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [activeId])

  function openEbook(pathId: string) {
    const url = getEbookUrl(pathId)
    if (!url) {
      alert('이 길의 PDF가 아직 준비되지 않았습니다.')
      return
    }
    setActiveId(pathId)
  }

  return (
    <section className="section" id="paths">
      <div className="wrap">
        <div className="section-head">
          <div className="copy">
            <span className="eyebrow">50개의 길</span>
            <h2 style={{ marginTop: 16 }}>한 권의 지도와 50개의 길</h2>
          </div>
          <p>
            대표 도서 《나는 내 생활의 설계자》가 전체 지도가 되고, 50권은 지금 필요한 주제로 깊이 들어가는 각각의 길이
            됩니다. 아래 카드를 누르면 전자책(PDF)이 열립니다.
          </p>
        </div>

        <div className="path-tabs" role="tablist" aria-label="50개 길 분류">
          {TABS.map((t) => (
            <button
              key={t.value}
              className={`path-tab ${tab === t.value ? 'active' : ''}`}
              type="button"
              onClick={() => setTab(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="path-toolbar">
          <label className="path-search" aria-label="50개의 길 검색">
            <span>⌕</span>
            <input
              type="search"
              placeholder="책 제목·주제 검색"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <span className="path-count">{filtered.length}개 항목</span>
        </div>

        <div className="path-grid">
          {filtered.map((card) => {
            const hasPdf = Boolean(getEbookUrl(card.id))
            return (
              <article
                key={card.id}
                className={`card path-card path-card-btn ${hasPdf ? '' : 'no-pdf'}`}
                data-category={card.category}
                data-title={card.searchTitle}
                role="button"
                tabIndex={0}
                onClick={() => openEbook(card.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openEbook(card.id)
                  }
                }}
                aria-label={`${card.title} 전자책 보기`}
              >
                <span className="path-no">{card.pathNo}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <span className="tag">{card.tag}</span>
                <span className="path-open-hint">{hasPdf ? '클릭하여 PDF 보기 →' : 'PDF 준비 중'}</span>
              </article>
            )
          })}
        </div>
      </div>

      {activeCard && activePdf && (
        <div
          className="ebook-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeCard.title} 전자책`}
          onClick={() => setActiveId(null)}
        >
          <div className="ebook-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="ebook-modal-bar">
              <div>
                <strong>{activeCard.title}</strong>
                <span>{activeCard.pathNo}</span>
              </div>
              <div className="ebook-modal-actions">
                <a className="btn btn-soft btn-small" href={activePdf} target="_blank" rel="noopener noreferrer">
                  새 탭에서 열기
                </a>
                <button type="button" className="btn btn-primary btn-small" onClick={() => setActiveId(null)}>
                  닫기
                </button>
              </div>
            </div>
            <iframe title={`${activeCard.title} PDF`} src={`${activePdf}#toolbar=1`} className="ebook-frame" />
          </div>
        </div>
      )}
    </section>
  )
}
