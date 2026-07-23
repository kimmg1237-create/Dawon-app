import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSiteCopy } from '../context/SiteCopyContext'
import { SITE_COPY_DEFAULTS, type PageCopy, type SiteCopy } from '../data/siteCopyDefaults'
import { PATH_CARDS, type PathCategory } from '../data/paths'
import { getStaticLibraryAssets, loadAudiobookIndex } from '../data/libraryStaticAssets'
import {
  deleteLibraryItem,
  fetchLibraryItems,
  fillLibraryItemFromCatalog,
  libraryPublicUrl,
  libraryUploadConfig,
  removeLibraryFile,
  uploadLibraryFile,
  upsertLibraryItem,
  type LibraryItemRow,
  type LibraryUploadKind,
} from '../services/libraryService'
import { AdminResponsesPanel } from '../components/AdminResponsesPanel'
import './AdminPage.css'

type Tab = 'copy' | 'library' | 'responses'

const PAGE_KEYS = ['strategy', 'lifeStage', 'quickDesign', 'records', 'library', 'operations'] as const
const PAGE_LABELS: Record<(typeof PAGE_KEYS)[number], string> = {
  strategy: '실행지도',
  lifeStage: '계획방법',
  quickDesign: '실천카드',
  records: '7일 설계',
  library: '전자책·오디오북·만화',
  operations: '운영 상담',
}

const CATEGORIES: PathCategory[] = ['life', 'mind', 'relation', 'future', 'age']

function emptyItem(id: string): LibraryItemRow {
  const base = PATH_CARDS.find((c) => c.id === id)
  return {
    id,
    title: base?.title || '',
    description: base?.description || '',
    category: base?.category || 'life',
    tag: base?.tag || '',
    path_no: base?.pathNo || id,
    sort_order: Number(id) || 0,
    published: true,
    ebook_cover_path: null,
    comic_cover_path: null,
    audiobook_cover_path: null,
    ebook_pdf_path: null,
    comic_pdf_path: null,
    audiobook_text_path: null,
  }
}

