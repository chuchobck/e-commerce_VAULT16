import { z } from 'zod';

export const ListAuditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  tabla: z.string().optional(),
  accion: z.enum(['INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT']).optional(),
  usuario: z.coerce.number().int().optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
});

export type ListAuditQueryInput = z.infer<typeof ListAuditQuerySchema>;
