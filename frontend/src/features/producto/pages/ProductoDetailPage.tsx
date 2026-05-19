import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useProducto } from '@/features/producto/hooks/useProducto'
import { ProductGallery } from '@/features/producto/components/ProductGallery'
import { ProductInfo } from '@/features/producto/components/ProductInfo'
import { ProductosRelacionados } from '@/features/producto/components/ProductosRelacionados'

// ─── Skeleton ────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-64 bg-bg-hover dark:bg-bg-hover-dark rounded mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery skeleton */}
        <div className="aspect-product rounded-lg bg-bg-hover dark:bg-bg-hover-dark" />
        {/* Info skeleton */}
        <div className="space-y-4">
          <div className="h-8 w-3/4 bg-bg-hover dark:bg-bg-hover-dark rounded" />
          <div className="h-4 w-1/3 bg-bg-hover dark:bg-bg-hover-dark rounded" />
          <div className="h-7 w-1/4 bg-bg-hover dark:bg-bg-hover-dark rounded mt-6" />
          <div className="flex gap-2 mt-6">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="w-9 h-9 rounded-full bg-bg-hover dark:bg-bg-hover-dark" />
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="w-12 h-12 rounded-md bg-bg-hover dark:bg-bg-hover-dark" />
            ))}
          </div>
          <div className="h-12 w-full bg-bg-hover dark:bg-bg-hover-dark rounded-md mt-8" />
        </div>
      </div>
    </div>
  )
}

// ─── Error state ─────────────────────────────────────────────────────────────

function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-20 text-center"
    >
      <p className="text-6xl font-semibold text-text-muted dark:text-text-muted-dark mb-4">
        404
      </p>
      <h1 className="text-2xl font-semibold text-text-primary dark:text-text-primary-dark mb-2">
        Producto no encontrado
      </h1>
      <p className="text-text-secondary dark:text-text-secondary-dark mb-6">
        El producto que buscás no existe o fue eliminado.
      </p>
      <Link
        to="/catalogo"
        className="inline-flex items-center gap-2 text-accent hover:underline transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </Link>
    </motion.div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function ProductoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: producto, isLoading, isError } = useProducto(id ?? '')

  // Loading
  if (isLoading) {
    return (
      <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
        <DetailSkeleton />
      </div>
    )
  }

  // Error or inactive product
  if (isError || !producto || !producto.activo) {
    return (
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <NotFound />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-content mx-auto px-4 sm:px-6 py-8"
    >
      {/* Main detail grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left — Gallery */}
        <ProductGallery
          fotos={producto.fotos}
          productId={producto.id}
          productName={producto.nombre}
        />

        {/* Right — Info */}
        <ProductInfo producto={producto} />
      </div>

      {/* Related products */}
      <ProductosRelacionados producto={producto} />
    </motion.div>
  )
}
