import { useParams, Navigate } from 'react-router-dom'
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'

export function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-1">
        Nueva contraseña
      </h2>
      <ResetPasswordForm token={token} />
    </div>
  )
}
