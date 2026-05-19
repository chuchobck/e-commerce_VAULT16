import { prisma } from '../config/prisma';
import { NotFoundError } from '../shared/utils/errors';
import { AjusteStockDto } from '../schemas/inventario.schemas';

export async function ajustarStock(dto: AjusteStockDto, empleadoId: number) {
  const variante = await prisma.variante.findUnique({ where: { id: dto.varianteId } });
  if (!variante) throw new NotFoundError('Variante no encontrada');

  return prisma.$transaction(async (tx) => {
    await tx.ajusteStock.create({
      data: {
        varianteId: dto.varianteId,
        empleadoId,
        cantidadAntes: variante.stock,
        cantidadDespues: dto.nuevaCantidad,
        motivo: dto.motivo,
      },
    });

    return tx.variante.update({
      where: { id: dto.varianteId },
      data: { stock: dto.nuevaCantidad },
    });
  });
}

export async function getStockBajo(umbral?: number) {
  return prisma.variante.findMany({
    where: { stock: { lte: umbral ?? prisma.variante.fields.stockMinimo } },
    include: {
      producto: { select: { id: true, nombre: true } },
      talla: true,
    },
  });
}
