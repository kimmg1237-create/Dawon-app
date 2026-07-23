import { getCoverUrl } from './coverFiles'
import { getEbookUrl } from './ebookFiles'
import { getComicUrl } from './comicFiles'

export type StaticLibraryAssets = {
  ebookCoverUrl: string | null
  ebookPdfUrl: string | null
  comicPdfUrl: string | null
  audiobookTextUrl: string | null
  audiobookTextName: string | null
}

let audiobookIndexCache: Record<string, string> | null = null

/** ID(00~50) → audiobook-texts 파일명 */
export async function loadAudiobookIndex(): Promise<Record<string, string>> {
  if (audiobookIndexCache) return audiobookIndexCache
  try {
    const res = await fetch('/audiobook-texts/index.json')
    if (!res.ok) throw new Error('index missing')
    const files = (await res.json()) as unknown
    const map: Record<string, string> = {}
    if (Array.isArray(files)) {
      for (const f of files) {
        if (typeof f !== 'string') continue
        const m = /^(\d{2})_/.exec(f)
        if (m) map[m[1]] = f
      }
    }
    audiobookIndexCache = map
    return map
  } catch {
    audiobookIndexCache = {}
    return {}
  }
}

export function getStaticAudiobookTextUrl(id: string, index: Record<string, string>): string | null {
  const key = id.padStart(2, '0')
  const name = index[key]
  if (!name) return null
  return `/audiobook-texts/${encodeURIComponent(name)}`
}

export function getStaticLibraryAssets(id: string, audiobookIndex: Record<string, string> = {}): StaticLibraryAssets {
  const key = id.padStart(2, '0')
  const textName = audiobookIndex[key] ?? null
  return {
    ebookCoverUrl: getCoverUrl(key),
    ebookPdfUrl: getEbookUrl(key),
    comicPdfUrl: getComicUrl(key),
    audiobookTextUrl: textName ? `/audiobook-texts/${encodeURIComponent(textName)}` : null,
    audiobookTextName: textName,
  }
}
