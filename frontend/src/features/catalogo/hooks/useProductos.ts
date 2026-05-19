import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchProductos, type FetchProductosParams } from '@/features/catalogo/api/catalogoApi'
import type { Filtros } from './useFiltros'

const PAGE_SIZE = 16

/**
 * useProductos — infinite scroll with TanStack Query.
 * Supports filters passed from useFiltros.
 */
export function useProductos(filtros: Filtros) {
  const params: Omit<FetchProductosParams, 'page'> = {
    limit: PAGE_SIZE,
    search: filtros.search,
    categoriaId: filtros.categoriaId,
    // Backend doesn't support talla/color/price filter yet — handled client-side or TODO backend
  }

  const query = useInfiniteQuery({
    queryKey: ['productos', params],
    queryFn: ({ pageParam }) =>
      fetchProductos({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
    initialPageParam: 1,
  })

  // Flatten pages into a single array
  const productos = query.data?.pages.flatMap((p) => p.items) ?? []
  const total = query.data?.pages[0]?.meta.total ?? 0

  return {
    ...query,
    productos,
    total,
  }
}
