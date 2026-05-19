import { z } from 'zod';

export const ChatMensajeSchema = z.object({
  mensaje: z.string().min(1).max(500),
  id_sesion: z.string().uuid().optional(),
});

export type ChatMensajeInput = z.infer<typeof ChatMensajeSchema>;

export const ListSesionesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  id_cliente: z.coerce.number().int().positive().optional(),
  desde: z.string().datetime({ offset: true }).optional(),
  hasta: z.string().datetime({ offset: true }).optional(),
});

export type ListSesionesQueryInput = z.infer<typeof ListSesionesQuerySchema>;
