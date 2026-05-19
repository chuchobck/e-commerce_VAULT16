import { useQuery } from '@tanstack/react-query'
import { fetchProducto } from '@/features/catalogo/api/catalogoApi'

/**
 * Fetches a single product by ID with its fotos, variantes, and AI content.
 * Stale time: 5 min (product detail doesn't change often).
 */
export function useProducto(id: number) {
  return useQuery({
    queryKey: ['producto', id],
    queryFn: () => fetchProducto(id),
    enabled: id > 0,
    staleTime: 5 * 60 * 1000,
  })
}
