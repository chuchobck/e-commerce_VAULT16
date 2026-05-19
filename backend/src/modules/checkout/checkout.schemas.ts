import { z } from 'zod';

export const PreviewSchema = z.object({
  id_direccion_envio: z.number().int().positive(),
});

export const IniciarPagoSchema = z.object({
  id_direccion_envio: z.number().int().positive(),
  metodo_pago: z.enum(['STRIPE', 'TRANSFERENCIA']),
});

export type PreviewInput = z.infer<typeof PreviewSchema>;
export type IniciarPagoInput = z.infer<typeof IniciarPagoSchema>;
