import { useMemo, useState } from 'react'
import { PATH_CARDS, type PathCategory } from '../../data/paths'

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PATH_CARDS.filter((card) => {
      const matchesTab = tab === 'all' || card.category === tab
      const searchable = `${card.searchTitle} ${card.title} ${card.description} ${card.tag}`.toLowerCase()
      const matchesQuery = !q || searchable.includes(q)
      return matchesTab && matchesQuery
    })
  }, [tab, query])

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
            됩니다.
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
          {filtered.map((card) => (
            <article key={card.id} className="card path-card" data-category={card.category} data-title={card.searchTitle}>
              <span className="path-no">{card.pathNo}</span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <span className="tag">{card.tag}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
