import { PATH_CARDS, type PathCard, type PathCategory } from '../data/paths'
import { getStaticAudiobookTextUrl, getStaticLibraryAssets } from '../data/libraryStaticAssets'
import { getCoverUrl as getStaticCoverUrl } from '../data/coverFiles'
import { libraryPublicUrl, type LibraryItemRow } from './libraryService'

export type LibraryCard = PathCard & {
  ebookCoverUrl: string | null
  comicCoverUrl: string | null
  audiobookCoverUrl: string | null
  ebookUrl: string | null
  comicUrl: string | null
  audiobookTextUrl: string | null
  fromDb: boolean
  hasUploadedEbookCover: boolean
  hasUploadedComicCover: boolean
  hasUploadedAudiobookCover: boolean
  hasUploadedEbookPdf: boolean
  hasUploadedComicPdf: boolean
  hasUploadedAudiobookText: boolean
}

function coverFor(
  row: LibraryItemRow | undefined,
  kind: 'ebook' | 'comic' | 'audiobook',
  fallbackId: string,
) {
  const legacy = row?.cover_path ?? null
  const uploaded =
    kind === 'ebook'
      ? row?.ebook_cover_path
      : kind === 'comic'
        ? row?.comic_cover_path
        : row?.audiobook_cover_path
  const path = uploaded ?? (kind !== 'audiobook' ? legacy : null)
  const fromStorage = libraryPublicUrl('library-covers', path)
  if (fromStorage) return fromStorage
  return getStaticCoverUrl(fallbackId)
}

function toCard(base: PathCard, row?: LibraryItemRow, audiobookIndex: Record<string, string> = {}): LibraryCard {
  const staticAssets = getStaticLibraryAssets(base.id, audiobookIndex)
  const title = row?.title ?? base.title
  const description = row?.description ?? base.description
  const tag = row?.tag ?? base.tag
  const pathNo = row?.path_no || base.pathNo
  const category = (row?.category as PathCategory) || base.category
  const ebookPdfUploaded = libraryPublicUrl('library-ebooks', row?.ebook_pdf_path)
  const comicPdfUploaded = libraryPublicUrl('library-comics', row?.comic_pdf_path)
  const audioTextUploaded = libraryPublicUrl('library-audiobooks', row?.audiobook_text_path)

  return {
    id: base.id,
    category,
    title,
    description,
    pathNo,
    tag,
    searchTitle: `${title} ${description} ${tag}`,
    ebookCoverUrl: coverFor(row, 'ebook', base.id),
    comicCoverUrl: coverFor(row, 'comic', base.id),
    audiobookCoverUrl: coverFor(row, 'audiobook', base.id),
    ebookUrl: ebookPdfUploaded || staticAssets.ebookPdfUrl,
    comicUrl: comicPdfUploaded || staticAssets.comicPdfUrl,
    audiobookTextUrl: audioTextUploaded || getStaticAudiobookTextUrl(base.id, audiobookIndex),
    fromDb: Boolean(row),
    hasUploadedEbookCover: Boolean(row?.ebook_cover_path),
    hasUploadedComicCover: Boolean(row?.comic_cover_path),
    hasUploadedAudiobookCover: Boolean(row?.audiobook_cover_path),
    hasUploadedEbookPdf: Boolean(row?.ebook_pdf_path),
    hasUploadedComicPdf: Boolean(row?.comic_pdf_path),
    hasUploadedAudiobookText: Boolean(row?.audiobook_text_path),
  }
}

export function mergeLibraryCards(
  rows: LibraryItemRow[],
  forAdmin = false,
  audiobookIndex: Record<string, string> = {},
): LibraryCard[] {
  const byId = new Map(rows.map((r) => [r.id, r]))
  const staticIds = new Set(PATH_CARDS.map((c) => c.id))

  const merged = PATH_CARDS.map((card) => {
    const row = byId.get(card.id)
    if (row && !row.published && !forAdmin) return null
    return toCard(card, row, audiobookIndex)
  }).filter((c): c is LibraryCard => Boolean(c))

  const extras = rows
    .filter((r) => !staticIds.has(r.id))
    .filter((r) => forAdmin || r.published)
    .map((r) =>
      toCard(
        {
          id: r.id,
          category: r.category,
          title: r.title,
          description: r.description,
          pathNo: r.path_no || r.id,
          tag: r.tag,
          searchTitle: `${r.title} ${r.description} ${r.tag}`,
        },
        r,
        audiobookIndex,
      ),
    )

  return [...merged, ...extras].sort((a, b) => {
    const ao = byId.get(a.id)?.sort_order ?? (Number(a.id) || 0)
    const bo = byId.get(b.id)?.sort_order ?? (Number(b.id) || 0)
    if (ao !== bo) return ao - bo
    return a.id.localeCompare(b.id)
  })
}

export function coverUrlForCard(card: LibraryCard, tab: 'ebook' | 'comic' | 'audio') {
  if (tab === 'comic') return card.comicCoverUrl
  if (tab === 'audio') return card.audiobookCoverUrl
  return card.ebookCoverUrl
}
