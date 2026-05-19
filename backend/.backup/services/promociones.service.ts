import { prisma } from '../config/prisma';
import { NotFoundError, ConflictError } from '../shared/utils/errors';
import { buildPaginatedResponse, PageParams } from '../shared/utils/pagination';
import { CreatePromocionDto, UpdatePromocionDto } from '../schemas/promociones.schemas';

const INCLUDE = { productos: { include: { producto: { select: { id: true, nombre: true } } } } };

export async function getPromociones(params: PageParams) {
  const [items, total] = await prisma.$transaction([
    prisma.promocion.findMany({ skip: params.skip, take: params.limit, orderBy: { fechaInicio: 'desc' }, include: INCLUDE }),
    prisma.promocion.count(),
  ]);
  return buildPaginatedResponse(items, total, params);
}

export async function getPromocionById(id: number) {
  const p = await prisma.promocion.findUnique({ where: { id }, include: INCLUDE });
  if (!p) throw new NotFoundError('Promoción no encontrada');
  return p;
}

export async function createPromocion(dto: CreatePromocionDto) {
  if (dto.codigo) {
    const exists = await prisma.promocion.findUnique({ where: { codigo: dto.codigo } });
    if (exists) throw new ConflictError('Código ya en uso');
  }

  const { productoIds, ...data } = dto;
  return prisma.promocion.create({
    data: {
      ...data,
      ...(productoIds?.length && {
        productos: { create: productoIds.map((productoId) => ({ productoId })) },
      }),
    },
    include: INCLUDE,
  });
}

export async function updatePromocion(id: number, dto: UpdatePromocionDto) {
  await getPromocionById(id);
  const { productoIds, ...data } = dto;
  return prisma.promocion.update({ where: { id }, data, include: INCLUDE });
}

export async function togglePromocion(id: number) {
  const p = await getPromocionById(id);
  return prisma.promocion.update({ where: { id }, data: { activa: !p.activa }, select: { id: true, activa: true } });
}

export async function getPromocionByCodigoActiva(codigo: string) {
  const now = new Date();
  const p = await prisma.promocion.findFirst({
    where: { codigo, activa: true, fechaInicio: { lte: now }, fechaFin: { gte: now } },
  });
  if (!p) throw new NotFoundError('Código no válido o expirado');
  if (p.usoMaximo && p.usoActual >= p.usoMaximo) throw new NotFoundError('Código agotado');
  return p;
}
