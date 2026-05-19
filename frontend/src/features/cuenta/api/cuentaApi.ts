import { api } from '@/shared/lib/api'
import type { ApiResponse } from '@/shared/types/api.types'
import type { Cliente } from '@/shared/stores/authStore'
import {
  mapCliente,
  mapDireccion,
  type RawCliente,
  type RawDireccion,
  type DireccionMapped,
} from '@/shared/lib/mappers'

// ─── Types ───────────────────────────────────────────────────────────────────

export type Direccion = DireccionMapped

export interface DireccionInput {
  alias: string
  nombreDestinatario: string
  telefonoContacto: string
  provincia: string
  ciudad: string
  direccion: string
  referencia?: string | null
  codigoPostal?: string | null
  esPrincipal?: boolean
}

function toBackendDireccion(input: DireccionInput) {
  return {
    alias: input.alias,
    nombre_destinatario: input.nombreDestinatario,
    telefono_contacto: input.telefonoContacto,
    provincia: input.provincia,
    ciudad: input.ciudad,
    direccion: input.direccion,
    referencia: input.referencia ?? undefined,
    codigo_postal: input.codigoPostal ?? undefined,
    es_principal: input.esPrincipal ?? false,
  }
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function updateProfile(payload: {
  nombre1?: string
  apellido1?: string
  telefono?: string
}): Promise<Cliente> {
  const res = await api.put<ApiResponse<RawCliente>>('/clientes/me', payload)
  return mapCliente(res.data.data)
}

export async function changePassword(payload: {
  oldPassword: string
  newPassword: string
}): Promise<{ message: string }> {
  await api.put<ApiResponse<unknown>>('/clientes/me/password', payload)
  return { message: 'Contraseña actualizada' }
}

// ─── Direcciones ─────────────────────────────────────────────────────────────

const DIR_BASE = '/clientes/me/direcciones'

export async function getDirecciones(): Promise<Direccion[]> {
  const res = await api.get<ApiResponse<RawDireccion[]>>(DIR_BASE)
  return res.data.data.map(mapDireccion)
}

export async function createDireccion(payload: DireccionInput): Promise<Direccion> {
  const res = await api.post<ApiResponse<RawDireccion>>(DIR_BASE, toBackendDireccion(payload))
  return mapDireccion(res.data.data)
}

export async function updateDireccion(
  id: number,
  payload: Partial<DireccionInput>,
): Promise<Direccion> {
  const body: Record<string, unknown> = {}
  if (payload.alias !== undefined) body.alias = payload.alias
  if (payload.nombreDestinatario !== undefined) body.nombre_destinatario = payload.nombreDestinatario
  if (payload.telefonoContacto !== undefined) body.telefono_contacto = payload.telefonoContacto
  if (payload.provincia !== undefined) body.provincia = payload.provincia
  if (payload.ciudad !== undefined) body.ciudad = payload.ciudad
  if (payload.direccion !== undefined) body.direccion = payload.direccion
  if (payload.referencia !== undefined) body.referencia = payload.referencia ?? undefined
  if (payload.codigoPostal !== undefined) body.codigo_postal = payload.codigoPostal ?? undefined

  const res = await api.put<ApiResponse<RawDireccion>>(`${DIR_BASE}/${id}`, body)
  return mapDireccion(res.data.data)
}

export async function setDireccionPrincipal(id: number): Promise<Direccion> {
  const res = await api.put<ApiResponse<RawDireccion>>(`${DIR_BASE}/${id}/principal`, {})
  return mapDireccion(res.data.data)
}

export async function deleteDireccion(id: number): Promise<void> {
  await api.delete(`${DIR_BASE}/${id}`)
}
