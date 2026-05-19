import { api } from '@/shared/lib/api'
import type { ApiResponse } from '@/shared/types/api.types'

// ─── Types ───────────────────────────────────────────────────────────────────

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
  errors: { varianteId: number; message: string }[]
}

export interface IniciarPagoResponse {
  clientSecret: string | null
  idFactura: string
  metodo: 'TARJETA' | 'TRANSFERENCIA'
  instrucciones?: string
  datosBancarios?: {
    banco: string
    cuenta: string
    titular: string
    ruc: string
  }
}

export interface ConfirmacionResponse {
  id: number
  idFactura: string
  estado: string
  total: number
  fecha: string
  items: {
    nombre: string
    talla: string
    color: string
    cantidad: number
    precioUnitario: number
    subtotal: number
  }[]
}

// ─── API Functions ───────────────────────────────────────────────────────────

export async function getCheckoutPreview(): Promise<CheckoutPreview> {
  const res = await api.get<ApiResponse<CheckoutPreview>>('/api/checkout/preview')
  return res.data.data
}

export async function validarCarrito(): Promise<CheckoutValidacion> {
  const res = await api.get<ApiResponse<CheckoutValidacion>>('/api/carrito/validar')
  return res.data.data
}

export async function iniciarPago(payload: {
  direccionId: number
  metodoPago: 'TARJETA' | 'TRANSFERENCIA'
}): Promise<IniciarPagoResponse> {
  const res = await api.post<ApiResponse<IniciarPagoResponse>>('/api/checkout/iniciar-pago', payload)
  return res.data.data
}

export async function confirmarPago(idFactura: string): Promise<ConfirmacionResponse> {
  const res = await api.post<ApiResponse<ConfirmacionResponse>>('/api/checkout/confirmar', { idFactura })
  return res.data.data
}

export async function getFactura(idFactura: string): Promise<ConfirmacionResponse> {
  const res = await api.get<ApiResponse<ConfirmacionResponse>>(`/api/facturas/me/${idFactura}`)
  return res.data.data
}
