import { api } from '@/shared/lib/api'
import type { Producto } from '@/shared/types/producto.types'
import { mapProducto, type RawProducto } from '@/shared/lib/mappers'

interface RawList {
  success: boolean
  data: RawProducto[]
  meta?: { page: number; pageSize: number; total: number; totalPages: number }
}

/**
 * Obtiene productos destacados para la home.
 * Backend aún no soporta destacado=true, así que devolvemos los primeros 8.
 */
export async function getDestacados(): Promise<Producto[]> {
  try {
    const res = await api.get<RawList>('/productos', {
      params: { pageSize: 8 },
    })
    return (res.data.data ?? []).map(mapProducto)
  } catch {
    return []
  }
}
