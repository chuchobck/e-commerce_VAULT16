import { z } from 'zod';

export const CreateVarianteSchema = z.object({
  productoId: z.number().int().positive(),
  tallaId: z.number().int().positive(),
  color: z.string().min(1).max(50),
  sku: z.string().min(2).max(100),
  stock: z.number().int().min(0).default(0),
  stockMinimo: z.number().int().min(0).default(5),
});

export const UpdateVarianteSchema = CreateVarianteSchema.partial().omit({ productoId: true });
export type CreateVarianteDto = z.infer<typeof CreateVarianteSchema>;
export type UpdateVarianteDto = z.infer<typeof UpdateVarianteSchema>;
