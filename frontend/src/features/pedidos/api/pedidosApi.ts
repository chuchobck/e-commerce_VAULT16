import { api } from '@/shared/lib/api'
import type { ApiResponse } from '@/shared/types/api.types'
import {
  mapPedido,
  mapPedidoResumen,
  type EstadoPedido as EstadoPedidoBase,
  type PedidoItemMapped,
  type PedidoMapped,
  type PedidoResumenMapped,
  type RawFacturaFull,
  type RawFacturaList,
} from '@/shared/lib/mappers'

// ─── Types ───────────────────────────────────────────────────────────────────

export type EstadoPedido = EstadoPedidoBase
export type PedidoItem = PedidoItemMapped
export type Pedido = PedidoMapped
export type PedidoResumen = PedidoResumenMapped

interface FacturasListResponse {
  success: boolean
  data: RawFacturaList[]
  meta: { page: number; pageSize: number; total: number; totalPages: number }
}

// ─── API ─────────────────────────────────────────────────────────────────────

export async function getPedidos(): Promise<PedidoResumen[]> {
  const res = await api.get<FacturasListResponse>('/facturas/me')
  return res.data.data.map(mapPedidoResumen)
}

export async function getPedido(idFactura: string): Promise<Pedido> {
  const res = await api.get<ApiResponse<RawFacturaFull>>(`/facturas/me/${idFactura}`)
  return mapPedido(res.data.data)
}
