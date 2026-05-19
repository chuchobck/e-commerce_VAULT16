import { prisma } from '../config/prisma';
import { NotFoundError, ConflictError } from '../shared/utils/errors';
import { CreateTallaDto } from '../schemas/tallas.schemas';

export const getTallas = () => prisma.talla.findMany({ orderBy: { orden: 'asc' } });

export async function createTalla(dto: CreateTallaDto) {
  const exists = await prisma.talla.findUnique({ where: { nombre: dto.nombre } });
  if (exists) throw new ConflictError('Talla ya existe');
  return prisma.talla.create({ data: dto });
}

export async function deleteTalla(id: number) {
  const t = await prisma.talla.findUnique({ where: { id } });
  if (!t) throw new NotFoundError('Talla no encontrada');
  return prisma.talla.delete({ where: { id } });
}
