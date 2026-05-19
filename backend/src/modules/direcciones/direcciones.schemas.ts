import { z } from 'zod';

export const CreateDireccionSchema = z.object({
  alias: z.string().max(30),
  nombre_destinatario: z.string().max(80),
  telefono_contacto: z.string().max(20),
  provincia: z.string().max(50),
  ciudad: z.string().max(50),
  direccion: z.string().max(200),
  referencia: z.string().max(200).optional(),
  codigo_postal: z.string().max(10).optional(),
  es_principal: z.boolean().default(false),
});

export const UpdateDireccionSchema = z.object({
  alias: z.string().max(30).optional(),
  nombre_destinatario: z.string().max(80).optional(),
  telefono_contacto: z.string().max(20).optional(),
  provincia: z.string().max(50).optional(),
  ciudad: z.string().max(50).optional(),
  direccion: z.string().max(200).optional(),
  referencia: z.string().max(200).optional(),
  codigo_postal: z.string().max(10).optional(),
});

export const DireccionIdParamSchema = z.object({
  id: z.string().transform((v) => parseInt(v, 10)),
});

export type CreateDireccionInput = z.infer<typeof CreateDireccionSchema>;
export type UpdateDireccionInput = z.infer<typeof UpdateDireccionSchema>;
