import { Logo } from './Logo'
import { SearchBar } from './SearchBar'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'
import { CartIconButton } from './CartIconButton'
import { MainNav } from './MainNav'

/**
 * Header principal del e-commerce.
 *
 * ROW 1 (h-16): Logo izq | SearchBar centro | ThemeToggle + UserMenu + CartIcon der
 * ROW 2 (h-12): MainNav centrada con 4 links
 *
 * Sticky top-0, backdrop-blur, bg-bg-surface/90
 */
export function Header() {
  return (
    <header className="sticky top-0 z-sticky bg-bg-surface/90 dark:bg-bg-surface-dark/90 backdrop-blur-md">
      {/* ROW 1 */}
      <div className="h-16 max-w-content mx-auto px-4 sm:px-6 flex items-center">
        {/* Izquierda — Logo */}
        <Logo />

        {/* Centro — SearchBar (flex-1 en desktop, icono en mobile) */}
        <SearchBar />

        {/* Derecha — Controles */}
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <UserMenu />
          <CartIconButton />
        </div>
      </div>

      {/* ROW 2 — Navegación */}
      <div className="border-t border-border-base dark:border-border-base-dark">
        <div className="max-w-content mx-auto px-4 sm:px-6">
          <MainNav />
        </div>
      </div>
    </header>
  )
}
