import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { ToastProvider } from '@/shared/components/feedback/Toast'
import { CarritoDrawer } from '@/features/carrito/components/CarritoDrawer'

/**
 * EcommerceLayout — Wrapper principal.
 * Header arriba, contenido (<Outlet />) en el medio, Footer abajo.
 * CarritoDrawer rendered globally so it can be opened from anywhere.
 * min-h-screen flex flex-col → footer siempre al fondo.
 */
export function EcommerceLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-base dark:bg-bg-base-dark">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CarritoDrawer />
      <ToastProvider />
    </div>
  )
}
