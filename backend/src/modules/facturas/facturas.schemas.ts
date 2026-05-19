import { z } from 'zod';

// ─── Listado (admin) ──────────────────────────────────────────────────────────

export const ListFacturasQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  cliente: z.coerce.number().int().optional(),          // id_cliente
  estado: z.enum(['EMI', 'PAG', 'ENV', 'ENT', 'ANU']).optional(),
  desde: z.string().datetime({ offset: true }).optional(),
  hasta: z.string().datetime({ offset: true }).optional(),
  metodo_pago: z.string().max(20).optional(),
});

export type ListFacturasQuery = z.infer<typeof ListFacturasQuerySchema>;

// ─── Listado propio del cliente ───────────────────────────────────────────────

export const ListFacturasMeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  estado: z.enum(['EMI', 'PAG', 'ENV', 'ENT', 'ANU']).optional(),
});

export type ListFacturasMeQuery = z.infer<typeof ListFacturasMeQuerySchema>;

// ─── Cambio de estado (admin/vendedor) ───────────────────────────────────────

export const CambiarEstadoSchema = z.object({
  nuevo_estado: z.enum(['ENV', 'ENT', 'ANU']),
  observacion: z.string().max(300).optional(),
});

export type CambiarEstadoInput = z.infer<typeof CambiarEstadoSchema>;
