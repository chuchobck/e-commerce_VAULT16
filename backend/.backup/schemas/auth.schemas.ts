import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterClienteSchema = z.object({
  nombre: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/, 'Debe tener al menos una mayúscula').regex(/\d/, 'Debe tener al menos un número'),
  telefono: z.string().max(20).optional(),
});

export type LoginDto = z.infer<typeof LoginSchema>;
export type RegisterClienteDto = z.infer<typeof RegisterClienteSchema>;
