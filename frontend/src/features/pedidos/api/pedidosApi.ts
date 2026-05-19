import { api } from '@/shared/lib/api'
import type { ApiResponse } from '@/shared/types/api.types'

// ─── Types ───────────────────────────────────────────────────────────────────

export type EstadoPedido = 'EMI' | 'PAG' | 'ENV' | 'ENT' | 'CAN'

export interface PedidoItem {
  id: number
  productoNombre: string
  talla: string
  color: string
  cantidad: number
  precioUnitario: number
  subtotal: number
  imagen: string
}

export interface Pedido {
  id: number
  idFactura: string
  fecha: string
  estado: EstadoPedido
  subtotal: number
  descuento: number
  impuestos: number
  total: number
  items: PedidoItem[]
  direccionEnvio: {
    callePrincipal: string
    numeracion: string
    ciudad: string
    provincia: string
  } | null
}

export interface PedidoResumen {
  id: number
  idFactura: string
  fecha: string
  estado: EstadoPedido
  total: number
  totalItems: number
}

// ─── API ─────────────────────────────────────────────────────────────────────

export async function getPedidos(): Promise<PedidoResumen[]> {
  const res = await api.get<ApiResponse<PedidoResumen[]>>('/pedidos')
  return res.data.data
}

export async function getPedido(id: number): Promise<Pedido> {
  const res = await api.get<ApiResponse<Pedido>>(`/pedidos/${id}`)
  return res.data.data
}
