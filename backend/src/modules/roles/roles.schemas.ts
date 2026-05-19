import { z } from 'zod';

export const CreateRolSchema = z.object({
  nombre: z.string().min(3).max(50),
  descripcion: z.string().max(200).optional(),
});

export const UpdateRolSchema = z.object({
  nombre: z.string().min(3).max(50).optional(),
  descripcion: z.string().max(200).optional(),
});

export const RolIdParamSchema = z.object({
  id: z.string().transform((v) => parseInt(v, 10)),
});

export type CreateRolInput = z.infer<typeof CreateRolSchema>;
export type UpdateRolInput = z.infer<typeof UpdateRolSchema>;
