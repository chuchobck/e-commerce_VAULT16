import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/shared/stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * HOC that verifies authentication.
 * - Not authenticated → redirect to /login with returnUrl
 *
 * Nota: ya NO bloqueamos por email_verificado. El cliente recién registrado
 * puede acceder al checkout sin verificar el email; el banner global en el
 * header se encarga de recordárselo.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />
  }

  return <>{children}</>
}
