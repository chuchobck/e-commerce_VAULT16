import { Outlet } from 'react-router-dom'
import { CuentaSidebar } from '@/features/cuenta/components/CuentaSidebar'

/**
 * CuentaLayout — EcommerceLayout child with sidebar.
 * Used for /mi-cuenta/* protected routes.
 */
export function CuentaLayout() {
  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-semibold text-text-primary dark:text-text-primary-dark mb-6">
        Mi cuenta
      </h1>
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <aside className="md:w-56 flex-shrink-0">
          <CuentaSidebar />
        </aside>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
