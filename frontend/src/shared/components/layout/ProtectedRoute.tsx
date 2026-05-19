import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/shared/stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * HOC that verifies authentication.
 * - Not authenticated → redirect to /login with returnUrl
 * - Authenticated but email not verified → redirect to /verify-email-pending
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, cliente } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />
  }

  if (cliente && !cliente.emailVerificado) {
    return <Navigate to="/verify-email-pending" replace />
  }

  return <>{children}</>
}
