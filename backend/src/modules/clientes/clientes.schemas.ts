import { z } from 'zod';

export const ListClienteQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

export const UpdateClienteSchema = z.object({
  nombre1: z.string().min(2).max(40).optional(),
  apellido1: z.string().min(2).max(40).optional(),
  telefono: z.string().max(20).optional(),
});

export const UpdatePasswordClienteSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export const UpdateEstadoSchema = z.object({
  estado: z.enum(['ACT', 'INA', 'BLO']),
});

export const ClienteIdParamSchema = z.object({
  id: z.string().transform((v) => parseInt(v, 10)),
});

export type ListClienteQueryInput = z.infer<typeof ListClienteQuerySchema>;
export type UpdateClienteInput = z.infer<typeof UpdateClienteSchema>;
export type UpdatePasswordClienteInput = z.infer<typeof UpdatePasswordClienteSchema>;
export type UpdateEstadoInput = z.infer<typeof UpdateEstadoSchema>;
