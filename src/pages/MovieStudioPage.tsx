import { Navigate, useSearchParams } from 'react-router-dom'

/** Old /movie-studio URL stays on the homepage studio, without leaving the main page. */
export function MovieStudioPage() {
  const [params] = useSearchParams()
  const next = new URLSearchParams()
  next.set('tab', params.get('tab') || 'video')
  const book = params.get('book')
  if (book) next.set('book', book)
  return <Navigate to={`/?${next.toString()}#studio`} replace />
}
