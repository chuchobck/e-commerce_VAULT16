import { z } from 'zod';

export const LoginBackofficeSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const LoginClienteSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const RegisterClienteSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(8).max(100),
  ruc_cedula: z.string().regex(/^\d{10}$|^\d{13}$/, 'Cédula (10 dígitos) o RUC (13 dígitos)'),
  nombre1: z.string().min(2).max(40),
  apellido1: z.string().min(2).max(40),
  telefono: z.string().max(20).optional(),
});

export const VerifyEmailParamSchema = z.object({
  token: z.string().uuid(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
  token: z.string().uuid(),
  newPassword: z.string().min(8).max(100),
});

export type LoginBackofficeInput = z.infer<typeof LoginBackofficeSchema>;
export type LoginClienteInput = z.infer<typeof LoginClienteSchema>;
export type RegisterClienteInput = z.infer<typeof RegisterClienteSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
