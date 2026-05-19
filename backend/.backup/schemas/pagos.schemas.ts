import { z } from 'zod';

export const CreatePaymentIntentSchema = z.object({
  facturaId: z.number().int().positive(),
});

export type CreatePaymentIntentDto = z.infer<typeof CreatePaymentIntentSchema>;
