import { z } from 'zod';

export const GenerateContentSchema = z.object({
  productoId: z.number().int().positive(),
  forzar: z.boolean().default(false), // regenerar aunque ya exista
});

export type GenerateContentDto = z.infer<typeof GenerateContentSchema>;
