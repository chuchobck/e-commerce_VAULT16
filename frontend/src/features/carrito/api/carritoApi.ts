import { api } from '@/shared/lib/api'
import type { ApiResponse } from '@/shared/types/api.types'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CarritoItemBackend {
  id: number
  carritoId: number
  varianteId: number
  cantidad: number
  precioUnitario: number
  descuento: number
  variante: {
    id: number
    productoId: string
    color: string
    codigoHex: string
    stock: number
    sku: string
    talla: { id: number; nombre: string }
    producto: {
      id: string
      nombre: string
      slug: string
      precio: number
      fotos: { id: number; url: string; esPrincipal: boolean; orden: number }[]
      porcentajeDescuentoActivo?: number
    }
  }
}

export interface CarritoBackend {
  id: number
  clienteId: number
  items: CarritoItemBackend[]
}

export interface CarritoValidacion {
  valid: boolean
  errors: { varianteId: number; message: string }[]
}

// ─── API Functions ───────────────────────────────────────────────────────────

export async function getCarrito(): Promise<CarritoBackend> {
  const res = await api.get<ApiResponse<CarritoBackend>>('/carrito')
  return res.data.data
}

export async function addItem(payload: {
  varianteId: number
  cantidad: number
}): Promise<CarritoItemBackend> {
  const res = await api.post<ApiResponse<CarritoItemBackend>>('/carrito/items', payload)
  return res.data.data
}

export async function updateCantidad(
  itemId: number,
  cantidad: number,
): Promise<CarritoItemBackend> {
  const res = await api.put<ApiResponse<CarritoItemBackend>>(`/carrito/items/${itemId}`, {
    cantidad,
  })
  return res.data.data
}

export async function removeItem(itemId: number): Promise<void> {
  await api.delete(`/carrito/items/${itemId}`)
}

export async function clearCarrito(): Promise<void> {
  await api.delete('/carrito')
}

export async function validarCarrito(): Promise<CarritoValidacion> {
  const res = await api.get<ApiResponse<CarritoValidacion>>('/carrito/validar')
  return res.data.data
}
