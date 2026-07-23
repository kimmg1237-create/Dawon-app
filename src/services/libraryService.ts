import { supabase } from '../lib/supabase'
import { PATH_CARDS, type PathCategory } from '../data/paths'

export type LibraryBucket = 'library-covers' | 'library-ebooks' | 'library-comics' | 'library-audiobooks'

export type LibraryItemRow = {
  id: string
  title: string
  description: string
  category: PathCategory
  tag: string
  path_no: string
  sort_order: number
  published: boolean
  /** @deprecated use ebook_cover_path / comic_cover_path / audiobook_cover_path */
  cover_path?: string | null
  ebook_cover_path: string | null
  comic_cover_path: string | null
  audiobook_cover_path: string | null
  ebook_pdf_path: string | null
  comic_pdf_path: string | null
  audiobook_text_path: string | null
  updated_at?: string
}

export type LibraryUploadKind =
  | 'ebookCover'
  | 'ebookPdf'
  | 'comicCover'
  | 'comicPdf'
  | 'audiobookCover'
  | 'audiobookText'

const UPLOAD_CONFIG: Record<
  LibraryUploadKind,
  { bucket: LibraryBucket; field: keyof LibraryItemRow; filePrefix: string }
> = {
  ebookCover: { bucket: 'library-covers', field: 'ebook_cover_path', filePrefix: 'ebook-cover' },
  ebookPdf: { bucket: 'library-ebooks', field: 'ebook_pdf_path', filePrefix: 'ebook' },
  comicCover: { bucket: 'library-covers', field: 'comic_cover_path', filePrefix: 'comic-cover' },
  comicPdf: { bucket: 'library-comics', field: 'comic_pdf_path', filePrefix: 'comic' },
  audiobookCover: { bucket: 'library-covers', field: 'audiobook_cover_path', filePrefix: 'audio-cover' },
  audiobookText: { bucket: 'library-audiobooks', field: 'audiobook_text_path', filePrefix: 'audio-text' },
}

export function libraryUploadConfig(kind: LibraryUploadKind) {
  return UPLOAD_CONFIG[kind]
}

export function libraryPublicUrl(bucket: LibraryBucket, path: string | null | undefined): string | null {
  if (!supabase || !path) return null
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl || null
}

export async function fetchLibraryItems(includeUnpublished = false): Promise<LibraryItemRow[]> {
  if (!supabase) return []
  let query = supabase.from('library_items').select('*').order('sort_order', { ascending: true }).order('id')
  if (!includeUnpublished) query = query.eq('published', true)
  const { data, error } = await query
  if (error) {
    console.warn('[library] fetch failed', error.message)
    return []
  }
  return (data || []).map(normalizeLibraryRow)
}

function normalizeLibraryRow(raw: Record<string, unknown>): LibraryItemRow {
  const legacyCover = (raw.cover_path as string | null) ?? null
  return {
    id: String(raw.id),
    title: String(raw.title || ''),
    description: String(raw.description || ''),
    category: (raw.category as PathCategory) || 'life',
    tag: String(raw.tag || ''),
    path_no: String(raw.path_no || ''),
    sort_order: Number(raw.sort_order) || 0,
    published: raw.published !== false,
    cover_path: legacyCover,
    ebook_cover_path: (raw.ebook_cover_path as string | null) ?? legacyCover,
    comic_cover_path: (raw.comic_cover_path as string | null) ?? legacyCover,
    audiobook_cover_path: (raw.audiobook_cover_path as string | null) ?? legacyCover,
    ebook_pdf_path: (raw.ebook_pdf_path as string | null) ?? null,
    comic_pdf_path: (raw.comic_pdf_path as string | null) ?? null,
    audiobook_text_path: (raw.audiobook_text_path as string | null) ?? null,
    updated_at: raw.updated_at as string | undefined,
  }
}

export async function upsertLibraryItem(
  item: Omit<LibraryItemRow, 'updated_at'> & { updated_at?: string },
): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Supabase가 설정되지 않았습니다.' }
  const { cover_path: _legacy, ...payload } = item
  if (!payload.title?.trim()) return { error: '제목이 필요합니다.' }
  const { error } = await supabase.from('library_items').upsert({
    ...payload,
    updated_at: new Date().toISOString(),
  })
  return { error: error?.message }
}

/** 업로드 전 기존 51권 메타를 PATH_CARDS에서 채웁니다. */
export function fillLibraryItemFromCatalog(item: LibraryItemRow): LibraryItemRow {
  const base = PATH_CARDS.find((c) => c.id === item.id)
  if (!base) return item
  return {
    ...item,
    title: item.title || base.title,
    description: item.description || base.description,
    category: item.category || base.category,
    tag: item.tag || base.tag,
    path_no: item.path_no || base.pathNo,
    sort_order: item.sort_order || Number(item.id) || 0,
  }
}

export async function deleteLibraryItem(id: string): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Supabase가 설정되지 않았습니다.' }
  const { error } = await supabase.from('library_items').delete().eq('id', id)
  return { error: error?.message }
}

export async function uploadLibraryFile(
  kind: LibraryUploadKind,
  itemId: string,
  file: File,
): Promise<{ path?: string; error?: string }> {
  if (!supabase) return { error: 'Supabase가 설정되지 않았습니다.' }
  const { bucket, filePrefix } = UPLOAD_CONFIG[kind]
  const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'bin'
  const path = `${itemId}/${filePrefix}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  })
  if (error) return { error: error.message }
  return { path }
}

export async function removeLibraryFile(bucket: LibraryBucket, path: string | null | undefined): Promise<void> {
  if (!supabase || !path) return
  await supabase.storage.from(bucket).remove([path])
}
