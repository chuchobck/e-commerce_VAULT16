import { api } from '@/shared/lib/api'
import type { ApiResponse } from '@/shared/types/api.types'
import type { Cliente } from '@/shared/stores/authStore'
import { mapCliente, type RawCliente } from '@/shared/lib/mappers'

// ─── Response Types ──────────────────────────────────────────────────────────

export interface LoginResponse {
  token: string
  cliente: Cliente
}

export interface RegisterResponse {
  cliente: Cliente
  message: string
}

// ─── API Functions ───────────────────────────────────────────────────────────

export async function loginCliente(payload: {
  email: string
  password: string
}): Promise<LoginResponse> {
  const res = await api.post<ApiResponse<{ token: string; cliente: RawCliente }>>(
    '/auth/login-cliente',
    payload,
  )
  return {
    token: res.data.data.token,
    cliente: mapCliente(res.data.data.cliente),
  }
}

export async function registerCliente(payload: {
  email: string
  password: string
  rucCedula: string
  nombre1: string
  apellido1: string
  telefono?: string
}): Promise<RegisterResponse> {
  const res = await api.post<ApiResponse<{ cliente: RawCliente; message: string }>>(
    '/auth/register-cliente',
    {
      email: payload.email,
      password: payload.password,
      ruc_cedula: payload.rucCedula,
      nombre1: payload.nombre1,
      apellido1: payload.apellido1,
      telefono: payload.telefono,
    },
  )
  return {
    cliente: mapCliente(res.data.data.cliente),
    message: res.data.data.message,
  }
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const res = await api.get<ApiResponse<{ message: string }>>(`/auth/verify-email/${token}`)
  return res.data.data
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await api.post<ApiResponse<{ message: string }>>(
    '/auth/forgot-password-cliente',
    { email },
  )
  return res.data.data
}

export async function resetPassword(payload: {
  token: string
  password: string
}): Promise<{ message: string }> {
  const res = await api.post<ApiResponse<{ message: string }>>('/auth/reset-password-cliente', {
    token: payload.token,
    newPassword: payload.password,
  })
  return res.data.data
}

export async function getProfile(): Promise<Cliente> {
  const res = await api.get<ApiResponse<RawCliente>>('/clientes/me')
  return mapCliente(res.data.data)
}
