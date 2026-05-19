import { z } from 'zod';
import { MOV_ENTRADA, MOV_SALIDA, MOV_DEVOLUCION, MOV_AJUSTE } from '../shared/constants/estados';

export const AjusteStockSchema = z.object({
  varianteId: z.number().int().positive(),
  nuevaCantidad: z.number().int().min(0),
  motivo: z.string().min(5).max(200),
});

export const MovimientoFiltersSchema = z.object({
  varianteId: z.coerce.number().int().positive().optional(),
  tipo: z.enum([MOV_ENTRADA, MOV_SALIDA, MOV_DEVOLUCION, MOV_AJUSTE]).optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

export type AjusteStockDto = z.infer<typeof AjusteStockSchema>;
export type MovimientoFilters = z.infer<typeof MovimientoFiltersSchema>;
