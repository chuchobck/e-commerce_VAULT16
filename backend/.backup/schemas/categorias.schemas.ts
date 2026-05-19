import { z } from 'zod';

export const CreateCategoriaSchema = z.object({
  nombre: z.string().min(2).max(100),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/),
  descripcion: z.string().optional(),
  parentId: z.number().int().positive().optional(),
});

export const UpdateCategoriaSchema = CreateCategoriaSchema.partial();
export type CreateCategoriaDto = z.infer<typeof CreateCategoriaSchema>;
export type UpdateCategoriaDto = z.infer<typeof UpdateCategoriaSchema>;
