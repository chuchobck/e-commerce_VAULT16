import { RegisterForm } from '@/features/auth/components/RegisterForm'

export function RegisterPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-1">
        Crear cuenta
      </h2>
      <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-6">
        Unite a VAULT 16
      </p>
      <RegisterForm />
    </div>
  )
}
