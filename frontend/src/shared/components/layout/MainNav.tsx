import { NavLink } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/promociones', label: 'Promociones' },
  { to: '/contacto', label: 'Contacto' },
] as const

/**
 * MainNav — Row 2 del header.
 * 4 links centrados con NavLink activo (underline + accent).
 */
export function MainNav() {
  return (
    <nav className="flex items-center justify-center gap-8 h-12" aria-label="Navegación principal">
      {NAV_LINKS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'text-sm font-medium transition-colors duration-fast pb-0.5',
              isActive
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark',
            )
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
