import { z } from 'zod';

export const CreateDireccionSchema = z.object({
  alias: z.string().min(1).max(50),
  calle: z.string().min(5).max(200),
  ciudad: z.string().min(2).max(100),
  estado: z.string().min(2).max(100),
  codigoPostal: z.string().min(4).max(10),
  pais: z.string().length(3).default('MX'),
  esPrincipal: z.boolean().default(false),
});

export const UpdateDireccionSchema = CreateDireccionSchema.partial();

export type CreateDireccionDto = z.infer<typeof CreateDireccionSchema>;
export type UpdateDireccionDto = z.infer<typeof UpdateDireccionSchema>;
