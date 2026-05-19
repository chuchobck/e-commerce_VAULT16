import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const iconColors: Record<ToastType, string> = {
  success: 'text-status-success dark:text-status-success-dark',
  error: 'text-status-danger dark:text-status-danger-dark',
  warning: 'text-status-warning dark:text-status-warning-dark',
  info: 'text-accent',
}

function showToast(type: ToastType, message: string) {
  const Icon = icons[type]
  const colorClass = iconColors[type]

  toast.custom(
    (t) => (
      <div
        className={`
          flex items-start gap-3 max-w-sm w-full p-4 rounded-lg shadow-modal dark:shadow-modal-dark
          bg-bg-surface dark:bg-bg-card-dark
          border border-border-base dark:border-border-base-dark
          transition-all duration-normal
          ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        `}
        role="alert"
      >
        <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${colorClass}`} aria-hidden="true" />
        <p className="flex-1 text-sm text-text-primary dark:text-text-primary-dark">{message}</p>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="flex-shrink-0 text-text-muted dark:text-text-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors"
          aria-label="Cerrar notificación"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ),
    { duration: 4000, position: 'bottom-right' },
  )
}

export function useToast() {
  const success = useCallback((msg: string) => showToast('success', msg), [])
  const error = useCallback((msg: string) => showToast('error', msg), [])
  const warning = useCallback((msg: string) => showToast('warning', msg), [])
  const info = useCallback((msg: string) => showToast('info', msg), [])

  return { success, error, warning, info }
}
