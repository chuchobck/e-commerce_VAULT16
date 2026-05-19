import { z } from 'zod';

export const CreateVarianteSchema = z.object({
  id_talla: z.number().int().positive(),
  color: z.string().min(1).max(30),
  sku: z.string().min(1).max(50),
  var_saldo_inicial: z.number().int().nonnegative().default(0),
});

export const UpdateVarianteSchema = z.object({
  color: z.string().min(1).max(30).optional(),
  sku: z.string().min(1).max(50).optional(),
});

export const VarianteIdParamSchema = z.object({
  id: z.string().transform((v) => parseInt(v, 10)),
});

export const ProductoIdParamSchema = z.object({
  id: z.string().min(1),
});

export type CreateVarianteInput = z.infer<typeof CreateVarianteSchema>;
export type UpdateVarianteInput = z.infer<typeof UpdateVarianteSchema>;
