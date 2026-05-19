import { z } from 'zod';

export const CreatePromocionSchema = z
  .object({
    nombre: z.string().min(3).max(100),
    descripcion: z.string().optional(),
    porcentaje_descuento: z.number().min(0).max(100),
    fecha_inicio: z.coerce.date(),
    fecha_fin: z.coerce.date(),
  })
  .refine((d) => d.fecha_fin > d.fecha_inicio, {
    message: 'fecha_fin debe ser posterior a fecha_inicio',
    path: ['fecha_fin'],
  });

export const UpdatePromocionSchema = z
  .object({
    nombre: z.string().min(3).max(100).optional(),
    descripcion: z.string().optional(),
    porcentaje_descuento: z.number().min(0).max(100).optional(),
    fecha_inicio: z.coerce.date().optional(),
    fecha_fin: z.coerce.date().optional(),
  })
  .refine(
    (d) => {
      if (d.fecha_inicio && d.fecha_fin) return d.fecha_fin > d.fecha_inicio;
      return true;
    },
    { message: 'fecha_fin debe ser posterior a fecha_inicio', path: ['fecha_fin'] }
  );

export const AsociarProductosSchema = z.object({
  id_productos: z.array(z.string().min(1)).min(1),
});

export type CreatePromocionInput = z.infer<typeof CreatePromocionSchema>;
export type UpdatePromocionInput = z.infer<typeof UpdatePromocionSchema>;
export type AsociarProductosInput = z.infer<typeof AsociarProductosSchema>;
