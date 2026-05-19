import { DireccionesList } from '@/features/cuenta/components/DireccionesList'

export function DireccionesPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-1">
        Direcciones
      </h2>
      <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-6">
        Gestioná tus direcciones de envío
      </p>
      <DireccionesList />
    </div>
  )
}
