import { api } from '@/shared/lib/api'
import type { ApiResponse } from '@/shared/types/api.types'
import type { Cliente } from '@/shared/stores/authStore'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Direccion {
  id: number
  clienteId: number
  alias: string
  callePrincipal: string
  numeracion: string
  calleSecundaria: string | null
  referencia: string | null
  barrio: string | null
  ciudad: string
  provincia: string
  pais: string
  codigoPostal: string | null
  esPrincipal: boolean
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function updateProfile(payload: {
  nombre1?: string
  apellido1?: string
  telefono?: string
}): Promise<Cliente> {
  const res = await api.put<ApiResponse<Cliente>>('/clientes/profile', payload)
  return res.data.data
}

export async function changePassword(payload: {
  oldPassword: string
  newPassword: string
}): Promise<{ message: string }> {
  const res = await api.put<ApiResponse<{ message: string }>>('/auth/change-password', payload)
  return res.data.data
}

// ─── Direcciones ─────────────────────────────────────────────────────────────

export async function getDirecciones(): Promise<Direccion[]> {
  const res = await api.get<ApiResponse<Direccion[]>>('/clientes/direcciones')
  return res.data.data
}

export async function createDireccion(payload: Omit<Direccion, 'id' | 'clienteId'>): Promise<Direccion> {
  const res = await api.post<ApiResponse<Direccion>>('/clientes/direcciones', payload)
  return res.data.data
}

export async function updateDireccion(id: number, payload: Partial<Omit<Direccion, 'id' | 'clienteId'>>): Promise<Direccion> {
  const res = await api.put<ApiResponse<Direccion>>(`/clientes/direcciones/${id}`, payload)
  return res.data.data
}

export async function deleteDireccion(id: number): Promise<void> {
  await api.delete(`/clientes/direcciones/${id}`)
}
