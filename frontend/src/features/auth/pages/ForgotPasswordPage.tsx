import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'

export function ForgotPasswordPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-1">
        Recuperar contraseña
      </h2>
      <ForgotPasswordForm />
    </div>
  )
}
