import { api } from '@/shared/lib/api'
import type { ApiResponse } from '@/shared/types/api.types'
import type { Cliente } from '@/shared/stores/authStore'

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
  const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', payload)
  return res.data.data
}

export async function registerCliente(payload: {
  email: string
  password: string
  rucCedula: string
  nombre1: string
  apellido1: string
  telefono?: string
}): Promise<RegisterResponse> {
  const res = await api.post<ApiResponse<RegisterResponse>>('/auth/register', payload)
  return res.data.data
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const res = await api.get<ApiResponse<{ message: string }>>(`/auth/verify-email/${token}`)
  return res.data.data
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email })
  return res.data.data
}

export async function resetPassword(payload: {
  token: string
  password: string
}): Promise<{ message: string }> {
  const res = await api.post<ApiResponse<{ message: string }>>('/auth/reset-password', payload)
  return res.data.data
}

export async function getProfile(): Promise<Cliente> {
  const res = await api.get<ApiResponse<Cliente>>('/auth/me')
  return res.data.data
}
