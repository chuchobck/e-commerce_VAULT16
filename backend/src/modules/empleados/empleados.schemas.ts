import { z } from 'zod';

export const CreateEmpleadoSchema = z.object({
  cedula: z.string().length(10),
  nombre1: z.string().min(2).max(50),
  apellido1: z.string().min(2).max(50),
  telefono: z.string().max(20).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  id_rol: z.number().int().positive(),
});

export const UpdateEmpleadoSchema = z.object({
  cedula: z.string().length(10).optional(),
  nombre1: z.string().min(2).max(50).optional(),
  apellido1: z.string().min(2).max(50).optional(),
  telefono: z.string().max(20).optional(),
});

export const UpdatePasswordSchema = z.object({
  password: z.string().min(6),
});

export const EmpleadoIdParamSchema = z.object({
  id: z.string().transform((v) => parseInt(v, 10)),
});

export type CreateEmpleadoInput = z.infer<typeof CreateEmpleadoSchema>;
export type UpdateEmpleadoInput = z.infer<typeof UpdateEmpleadoSchema>;
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>;
