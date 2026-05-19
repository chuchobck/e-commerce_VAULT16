import { NavLink } from 'react-router-dom'
import { User, MapPin, Lock, Package } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

const links = [
  { to: '/mi-cuenta',              icon: User,    label: 'Perfil',      end: true },
  { to: '/mi-cuenta/direcciones',  icon: MapPin,  label: 'Direcciones', end: false },
  { to: '/mi-cuenta/seguridad',    icon: Lock,    label: 'Seguridad',   end: false },
  { to: '/mi-cuenta/pedidos',      icon: Package, label: 'Mis pedidos', end: false },
]

/**
 * CuentaSidebar — persistent navigation for account pages.
 * Desktop: vertical sidebar. Mobile: horizontal tabs.
 */
export function CuentaSidebar() {
  return (
    <nav
      className="flex md:flex-col gap-1 overflow-x-auto scrollbar-hide md:overflow-visible border-b md:border-b-0 md:border-r border-border-base dark:border-border-base-dark pb-2 md:pb-0 md:pr-6"
      aria-label="Navegación de cuenta"
    >
      {links.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'bg-accent/10 text-accent'
                : 'text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-bg-hover dark:hover:bg-bg-hover-dark',
            )
          }
        >
          <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
