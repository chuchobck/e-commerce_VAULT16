import { z } from 'zod';

export const CreateTallaSchema = z.object({
  descripcion: z.string().length(10),
});

export const UpdateTallaSchema = z.object({
  descripcion: z.string().length(10).optional(),
  orden: z.number().int().nonnegative().optional(),
});

export const TallaIdParamSchema = z.object({
  id: z.string().transform((v) => parseInt(v, 10)),
});

export type CreateTallaInput = z.infer<typeof CreateTallaSchema>;
export type UpdateTallaInput = z.infer<typeof UpdateTallaSchema>;
