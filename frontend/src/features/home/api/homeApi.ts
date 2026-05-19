import { api } from '@/shared/lib/api'
import type { ApiResponse } from '@/shared/types/api.types'
import type { Producto, ProductosPaginados } from '@/shared/types/producto.types'

/**
 * Obtiene productos destacados para la home.
 * Usa el flag destacado=true del backend.
 * Fallback: devuelve los primeros 8 productos si no hay destacados.
 */
export async function getDestacados(): Promise<Producto[]> {
  try {
    const res = await api.get<ApiResponse<ProductosPaginados>>('/api/productos', {
      params: { destacado: 'true', limit: 8 },
    })
    const items = res.data.data.items
    if (items.length > 0) return items

    // Fallback: primeros 8 si no hay destacados
    const fallback = await api.get<ApiResponse<ProductosPaginados>>('/api/productos', {
      params: { limit: 8 },
    })
    return fallback.data.data.items
  } catch {
    return []
  }
}
