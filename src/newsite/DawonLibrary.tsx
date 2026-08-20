import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { EbookViewer } from '../components/EbookViewer'
import { ComicMoviePlayer } from '../components/ComicMoviePlayer'
import { AudiobookPage } from '../components/AudiobookPage'
import { useSubscription } from '../context/SubscriptionContext'
import { useAuth } from '../context/AuthContext'
import { fetchLibraryItems } from '../services/libraryService'
import { loadAudiobookIndex } from '../data/libraryStaticAssets'
import { coverUrlForCard, mergeLibraryCards, type LibraryCard } from '../services/libraryCatalog'
import { PRODUCT_SPEC } from '../data/productSpec'
import { dawonT, getDawonLang, type DawonLang } from './dawonOs/i18n'

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

function tocLines(card: LibraryCard, t: (key: string) => string): string[] {
  return [
    t('libraryTocCover'),
    card.tag ? t('libraryTocTheme').replace('{tag}', card.tag) : t('libraryTocDefaultTheme'),
    t('libraryTocPreview'),
    t('libraryTocFull'),
  ]
}

function BookCover({
  card,
  tab,
  eager,
  coverAlt,
}: {
  card: LibraryCard
  tab: 'ebook' | 'comic' | 'audio'
  eager?: boolean
  coverAlt: string
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
      alt={coverAlt}
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
  hideTabs?: boolean
}

export function DawonLibrary({ initialTab = 'ebook', onTabChange, hideTabs }: DawonLibraryProps = {}) {
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
  const [lang, setLang] = useState<DawonLang>(() => getDawonLang())
  const t = (key: string) => dawonT(key, lang)

  useEffect(() => {
    const onLang = () => setLang(getDawonLang())
    window.addEventListener('dawon-lang-changed', onLang)
    return () => window.removeEventListener('dawon-lang-changed', onLang)
  }, [])

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
          pdfUrl: c.ebookUrl,
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
    const url = kind === 'ebook' ? card.ebookUrl : card.comicUrl
    if (!url) return

    if (!isPremium) {
      if (!user) {
        setPreview(card)
        return
      }
      setPreview(null)
      setOpen({ card, kind, url, previewMaxPages: GUEST_PREVIEW_PAGES })
      return
    }

    void markContentUsed()
    setOpen({ card, kind, url })
    setPreview(null)
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
    if (!isPremium) {
      setPreview(null)
      setMovie({
        card,
        kind: 'comic',
        url: card.comicUrl,
        previewMaxPages: GUEST_MOVIE_PAGES,
      })
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

  const previewKind: 'ebook' | 'comic' = tab === 'comic' ? 'comic' : 'ebook'
  const days = String(PRODUCT_SPEC.freeTrialDays)
  const tabCount = t('libraryTabCount').replace('{n}', String(cards.length))

  return (
    <div className="dawon-library">
      {paymentsEnabled && !isPremium && tab !== 'audio' ? (
        <div className="library-premium-banner">
          <span>
            {t('libraryBanner').replace('{status}', t(statusLabel)).replace('{days}', days)}
          </span>
          <Link to="/subscribe" className="btn btn-primary btn-small">
            {user ? t('libraryViewPass') : t('libraryJoinFree')}
          </Link>
        </div>
      ) : null}
      {hideTabs ? null : (
      <div className="library-tabs" role="tablist" aria-label={t('libraryTabsAria')}>
        <button
          type="button"
          role="tab"
          className={`library-tab ${tab === 'ebook' ? 'active' : ''}`}
          aria-selected={tab === 'ebook'}
          onClick={() => changeTab('ebook')}
        >
          {t('libraryTabEbook')} {tabCount}
        </button>
        <button
          type="button"
          role="tab"
          className={`library-tab ${tab === 'audio' ? 'active' : ''}`}
          aria-selected={tab === 'audio'}
          onClick={() => changeTab('audio')}
        >
          {t('libraryTabAudio')}
        </button>
        <button
          type="button"
          role="tab"
          className={`library-tab ${tab === 'comic' ? 'active' : ''}`}
          aria-selected={tab === 'comic'}
          onClick={() => changeTab('comic')}
        >
          {t('libraryTabComic')} {tabCount}
        </button>
      </div>
      )}

      {tab !== 'audio' && (
        <>
          <div className="library-toolbar">
            <label className="library-search">
              <span aria-hidden="true">⌕</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('librarySearchPlaceholder')}
                aria-label={t('librarySearchAria')}
              />
            </label>
            <span className="library-count">
              {t('libraryCount')
                .replace('{n}', String(filtered.length))
                .replace('{pages}', String(GUEST_PREVIEW_PAGES))}
            </span>
          </div>

          {filtered.length > 0 ? (
            <div className="book-slider">
              <button
                type="button"
                className="book-slider-btn book-slider-prev"
                onClick={goPrev}
                disabled={safeSlide === 0}
                aria-label={t('libraryPrev')}
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
                          coverAlt={t('libraryCoverAlt').replace('{title}', card.title)}
                        />
                        <span className="book-body">
                          <span className="book-no">{card.pathNo}</span>
                          <h3>{card.title}</h3>
                          <p>{card.description}</p>
                          <span className="book-open">
                            {isPremium
                              ? tab === 'ebook'
                                ? t('libraryReadEbook')
                                : t('libraryReadComic')
                              : t('libraryPreviewArrow')}
                          </span>
                        </span>
                      </button>
                      {tab === 'comic' && card.comicUrl ? (
                        <button
                          type="button"
                          className="book-movie-btn"
                          onClick={() => openComicMovie(card)}
                        >
                          {t('libraryComicMovie')}
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
                aria-label={t('libraryNext')}
              >
                ›
              </button>
            </div>
          ) : (
            <div className="empty-state">{t('libraryEmpty')}</div>
          )}

          {filtered.length > 0 && (
            <div className="book-slider-meta">
              <span>
                {t('librarySlideMeta')
                  .replace('{current}', String(safeSlide + 1))
                  .replace('{total}', String(totalSlides))
                  .replace('{from}', String(safeSlide * PAGE_SIZE + 1))
                  .replace(
                    '{to}',
                    String(Math.min(filtered.length, (safeSlide + 1) * PAGE_SIZE)),
                  )}
              </span>
              <div className="book-slider-dots" aria-label={t('librarySlidePos')}>
                {Array.from({ length: totalSlides }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`book-slider-dot ${i === safeSlide ? 'active' : ''}`}
                    aria-label={t('librarySlideGroup').replace('{n}', String(i + 1))}
                    aria-current={i === safeSlide ? 'true' : undefined}
                    onClick={() => setSlide(i)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="library-note">
            <span>
              {t('libraryNote')
                .replace('{pages}', String(GUEST_PREVIEW_PAGES))
                .replace('{moviePages}', String(GUEST_MOVIE_PAGES))}
            </span>
            {!isPremium ? (
              <span className="library-trial-promo">
                {t('libraryTrialPromo').replace('{days}', days)}
                {!user ? (
                  <>
                    {' '}
                    ·{' '}
                    <Link to="/login" state={{ from: '/library' }}>
                      {t('libraryJoinStart')}
                    </Link>
                  </>
                ) : null}
              </span>
            ) : null}
          </div>
        </>
      )}

      {tab === 'audio' && (
        <div className="library-audio-shell">
          {!isPremium ? (
            <div className="library-preview-banner library-premium-banner">
              <p>
                {t('libraryAudioBanner').replace('{status}', t(statusLabel)).replace('{days}', days)}
              </p>
              {user ? (
                <Link className="btn btn-primary btn-small" to="/subscribe">
                  {t('libraryViewPass')}
                </Link>
              ) : (
                <Link className="btn btn-primary btn-small" to="/login" state={{ from: '/audiobooks' }}>
                  {t('libraryJoinFree')}
                </Link>
              )}
            </div>
          ) : null}
          <AudiobookPage extraTexts={audioExtras} previewOnly={paymentsEnabled && !isPremium} />
        </div>
      )}

      {preview ? (
        <div className="library-preview-modal" role="dialog" aria-modal="true" aria-labelledby="library-preview-title">
          <div className="library-preview-card">
            <button
              type="button"
              className="library-preview-close"
              aria-label={t('libraryClosePreview')}
              onClick={() => setPreview(null)}
            >
              ×
            </button>
            <div className="library-preview-cover">
              <BookCover
                card={preview}
                tab={previewKind}
                eager
                coverAlt={t('libraryCoverAlt').replace('{title}', preview.title)}
              />
            </div>
            <p className="library-preview-kind">
              {tab === 'comic' ? t('libraryComic') : t('libraryEbook')} · {preview.pathNo}
            </p>
            <h3 id="library-preview-title">{preview.title}</h3>
            <p>{preview.description}</p>
            <div className="library-preview-toc">
              <strong>{t('libraryTocPartial')}</strong>
              <ol>
                {tocLines(preview, t).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </div>
            {related.length > 0 ? (
              <div className="library-preview-related">
                <strong>{t('libraryRelated')}</strong>
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
                {t('libraryPreviewCta')}
              </button>
              {tab === 'comic' && preview.comicUrl ? (
                <button type="button" className="btn btn-gold" onClick={() => openComicMovie(preview)}>
                  {t('libraryComicMovie')}
                </button>
              ) : null}
              <Link
                className="btn btn-soft"
                to={user ? '/subscribe' : '/login'}
                state={{ from: tab === 'comic' ? '/library' : '/ebooks' }}
              >
                {user ? t('libraryViewFullPass') : t('libraryJoinFree')}
              </Link>
              <button type="button" className="btn btn-soft" onClick={() => setPreview(null)}>
                {t('libraryClose')}
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
              ? t('libraryPreviewPages')
                  .replace('{path}', movie.card.pathNo)
                  .replace('{pages}', String(movie.previewMaxPages))
              : t('libraryMovieFull').replace('{path}', movie.card.pathNo)
          }
          previewMaxPages={movie.previewMaxPages}
          onClose={() => setMovie(null)}
          onRequestFullAccess={
            movie.previewMaxPages
              ? () => {
                  setMovie(null)
                  navigate(user ? '/subscribe' : '/login', { state: { from: '/library' } })
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
              ? t('libraryPreviewPages')
                  .replace('{path}', open.card.pathNo)
                  .replace('{pages}', String(open.previewMaxPages))
              : `${open.card.pathNo} · ${open.kind === 'ebook' ? t('libraryEbook') : t('libraryComicShort')}`
          }
          previewMaxPages={open.previewMaxPages}
          onClose={() => setOpen(null)}
          onRequestFullAccess={
            open.previewMaxPages
              ? () => {
                  setOpen(null)
                  navigate(user ? '/subscribe' : '/login', {
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
