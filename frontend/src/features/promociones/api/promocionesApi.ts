import { api } from '@/shared/lib/api'
import type { ApiResponse } from '@/shared/types/api.types'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Promocion {
  id: number
  nombre: string
  descripcion: string
  porcentaje: number
  fechaInicio: string
  fechaFin: string
  activa: boolean
  productos: {
    id: number
    nombre: string
    slug: string
    precio: number
    fotos: { id: number; url: string; esPrincipal: boolean; orden: number }[]
  }[]
}

// ─── API ─────────────────────────────────────────────────────────────────────

export async function getPromociones(): Promise<Promocion[]> {
  const res = await api.get<ApiResponse<Promocion[]>>('/api/promociones')
  return res.data.data
}
