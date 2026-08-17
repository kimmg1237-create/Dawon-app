import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { EbookViewer } from '../components/EbookViewer'
import { ComicMoviePlayer } from '../components/ComicMoviePlayer'
import { AudiobookPage } from '../components/AudiobookPage'
import { PremiumGate } from '../components/PremiumGate'
import { useSubscription } from '../context/SubscriptionContext'
import { useAuth } from '../context/AuthContext'
import { fetchLibraryItems } from '../services/libraryService'
import { loadAudiobookIndex } from '../data/libraryStaticAssets'
import { coverUrlForCard, mergeLibraryCards, type LibraryCard } from '../services/libraryCatalog'

export type LibraryTab = 'ebook' | 'comic' | 'audio'

interface OpenBook {
  card: LibraryCard
  kind: 'ebook' | 'comic'
  url: string
  previewMaxPages?: number
}

const PAGE_SIZE = 4
const GUEST_PREVIEW_PAGES = 5
const GUEST_MOVIE_PAGES = 1

function normalizeTitle(value: string): string {
  return value.replace(/[《》\s,.·'"!?~\-_]/g, '').toLowerCase()
}

function tocLines(card: LibraryCard): string[] {
  const base = [
    '표지 · 작품 소개',
    card.tag ? `주제: ${card.tag}` : '생활설계와 자기확인',
    '본문 미리보기 (일부)',
    '전체 본문 (로그인 후)',
  ]
  return base
}

function BookCover({
  card,
  tab,
  eager,
}: {
  card: LibraryCard
  tab: 'ebook' | 'comic' | 'audio'
  eager?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const cover = coverUrlForCard(card, tab)

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
      width={360}
      height={510}
      sizes="(max-width: 680px) 46vw, (max-width: 1080px) 28vw, 220px"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : 'auto'}
      onError={() => setFailed(true)}
    />
  )
}

type DawonLibraryProps = {
  initialTab?: LibraryTab
  onTabChange?: (tab: LibraryTab) => void
}

export function DawonLibrary({ initialTab = 'ebook', onTabChange }: DawonLibraryProps = {}) {
  const { isPremium, statusLabel, markContentUsed, paymentsEnabled } = useSubscription()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const openedFromQuery = useRef(false)
  const [tab, setTab] = useState<LibraryTab>(initialTab)
  const [query, setQuery] = useState('')
  const [slide, setSlide] = useState(0)
  const [open, setOpen] = useState<OpenBook | null>(null)
  const [movie, setMovie] = useState<OpenBook | null>(null)
  const [preview, setPreview] = useState<LibraryCard | null>(null)
  const [cards, setCards] = useState<LibraryCard[]>(() => mergeLibraryCards([]))

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  function changeTab(next: LibraryTab) {
    setTab(next)
    onTabChange?.(next)
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const [rows, index] = await Promise.all([fetchLibraryItems(false), loadAudiobookIndex()])
      if (!cancelled) setCards(mergeLibraryCards(rows, false, index))
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return cards
    return cards.filter((card) =>
      `${card.id} ${card.title} ${card.searchTitle} ${card.tag}`.toLowerCase().includes(q),
    )
  }, [query, cards])

  const related = useMemo(() => {
    if (!preview) return []
    return cards.filter((c) => c.id !== preview.id).slice(0, 3)
  }, [cards, preview])

  const audioExtras = useMemo(
    () =>
      cards
        .filter((c) => c.audiobookTextUrl)
        .map((c) => ({
          id: c.id,
          title: c.title,
          url: c.audiobookTextUrl!,
          coverUrl: c.audiobookCoverUrl,
          fromUpload: c.hasUploadedAudiobookText,
        })),
    [cards],
  )

  const totalSlides = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safeSlide = Math.min(slide, totalSlides - 1)
  const visible = filtered.slice(safeSlide * PAGE_SIZE, safeSlide * PAGE_SIZE + PAGE_SIZE)

  useEffect(() => {
    setSlide(0)
  }, [tab, query])

  function openBook(card: LibraryCard, kind: 'ebook' | 'comic') {
    if (!user) {
      setPreview(card)
      return
    }
    if (paymentsEnabled && !isPremium) {
      navigate('/subscribe')
      return
    }
    const url = kind === 'ebook' ? card.ebookUrl : card.comicUrl
    if (url) {
      void markContentUsed()
      setOpen({ card, kind, url })
      setPreview(null)
    }
  }

  function openGuestPreview(card: LibraryCard, kind: 'ebook' | 'comic') {
    const url = kind === 'ebook' ? card.ebookUrl : card.comicUrl
    if (!url) {
      setPreview(card)
      return
    }
    setPreview(null)
    setOpen({ card, kind, url, previewMaxPages: GUEST_PREVIEW_PAGES })
  }

  function openComicMovie(card: LibraryCard) {
    if (!card.comicUrl) return
    if (!user) {
      setPreview(null)
      setMovie({ card, kind: 'comic', url: card.comicUrl, previewMaxPages: GUEST_MOVIE_PAGES })
      return
    }
    if (paymentsEnabled && !isPremium) {
      navigate('/subscribe')
      return
    }
    void markContentUsed()
    setPreview(null)
    setMovie({ card, kind: 'comic', url: card.comicUrl })
  }

  useEffect(() => {
    if (openedFromQuery.current || !cards.length) return
    const book = searchParams.get('book')
    if (!book) return
    const target = normalizeTitle(book)
    const card = cards.find((c) => c.id === book || normalizeTitle(c.title) === target)
    if (!card) return
    openedFromQuery.current = true
    changeTab('ebook')
    openBook(card, 'ebook')
  }, [cards, searchParams])

  useEffect(() => {
    function onOpenBook(e: Event) {
      const title = (e as CustomEvent<{ title?: string }>).detail?.title
      if (!title) return
      const target = normalizeTitle(title)
      const card = cards.find((c) => normalizeTitle(c.title) === target)
      if (!card) return
      changeTab('ebook')
      openBook(card, 'ebook')
      document.getElementById('library')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    window.addEventListener('dawon:open-book', onOpenBook)
    return () => window.removeEventListener('dawon:open-book', onOpenBook)
  }, [cards, user, paymentsEnabled, isPremium])

  function goPrev() {
    setSlide((s) => Math.max(0, s - 1))
  }

  function goNext() {
    setSlide((s) => Math.min(totalSlides - 1, s + 1))
  }

  const kindLabel = tab === 'ebook' ? '전자책' : '만화'
  const previewKind: 'ebook' | 'comic' = tab === 'comic' ? 'comic' : 'ebook'

  return (
    <div className="dawon-library">
      {paymentsEnabled && user && !isPremium ? (
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
          onClick={() => changeTab('ebook')}
        >
          ▤ 전자책 {cards.length}권
        </button>
        <button
          type="button"
          role="tab"
          className={`library-tab ${tab === 'audio' ? 'active' : ''}`}
          aria-selected={tab === 'audio'}
          onClick={() => changeTab('audio')}
        >
          ♪ 오디오북
        </button>
        <button
          type="button"
          role="tab"
          className={`library-tab ${tab === 'comic' ? 'active' : ''}`}
          aria-selected={tab === 'comic'}
          onClick={() => changeTab('comic')}
        >
          ◔ 만화책 {cards.length}권
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
              {filtered.length}권 · 표지·소개·목차 일부를 먼저 보고, 전체는 로그인 후 이용합니다
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
                  {visible.map((card, i) => (
                    <article key={card.id} className="book-card">
                      <button
                        type="button"
                        className="book-card-main"
                        onClick={() => openBook(card, tab === 'ebook' ? 'ebook' : 'comic')}
                      >
                        <BookCover
                          card={card}
                          tab={tab === 'ebook' ? 'ebook' : 'comic'}
                          eager={i < 2}
                        />
                        <span className="book-body">
                          <span className="book-no">{card.pathNo}</span>
                          <h3>{card.title}</h3>
                          <p>{card.description}</p>
                          <span className="book-open">
                            {user
                              ? tab === 'ebook'
                                ? '전자책 읽기 →'
                                : '만화로 보기 →'
                              : '무료로 미리보기 →'}
                          </span>
                        </span>
                      </button>
                      {tab === 'comic' && card.comicUrl ? (
                        <button
                          type="button"
                          className="book-movie-btn"
                          onClick={() => openComicMovie(card)}
                        >
                          만화영화
                        </button>
                      ) : null}
                    </article>
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
            로그인 전: 표지·제목·소개·목차 일부·최대 {GUEST_PREVIEW_PAGES}쪽 미리보기 · 로그인 후: 전체{' '}
            {kindLabel} 이용
          </div>
        </>
      )}

      {tab === 'audio' && (
        <div className="library-audio-shell">
          {!user ? (
            <div className="library-preview-banner">
              <p>
                오디오북은 표지·제목·설명을 먼저 확인할 수 있습니다. 짧은 샘플 파일이 준비된 작품만
                미리듣기가 제공되며, 전체 재생은 로그인 후 이용하세요.
              </p>
              <Link className="btn btn-primary btn-small" to="/login" state={{ from: '/audiobooks' }}>
                계속 들으려면 로그인해 주세요
              </Link>
            </div>
          ) : null}
          <PremiumGate feature="오디오북">
            <AudiobookPage extraTexts={audioExtras} />
          </PremiumGate>
        </div>
      )}

      {preview ? (
        <div className="library-preview-modal" role="dialog" aria-modal="true" aria-labelledby="library-preview-title">
          <div className="library-preview-card">
            <button
              type="button"
              className="library-preview-close"
              aria-label="미리보기 닫기"
              onClick={() => setPreview(null)}
            >
              ×
            </button>
            <div className="library-preview-cover">
              <BookCover card={preview} tab={previewKind} eager />
            </div>
            <p className="library-preview-kind">
              {tab === 'comic' ? '만화책' : '전자책'} · {preview.pathNo}
            </p>
            <h3 id="library-preview-title">{preview.title}</h3>
            <p>{preview.description}</p>
            <div className="library-preview-toc">
              <strong>목차 일부</strong>
              <ol>
                {tocLines(preview).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </div>
            {related.length > 0 ? (
              <div className="library-preview-related">
                <strong>관련 작품</strong>
                <ul>
                  {related.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        className="library-related-link"
                        onClick={() => setPreview(r)}
                      >
                        {r.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="library-preview-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => openGuestPreview(preview, previewKind)}
              >
                무료로 미리보기
              </button>
              {tab === 'comic' && preview.comicUrl ? (
                <button type="button" className="btn btn-gold" onClick={() => openComicMovie(preview)}>
                  만화영화
                </button>
              ) : null}
              <Link
                className="btn btn-soft"
                to="/login"
                state={{ from: tab === 'comic' ? '/library' : '/ebooks' }}
              >
                계속 읽으려면 로그인해 주세요
              </Link>
              <button type="button" className="btn btn-soft" onClick={() => setPreview(null)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {movie && (
        <ComicMoviePlayer
          url={movie.url}
          title={movie.card.title}
          subtitle={
            movie.previewMaxPages
              ? `${movie.card.pathNo} · 미리보기 ${movie.previewMaxPages}쪽`
              : `${movie.card.pathNo} · 4컷·7컷 만화영화`
          }
          previewMaxPages={movie.previewMaxPages}
          onClose={() => setMovie(null)}
          onRequestFullAccess={
            movie.previewMaxPages
              ? () => {
                  setMovie(null)
                  navigate('/login', { state: { from: '/library' } })
                }
              : undefined
          }
        />
      )}

      {open && (
        <EbookViewer
          url={open.url}
          title={open.card.title}
          subtitle={
            open.previewMaxPages
              ? `${open.card.pathNo} · 미리보기 ${open.previewMaxPages}쪽`
              : `${open.card.pathNo} · ${open.kind === 'ebook' ? '전자책' : '만화'}`
          }
          previewMaxPages={open.previewMaxPages}
          onClose={() => setOpen(null)}
          onRequestFullAccess={
            open.previewMaxPages
              ? () => {
                  setOpen(null)
                  navigate('/login', {
                    state: { from: open.kind === 'comic' ? '/library' : '/ebooks' },
                  })
                }
              : undefined
          }
        />
      )}
    </div>
  )
}
