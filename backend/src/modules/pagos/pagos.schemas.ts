import { z } from 'zod';

export const ListPagosQuerySchema = z.object({
  id_factura: z.string().optional(),
  estado: z.enum(['PEN', 'COM', 'FAL', 'REE']).optional(),
  metodo: z.enum(['PAYPAL', 'TARJETA', 'TRANSFERENCIA', 'EFECTIVO', 'OTRO']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListPagosQuery = z.infer<typeof ListPagosQuerySchema>;
