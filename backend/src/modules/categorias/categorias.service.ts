import { prisma } from '@/config/prisma';
import { NotFoundError, ConflictError } from '@/shared/utils/errors';
import { registrarAudit, AuditParams } from '@/shared/utils/audit';
import { CreateCategoriaInput, UpdateCategoriaInput } from './categorias.schemas';

type AuditCtx = Pick<AuditParams, 'id_usuario_bo' | 'ip' | 'user_agent'>;

// Listado público - solo ACT
export async function findAllActive() {
  return prisma.categoria_producto.findMany({
    where: { estado: 'ACT' },
    orderBy: { nombre: 'asc' },
  });
}

// Listado admin - incluye INA
export async function findAll() {
  return prisma.categoria_producto.findMany({
    orderBy: { nombre: 'asc' },
  });
}

export async function findById(id: string) {
  const categoria = await prisma.categoria_producto.findUnique({
    where: { id_categoria: id },
  });

  if (!categoria) {
    throw new NotFoundError(`Categoría no encontrada`);
  }

  return categoria;
}

export async function create(data: CreateCategoriaInput, ctx?: AuditCtx) {
  const existing = await prisma.categoria_producto.findUnique({
    where: { id_categoria: data.id_categoria },
  });

  if (existing) {
    throw new ConflictError(`La categoría ${data.id_categoria} ya existe`);
  }

  const categoria = await prisma.categoria_producto.create({
    data: {
      id_categoria: data.id_categoria,
      nombre: data.nombre,
      descripcion: data.descripcion || null,
      estado: 'ACT',
    },
  });

  await registrarAudit({ tabla: 'categoria_producto', id_registro: categoria.id_categoria, accion: 'INSERT', payload_despues: categoria, ...ctx });
  return categoria;
}

export async function update(id: string, data: UpdateCategoriaInput, ctx?: AuditCtx) {
  const antes = await findById(id);

  const categoria = await prisma.categoria_producto.update({
    where: { id_categoria: id },
    data,
  });

  await registrarAudit({ tabla: 'categoria_producto', id_registro: id, accion: 'UPDATE', payload_antes: antes, payload_despues: categoria, ...ctx });
  return categoria;
}

export async function deactivate(id: string, ctx?: AuditCtx) {
  const antes = await findById(id);

  const productosActivos = await prisma.producto.count({
    where: { id_categoria: id, estado_prod: 'ACT' },
  });

  if (productosActivos > 0) {
    throw new ConflictError(
      `No se puede desactivar: hay ${productosActivos} producto(s) activo(s) en esta categoría`
    );
  }

  const categoria = await prisma.categoria_producto.update({
    where: { id_categoria: id },
    data: { estado: 'INA' },
  });

  await registrarAudit({ tabla: 'categoria_producto', id_registro: id, accion: 'UPDATE', payload_antes: { estado: antes.estado }, payload_despues: { estado: 'INA' }, ...ctx });
  return categoria;
}