export function AdminPage() {
  const { user, isAdmin, loading, configured } = useAuth()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'copy'

  function setTab(next: Tab) {
    setParams(next === 'copy' ? {} : { tab: next })
  }

  if (loading) return <div className="container page-banner">권한 확인 중…</div>
  if (!configured) return <Navigate to="/login" replace state={{ from: '/admin' }} />
  if (!user) return <Navigate to="/login" replace state={{ from: '/admin' }} />
  if (!isAdmin) {
    return (
      <div className="container page-banner">
        <h1>관리</h1>
        <p>관리자 권한이 필요합니다. Supabase `admin_users` 테이블에 본인 user_id를 등록하세요.</p>
        <p>
          <Link to="/">홈으로</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="admin-page container">
      <div className="page-banner">
        <div className="eyebrow">ADMIN</div>
        <h1>관리자</h1>
        <p>사이트 문구를 고치고, 전자책·만화·오디오북 파일을 올립니다. 본인만 접근할 수 있습니다.</p>
      </div>

      <div className="admin-tabs" role="tablist" aria-label="관리 메뉴">
        <button type="button" className={tab === 'copy' ? 'active' : ''} onClick={() => setTab('copy')}>
          문구 수정
        </button>
        <button type="button" className={tab === 'library' ? 'active' : ''} onClick={() => setTab('library')}>
          전자책·만화·오디오북
        </button>
        <button type="button" className={tab === 'responses' ? 'active' : ''} onClick={() => setTab('responses')}>
          설문 응답
        </button>
      </div>

      {tab === 'copy' ? <AdminCopyPanel /> : null}
      {tab === 'library' ? <AdminLibraryPanel /> : null}
      {tab === 'responses' ? <AdminResponsesPanel /> : null}
    </div>
  )
}

function AdminCopyPanel() {
  const { copy, save } = useSiteCopy()
  const [draft, setDraft] = useState<SiteCopy>(copy)
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(copy)
  }, [copy])

  function setNav(key: keyof SiteCopy['nav'], value: string) {
    setDraft((d) => ({ ...d, nav: { ...d.nav, [key]: value } }))
  }

  function setDock(key: keyof SiteCopy['dock'], value: string) {
    setDraft((d) => ({ ...d, dock: { ...d.dock, [key]: value } }))
  }

  function setFooter(key: keyof SiteCopy['footer'], value: string) {
    setDraft((d) => ({ ...d, footer: { ...d.footer, [key]: value } }))
  }

  function setChrome(key: keyof SiteCopy['chrome'], value: string) {
    setDraft((d) => ({ ...d, chrome: { ...d.chrome, [key]: value } }))
  }

  function setPage(page: (typeof PAGE_KEYS)[number], key: keyof PageCopy, value: string) {
    setDraft((d) => ({
      ...d,
      pages: {
        ...d.pages,
        [page]: { ...d.pages[page], [key]: value },
      },
    }))
  }

  async function onSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setStatus('')
    const result = await save(draft)
    setSaving(false)
    setStatus(result.error ? `저장 실패: ${result.error}` : '저장했습니다. 사이트에 바로 반영됩니다.')
  }

  return (
    <form className="admin-panel" onSubmit={(e) => void onSave(e)}>
      <div className="admin-panel-head">
        <h2>네비·페이지 문구</h2>
        <div className="admin-actions">
          <button
            type="button"
            className="btn btn-light"
            onClick={() => {
              if (confirm('기본 문구로 되돌릴까요? (저장 전까지 반영되지 않습니다)')) {
                setDraft(SITE_COPY_DEFAULTS)
              }
            }}
          >
            기본값 불러오기
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? '저장 중…' : '문구 저장'}
          </button>
        </div>
      </div>
      {status ? <p className="admin-status">{status}</p> : null}

      <section className="admin-card">
        <h3>상단 띠·배너</h3>
        <label>
          상단 한 줄
          <input value={draft.chrome.topline} onChange={(e) => setChrome('topline', e.target.value)} />
        </label>
        <label>
          스타일 배너
          <input value={draft.chrome.styleBanner} onChange={(e) => setChrome('styleBanner', e.target.value)} />
        </label>
      </section>

      <section className="admin-card">
        <h3>네비게이션 메뉴</h3>
        <div className="admin-grid-2">
          {(Object.keys(draft.nav) as (keyof SiteCopy['nav'])[]).map((key) => (
            <label key={key}>
              {key}
              <input value={draft.nav[key]} onChange={(e) => setNav(key, e.target.value)} />
            </label>
          ))}
        </div>
      </section>

      <section className="admin-card">
        <h3>모바일 독 · 푸터</h3>
        <div className="admin-grid-2">
          {(Object.keys(draft.dock) as (keyof SiteCopy['dock'])[]).map((key) => (
            <label key={`dock-${key}`}>
              dock.{key}
              <input value={draft.dock[key]} onChange={(e) => setDock(key, e.target.value)} />
            </label>
          ))}
          {(Object.keys(draft.footer) as (keyof SiteCopy['footer'])[]).map((key) => (
            <label key={`footer-${key}`}>
              footer.{key}
              <input value={draft.footer[key]} onChange={(e) => setFooter(key, e.target.value)} />
            </label>
          ))}
        </div>
      </section>

      {PAGE_KEYS.map((page) => (
        <section className="admin-card" key={page}>
          <h3>{PAGE_LABELS[page]} 페이지</h3>
          <label>
            배너 제목
            <input value={draft.pages[page].title} onChange={(e) => setPage(page, 'title', e.target.value)} />
          </label>
          <label>
            배너 설명
            <textarea
              rows={2}
              value={draft.pages[page].description}
              onChange={(e) => setPage(page, 'description', e.target.value)}
            />
          </label>
          <label>
            섹션 kicker
            <input value={draft.pages[page].kicker} onChange={(e) => setPage(page, 'kicker', e.target.value)} />
          </label>
          <label>
            섹션 제목 (줄바꿈은 Enter)
            <textarea rows={2} value={draft.pages[page].h2} onChange={(e) => setPage(page, 'h2', e.target.value)} />
          </label>
          <label>
            섹션 안내문
            <textarea rows={3} value={draft.pages[page].lead} onChange={(e) => setPage(page, 'lead', e.target.value)} />
          </label>
        </section>
      ))}

      <div className="admin-actions sticky">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? '저장 중…' : '문구 저장'}
        </button>
      </div>
    </form>
  )
}

function blankNewItem(suggestedId: string): LibraryItemRow {
  return {
    id: suggestedId,
    title: '',
    description: '',
    category: 'life',
    tag: '',
    path_no: suggestedId,
    sort_order: Number(suggestedId) || 0,
    published: true,
    ebook_cover_path: null,
    comic_cover_path: null,
    audiobook_cover_path: null,
    ebook_pdf_path: null,
    comic_pdf_path: null,
    audiobook_text_path: null,
  }
}

