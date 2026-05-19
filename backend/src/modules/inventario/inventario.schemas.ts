import { z } from 'zod';

export const DetalleAjusteSchema = z.object({
  id_variante: z.number().int().positive(),
  cantidad: z.number().int().positive(),
  tipo_movimiento: z.enum(['ING', 'EGR']),
});

export const CreateAjusteSchema = z.object({
  motivo: z.string().min(5).max(200),
  detalles: z.array(DetalleAjusteSchema).min(1),
});

export const AnularAjusteSchema = z.object({
  motivo_anulacion: z.string().min(5).max(200),
});

export const ListAjustesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
  empleado: z.coerce.number().int().optional(),
});

export const ListMovimientosQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  id_variante: z.coerce.number().int().optional(),
  tipo: z.string().length(3).optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
  id_empleado: z.coerce.number().int().optional(),
});

export const StockActualQuerySchema = z.object({
  categoria: z.string().optional(),
  stock_minimo: z.coerce.number().int().optional(),
  stock_maximo: z.coerce.number().int().optional(),
});

export type CreateAjusteInput = z.infer<typeof CreateAjusteSchema>;
export type AnularAjusteInput = z.infer<typeof AnularAjusteSchema>;
export type ListAjustesQueryInput = z.infer<typeof ListAjustesQuerySchema>;
export type ListMovimientosQueryInput = z.infer<typeof ListMovimientosQuerySchema>;
export type StockActualQueryInput = z.infer<typeof StockActualQuerySchema>;
