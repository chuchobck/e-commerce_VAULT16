import { prisma } from '../config/prisma';
import { NotFoundError, ConflictError } from '../shared/utils/errors';
import { CreateCategoriaDto, UpdateCategoriaDto } from '../schemas/categorias.schemas';

export const getCategorias = () =>
  prisma.categoria.findMany({ where: { activa: true }, include: { hijos: true }, orderBy: { nombre: 'asc' } });

export async function createCategoria(dto: CreateCategoriaDto) {
  const exists = await prisma.categoria.findUnique({ where: { slug: dto.slug } });
  if (exists) throw new ConflictError('Slug ya en uso');
  return prisma.categoria.create({ data: dto });
}

export async function updateCategoria(id: number, dto: UpdateCategoriaDto) {
  const cat = await prisma.categoria.findUnique({ where: { id } });
  if (!cat) throw new NotFoundError('Categoría no encontrada');
  return prisma.categoria.update({ where: { id }, data: dto });
}

export async function toggleCategoria(id: number) {
  const cat = await prisma.categoria.findUnique({ where: { id } });
  if (!cat) throw new NotFoundError('Categoría no encontrada');
  return prisma.categoria.update({ where: { id }, data: { activa: !cat.activa } });
}
