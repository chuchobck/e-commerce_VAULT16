import { prisma } from '../config/prisma';
import { buildPaginatedResponse } from '../shared/utils/pagination';
import { MovimientoFilters } from '../schemas/inventario.schemas';

export async function getMovimientos(filters: MovimientoFilters) {
  const { varianteId, tipo, page, limit } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (varianteId) where.varianteId = varianteId;
  if (tipo) where.tipo = tipo;

  const [items, total] = await prisma.$transaction([
    prisma.movimientoStock.findMany({
      where,
      skip,
      take: limit,
      orderBy: { creadoEn: 'desc' },
      include: { variante: { include: { producto: { select: { id: true, nombre: true } }, talla: true } } },
    }),
    prisma.movimientoStock.count({ where }),
  ]);

  return buildPaginatedResponse(items, total, { page, limit, skip });
}
