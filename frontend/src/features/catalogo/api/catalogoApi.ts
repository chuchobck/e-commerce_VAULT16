import { api } from '@/shared/lib/api'
import type { Producto, ProductosPaginados, Categoria } from '@/shared/types/producto.types'
import {
  mapCategoria,
  mapProducto,
  type RawCategoria,
  type RawProducto,
} from '@/shared/lib/mappers'

export interface FetchProductosParams {
  page?: number
  pageSize?: number
  search?: string
  categoriaId?: string
  destacado?: boolean
  activo?: boolean
}

interface RawProductosListResponse {
  success: boolean
  data: RawProducto[]
  meta: { page: number; pageSize: number; total: number; totalPages: number }
}

/**
 * Fetch paginated products from the backend.
 * Backend devuelve: { success, data: RawProducto[], meta: { page, pageSize, total, totalPages } }
 */
export async function fetchProductos(params: FetchProductosParams): Promise<ProductosPaginados> {
  const query: Record<string, string> = {}

  if (params.page) query.page = String(params.page)
  if (params.pageSize) query.pageSize = String(params.pageSize)
  if (params.search) query.search = params.search
  if (params.categoriaId) query.categoria = params.categoriaId

  const res = await api.get<RawProductosListResponse>('/productos', { params: query })
  return {
    items: (res.data.data ?? []).map(mapProducto),
    meta: res.data.meta,
  }
}

/**
 * Fetch single product by ID.
 */
export async function fetchProducto(id: string): Promise<Producto> {
  const res = await api.get<{ success: boolean; data: RawProducto }>(`/productos/${id}`)
  return mapProducto(res.data.data)
}

/**
 * Fetch all categories.
 */
export async function fetchCategorias(): Promise<Categoria[]> {
  const res = await api.get<{ success: boolean; data: RawCategoria[] }>('/categorias')
  return (res.data.data ?? []).map(mapCategoria)
}

/**
 * Fetch all tallas.
 */
export async function fetchTallas(): Promise<{ id: number; nombre: string }[]> {
  const res = await api.get<{
    success: boolean
    data: Array<{ id_talla: number; descripcion: string }>
  }>('/tallas')
  return (res.data.data ?? []).map((t) => ({ id: t.id_talla, nombre: t.descripcion }))
}
