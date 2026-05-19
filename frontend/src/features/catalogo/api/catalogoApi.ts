import { api } from '@/shared/lib/api'
import type { ApiResponse } from '@/shared/types/api.types'
import type { Producto, ProductosPaginados, Categoria } from '@/shared/types/producto.types'

export interface FetchProductosParams {
  page?: number
  limit?: number
  search?: string
  categoriaId?: number
  destacado?: boolean
  activo?: boolean
}

/**
 * Fetch paginated products from the backend.
 * Response: { success: true, data: { items: Producto[], meta: { page, limit, total, totalPages } } }
 */
export async function fetchProductos(params: FetchProductosParams): Promise<ProductosPaginados> {
  const query: Record<string, string> = {}

  if (params.page) query.page = String(params.page)
  if (params.limit) query.limit = String(params.limit)
  if (params.search) query.search = params.search
  if (params.categoriaId) query.categoriaId = String(params.categoriaId)
  if (params.destacado !== undefined) query.destacado = String(params.destacado)
  if (params.activo !== undefined) query.activo = String(params.activo)

  const res = await api.get<ApiResponse<ProductosPaginados>>('/api/productos', { params: query })
  return res.data.data
}

/**
 * Fetch single product by ID.
 */
export async function fetchProducto(id: number): Promise<Producto> {
  const res = await api.get<ApiResponse<Producto>>(`/api/productos/${id}`)
  return res.data.data
}

/**
 * Fetch all categories.
 */
export async function fetchCategorias(): Promise<Categoria[]> {
  const res = await api.get<ApiResponse<Categoria[]>>('/api/categorias')
  return res.data.data
}

/**
 * Fetch all tallas.
 */
export async function fetchTallas(): Promise<{ id: number; nombre: string }[]> {
  const res = await api.get<ApiResponse<{ id: number; nombre: string }[]>>('/api/tallas')
  return res.data.data
}
