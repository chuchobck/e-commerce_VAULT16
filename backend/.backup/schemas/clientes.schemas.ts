import { z } from 'zod';

export const CreateClienteSchema = z.object({
  nombre: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  telefono: z.string().max(20).optional(),
});

export const UpdateClienteSchema = z.object({
  nombre: z.string().min(2).max(100).optional(),
  telefono: z.string().max(20).optional(),
});

export type CreateClienteDto = z.infer<typeof CreateClienteSchema>;
export type UpdateClienteDto = z.infer<typeof UpdateClienteSchema>;
