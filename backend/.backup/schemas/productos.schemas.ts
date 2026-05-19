import { z } from 'zod';

export const CreateProductoSchema = z.object({
  categoriaId: z.number().int().positive(),
  nombre: z.string().min(2).max(200),
  slug: z.string().min(2).max(220).regex(/^[a-z0-9-]+$/),
  descripcion: z.string().optional(),
  precio: z.number().positive(),
  destacado: z.boolean().default(false),
});

export const UpdateProductoSchema = CreateProductoSchema.partial();

export const ProductoFiltersSchema = z.object({
  search: z.string().optional(),
  categoriaId: z.coerce.number().int().positive().optional(),
  destacado: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  activo: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

export type CreateProductoDto = z.infer<typeof CreateProductoSchema>;
export type UpdateProductoDto = z.infer<typeof UpdateProductoSchema>;
export type ProductoFilters = z.infer<typeof ProductoFiltersSchema>;
