import { z } from 'zod'

// ─── Login ───────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
})

export type LoginInput = z.infer<typeof LoginSchema>

// ─── Register ────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  rucCedula: z
    .string()
    .min(1, 'RUC o Cédula es requerido')
    .regex(/^\d{10}(\d{3})?$/, 'Debe ser 10 (cédula) o 13 (RUC) dígitos'),
  nombre1: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'Máximo 100 caracteres')
    .regex(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/, 'El nombre solo debe contener letras y espacios'),
  apellido1: z
    .string()
    .min(1, 'El apellido es requerido')
    .max(100, 'Máximo 100 caracteres')
    .regex(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/, 'El apellido solo debe contener letras y espacios'),
  telefono: z
    .string()
    .regex(/^\d*$/, 'El teléfono solo debe contener números')
    .optional()
    .or(z.literal('')),
  acceptTerms: z
    .literal(true, { errorMap: () => ({ message: 'Debés aceptar los términos' }) }),
})

export type RegisterInput = z.infer<typeof RegisterSchema>

// ─── Forgot Password ─────────────────────────────────────────────────────────

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
})

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>

// ─── Reset Password ──────────────────────────────────────────────────────────

export const ResetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmá tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>

// ─── Change Password ─────────────────────────────────────────────────────────

export const ChangePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(1, 'La contraseña actual es requerida'),
  newPassword: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmá tu contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
}).refine((data) => data.oldPassword !== data.newPassword, {
  message: 'La nueva contraseña debe ser diferente a la actual',
  path: ['newPassword'],
})

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>
