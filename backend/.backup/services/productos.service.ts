import { prisma } from '../config/prisma';
import { NotFoundError, ConflictError } from '../shared/utils/errors';
import { buildPaginatedResponse } from '../shared/utils/pagination';
import { CreateProductoDto, UpdateProductoDto, ProductoFilters } from '../schemas/productos.schemas';

const INCLUDE_BASE = {
  categoria: { select: { id: true, nombre: true, slug: true } },
  fotos: { orderBy: { orden: 'asc' as const } },
  variantes: { include: { talla: true } },
};

export async function getProductos(filters: ProductoFilters) {
  const { search, categoriaId, destacado, activo, page, limit } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) where.nombre = { contains: search, mode: 'insensitive' };
  if (categoriaId) where.categoriaId = categoriaId;
  if (destacado !== undefined) where.destacado = destacado;
  if (activo !== undefined) where.activo = activo;

  const [items, total] = await prisma.$transaction([
    prisma.producto.findMany({ where, skip, take: limit, orderBy: { creadoEn: 'desc' }, include: INCLUDE_BASE }),
    prisma.producto.count({ where }),
  ]);

  return buildPaginatedResponse(items, total, { page, limit, skip });
}

export async function getProductoById(id: number) {
  const p = await prisma.producto.findUnique({ where: { id }, include: { ...INCLUDE_BASE, aiContent: true } });
  if (!p) throw new NotFoundError('Producto no encontrado');
  return p;
}

export async function getProductoBySlug(slug: string) {
  const p = await prisma.producto.findUnique({ where: { slug }, include: { ...INCLUDE_BASE, aiContent: true } });
  if (!p) throw new NotFoundError('Producto no encontrado');
  return p;
}

export async function createProducto(dto: CreateProductoDto) {
  const exists = await prisma.producto.findUnique({ where: { slug: dto.slug } });
  if (exists) throw new ConflictError('Slug ya en uso');
  return prisma.producto.create({ data: { ...dto, precio: dto.precio }, include: INCLUDE_BASE });
}

export async function updateProducto(id: number, dto: UpdateProductoDto) {
  await getProductoById(id);
  return prisma.producto.update({ where: { id }, data: dto, include: INCLUDE_BASE });
}

export async function toggleProducto(id: number) {
  const p = await getProductoById(id);
  return prisma.producto.update({ where: { id }, data: { activo: !p.activo }, select: { id: true, activo: true } });
}
