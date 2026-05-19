import { z } from 'zod';

export const CreateCategoriaSchema = z.object({
  id_categoria: z.string().length(3).toUpperCase(),
  nombre: z.string().min(3).max(100),
  descripcion: z.string().max(500).optional(),
});

export const UpdateCategoriaSchema = z.object({
  nombre: z.string().min(3).max(100).optional(),
  descripcion: z.string().max(500).optional(),
});

export const CategoriaIdParamSchema = z.object({
  id: z.string().length(3).toUpperCase(),
});

export type CreateCategoriaInput = z.infer<typeof CreateCategoriaSchema>;
export type UpdateCategoriaInput = z.infer<typeof UpdateCategoriaSchema>;
