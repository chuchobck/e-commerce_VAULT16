import { prisma } from '../../config/prisma';

/**
 * Devuelve el porcentaje de descuento vigente más alto para un producto.
 * Retorna 0 si no hay promoción activa.
 * Nunca lanza excepción — si falla, devuelve 0.
 */
export async function getDescuentoActivoProducto(id_producto: string): Promise<number> {
  try {
    const now = new Date();

    const detalles = await prisma.promocion_detalle.findMany({
      where: {
        id_producto,
        promocion: {
          estado: 'ACT',
          fecha_inicio: { lte: now },
          fecha_fin: { gte: now },
        },
      },
      include: {
        promocion: {
          select: { porcentaje_descuento: true },
        },
      },
    });

    if (detalles.length === 0) return 0;

    const porcentajes = detalles
      .map((d) => Number(d.promocion.porcentaje_descuento ?? 0))
      .filter((p) => p > 0);

    return porcentajes.length > 0 ? Math.max(...porcentajes) : 0;
  } catch {
    return 0;
  }
}
