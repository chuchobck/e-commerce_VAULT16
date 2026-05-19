import { z } from 'zod';
import { PROMO_PORCENTAJE, PROMO_MONTO_FIJO } from '../shared/constants/estados';

export const CreatePromocionSchema = z.object({
  nombre: z.string().min(2).max(100),
  tipo: z.enum([PROMO_PORCENTAJE, PROMO_MONTO_FIJO]),
  valor: z.number().positive(),
  codigo: z.string().min(3).max(50).optional(),
  fechaInicio: z.coerce.date(),
  fechaFin: z.coerce.date(),
  usoMaximo: z.number().int().positive().optional(),
  productoIds: z.array(z.number().int().positive()).optional(),
});

export const UpdatePromocionSchema = CreatePromocionSchema.partial();
export type CreatePromocionDto = z.infer<typeof CreatePromocionSchema>;
export type UpdatePromocionDto = z.infer<typeof UpdatePromocionSchema>;
