import { useEffect, useMemo, useState } from 'react'
import { PATH_CARDS, type PathCategory } from '../data/paths'
import { getComicUrl } from '../data/comicFiles'
import { EbookViewer } from './EbookViewer'

const TABS: { value: PathCategory | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'life', label: '생활실천' },
  { value: 'mind', label: '마음정리' },
  { value: 'relation', label: '관계·가족' },
  { value: 'future', label: '공부·일·미래' },
  { value: 'age', label: '생애주기' },
]

export function ComicLibraryPage() {
  const [tab, setTab] = useState<PathCategory | 'all'>('all')
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PATH_CARDS.filter((card) => {
      const matchesTab = tab === 'all' || card.category === tab
      const searchable = `${card.title} ${card.description} ${card.tag}`.toLowerCase()
      return matchesTab && (!q || searchable.includes(q))
    })
  }, [query, tab])

  const activeCard = activeId ? PATH_CARDS.find((card) => card.id === activeId) ?? null : null
  const activePdf = activeId ? getComicUrl(activeId) : null

  useEffect(() => {
    if (!activeId) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [activeId])

  return (
    <section className="section" id="comics">
      <div className="wrap">
        <div className="section-head">
          <div className="copy">
            <span className="eyebrow">다원 만화전자책</span>
            <h2 style={{ marginTop: 16 }}>그림으로 만나는 50개의 길</h2>
          </div>
          <p>읽고 싶은 만화를 선택하면 전자책 뷰어에서 페이지를 넘기며 볼 수 있습니다.</p>
        </div>

        <div className="path-tabs" role="tablist" aria-label="만화전자책 분류">
          {TABS.map((item) => (
            <button
              key={item.value}
              className={`path-tab ${tab === item.value ? 'active' : ''}`}
              type="button"
              onClick={() => setTab(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="path-toolbar">
          <label className="path-search" aria-label="만화전자책 검색">
            <span>⌕</span>
            <input
              type="search"
              placeholder="만화 제목·주제 검색"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <span className="path-count">{filtered.length}개 만화</span>
        </div>

        <div className="path-grid">
          {filtered.map((card) => (
            <article
              key={card.id}
              className="card path-card path-card-btn comic-card"
              role="button"
              tabIndex={0}
              onClick={() => setActiveId(card.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setActiveId(card.id)
                }
              }}
              aria-label={`${card.title} 만화전자책 보기`}
            >
              <div className="comic-card-icon" aria-hidden="true">💬</div>
              <span className="path-no">{card.pathNo}</span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <span className="tag">만화전자책</span>
              <span className="path-open-hint">클릭하여 만화 보기 →</span>
            </article>
          ))}
        </div>
      </div>

      {activeCard && activePdf ? (
        <EbookViewer
          url={activePdf}
          title={activeCard.title}
          subtitle={`${activeCard.pathNo} · 만화전자책`}
          onClose={() => setActiveId(null)}
        />
      ) : null}
    </section>
  )
}
