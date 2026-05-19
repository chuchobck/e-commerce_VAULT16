import { api } from '@/shared/lib/api'
import type { ApiResponse } from '@/shared/types/api.types'
import {
  mapCarrito,
  mapValidacionCarrito,
  type RawCarrito,
  type RawValidacionCarrito,
  type CarritoItemMapped,
  type ValidacionCarritoMapped,
} from '@/shared/lib/mappers'

// ─── Re-export para que los hooks no dependan directo de mappers ─────────────

export type { CarritoItemMapped, ValidacionCarritoMapped }

// ─── API Functions ───────────────────────────────────────────────────────────
// El backend devuelve el carrito completo (con resumen) en cada mutación.
// Devolvemos siempre la lista normalizada de items para que el caller
// haga `setItems(...)` sin más mapeos.

export async function getCarrito(): Promise<CarritoItemMapped[]> {
  const res = await api.get<ApiResponse<RawCarrito>>('/carrito')
  return mapCarrito(res.data.data)
}

export async function addItem(payload: {
  id_variante: number
  cantidad: number
}): Promise<CarritoItemMapped[]> {
  const res = await api.post<ApiResponse<RawCarrito>>('/carrito/items', payload)
  return mapCarrito(res.data.data)
}

export async function updateCantidad(
  idCarritoDet: number,
  cantidad: number,
): Promise<CarritoItemMapped[]> {
  const res = await api.put<ApiResponse<RawCarrito>>(
    `/carrito/items/${idCarritoDet}`,
    { cantidad },
  )
  return mapCarrito(res.data.data)
}

export async function removeItem(idCarritoDet: number): Promise<CarritoItemMapped[]> {
  const res = await api.delete<ApiResponse<RawCarrito>>(`/carrito/items/${idCarritoDet}`)
  return mapCarrito(res.data.data)
}

export async function clearCarrito(): Promise<CarritoItemMapped[]> {
  const res = await api.delete<ApiResponse<RawCarrito>>('/carrito')
  return mapCarrito(res.data.data)
}

export async function validarCarrito(): Promise<ValidacionCarritoMapped> {
  const res = await api.get<ApiResponse<RawValidacionCarrito>>('/carrito/validar')
  return mapValidacionCarrito(res.data.data)
}