function AdminLibraryPanel() {
  const [rows, setRows] = useState<LibraryItemRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<LibraryItemRow>(() => blankNewItem('51'))
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [audiobookIndex, setAudiobookIndex] = useState<Record<string, string>>({})

  const isNewMode = selectedId === null
  const rowMap = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows])

  const catalog = useMemo(() => {
    const ids = new Set([...PATH_CARDS.map((c) => c.id), ...rows.map((r) => r.id)])
    return [...ids].sort((a, b) => a.localeCompare(b))
  }, [rows])

  const nextNewId = useMemo(() => {
    let n = 51
    const used = new Set(catalog)
    while (used.has(String(n).padStart(2, '0')) || used.has(String(n))) n += 1
    return String(n).padStart(2, '0')
  }, [catalog])

  const staticAssets = useMemo(() => {
    if (isNewMode) {
      return {
        ebookCoverUrl: null,
        ebookPdfUrl: null,
        comicPdfUrl: null,
        audiobookTextUrl: null,
        audiobookTextName: null,
      }
    }
    return getStaticLibraryAssets(draft.id, audiobookIndex)
  }, [isNewMode, draft.id, audiobookIndex])

  async function reload() {
    const list = await fetchLibraryItems(true)
    setRows(list)
  }

  useEffect(() => {
    void reload()
    void loadAudiobookIndex().then(setAudiobookIndex)
  }, [])

  useEffect(() => {
    if (selectedId === null) {
      setDraft(blankNewItem(nextNewId))
      return
    }
    const existing = rowMap.get(selectedId)
    setDraft(existing ? { ...existing } : emptyItem(selectedId))
    // nextNewId / rowMap 변경으로 새 작성 중 폼이 덮이지 않게 selectedId만 반응
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  // 기존 항목 선택 중 DB 갱신되면 draft 동기화
  useEffect(() => {
    if (selectedId === null) return
    const existing = rowMap.get(selectedId)
    if (existing) setDraft({ ...existing })
  }, [rowMap, selectedId])

  function withCatalogMeta(item: LibraryItemRow) {
    return fillLibraryItemFromCatalog(item)
  }

  function startNewUpload() {
    setSelectedId(null)
    setDraft(blankNewItem(nextNewId))
    setStatus('새 항목 모드입니다. 번호·제목을 적고 파일을 올린 뒤 저장하세요.')
  }

  function selectItem(id: string) {
    if (selectedId === id) {
      startNewUpload()
      return
    }
    setSelectedId(id)
    setStatus('')
  }

  async function saveMeta() {
    const id = draft.id.trim()
    if (!id) {
      setStatus('번호를 입력해 주세요. (예: 51)')
      return
    }
    if (!draft.title.trim()) {
      setStatus('제목을 입력해 주세요.')
      return
    }
    setBusy(true)
    setStatus('')
    const payload = withCatalogMeta({ ...draft, id, path_no: draft.path_no || id })
    const result = await upsertLibraryItem(payload)
    setBusy(false)
    if (result.error) {
      setStatus(`저장 실패: ${result.error}`)
      return
    }
    setSelectedId(id)
    setDraft(payload)
    setStatus(isNewMode ? '새 항목을 추가했습니다.' : '메타데이터를 저장했습니다.')
    await reload()
  }

  async function onUpload(kind: LibraryUploadKind, file: File | null) {
    if (!file) return
    const id = draft.id.trim()
    if (!id) {
      setStatus('먼저 번호를 입력해 주세요. (예: 51)')
      return
    }
    if (!draft.title.trim()) {
      setStatus('먼저 제목을 입력한 뒤 파일을 올려 주세요.')
      return
    }
    setBusy(true)
    setStatus('')
    const base = withCatalogMeta({ ...draft, id, path_no: draft.path_no || id })
    const { bucket, field } = libraryUploadConfig(kind)
    const uploaded = await uploadLibraryFile(kind, base.id, file)
    if (uploaded.error || !uploaded.path) {
      setBusy(false)
      setStatus(`업로드 실패: ${uploaded.error || '알 수 없는 오류'}`)
      return
    }
    const prevPath = base[field] as string | null
    const next = { ...base, [field]: uploaded.path }
    const result = await upsertLibraryItem(next)
    if (!result.error && prevPath && prevPath !== uploaded.path) {
      await removeLibraryFile(bucket, prevPath)
    }
    setDraft(next)
    setSelectedId(id)
    setBusy(false)
    setStatus(result.error ? `파일은 올렸지만 메타 저장 실패: ${result.error}` : '파일을 올렸습니다. 사이트에 바로 반영됩니다.')
    await reload()
  }

  async function clearFile(kind: LibraryUploadKind) {
    const { bucket, field } = libraryUploadConfig(kind)
    const path = draft[field] as string | null
    if (!path) return
    if (!confirm('이 파일을 삭제할까요? 정적(기본) 파일이 있으면 그쪽으로 돌아갑니다.')) return
    setBusy(true)
    await removeLibraryFile(bucket, path)
    const next = { ...withCatalogMeta(draft), [field]: null }
    await upsertLibraryItem(next)
    setDraft(next)
    setBusy(false)
    setStatus('파일을 삭제했습니다.')
    await reload()
  }

  async function removeItem() {
    if (isNewMode) return
    if (!confirm(`항목 ${draft.id} 메타데이터를 삭제할까요? (Storage 파일은 별도)`)) return
    setBusy(true)
    const result = await deleteLibraryItem(draft.id)
    setBusy(false)
    setStatus(result.error ? `삭제 실패: ${result.error}` : '항목을 삭제했습니다.')
    startNewUpload()
    await reload()
  }

  function onFile(kind: LibraryUploadKind) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null
      e.target.value = ''
      void onUpload(kind, file)
    }
  }

  function AssetSlot({
    label,
    uploadedPath,
    staticUrl,
    staticLabel,
    accept,
    kind,
    isImage,
  }: {
    label: string
    uploadedPath: string | null
    staticUrl: string | null
    staticLabel?: string | null
    accept: string
    kind: LibraryUploadKind
    isImage?: boolean
  }) {
    const bucket = libraryUploadConfig(kind).bucket
    const preview = isImage ? libraryPublicUrl('library-covers', uploadedPath) || staticUrl : null
    const activeUrl = uploadedPath ? libraryPublicUrl(bucket, uploadedPath) : staticUrl
    const source = uploadedPath ? '업로드 파일' : staticUrl ? '기본 파일' : '없음'

    return (
      <div className="admin-asset-slot">
        <b>{label}</b>
        {isImage && preview ? <img className="admin-cover-preview" src={preview} alt="" /> : null}
        <p className="admin-asset-source">
          현재: <strong>{source}</strong>
          {staticLabel && !uploadedPath ? <span> · {staticLabel}</span> : null}
        </p>
        {activeUrl && !isImage ? (
          <a className="admin-asset-link" href={activeUrl} target="_blank" rel="noreferrer">
            지금 파일 열기
          </a>
        ) : null}
        <input type="file" accept={accept} onChange={onFile(kind)} disabled={busy} />
        <small>
          {uploadedPath || (staticUrl ? '기본 파일 사용 중 · 올리면 교체됩니다' : '파일 없음 · 여기서 새로 올릴 수 있습니다')}
        </small>
        {uploadedPath ? (
          <button type="button" className="btn btn-light btn-sm" onClick={() => void clearFile(kind)}>
            업로드 삭제 (기본으로)
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>라이브러리 파일</h2>
        <p className="admin-hint">
          왼쪽 번호를 누르면 기존 책을 수정합니다. 같은 번호를 다시 누르면 선택이 풀리고{' '}
          <b>새로 올리기</b> 모드로 바뀝니다.
        </p>
      </div>
      {status ? <p className="admin-status">{status}</p> : null}

      <div className="admin-library-layout">
        <aside className="admin-card admin-library-list">
          <button
            type="button"
            className={`admin-new-upload-btn${isNewMode ? ' active' : ''}`}
            onClick={startNewUpload}
          >
            + 새로 올리기
          </button>
          <h3>기존 항목</h3>
          <p className="admin-hint" style={{ margin: 0 }}>
            같은 번호를 다시 누르면 선택이 해제됩니다.
          </p>
          <div className="admin-id-list">
            {catalog.map((id) => {
              const row = rowMap.get(id)
              const title = row?.title || PATH_CARDS.find((c) => c.id === id)?.title || id
              return (
                <button
                  key={id}
                  type="button"
                  className={selectedId === id ? 'active' : ''}
                  onClick={() => selectItem(id)}
                >
                  <b>{id}</b>
                  <span>{title}</span>
                  {row ? <i>수정됨</i> : <i className="muted">기본</i>}
                </button>
              )
            })}
          </div>
        </aside>

        <div className="admin-card admin-library-edit">
          <h3>
            {isNewMode ? `새 항목 올리기${busy ? ' (처리 중…)' : ''}` : `${draft.id} · 편집${busy ? ' (처리 중…)' : ''}`}
          </h3>
          {isNewMode ? (
            <p className="admin-hint" style={{ marginTop: 0 }}>
              번호와 제목을 먼저 적고, 전자책·만화·오디오북 파일을 올리세요. 기본 00번과는 별개로 추가됩니다.
            </p>
          ) : null}

          <div className="admin-grid-2">
            <label>
              번호 (ID)
              <input
                value={draft.id}
                onChange={(e) => {
                  const id = e.target.value.trim()
                  setDraft((d) => ({ ...d, id, path_no: d.path_no === d.id ? id : d.path_no }))
                }}
                placeholder="예: 51"
                disabled={!isNewMode && PATH_CARDS.some((c) => c.id === draft.id)}
              />
            </label>
            <label>
              제목
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </label>
            <label>
              태그
              <input value={draft.tag} onChange={(e) => setDraft({ ...draft, tag: e.target.value })} />
            </label>
            <label>
              번호 표시
              <input value={draft.path_no} onChange={(e) => setDraft({ ...draft, path_no: e.target.value })} />
            </label>
            <label>
              카테고리
              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as PathCategory })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              정렬
              <input
                type="number"
                value={draft.sort_order}
                onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })}
              />
            </label>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
              />
              공개
            </label>
          </div>
          <label>
            설명
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </label>

          <div className="admin-upload-sections">
            <section className="admin-upload-block">
              <h4>전자책</h4>
              <div className="admin-upload-grid">
                <AssetSlot
                  label="전자책 썸네일"
                  uploadedPath={draft.ebook_cover_path}
                  staticUrl={staticAssets.ebookCoverUrl}
                  accept="image/png,image/jpeg,image/webp"
                  kind="ebookCover"
                  isImage
                />
                <AssetSlot
                  label="전자책 PDF"
                  uploadedPath={draft.ebook_pdf_path}
                  staticUrl={staticAssets.ebookPdfUrl}
                  staticLabel={staticAssets.ebookPdfUrl ? '기본 PDF' : undefined}
                  accept="application/pdf"
                  kind="ebookPdf"
                />
              </div>
            </section>

            <section className="admin-upload-block">
              <h4>만화</h4>
              <div className="admin-upload-grid">
                <AssetSlot
                  label="만화 썸네일"
                  uploadedPath={draft.comic_cover_path}
                  staticUrl={staticAssets.ebookCoverUrl}
                  accept="image/png,image/jpeg,image/webp"
                  kind="comicCover"
                  isImage
                />
                <AssetSlot
                  label="만화 PDF"
                  uploadedPath={draft.comic_pdf_path}
                  staticUrl={staticAssets.comicPdfUrl}
                  staticLabel={staticAssets.comicPdfUrl ? '기본 PDF' : undefined}
                  accept="application/pdf"
                  kind="comicPdf"
                />
              </div>
            </section>

            <section className="admin-upload-block">
              <h4>오디오북</h4>
              <div className="admin-upload-grid">
                <AssetSlot
                  label="오디오북 썸네일"
                  uploadedPath={draft.audiobook_cover_path}
                  staticUrl={staticAssets.ebookCoverUrl}
                  accept="image/png,image/jpeg,image/webp"
                  kind="audiobookCover"
                  isImage
                />
                <AssetSlot
                  label="오디오북 텍스트"
                  uploadedPath={draft.audiobook_text_path}
                  staticUrl={staticAssets.audiobookTextUrl}
                  staticLabel={staticAssets.audiobookTextName || undefined}
                  accept=".txt,text/plain"
                  kind="audiobookText"
                />
              </div>
            </section>
          </div>

          <div className="admin-actions">
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void saveMeta()}>
              {isNewMode ? '새 항목 저장' : '메타 저장'}
            </button>
            {!isNewMode && rowMap.has(draft.id) ? (
              <button type="button" className="btn btn-danger" disabled={busy} onClick={() => void removeItem()}>
                DB 항목 삭제
              </button>
            ) : null}
            {!isNewMode ? (
              <button type="button" className="btn btn-light" disabled={busy} onClick={startNewUpload}>
                선택 해제 · 새로 올리기
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
