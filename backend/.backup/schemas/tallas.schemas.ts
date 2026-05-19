import { z } from 'zod';
export const CreateTallaSchema = z.object({ nombre: z.string().min(1).max(10), orden: z.number().int().default(0) });
export const UpdateTallaSchema = CreateTallaSchema.partial();
export type CreateTallaDto = z.infer<typeof CreateTallaSchema>;
