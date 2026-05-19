import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { EcommerceLayout } from '@/shared/components/layout/EcommerceLayout'
import { AuthLayout } from '@/shared/components/layout/AuthLayout'
import { CuentaLayout } from '@/shared/components/layout/CuentaLayout'
import { ProtectedRoute } from '@/shared/components/layout/ProtectedRoute'

// ─── Lazy-loaded pages ───────────────────────────────────────────────────────

const HomePage = lazy(() =>
  import('@/features/home/pages/HomePage').then((m) => ({ default: m.HomePage })),
)
const CatalogoPage = lazy(() =>
  import('@/features/catalogo/pages/CatalogoPage').then((m) => ({ default: m.CatalogoPage })),
)
const CategoriaPage = lazy(() =>
  import('@/features/catalogo/pages/CategoriaPage').then((m) => ({ default: m.CategoriaPage })),
)
const ProductoDetailPage = lazy(() =>
  import('@/features/producto/pages/ProductoDetailPage').then((m) => ({ default: m.ProductoDetailPage })),
)
const CarritoPage = lazy(() =>
  import('@/features/carrito/pages/CarritoPage').then((m) => ({ default: m.CarritoPage })),
)

// Auth pages
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
const VerifyEmailPage = lazy(() =>
  import('@/features/auth/pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })),
)
const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
)
const ResetPasswordPage = lazy(() =>
  import('@/features/auth/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
)

// Cuenta pages
const PerfilPage = lazy(() =>
  import('@/features/cuenta/pages/PerfilPage').then((m) => ({ default: m.PerfilPage })),
)
const DireccionesPage = lazy(() =>
  import('@/features/cuenta/pages/DireccionesPage').then((m) => ({ default: m.DireccionesPage })),
)
const SeguridadPage = lazy(() =>
  import('@/features/cuenta/pages/SeguridadPage').then((m) => ({ default: m.SeguridadPage })),
)

// Pedidos pages
const PedidosPage = lazy(() =>
  import('@/features/pedidos/pages/PedidosPage').then((m) => ({ default: m.PedidosPage })),
)
const PedidoDetailPage = lazy(() =>
  import('@/features/pedidos/pages/PedidoDetailPage').then((m) => ({ default: m.PedidoDetailPage })),
)

// Checkout pages
const CheckoutPage = lazy(() =>
  import('@/features/checkout/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })),
)
const ConfirmacionPage = lazy(() =>
  import('@/features/checkout/pages/ConfirmacionPage').then((m) => ({ default: m.ConfirmacionPage })),
)

// Promociones + Static pages
const PromocionesPage = lazy(() =>
  import('@/features/promociones/pages/PromocionesPage').then((m) => ({ default: m.PromocionesPage })),
)
const AcercaPage = lazy(() =>
  import('@/features/estaticas/pages/AcercaPage').then((m) => ({ default: m.AcercaPage })),
)
const ContactoPage = lazy(() =>
  import('@/features/estaticas/pages/ContactoPage').then((m) => ({ default: m.ContactoPage })),
)
const TerminosPage = lazy(() =>
  import('@/features/estaticas/pages/TerminosPage').then((m) => ({ default: m.TerminosPage })),
)
const PrivacidadPage = lazy(() =>
  import('@/features/estaticas/pages/PrivacidadPage').then((m) => ({ default: m.PrivacidadPage })),
)

// ─── Page loader ─────────────────────────────────────────────────────────────

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ─── Suspense wrapper ────────────────────────────────────────────────────────

function SuspensePage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

// ─── Router ──────────────────────────────────────────────────────────────────

export function AppRouter() {
  return (
    <Routes>
      {/* ── Rutas con layout principal (Header + Footer) ───────────────── */}
      <Route element={<EcommerceLayout />}>
        <Route path="/" element={<SuspensePage><HomePage /></SuspensePage>} />
        <Route path="/catalogo" element={<SuspensePage><CatalogoPage /></SuspensePage>} />
        <Route path="/categoria/:id" element={<SuspensePage><CategoriaPage /></SuspensePage>} />
        <Route path="/producto/:id" element={<SuspensePage><ProductoDetailPage /></SuspensePage>} />
        <Route path="/carrito" element={<SuspensePage><CarritoPage /></SuspensePage>} />

        <Route path="/promociones" element={<SuspensePage><PromocionesPage /></SuspensePage>} />
        <Route path="/contacto" element={<SuspensePage><ContactoPage /></SuspensePage>} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <SuspensePage><CheckoutPage /></SuspensePage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/confirmacion/:idFactura"
          element={
            <ProtectedRoute>
              <SuspensePage><ConfirmacionPage /></SuspensePage>
            </ProtectedRoute>
          }
        />
        <Route path="/acerca" element={<SuspensePage><AcercaPage /></SuspensePage>} />
        <Route path="/terminos" element={<SuspensePage><TerminosPage /></SuspensePage>} />
        <Route path="/privacidad" element={<SuspensePage><PrivacidadPage /></SuspensePage>} />

        {/* ── Cuenta (protegida) ─────────────────────────────────────── */}
        <Route
          path="/mi-cuenta"
          element={
            <ProtectedRoute>
              <CuentaLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SuspensePage><PerfilPage /></SuspensePage>} />
          <Route path="direcciones" element={<SuspensePage><DireccionesPage /></SuspensePage>} />
          <Route path="seguridad" element={<SuspensePage><SeguridadPage /></SuspensePage>} />
          <Route path="pedidos" element={<SuspensePage><PedidosPage /></SuspensePage>} />
          <Route path="pedidos/:id" element={<SuspensePage><PedidoDetailPage /></SuspensePage>} />
        </Route>

        {/* Legacy routes → redirect */}
        <Route path="/cuenta/perfil" element={<SuspensePage><PerfilPage /></SuspensePage>} />
        <Route path="/cuenta/pedidos" element={<SuspensePage><PedidosPage /></SuspensePage>} />
        <Route path="/cuenta/direcciones" element={<SuspensePage><DireccionesPage /></SuspensePage>} />
      </Route>

      {/* ── Rutas auth (AuthLayout — sin Header/Footer) ────────────── */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<SuspensePage><LoginPage /></SuspensePage>} />
        <Route path="/register" element={<SuspensePage><RegisterPage /></SuspensePage>} />
        <Route path="/verify-email/:token" element={<SuspensePage><VerifyEmailPage /></SuspensePage>} />
        <Route path="/forgot-password" element={<SuspensePage><ForgotPasswordPage /></SuspensePage>} />
        <Route path="/reset-password/:token" element={<SuspensePage><ResetPasswordPage /></SuspensePage>} />
      </Route>
    </Routes>
  )
}
