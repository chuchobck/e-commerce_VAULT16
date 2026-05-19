import { api } from '@/shared/lib/api'
import type { ApiResponse } from '@/shared/types/api.types'
import {
  mapValidacionCarrito,
  mapConfirmacionPedido,
  type RawValidacionCarrito,
  type RawFacturaFull,
} from '@/shared/lib/mappers'

// ─── Types ───────────────────────────────────────────────────────────────────

export type MetodoPago = 'PAYPAL' | 'TARJETA' | 'TRANSFERENCIA'

export interface CheckoutPreview {
  items: {
    varianteId: number
    nombre: string
    talla: string
    color: string
    cantidad: number
    precioUnitario: number
    subtotal: number
    imagen: string
    stockDisponible: number
  }[]
  subtotal: number
  descuento: number
  impuestos: number
  total: number
}

export interface CheckoutValidacion {
  valid: boolean
  errors: { idItem: number | null; motivo: string; message: string }[]
}

export interface IniciarPagoResponse {
  metodo: MetodoPago
  total?: number
  paypal_order_id?: string
  paypal_status?: string
  paypal_stub?: boolean
  id_factura?: string
  estado?: string
  instrucciones_transferencia?: {
    banco: string
    cuenta: string
    tipo: string
    beneficiario: string
    ruc: string
    referencia: string
  }
}

export interface ConfirmacionResponse {
  idFactura: string
  estado: string
  total: number
  fecha: string
  items: {
    productoNombre: string
    talla: string
    color: string
    cantidad: number
    precioUnitario: number
    subtotal: number
  }[]
}

// ─── API Functions ───────────────────────────────────────────────────────────

export async function validarCarrito(): Promise<CheckoutValidacion> {
  const res = await api.get<ApiResponse<RawValidacionCarrito>>('/carrito/validar')
  const mapped = mapValidacionCarrito(res.data.data)
  return {
    valid: mapped.valido,
    errors: mapped.problemas.map((p) => ({
      idItem: p.idItem,
      motivo: p.motivo,
      message: p.mensaje,
    })),
  }
}

export async function iniciarPago(payload: {
  id_direccion_envio: number
  metodo_pago: MetodoPago
}): Promise<IniciarPagoResponse> {
  // PayPal usa el endpoint canónico /api/pagos/paypal/create-order;
  // tarjeta y transferencia siguen el flujo unificado de checkout.
  if (payload.metodo_pago === 'PAYPAL') {
    const res = await api.post<ApiResponse<IniciarPagoResponse>>(
      '/pagos/paypal/create-order',
      { id_direccion_envio: payload.id_direccion_envio },
    )
    return res.data.data
  }
  const res = await api.post<ApiResponse<IniciarPagoResponse>>('/checkout/iniciar-pago', payload)
  return res.data.data
}

export async function capturarPayPal(payload: {
  id_direccion_envio: number
  paypal_order_id: string
}): Promise<{ id_factura: string; total: number; estado: string }> {
  const res = await api.post<ApiResponse<{ id_factura: string; total: number; estado: string }>>(
    `/pagos/paypal/capture-order/${encodeURIComponent(payload.paypal_order_id)}`,
    { id_direccion_envio: payload.id_direccion_envio },
  )
  return res.data.data
}

export async function confirmarTarjetaSimulada(payload: {
  id_direccion_envio: number
}): Promise<{ id_factura: string; total: number; estado: string }> {
  const res = await api.post<ApiResponse<{ id_factura: string; total: number; estado: string }>>(
    '/checkout/tarjeta/confirmar',
    payload,
  )
  return res.data.data
}

export async function getFactura(idFactura: string): Promise<ConfirmacionResponse> {
  const res = await api.get<ApiResponse<RawFacturaFull>>(`/facturas/me/${idFactura}`)
  return mapConfirmacionPedido(res.data.data)
}
