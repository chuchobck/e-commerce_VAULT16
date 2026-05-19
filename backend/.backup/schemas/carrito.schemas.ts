import { z } from 'zod';

export const AddItemSchema = z.object({
  varianteId: z.number().int().positive(),
  cantidad: z.number().int().positive(),
});

export const UpdateItemSchema = z.object({
  cantidad: z.number().int().min(0), // 0 = eliminar
});

export type AddItemDto = z.infer<typeof AddItemSchema>;
export type UpdateItemDto = z.infer<typeof UpdateItemSchema>;
