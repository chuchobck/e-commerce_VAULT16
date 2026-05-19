import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { fetchProductos } from '@/features/catalogo/api/catalogoApi'
import { ProductCard } from '@/features/catalogo/components/ProductCard'
import { ProductSkeleton } from '@/features/catalogo/components/ProductSkeleton'
import type { Producto } from '@/shared/types/producto.types'

interface ProductosRelacionadosProps {
  producto: Producto
}

export function ProductosRelacionados({ producto }: ProductosRelacionadosProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['productos', 'relacionados', producto.categoriaId, producto.id],
    queryFn: () =>
      fetchProductos({
        categoriaId: producto.categoriaId,
        pageSize: 5, // Fetch 5 so we can exclude the current one
      }),
    staleTime: 5 * 60 * 1000,
  })

  const related = useMemo(() => {
    if (!data?.items) return []
    return data.items.filter((p) => p.id !== producto.id).slice(0, 4)
  }, [data, producto.id])

  if (isLoading) {
    return (
      <section className="mt-16 pt-8 border-t border-border-base dark:border-border-base-dark">
        <h2 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-6">
          También te puede gustar
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </section>
    )
  }

  if (related.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.4 }}
      className="mt-16 pt-8 border-t border-border-base dark:border-border-base-dark"
    >
      <h2 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-6">
        También te puede gustar
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {related.map((p) => (
          <ProductCard key={p.id} producto={p} />
        ))}
      </div>
    </motion.section>
  )
}
