import { Prisma } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { NotFoundError, ConflictError } from '@/shared/utils/errors';
import { registrarAudit, AuditParams } from '@/shared/utils/audit';
import {
  CreatePromocionInput,
  UpdatePromocionInput,
  AsociarProductosInput,
} from './promociones.schemas';

type AuditCtx = Pick<AuditParams, 'id_usuario_bo' | 'ip' | 'user_agent'>;

const promocionInclude = {
  promocion_detalle: {
    include: {
      producto: {
        select: {
          id_producto: true,
          nombre: true,
          precio_venta: true,
          estado_prod: true,
          producto_fotos: {
            where: { es_principal: true },
            take: 1,
            select: { url_foto: true },
          },
        },
      },
    },
  },
} as const;

// ─── Lecturas ─────────────────────────────────────────────────────────────────

export async function findVigentes() {
  const now = new Date();
  return prisma.promocion.findMany({
    where: {
      estado: 'ACT',
      fecha_inicio: { lte: now },
      fecha_fin: { gte: now },
    },
    include: promocionInclude,
    orderBy: { fecha_inicio: 'desc' },
  });
}

export async function findAll() {
  return prisma.promocion.findMany({
    include: promocionInclude,
    orderBy: { created_at: 'desc' },
  });
}

export async function findById(id: number) {
  const promo = await prisma.promocion.findUnique({
    where: { id_promocion: id },
    include: promocionInclude,
  });
  if (!promo) throw new NotFoundError('Promoción no encontrada');
  return promo;
}

// ─── Mutaciones ───────────────────────────────────────────────────────────────

export async function create(data: CreatePromocionInput, ctx?: AuditCtx) {
  const promo = await prisma.promocion.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
      porcentaje_descuento: data.porcentaje_descuento,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      estado: 'ACT',
    },
    include: promocionInclude,
  });

  await registrarAudit({
    tabla: 'promocion',
    id_registro: promo.id_promocion,
    accion: 'INSERT',
    payload_despues: promo,
    ...ctx,
  });

  return promo;
}

export async function update(id: number, data: UpdatePromocionInput, ctx?: AuditCtx) {
  const antes = await findById(id);
  const now = new Date();
  const yaEmpezó = antes.fecha_inicio <= now;

  // No permitir cambiar fechas si la promo ya arrancó
  if (yaEmpezó && (data.fecha_inicio !== undefined || data.fecha_fin !== undefined)) {
    throw new ConflictError('No se pueden modificar las fechas de una promoción que ya inició');
  }

  const promo = await prisma.promocion.update({
    where: { id_promocion: id },
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      porcentaje_descuento: data.porcentaje_descuento,
      ...(!yaEmpezó
        ? { fecha_inicio: data.fecha_inicio, fecha_fin: data.fecha_fin }
        : {}),
    },
    include: promocionInclude,
  });

  await registrarAudit({
    tabla: 'promocion',
    id_registro: id,
    accion: 'UPDATE',
    payload_antes: antes,
    payload_despues: promo,
    ...ctx,
  });

  return promo;
}

export async function deactivate(id: number, ctx?: AuditCtx) {
  const antes = await findById(id);

  const promo = await prisma.promocion.update({
    where: { id_promocion: id },
    data: { estado: 'INA' },
    include: promocionInclude,
  });

  await registrarAudit({
    tabla: 'promocion',
    id_registro: id,
    accion: 'UPDATE',
    payload_antes: { estado: antes.estado },
    payload_despues: { estado: 'INA' },
    ...ctx,
  });

  return promo;
}

// ─── Asociación de productos ──────────────────────────────────────────────────

export async function asociarProductos(
  id: number,
  data: AsociarProductosInput,
  ctx?: AuditCtx
) {
  await findById(id);

  // Validar que todos los productos existen
  const productosEnDB = await prisma.producto.findMany({
    where: { id_producto: { in: data.id_productos } },
    select: { id_producto: true },
  });

  if (productosEnDB.length !== data.id_productos.length) {
    const found = productosEnDB.map((p) => p.id_producto);
    const notFound = data.id_productos.filter((pid) => !found.includes(pid));
    throw new NotFoundError(`Productos no encontrados: ${notFound.join(', ')}`);
  }

  // Insertar en transacción — el UNIQUE constraint maneja duplicados silenciosamente
  await prisma.$transaction(
    data.id_productos.map((id_producto) =>
      prisma.promocion_detalle.upsert({
        where: { id_promocion_id_producto: { id_promocion: id, id_producto } },
        create: { id_promocion: id, id_producto },
        update: {},
      })
    )
  );

  await registrarAudit({
    tabla: 'promocion_detalle',
    id_registro: id,
    accion: 'INSERT',
    payload_despues: { id_productos: data.id_productos },
    ...ctx,
  });

  return findById(id);
}

export async function quitarProducto(
  id: number,
  idProducto: string,
  ctx?: AuditCtx
) {
  await findById(id);

  const detalle = await prisma.promocion_detalle.findUnique({
    where: { id_promocion_id_producto: { id_promocion: id, id_producto: idProducto } },
  });

  if (!detalle) throw new NotFoundError('El producto no está asociado a esta promoción');

  // DELETE FÍSICO — promocion_detalle es solo tabla de asociación
  await prisma.promocion_detalle.delete({
    where: { id_prom_detalle: detalle.id_prom_detalle },
  });

  await registrarAudit({
    tabla: 'promocion_detalle',
    id_registro: id,
    accion: 'DELETE',
    payload_antes: { id_producto: idProducto },
    ...ctx,
  });

  return findById(id);
}
