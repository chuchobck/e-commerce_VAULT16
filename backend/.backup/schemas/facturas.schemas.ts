import { z } from 'zod';
import { FACTURA_EMITIDA, FACTURA_PAGADA, FACTURA_ENVIADA, FACTURA_ENTREGADA, FACTURA_CANCELADA } from '../shared/constants/estados';

export const FacturaFiltersSchema = z.object({
  clienteId: z.coerce.number().int().positive().optional(),
  estado: z.enum([FACTURA_EMITIDA, FACTURA_PAGADA, FACTURA_ENVIADA, FACTURA_ENTREGADA, FACTURA_CANCELADA]).optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

export const UpdateEstadoSchema = z.object({
  estado: z.enum([FACTURA_EMITIDA, FACTURA_PAGADA, FACTURA_ENVIADA, FACTURA_ENTREGADA, FACTURA_CANCELADA]),
});

export type FacturaFilters = z.infer<typeof FacturaFiltersSchema>;
export type UpdateEstadoDto = z.infer<typeof UpdateEstadoSchema>;
