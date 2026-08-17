import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist'

export function installPdfWorker() {
  if (GlobalWorkerOptions.workerSrc) return
  GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdfjs/pdf.worker.boot.mjs`
}

function looksLikePdf(bytes: Uint8Array) {
  if (bytes.length < 5) return false
  return (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  )
}

export async function loadPdfDocument(url: string): Promise<PDFDocumentProxy> {
  installPdfWorker()
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`PDF_HTTP_${res.status}`)
  }
  const data = new Uint8Array(await res.arrayBuffer())
  if (!looksLikePdf(data)) {
    throw new Error('NOT_PDF')
  }
  const task = getDocument({
    data,
    cMapUrl: '/pdfjs/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: '/pdfjs/standard_fonts/',
    wasmUrl: '/pdfjs/wasm/',
    useSystemFonts: true,
    disableStream: true,
    disableRange: true,
    disableAutoFetch: true,
  })
  return task.promise
}
