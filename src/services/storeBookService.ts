import { supabase } from '../lib/supabase'
import { libraryPublicUrl } from './libraryService'

export type StoreBookProduct = 'sotong' | 'healing'

export type StoreBookRow = {
  product: StoreBookProduct
  title: string
  cover_path: string | null
  pdf_path: string | null
  updated_at?: string
}

export type OwnedBook = {
  product: StoreBookProduct
  title: string
  format: 'ebook' | 'paper'
  orderId: string
  coverUrl: string
  pdfUrl: string | null
  canRead: boolean
  paidAt: string | null
}

export type StoreBookLocalFiles = {
  product: StoreBookProduct
  title: string
  coverUrl: string
  pdfUrl: string | null
  coverFromDisk: boolean
  pdfFromDisk: boolean
}

const TITLES: Record<StoreBookProduct, string> = {
  sotong: '자신과의 소통',
  healing: '힐링게임',
}

const LOCAL_COVERS: Record<StoreBookProduct, string[]> = {
  sotong: ['/store-books/sotong.png', '/store-books/sotong.jpg', '/store-books/sotong.webp', '/ads/sotong.png'],
  healing: ['/store-books/healing.png', '/store-books/healing.jpg', '/store-books/healing.webp', '/ads/healing.png'],
}

const LOCAL_PDFS: Record<StoreBookProduct, string[]> = {
  sotong: ['/store-books/sotong.pdf'],
  healing: ['/store-books/healing.pdf'],
}

export function storeBookTitle(product: string) {
  if (product === 'sotong' || product === 'healing') return TITLES[product]
  return product
}

export function storeBookCoverSrc(product: StoreBookProduct) {
  return LOCAL_COVERS[product][0]
}

async function urlExists(url: string): Promise<boolean> {
  try {
    const head = await fetch(url, { method: 'HEAD', cache: 'no-store' })
    if (head.ok) return true
    if (head.status === 405 || head.status === 501) {
      const get = await fetch(url, { method: 'GET', cache: 'no-store', headers: { Range: 'bytes=0-0' } })
      return get.ok
    }
    return false
  } catch {
    return false
  }
}

async function firstExisting(urls: string[]): Promise<string | null> {
  for (const url of urls) {
    if (await urlExists(url)) return url
  }
  return null
}

export async function resolveStoreBookLocal(product: StoreBookProduct): Promise<StoreBookLocalFiles> {
  const coverHit = await firstExisting(LOCAL_COVERS[product])
  const pdfHit = await firstExisting(LOCAL_PDFS[product])
  return {
    product,
    title: TITLES[product],
    coverUrl: coverHit || LOCAL_COVERS[product][0],
    pdfUrl: pdfHit,
    coverFromDisk: Boolean(coverHit && coverHit.startsWith('/store-books/')),
    pdfFromDisk: Boolean(pdfHit),
  }
}

export async function fetchStoreBooks(): Promise<StoreBookRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('store_books').select('*')
  if (error) return []
  return (data as StoreBookRow[]) || []
}

export async function uploadStoreBookFile(
  product: StoreBookProduct,
  kind: 'cover' | 'pdf',
  file: File,
): Promise<{ path?: string; error?: string }> {
  if (!supabase) return { error: 'Supabase가 설정되지 않았습니다.' }
  const bucket = kind === 'cover' ? 'library-covers' : 'library-ebooks'
  const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : kind === 'pdf' ? 'pdf' : 'png'
  const path = `store/${product}/${kind}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  })
  if (error) return { error: error.message }
  return { path }
}

export async function saveStoreBook(row: StoreBookRow): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Supabase가 설정되지 않았습니다.' }
  const { error } = await supabase.from('store_books').upsert({
    product: row.product,
    title: row.title,
    cover_path: row.cover_path,
    pdf_path: row.pdf_path,
    updated_at: new Date().toISOString(),
  })
  return { error: error?.message }
}

export async function fetchOwnedBooks(userId: string): Promise<OwnedBook[]> {
  if (!supabase) return []
  const [localSotong, localHealing, books, entitlements, orders] = await Promise.all([
    resolveStoreBookLocal('sotong'),
    resolveStoreBookLocal('healing'),
    fetchStoreBooks(),
    supabase
      .from('user_entitlements')
      .select('product, order_id, granted_at, revoked_at')
      .eq('user_id', userId)
      .is('revoked_at', null),
    supabase
      .from('payment_orders')
      .select('order_id, product, book_format, status, paid_at')
      .eq('user_id', userId)
      .eq('status', 'paid')
      .in('product', ['sotong', 'healing']),
  ])

  const localMap = { sotong: localSotong, healing: localHealing }
  const bookMap = new Map(books.map((b) => [b.product, b]))
  const owned = new Map<string, OwnedBook>()

  const add = (product: StoreBookProduct, format: 'ebook' | 'paper', orderId: string, paidAt: string | null) => {
    const local = localMap[product]
    const meta = bookMap.get(product)
    const uploadedPdf = libraryPublicUrl('library-ebooks', meta?.pdf_path)
    const uploadedCover = libraryPublicUrl('library-covers', meta?.cover_path)
    const pdfUrl = local.pdfUrl || uploadedPdf
    const key = `${product}-${format}`
    if (owned.has(key)) return
    owned.set(key, {
      product,
      title: meta?.title || TITLES[product],
      format,
      orderId,
      paidAt,
      coverUrl: local.coverUrl || uploadedCover || LOCAL_COVERS[product][0],
      pdfUrl,
      canRead: format === 'ebook' && Boolean(pdfUrl),
    })
  }

  for (const row of entitlements.data || []) {
    const product = row.product as string
    if (product !== 'sotong' && product !== 'healing') continue
    add(product, 'ebook', row.order_id as string, (row.granted_at as string) || null)
  }

  for (const row of orders.data || []) {
    const product = row.product as string
    if (product !== 'sotong' && product !== 'healing') continue
    const format = row.book_format === 'paper' ? 'paper' : 'ebook'
    add(product, format, row.order_id as string, (row.paid_at as string) || null)
  }

  return [...owned.values()].sort((a, b) => a.title.localeCompare(b.title, 'ko'))
}
