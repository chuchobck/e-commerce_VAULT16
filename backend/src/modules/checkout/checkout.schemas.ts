import { z } from 'zod';

export const PreviewSchema = z.object({
  id_direccion_envio: z.number().int().positive(),
});

export const IniciarPagoSchema = z.object({
  id_direccion_envio: z.number().int().positive(),
  metodo_pago: z.enum(['PAYPAL', 'TARJETA', 'TRANSFERENCIA']),
});

export const CapturarPayPalSchema = z.object({
  id_direccion_envio: z.number().int().positive(),
  paypal_order_id: z.string().min(1),
});

export const ConfirmarTarjetaSimuladaSchema = z.object({
  id_direccion_envio: z.number().int().positive(),
});

export type PreviewInput = z.infer<typeof PreviewSchema>;
export type IniciarPagoInput = z.infer<typeof IniciarPagoSchema>;
export type CapturarPayPalInput = z.infer<typeof CapturarPayPalSchema>;
export type ConfirmarTarjetaSimuladaInput = z.infer<typeof ConfirmarTarjetaSimuladaSchema>;
