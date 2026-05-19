import { prisma } from '../config/prisma';
import { NotFoundError, ConflictError } from '../shared/utils/errors';
import { CreateVarianteDto, UpdateVarianteDto } from '../schemas/variantes.schemas';

const INCLUDE = { talla: true, producto: { select: { id: true, nombre: true, slug: true } } };

export async function getVariantesByProducto(productoId: number) {
  return prisma.variante.findMany({ where: { productoId }, include: INCLUDE, orderBy: { talla: { orden: 'asc' } } });
}

export async function getVarianteById(id: number) {
  const v = await prisma.variante.findUnique({ where: { id }, include: INCLUDE });
  if (!v) throw new NotFoundError('Variante no encontrada');
  return v;
}

export async function createVariante(dto: CreateVarianteDto) {
  const exists = await prisma.variante.findUnique({ where: { sku: dto.sku } });
  if (exists) throw new ConflictError('SKU ya en uso');
  return prisma.variante.create({ data: dto, include: INCLUDE });
}

export async function updateVariante(id: number, dto: UpdateVarianteDto) {
  await getVarianteById(id);
  return prisma.variante.update({ where: { id }, data: dto, include: INCLUDE });
}

export async function toggleVariante(id: number) {
  const v = await getVarianteById(id);
  return prisma.variante.update({ where: { id }, data: { activo: !v.activo }, select: { id: true, activo: true } });
}
