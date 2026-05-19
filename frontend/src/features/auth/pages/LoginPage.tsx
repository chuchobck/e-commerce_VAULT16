import { LoginForm } from '@/features/auth/components/LoginForm'

export function LoginPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-1">
        Iniciar sesión
      </h2>
      <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-6">
        Ingresá a tu cuenta VAULT 16
      </p>
      <LoginForm />
    </div>
  )
}
