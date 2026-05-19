import { Logo } from './Logo'
import { SearchBar } from './SearchBar'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'
import { CartIconButton } from './CartIconButton'
import { MainNav } from './MainNav'

/**
 * Header principal del e-commerce.
 *
 * Desktop (sm+):
 *   - ROW 1 (h-16): grid 3 cols [1fr_auto_1fr]
 *       · izquierda : Logo VAULT 16
 *       · centro    : SearchBar (max-w 520px, visualmente centrado)
 *       · derecha   : Theme + User + Cart
 *   - ROW 2 : MainNav
 *
 * Mobile (< sm):
 *   - ROW 1 (h-14): Logo izq + íconos der (Theme + User + Cart). No hay
 *     buscador en esta fila para no ahogarla.
 *   - ROW 2       : SearchBar persistente (siempre visible, no overlay)
 *   - ROW 3       : MainNav
 *
 * Sticky top-0, backdrop-blur, bg-bg-surface/90
 */
export function Header() {
  return (
    <header className="sticky top-0 z-sticky bg-bg-surface/90 dark:bg-bg-surface-dark/90 backdrop-blur-md">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        {/* ROW 1 — Logo + (Search desktop) + Íconos */}
        <div className="h-14 sm:h-16 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
          <div className="justify-self-start">
            <Logo />
          </div>

          {/* Search centrado — solo desktop */}
          <div className="hidden sm:flex justify-self-center w-full max-w-[520px] justify-center">
            <SearchBar />
          </div>

          {/* En mobile, el centro queda vacío para que el grid se cierre */}
          <div className="sm:hidden" />

          <div className="justify-self-end flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <UserMenu />
            <CartIconButton />
          </div>
        </div>

        {/* ROW 2 mobile — SearchBar persistente debajo del logo+íconos */}
        <div className="sm:hidden pb-3">
          <SearchBar />
        </div>
      </div>

      {/* ROW final — Navegación */}
      <div className="border-t border-border-base dark:border-border-base-dark">
        <div className="max-w-content mx-auto px-4 sm:px-6">
          <MainNav />
        </div>
      </div>
    </header>
  )
}
