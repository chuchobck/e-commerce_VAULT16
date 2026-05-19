import type { Producto } from '@/shared/types/producto.types'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  productos: Producto[]
}

/**
 * Product grid — responsive columns.
 * Mobile: 2 cols, Tablet: 3 cols, Desktop: 4 cols.
 */
export function ProductGrid({ productos }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {productos.map((producto) => (
        <ProductCard key={producto.id} producto={producto} />
      ))}
    </div>
  )
}
