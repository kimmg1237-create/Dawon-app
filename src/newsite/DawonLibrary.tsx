import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PATH_CARDS, type PathCard } from '../data/paths'
import { getCoverUrl } from '../data/coverFiles'
import { getEbookUrl } from '../data/ebookFiles'
import { getComicUrl } from '../data/comicFiles'
import { EbookViewer } from '../components/EbookViewer'
import { AudiobookPage } from '../components/AudiobookPage'
import { PremiumGate } from '../components/PremiumGate'
import { useSubscription } from '../context/SubscriptionContext'
import { useAuth } from '../context/AuthContext'

type LibraryTab = 'ebook' | 'comic' | 'audio'

interface OpenBook {
  card: PathCard
  kind: 'ebook' | 'comic'
  url: string
}

const PAGE_SIZE = 5

function normalizeTitle(value: string): string {
  return value.replace(/[《》\s,.·'"!?~\-_]/g, '').toLowerCase()
}

function BookCover({ card }: { card: PathCard }) {
  const [failed, setFailed] = useState(false)
  const cover = getCoverUrl(card.id)

  if (!cover || failed) {
    return (
      <span className="book-cover-fallback" aria-hidden="true">
        <span>DAWON PATH {card.id}</span>
        <b>{card.title}</b>
      </span>
    )
  }
  return (
    <img
      className="book-cover"
      src={cover}
      alt={`${card.title} 표지`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

export function DawonLibrary() {
  const { isPremium, statusLabel, markContentUsed, paymentsEnabled } = useSubscription()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<LibraryTab>('ebook')
  const [query, setQuery] = useState('')
  const [slide, setSlide] = useState(0)
  const [open, setOpen] = useState<OpenBook | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PATH_CARDS
    return PATH_CARDS.filter((card) =>
      `${card.id} ${card.title} ${card.searchTitle} ${card.tag}`.toLowerCase().includes(q),
    )
  }, [query])

  const totalSlides = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safeSlide = Math.min(slide, totalSlides - 1)
  const visible = filtered.slice(safeSlide * PAGE_SIZE, safeSlide * PAGE_SIZE + PAGE_SIZE)

  useEffect(() => {
    setSlide(0)
  }, [tab, query])

  function openBook(card: PathCard, kind: 'ebook' | 'comic') {
    if (!user) {
      navigate('/login', { state: { from: '/library' } })
      return
    }
    if (paymentsEnabled && !isPremium) {
      navigate('/subscribe')
      return
    }
    const url = kind === 'ebook' ? getEbookUrl(card.id) : getComicUrl(card.id)
    if (url) {
      void markContentUsed()
      setOpen({ card, kind, url })
    }
  }

  useEffect(() => {
    function onOpenBook(e: Event) {
      const title = (e as CustomEvent<{ title?: string }>).detail?.title
      if (!title) return
      const target = normalizeTitle(title)
      const card = PATH_CARDS.find((c) => normalizeTitle(c.title) === target)
      if (!card) return
      setTab('ebook')
      openBook(card, 'ebook')
      document.getElementById('library')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    window.addEventListener('dawon:open-book', onOpenBook)
    return () => window.removeEventListener('dawon:open-book', onOpenBook)
  }, [])

  function goPrev() {
    setSlide((s) => Math.max(0, s - 1))
  }

  function goNext() {
    setSlide((s) => Math.min(totalSlides - 1, s + 1))
  }

  const kindLabel = tab === 'ebook' ? '전자책' : '만화'

  return (
    <div className="dawon-library">
      {!user ? (
        <div className="library-premium-banner">
          <span>전자책·만화·오디오북 열람은 로그인 후 이용할 수 있습니다.</span>
          <Link to="/login" state={{ from: '/library' }} className="btn btn-primary btn-small">
            로그인
          </Link>
        </div>
      ) : paymentsEnabled && !isPremium ? (
        <div className="library-premium-banner">
          <span>
            {statusLabel} · 전자책·만화·오디오북 열람은 구독·체험·광고 이용이 필요합니다.
          </span>
          <Link to="/subscribe" className="btn btn-primary btn-small">
            구독·결제
          </Link>
        </div>
      ) : null}
      <div className="library-tabs" role="tablist" aria-label="라이브러리 콘텐츠 유형">
        <button
          type="button"
          role="tab"
          className={`library-tab ${tab === 'ebook' ? 'active' : ''}`}
          aria-selected={tab === 'ebook'}
          onClick={() => setTab('ebook')}
        >
          ▤ 50개의 길 {PATH_CARDS.length}권
        </button>
        <button
          type="button"
          role="tab"
          className={`library-tab ${tab === 'audio' ? 'active' : ''}`}
          aria-selected={tab === 'audio'}
          onClick={() => setTab('audio')}
        >
          ♪ 오디오북
        </button>
        <button
          type="button"
          role="tab"
          className={`library-tab ${tab === 'comic' ? 'active' : ''}`}
          aria-selected={tab === 'comic'}
          onClick={() => setTab('comic')}
        >
          ◔ 만화 {PATH_CARDS.length}권
        </button>
      </div>

      {tab !== 'audio' && (
        <>
          <div className="library-toolbar">
            <label className="library-search">
              <span aria-hidden="true">⌕</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="제목·주제로 검색 예: 마음, 정리, 진로, 습관"
                aria-label="라이브러리 검색"
              />
            </label>
            <span className="library-count">
              {filtered.length}권 · 한 화면에 5권 · 표지를 누르면 {kindLabel}이 열립니다
            </span>
          </div>

          {filtered.length > 0 ? (
            <div className="book-slider">
              <button
                type="button"
                className="book-slider-btn book-slider-prev"
                onClick={goPrev}
                disabled={safeSlide === 0}
                aria-label="이전 책들"
              >
                ‹
              </button>

              <div className="book-slider-viewport" key={`${tab}-${safeSlide}`}>
                <div className="book-grid book-grid-slide">
                  {visible.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      className="book-card"
                      onClick={() => openBook(card, tab === 'ebook' ? 'ebook' : 'comic')}
                    >
                      <BookCover card={card} />
                      <span className="book-body">
                        <span className="book-no">{card.pathNo}</span>
                        <h3>{card.title}</h3>
                        <p>{card.description}</p>
                        <span className="book-open">
                          {tab === 'ebook' ? '전자책 읽기 →' : '만화로 보기 →'}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="book-slider-btn book-slider-next"
                onClick={goNext}
                disabled={safeSlide >= totalSlides - 1}
                aria-label="다음 책들"
              >
                ›
              </button>
            </div>
          ) : (
            <div className="empty-state">검색 결과가 없습니다. 다른 단어로 찾아보세요.</div>
          )}

          {filtered.length > 0 && (
            <div className="book-slider-meta">
              <span>
                {safeSlide + 1} / {totalSlides} · {safeSlide * PAGE_SIZE + 1}–
                {Math.min(filtered.length, (safeSlide + 1) * PAGE_SIZE)}권 표시
              </span>
              <div className="book-slider-dots" aria-label="슬라이드 위치">
                {Array.from({ length: totalSlides }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`book-slider-dot ${i === safeSlide ? 'active' : ''}`}
                    aria-label={`${i + 1}번째 묶음`}
                    aria-current={i === safeSlide ? 'true' : undefined}
                    onClick={() => setSlide(i)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="library-note">
            좌우 화살표로 다음 5권을 볼 수 있습니다. 표지를 누르면 페이지 뷰어가 열립니다.
          </div>
        </>
      )}

      {tab === 'audio' && (
        <div className="library-audio-shell">
          <PremiumGate feature="오디오북">
            <AudiobookPage />
          </PremiumGate>
        </div>
      )}

      {open && (
        <EbookViewer
          url={open.url}
          title={open.card.title}
          subtitle={`${open.card.pathNo} · ${open.kind === 'ebook' ? '전자책' : '만화'}`}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  )
}
