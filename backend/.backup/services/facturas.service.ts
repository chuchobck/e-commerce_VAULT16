import { prisma } from '../config/prisma';
import { NotFoundError, ForbiddenError } from '../shared/utils/errors';
import { buildPaginatedResponse } from '../shared/utils/pagination';
import { FacturaFilters, UpdateEstadoDto } from '../schemas/facturas.schemas';

const INCLUDE_DETALLE = {
  cliente: { select: { id: true, nombre: true, email: true } },
  direccion: true,
  items: {
    include: {
      variante: { include: { producto: { select: { id: true, nombre: true } }, talla: true } },
    },
  },
  pagos: true,
};

export async function getFacturas(filters: FacturaFilters) {
  const { clienteId, estado, page, limit } = filters;
  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = {};
  if (clienteId) where.clienteId = clienteId;
  if (estado) where.estado = estado;

  const [items, total] = await prisma.$transaction([
    prisma.factura.findMany({ where, skip, take: limit, orderBy: { creadoEn: 'desc' }, include: INCLUDE_DETALLE }),
    prisma.factura.count({ where }),
  ]);
  return buildPaginatedResponse(items, total, { page, limit, skip });
}

export async function getFacturaById(id: number) {
  const f = await prisma.factura.findUnique({ where: { id }, include: INCLUDE_DETALLE });
  if (!f) throw new NotFoundError('Factura no encontrada');
  return f;
}

export async function getFacturasCliente(clienteId: number, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [items, total] = await prisma.$transaction([
    prisma.factura.findMany({ where: { clienteId }, skip, take: limit, orderBy: { creadoEn: 'desc' }, include: INCLUDE_DETALLE }),
    prisma.factura.count({ where: { clienteId } }),
  ]);
  return buildPaginatedResponse(items, total, { page, limit, skip });
}

export async function getFacturaClienteById(id: number, clienteId: number) {
  const f = await getFacturaById(id);
  if (f.clienteId !== clienteId) throw new ForbiddenError();
  return f;
}

export async function updateEstado(id: number, dto: UpdateEstadoDto) {
  await getFacturaById(id);
  return prisma.factura.update({ where: { id }, data: { estado: dto.estado } });
}
