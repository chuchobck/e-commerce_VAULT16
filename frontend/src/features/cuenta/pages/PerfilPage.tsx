import { PerfilForm } from '@/features/cuenta/components/PerfilForm'

export function PerfilPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-1">
        Perfil
      </h2>
      <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-6">
        Administrá tu información personal
      </p>
      <PerfilForm />
    </div>
  )
}
