import { Outlet } from 'react-router-dom'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'
import { EmailVerificationBanner } from './EmailVerificationBanner'
import { ToastProvider } from '@/shared/components/feedback/Toast'
import { useCarrito } from '@/features/carrito/hooks/useCarrito'

/**
 * CheckoutLayout — wrapper enfocado para /checkout.
 *
 * A diferencia de EcommerceLayout:
 *   - Header "slim": solo Logo + ThemeToggle + UserMenu.
 *     No hay SearchBar, MainNav (Home/Catálogo/Promociones/Contacto) ni
 *     CartIconButton — todo eso distrae del pago.
 *   - No hay Footer.
 *   - No hay CarritoDrawer (estás en la página de pago, no tiene sentido
 *     abrir el carrito como overlay; para revisar/editar items hay un link
 *     "← Volver al carrito" en la propia página).
 *
 * EmailVerificationBanner y ToastProvider se mantienen.
 */
export function CheckoutLayout() {
  // Hydrate carrito from backend on mount (necesario porque CheckoutPage
  // depende del store local)
  useCarrito()

  return (
    <div className="min-h-screen flex flex-col bg-bg-base dark:bg-bg-base-dark">
      <header className="sticky top-0 z-sticky bg-bg-surface/90 dark:bg-bg-surface-dark/90 backdrop-blur-md border-b border-border-base dark:border-border-base-dark">
        <div className="max-w-content mx-auto px-4 sm:px-6">
          <div className="h-14 sm:h-16 flex items-center justify-between gap-3">
            <Logo />
            <div className="flex items-center gap-1 sm:gap-2">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <EmailVerificationBanner />

      <main className="flex-1">
        <Outlet />
      </main>

      <ToastProvider />
    </div>
  )
}
