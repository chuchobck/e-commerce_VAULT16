import { z } from 'zod';

export const CreateRolSchema = z.object({ nombre: z.string().min(2).max(50).toUpperCase() });
export type CreateRolDto = z.infer<typeof CreateRolSchema>;
