import { useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { useAuthStore } from '@/shared/stores/authStore'

/**
 * Banner global que aparece debajo del Header cuando el cliente está
 * logueado pero todavía no verificó su email.
 *
 * - No frena ninguna acción: la verificación es opcional.
 * - El botón "Reenviar email" queda como placeholder hasta que exista el
 *   endpoint correspondiente en el backend.
 * - La X solo oculta el banner en la sesión actual (estado local).
 */
export function EmailVerificationBanner() {
  const cliente = useAuthStore((s) => s.cliente)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [dismissed, setDismissed] = useState(false)

  if (!isAuthenticated || !cliente) return null
  if (cliente.emailVerificado) return null
  if (dismissed) return null

  return (
    <div
      role="status"
      className="w-full bg-status-warning-bg dark:bg-status-warning-bg-dark border-b border-status-warning/30 dark:border-status-warning-dark/30"
    >
      <div className="max-w-content mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
        <AlertCircle
          className="h-4 w-4 flex-shrink-0 text-status-warning dark:text-status-warning-dark"
          aria-hidden="true"
        />
        <p className="flex-1 text-sm text-text-primary dark:text-text-primary-dark">
          Verificá tu email{' '}
          <span className="text-text-secondary dark:text-text-secondary-dark">
            ({cliente.email})
          </span>{' '}
          para asegurar tu cuenta.
        </p>
        <button
          type="button"
          disabled
          title="Próximamente"
          className="hidden sm:inline-block text-sm font-medium text-accent disabled:opacity-50 disabled:cursor-not-allowed hover:underline"
        >
          Reenviar email
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1 rounded-md text-text-muted dark:text-text-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-bg-hover dark:hover:bg-bg-hover-dark transition-colors"
          aria-label="Cerrar aviso"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
