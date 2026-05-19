import { Suspense, lazy } from 'react'
import { HeroBanner } from '@/features/home/components/HeroBanner'

// Lazy load below-the-fold sections
const ProductosDestacados = lazy(() =>
  import('@/features/home/components/ProductosDestacados').then((m) => ({
    default: m.ProductosDestacados,
  })),
)
const CategoriasGrid = lazy(() =>
  import('@/features/home/components/CategoriasGrid').then((m) => ({
    default: m.CategoriasGrid,
  })),
)
const BannerPromocion = lazy(() =>
  import('@/features/home/components/BannerPromocion').then((m) => ({
    default: m.BannerPromocion,
  })),
)
const NewsletterCTA = lazy(() =>
  import('@/features/home/components/NewsletterCTA').then((m) => ({
    default: m.NewsletterCTA,
  })),
)

function SectionFallback() {
  return (
    <div className="py-20 flex items-center justify-center">
      <div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

/**
 * HomePage — compone todas las secciones en orden.
 * 1. Hero Carrusel (above-the-fold)
 * 2. Productos Destacados
 * 3. Categorías Grid
 * 4. Banner Promoción
 * 5. Newsletter CTA
 */
export function HomePage() {
  return (
    <>
      {/* 1. Hero — above the fold, eager loaded */}
      <HeroBanner />

      {/* 2–5. Below-the-fold — lazy loaded */}
      <Suspense fallback={<SectionFallback />}>
        <ProductosDestacados />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <CategoriasGrid />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <BannerPromocion />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <NewsletterCTA />
      </Suspense>
    </>
  )
}
