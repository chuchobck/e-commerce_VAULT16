import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useDestacados } from '@/features/home/hooks/useDestacados'
import { ProductCard } from '@/features/catalogo/components/ProductCard'
import { ProductSkeleton } from '@/features/catalogo/components/ProductSkeleton'

/**
 * Productos Destacados — grid horizontal scroll en mobile, 4 cols desktop.
 */
export function ProductosDestacados() {
  const { data: productos, isLoading, isError } = useDestacados()

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className="py-16 sm:py-20 max-w-content mx-auto px-4 sm:px-6"
    >
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <p className="text-xs font-mono uppercase tracking-widest text-accent mb-2">
          Destacados
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary dark:text-text-primary-dark">
          Lo más vendido del drop
        </h2>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }, (_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-12">
          <p className="text-text-secondary dark:text-text-secondary-dark">
            No pudimos cargar los productos. Intentá de nuevo más tarde.
          </p>
        </div>
      )}

      {/* Products grid */}
      {productos && productos.length > 0 && (
        <>
          {/* Mobile: horizontal scroll */}
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 sm:hidden">
            {productos.map((producto) => (
              <div key={producto.id} className="flex-shrink-0 w-[240px] snap-start">
                <ProductCard producto={producto} />
              </div>
            ))}
          </div>

          {/* Tablet+: grid */}
          <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {productos.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        </>
      )}

      {/* Empty state (backend up but no products) */}
      {productos && productos.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-text-muted dark:text-text-muted-dark">
            No hay productos destacados aún.
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 sm:mt-12 text-center">
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline transition-colors"
        >
          Ver todos
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </motion.section>
  )
}
