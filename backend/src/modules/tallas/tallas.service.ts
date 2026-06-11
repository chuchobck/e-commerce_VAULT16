import { prisma } from '../../config/prisma';
import { NotFoundError, ConflictError } from '../../shared/utils/errors';
import { registrarAudit, AuditParams } from '../../shared/utils/audit';
import { CreateTallaInput, UpdateTallaInput } from './tallas.schemas';

type AuditCtx = Pick<AuditParams, 'id_usuario_bo' | 'ip' | 'user_agent'>;

export async function findAllActive() {
  return prisma.talla.findMany({
    where: { estado: 'ACT' },
    orderBy: { orden: 'asc' },
  });
}

export async function findAll() {
  return prisma.talla.findMany({
    orderBy: { orden: 'asc' },
  });
}

export async function findById(id: number) {
  const talla = await prisma.talla.findUnique({
    where: { id_talla: id },
  });

  if (!talla) {
    throw new NotFoundError(`Talla no encontrada`);
  }

  return talla;
}

export async function create(data: CreateTallaInput, ctx?: AuditCtx) {
  const existing = await prisma.talla.findFirst({
    where: { descripcion: data.descripcion },
  });

  if (existing) {
    throw new ConflictError(`La talla ${data.descripcion} ya existe`);
  }

  const talla = await prisma.talla.create({
    data: {
      descripcion: data.descripcion,
      estado: 'ACT',
    },
  });

  await registrarAudit({ tabla: 'talla', id_registro: talla.id_talla, accion: 'INSERT', payload_despues: talla, ...ctx });
  return talla;
}

export async function update(id: number, data: UpdateTallaInput, ctx?: AuditCtx) {
  const antes = await findById(id);

  if (data.descripcion) {
    const existing = await prisma.talla.findFirst({
      where: { descripcion: data.descripcion, id_talla: { not: id } },
    });
    if (existing) throw new ConflictError(`La talla ${data.descripcion} ya existe`);
  }

  const talla = await prisma.talla.update({
    where: { id_talla: id },
    data,
  });

  await registrarAudit({ tabla: 'talla', id_registro: id, accion: 'UPDATE', payload_antes: antes, payload_despues: talla, ...ctx });
  return talla;
}

export async function deactivate(id: number, ctx?: AuditCtx) {
  const antes = await findById(id);

  const variantesActivas = await prisma.variante_producto.count({
    where: { id_talla: id, var_saldo_final: { gt: 0 } },
  });

  if (variantesActivas > 0) {
    throw new ConflictError(
      `No se puede desactivar: hay ${variantesActivas} variante(s) activa(s) con stock en esta talla`
    );
  }

  const talla = await prisma.talla.update({
    where: { id_talla: id },
    data: { estado: 'INA' },
  });

  await registrarAudit({ tabla: 'talla', id_registro: id, accion: 'UPDATE', payload_antes: { estado: antes.estado }, payload_despues: { estado: 'INA' }, ...ctx });
  return talla;
}
