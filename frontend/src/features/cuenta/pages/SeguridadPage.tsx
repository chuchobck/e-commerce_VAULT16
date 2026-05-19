import { CambiarPasswordForm } from '@/features/cuenta/components/CambiarPasswordForm'

export function SeguridadPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-1">
        Seguridad
      </h2>
      <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-6">
        Cambiá tu contraseña
      </p>
      <CambiarPasswordForm />
    </div>
  )
}
