import { z } from 'zod';

export const CreateProductoSchema = z.object({
  id_categoria: z.string().length(3),
  nombre: z.string().min(3).max(80),
  descripcion_corta: z.string().max(200).optional(),
  precio_venta: z.number().nonnegative(),
});

export const UpdateProductoSchema = z.object({
  id_categoria: z.string().length(3).optional(),
  nombre: z.string().min(3).max(80).optional(),
  descripcion_corta: z.string().max(200).optional(),
  precio_venta: z.number().nonnegative().optional(),
});

export const ListProductoQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  categoria: z.string().length(3).optional(),
  precioMin: z.coerce.number().nonnegative().optional(),
  precioMax: z.coerce.number().nonnegative().optional(),
});

export const ProductoIdParamSchema = z.object({
  id: z.string().min(1),
});

export type CreateProductoInput = z.infer<typeof CreateProductoSchema>;
export type UpdateProductoInput = z.infer<typeof UpdateProductoSchema>;
export type ListProductoQueryInput = z.infer<typeof ListProductoQuerySchema>;
