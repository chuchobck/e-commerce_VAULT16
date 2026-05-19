import { z } from 'zod';

export const AgregarItemSchema = z.object({
  id_variante: z.number().int().positive(),
  cantidad: z.number().int().positive(),
});

export const ActualizarCantidadSchema = z.object({
  cantidad: z.number().int().min(0),
});

export type AgregarItemInput = z.infer<typeof AgregarItemSchema>;
export type ActualizarCantidadInput = z.infer<typeof ActualizarCantidadSchema>;
