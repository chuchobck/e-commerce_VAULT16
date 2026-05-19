import { z } from 'zod';

export const CheckoutSchema = z.object({
  direccionId: z.number().int().positive(),
  codigoPromocion: z.string().optional(),
  notas: z.string().max(500).optional(),
});

export type CheckoutDto = z.infer<typeof CheckoutSchema>;
