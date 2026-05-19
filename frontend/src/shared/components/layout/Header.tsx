import { Logo } from './Logo'
import { SearchBar } from './SearchBar'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'
import { CartIconButton } from './CartIconButton'
import { MainNav } from './MainNav'

/**
 * Header principal del e-commerce.
 *
 * ROW 1 (h-16): grid 3 columnas [1fr | auto | 1fr] para garantizar que el
 * buscador quede VISUALMENTE centrado independientemente del ancho del logo o
 * los íconos de la derecha.
 *   - Izquierda  : Logo VAULT 16 (justify-self-start)
 *   - Centro     : SearchBar     (justify-self-center, ancho fijo en desktop)
 *   - Derecha    : Theme + User + Cart (justify-self-end, agrupados)
 *
 * ROW 2 (h-12): MainNav centrada con 4 links.
 *
 * Sticky top-0, backdrop-blur, bg-bg-surface/90
 */
export function Header() {
  return (
    <header className="sticky top-0 z-sticky bg-bg-surface/90 dark:bg-bg-surface-dark/90 backdrop-blur-md">
      {/* ROW 1 */}
      <div className="h-16 max-w-content mx-auto px-4 sm:px-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Izquierda — Logo */}
        <div className="justify-self-start">
          <Logo />
        </div>

        {/* Centro — SearchBar */}
        <div className="justify-self-center w-full max-w-[520px] flex justify-center">
          <SearchBar />
        </div>

        {/* Derecha — Controles agrupados */}
        <div className="justify-self-end flex items-center gap-1 sm:gap-2">
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
