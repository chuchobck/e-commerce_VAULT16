import { useParams } from 'react-router-dom'
import { useFiltros } from '@/features/catalogo/hooks/useFiltros'
import { useProductos } from '@/features/catalogo/hooks/useProductos'
import { useQuery } from '@tanstack/react-query'
import { fetchCategorias } from '@/features/catalogo/api/catalogoApi'
import { ProductGrid } from '@/features/catalogo/components/ProductGrid'
import { ProductSkeleton } from '@/features/catalogo/components/ProductSkeleton'
import { InfiniteScrollTrigger } from '@/features/catalogo/components/InfiniteScrollTrigger'

/**
 * Minimal SVG hero banner for category pages.
 */
function CategoryHero({ nombre, slug }: { nombre: string; slug: string }) {
  // Color variations based on slug
  const hue = slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360

  return (
    <div className="relative h-40 sm:h-52 overflow-hidden rounded-lg mb-8">
      <svg viewBox="0 0 1280 200" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`cat-grad-${slug}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#181C1F" />
            <stop offset="100%" stopColor={`hsl(${hue}, 40%, 25%)`} />
          </linearGradient>
        </defs>
        <rect width="1280" height="200" fill={`url(#cat-grad-${slug})`} />
        {Array.from({ length: 8 }, (_, i) => (
          <circle
            key={i}
            cx={160 + i * 140}
            cy={100 + (i % 2 === 0 ? -20 : 20)}
            r={20 + (i % 3) * 10}
            fill="#60A5FA"
            opacity="0.05"
          />
        ))}
        <text
          x="1200"
          y="180"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="120"
          fontWeight="700"
          fill="#60A5FA"
          opacity="0.04"
          textAnchor="end"
        >
          {slug.toUpperCase().slice(0, 3)}
        </text>
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-4 left-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white">{nombre}</h1>
      </div>
    </div>
  )
}

/**
 * CategoriaPage — same structure as CatalogoPage but pre-filtered by category.
 */
export function CategoriaPage() {
  const { id: slug } = useParams<{ id: string }>()
  const { filtros } = useFiltros()

  // Find the category by slug
  const { data: categorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: fetchCategorias,
  })

  const categoria = categorias?.find(
    (c) => c.slug === slug || c.nombre.toLowerCase() === slug?.toLowerCase(),
  )

  // Merge category filter — the URL slug overrides
  const mergedFiltros = {
    ...filtros,
    categoriaId: categoria?.id || filtros.categoriaId,
  }

  const {
    productos,
    total,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useProductos(mergedFiltros)

  const displayName = categoria?.nombre || slug || 'Categoría'

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Category hero */}
      <CategoryHero nombre={displayName} slug={slug || 'default'} />

      {/* Product count */}
      {!isLoading && (
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-6">
          {total} productos en {displayName}
        </p>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: 8 }, (_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-16">
          <p className="text-text-secondary dark:text-text-secondary-dark">
            Error al cargar los productos de esta categoría.
          </p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && productos.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-secondary dark:text-text-secondary-dark">
            No hay productos en esta categoría aún.
          </p>
        </div>
      )}

      {/* Grid */}
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
  )
}
