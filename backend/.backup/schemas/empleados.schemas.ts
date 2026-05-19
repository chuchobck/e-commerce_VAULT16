import { z } from 'zod';

export const CreateEmpleadoSchema = z.object({
  nombre: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  rolId: z.number().int().positive(),
});

export const UpdateEmpleadoSchema = z.object({
  nombre: z.string().min(2).max(100).optional(),
  rolId: z.number().int().positive().optional(),
});

export const ChangePasswordSchema = z.object({
  password: z.string().min(8).regex(/[A-Z]/).regex(/\d/),
});

export type CreateEmpleadoDto = z.infer<typeof CreateEmpleadoSchema>;
export type UpdateEmpleadoDto = z.infer<typeof UpdateEmpleadoSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
