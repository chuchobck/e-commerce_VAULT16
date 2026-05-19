import { useState, useCallback } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useFiltros } from '@/features/catalogo/hooks/useFiltros'
import { useProductos } from '@/features/catalogo/hooks/useProductos'
import { FiltrosSidebar } from '@/features/catalogo/components/FiltrosSidebar'
import { SortDropdown } from '@/features/catalogo/components/SortDropdown'
import { ProductGrid } from '@/features/catalogo/components/ProductGrid'
import { ProductSkeleton } from '@/features/catalogo/components/ProductSkeleton'
import { InfiniteScrollTrigger } from '@/features/catalogo/components/InfiniteScrollTrigger'
import { Button } from '@/shared/components/ui/Button'

/**
 * SVG illustration for empty state
 */
function EmptyIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto mb-4" aria-hidden="true">
      <rect width="200" height="200" fill="none" />
      <circle cx="100" cy="80" r="40" fill="none" stroke="#4A535A" strokeWidth="2" strokeDasharray="6 4" />
      <line x1="70" y1="80" x2="130" y2="80" stroke="#4A535A" strokeWidth="2" />
      <line x1="100" y1="50" x2="100" y2="110" stroke="#4A535A" strokeWidth="2" />
      <text x="100" y="160" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="14" fill="#6B757D">
        Sin resultados
      </text>
    </svg>
  )
}

function ErrorIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto mb-4" aria-hidden="true">
      <rect width="200" height="200" fill="none" />
      <circle cx="100" cy="80" r="40" fill="none" stroke="#DC2626" strokeWidth="2" />
      <text x="100" y="90" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="32" fill="#DC2626">!</text>
      <text x="100" y="160" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="14" fill="#6B757D">
        Error de carga
      </text>
    </svg>
  )
}

/**
 * CatalogoPage — Catalog with sidebar filters, sort, and infinite scroll.
 */
export function CatalogoPage() {
  const { filtros, setFiltro, clearFiltros, hasActiveFilters, activeFilterCount } = useFiltros()
  const {
    productos,
    total,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useProductos(filtros)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const handleSort = useCallback(
    (value: string) => {
      setFiltro('sort', value === 'newest' ? undefined : value)
    },
    [setFiltro],
  )

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Page header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary dark:text-text-primary-dark">
          Catálogo
        </h1>
        {!isLoading && (
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
            {total} productos encontrados
          </p>
        )}
      </div>

      {/* Top bar (mobile filter toggle + sort) */}
      <div className="flex items-center justify-between mb-6 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-border-base dark:border-border-base-dark text-text-primary dark:text-text-primary-dark hover:bg-bg-hover dark:hover:bg-bg-hover-dark transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs font-medium bg-accent text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
        <SortDropdown value={filtros.sort} onChange={handleSort} />
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <FiltrosSidebar
            filtros={filtros}
            setFiltro={setFiltro}
            clearFiltros={clearFiltros}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Desktop sort bar */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
              {total} productos
            </p>
            <SortDropdown value={filtros.sort} onChange={handleSort} />
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {Array.from({ length: 8 }, (_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="text-center py-16">
              <ErrorIllustration />
              <p className="text-text-secondary dark:text-text-secondary-dark mb-4">
                Algo falló al cargar los productos
              </p>
              <Button variant="primary" onClick={() => refetch()}>
                Reintentar
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && productos.length === 0 && (
            <div className="text-center py-16">
              <EmptyIllustration />
              <p className="text-text-secondary dark:text-text-secondary-dark mb-4">
                No encontramos nada con esos filtros
              </p>
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFiltros}>
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}

          {/* Product grid */}
          {!isLoading && !isError && productos.length > 0 && (
            <>
              <ProductGrid productos={productos} />
              <InfiniteScrollTrigger
                hasNextPage={!!hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
                total={total}
              />
            </>
          )}
        </div>
      </div>

      {/* Mobile filters drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-drawer lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[320px] max-w-[85vw] bg-bg-surface dark:bg-bg-surface-dark z-drawer overflow-y-auto p-4 lg:hidden"
            >
              <FiltrosSidebar
                filtros={filtros}
                setFiltro={setFiltro}
                clearFiltros={clearFiltros}
                hasActiveFilters={hasActiveFilters}
                onClose={() => setMobileFiltersOpen(false)}
                isMobile
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
