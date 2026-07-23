import { Navigate } from 'react-router-dom'

/** @deprecated use /admin?tab=responses */
export function AdminResponsesPage() {
  return <Navigate to="/admin?tab=responses" replace />
}
