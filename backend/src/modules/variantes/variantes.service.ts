import { prisma } from '@/config/prisma';
import { NotFoundError, ConflictError } from '@/shared/utils/errors';
import { registrarAudit, AuditParams } from '@/shared/utils/audit';
import { CreateVarianteInput, UpdateVarianteInput } from './variantes.schemas';

type AuditCtx = Pick<AuditParams, 'id_usuario_bo' | 'ip' | 'user_agent'>;

const varianteInclude = {
  talla: { select: { id_talla: true, descripcion: true } },
  producto: { select: { id_producto: true, nombre: true } },
} as const;

export async function findAllByProducto(idProducto: string) {
  // Verificar que el producto existe
  const producto = await prisma.producto.findUnique({ where: { id_producto: idProducto } });
  if (!producto) throw new NotFoundError('Producto no encontrado');

  return prisma.variante_producto.findMany({
    where: { id_producto: idProducto },
    include: varianteInclude,
    orderBy: { id_variante: 'asc' },
  });
}

export async function findById(id: number) {
  const variante = await prisma.variante_producto.findUnique({
    where: { id_variante: id },
    include: varianteInclude,
  });

  if (!variante) throw new NotFoundError('Variante no encontrada');
  return variante;
}

export async function create(idProducto: string, data: CreateVarianteInput, ctx?: AuditCtx) {
  // Verificar producto existe y está activo
  const producto = await prisma.producto.findUnique({ where: { id_producto: idProducto } });
  if (!producto) throw new NotFoundError('Producto no encontrado');
  if (producto.estado_prod !== 'ACT') throw new ConflictError('El producto no está activo');

  // Verificar talla existe y está activa
  const talla = await prisma.talla.findUnique({ where: { id_talla: data.id_talla } });
  if (!talla) throw new NotFoundError(`Talla ${data.id_talla} no existe`);
  if (talla.estado !== 'ACT') throw new ConflictError(`Talla ${data.id_talla} no está activa`);

  // Validar SKU único globalmente
  const existingSku = await prisma.variante_producto.findFirst({ where: { sku: data.sku } });
  if (existingSku) throw new ConflictError(`El SKU "${data.sku}" ya está en uso`);

  // Validar combinación (id_producto, id_talla, color) única
  const existingCombo = await prisma.variante_producto.findFirst({
    where: {
      id_producto: idProducto,
      id_talla: data.id_talla,
      color: data.color,
    },
  });
  if (existingCombo) throw new ConflictError(`Ya existe una variante con esa talla y color para este producto`);

  const variante = await prisma.variante_producto.create({
    data: {
      id_producto: idProducto,
      id_talla: data.id_talla,
      color: data.color,
      sku: data.sku,
      var_saldo_inicial: data.var_saldo_inicial,
    },
    include: varianteInclude,
  });

  await registrarAudit({ tabla: 'variante_producto', id_registro: variante.id_variante, accion: 'INSERT', payload_despues: variante, ...ctx });
  return variante;
}

export async function update(id: number, data: UpdateVarianteInput, ctx?: AuditCtx) {
  const antes = await findById(id);

  // Validar SKU único si cambia
  if (data.sku) {
    const existing = await prisma.variante_producto.findFirst({
      where: { sku: data.sku, id_variante: { not: id } },
    });
    if (existing) throw new ConflictError(`El SKU "${data.sku}" ya está en uso`);
  }

  // Validar combinación única si cambia el color
  if (data.color) {
    const existingCombo = await prisma.variante_producto.findFirst({
      where: {
        id_producto: antes.id_producto,
        id_talla: antes.id_talla,
        color: data.color,
        id_variante: { not: id },
      },
    });
    if (existingCombo) throw new ConflictError('Ya existe una variante con esa talla y color para este producto');
  }

  const variante = await prisma.variante_producto.update({
    where: { id_variante: id },
    data,
    include: varianteInclude,
  });

  await registrarAudit({ tabla: 'variante_producto', id_registro: id, accion: 'UPDATE', payload_antes: antes, payload_despues: variante, ...ctx });
  return variante;
}

export async function remove(id: number, ctx?: AuditCtx) {
  const variante = await findById(id);

  // Bloquear si tiene stock
  if (variante.var_saldo_final !== null && variante.var_saldo_final > 0) {
    throw new ConflictError(`No se puede eliminar: la variante tiene stock (${variante.var_saldo_final} unidades)`);
  }

  // Bloquear si tiene movimientos
  const movimientos = await prisma.movimiento_stock.count({
    where: { id_variante: id },
  });
  if (movimientos > 0) {
    throw new ConflictError(`No se puede eliminar: la variante tiene ${movimientos} movimiento(s) de stock registrado(s)`);
  }

  // Eliminar físicamente (es la única situación en que esto se permite)
  await prisma.variante_producto.delete({ where: { id_variante: id } });
  await registrarAudit({ tabla: 'variante_producto', id_registro: id, accion: 'DELETE', payload_antes: variante, ...ctx });
  return variante;
}

export async function findSinStock() {
  return prisma.variante_producto.findMany({
    where: { var_saldo_final: 0 },
    include: varianteInclude,
    orderBy: { id_variante: 'asc' },
  });
}

export async function findStockBajo() {
  return prisma.variante_producto.findMany({
    where: { var_saldo_final: { gte: 1, lte: 5 } },
    include: varianteInclude,
    orderBy: { var_saldo_final: 'asc' },
  });
}
