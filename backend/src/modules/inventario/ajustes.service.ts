import { Prisma } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { NotFoundError, ConflictError, UnauthorizedError } from '@/shared/utils/errors';
import { registrarAudit } from '@/shared/utils/audit';
import {
  CreateAjusteInput,
  AnularAjusteInput,
  ListAjustesQueryInput,
} from './inventario.schemas';

const ajusteInclude = {
  empleado: {
    select: { id_empleado: true, nombre1: true, apellido1: true },
  },
  detalle_ajuste: {
    include: {
      variante_producto: {
        select: { id_variante: true, sku: true, color: true, talla: { select: { descripcion: true } } },
      },
    },
  },
} as const;

async function resolveEmpleado(idUsuario: number): Promise<number> {
  const usuario = await prisma.usuarios_backoffice.findUnique({
    where: { id_usuario: idUsuario },
    select: { id_empleado: true },
  });
  if (!usuario) throw new UnauthorizedError('Usuario no autorizado');
  return usuario.id_empleado;
}

export async function findAll(query: ListAjustesQueryInput) {
  const { page, pageSize, desde, hasta, empleado } = query;
  const skip = (page - 1) * pageSize;

  const where: Prisma.ajuste_inventarioWhereInput = {};
  if (empleado) where.id_empleado = empleado;
  if (desde || hasta) {
    where.fecha_ajuste = {};
    if (desde) where.fecha_ajuste.gte = desde;
    if (hasta) where.fecha_ajuste.lte = hasta;
  }

  const [ajustes, total] = await Promise.all([
    prisma.ajuste_inventario.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { fecha_ajuste: 'desc' },
      include: {
        empleado: { select: { id_empleado: true, nombre1: true, apellido1: true } },
        _count: { select: { detalle_ajuste: true } },
      },
    }),
    prisma.ajuste_inventario.count({ where }),
  ]);

  return { data: ajustes, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

export async function findById(id: number) {
  const ajuste = await prisma.ajuste_inventario.findUnique({
    where: { id_ajuste: id },
    include: ajusteInclude,
  });

  if (!ajuste) throw new NotFoundError('Ajuste no encontrado');
  return ajuste;
}

export async function crearAjuste(data: CreateAjusteInput, idUsuario: number) {
  const idEmpleado = await resolveEmpleado(idUsuario);

  // Pre-validar que todas las variantes existen
  const idVariantes = data.detalles.map((d) => d.id_variante);
  const variantesBefore = await prisma.variante_producto.findMany({
    where: { id_variante: { in: idVariantes } },
    select: { id_variante: true, var_saldo_final: true },
  });

  if (variantesBefore.length !== idVariantes.length) {
    const found = variantesBefore.map((v) => v.id_variante);
    const notFound = idVariantes.filter((id) => !found.includes(id));
    throw new NotFoundError(`Variantes no encontradas: ${notFound.join(', ')}`);
  }

  // Pre-validar stock para EGR
  for (const detalle of data.detalles) {
    if (detalle.tipo_movimiento === 'EGR') {
      const variante = variantesBefore.find((v) => v.id_variante === detalle.id_variante)!;
      if ((variante.var_saldo_final ?? 0) < detalle.cantidad) {
        throw new ConflictError(`Stock insuficiente en variante ${detalle.id_variante}`);
      }
    }
  }

  try {
    const ajuste = await prisma.$transaction(async (tx) => {
      // 1. Crear cabecera del ajuste
      const ajusteHeader = await tx.ajuste_inventario.create({
        data: { motivo: data.motivo, estado: 'PRO', id_empleado: idEmpleado },
      });

      // 2. Procesar cada detalle
      for (const det of data.detalles) {
        // a. INSERT detalle_ajuste
        await tx.detalle_ajuste.create({
          data: {
            id_ajuste: ajusteHeader.id_ajuste,
            id_variante: det.id_variante,
            cantidad: det.cantidad,
            tipo_movimiento: det.tipo_movimiento,
          },
        });

        // b. UPDATE variante_producto
        const updatedVariante = await tx.variante_producto.update({
          where: { id_variante: det.id_variante },
          data:
            det.tipo_movimiento === 'ING'
              ? { var_qty_ingresos: { increment: det.cantidad } }
              : { var_qty_egresos: { increment: det.cantidad } },
        });

        // c. INSERT movimiento_stock
        await tx.movimiento_stock.create({
          data: {
            id_variante: det.id_variante,
            tipo: 'AJU',
            cantidad: det.cantidad,
            referencia: `AJU-${ajusteHeader.id_ajuste}`,
            saldo_post: updatedVariante.var_saldo_final ?? 0,
            observacion: data.motivo,
            id_empleado: idEmpleado,
          },
        });
      }

      return ajusteHeader;
    });

    // 3. Audit (fuera de la transacción — nunca puede romper la operación)
    await registrarAudit({
      tabla: 'ajuste_inventario',
      id_registro: ajuste.id_ajuste,
      accion: 'INSERT',
      payload_despues: { motivo: data.motivo, detalles: data.detalles.length },
      id_usuario_bo: idUsuario,
    });

    return findById(ajuste.id_ajuste);
  } catch (error: unknown) {
    if (error instanceof ConflictError || error instanceof NotFoundError) throw error;
    if (
      error instanceof Error &&
      (error.message.includes('chk_var_stock_no_neg') ||
        error.message.includes('violates check constraint'))
    ) {
      throw new ConflictError('Stock insuficiente: el ajuste dejaría stock negativo');
    }
    throw error;
  }
}

export async function anularAjuste(idAjuste: number, data: AnularAjusteInput, idUsuario: number) {
  const idEmpleado = await resolveEmpleado(idUsuario);

  const ajusteExistente = await prisma.ajuste_inventario.findUnique({
    where: { id_ajuste: idAjuste },
    include: { detalle_ajuste: true },
  });

  if (!ajusteExistente) throw new NotFoundError('Ajuste no encontrado');
  if (ajusteExistente.estado === 'ANU') {
    throw new ConflictError('El ajuste ya fue anulado');
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 2. Movimiento inverso por cada detalle
      for (const det of ajusteExistente.detalle_ajuste) {
        // Revertir la variante
        const updatedVariante = await tx.variante_producto.update({
          where: { id_variante: det.id_variante },
          data:
            det.tipo_movimiento === 'ING'
              ? { var_qty_ingresos: { decrement: det.cantidad } }
              : { var_qty_egresos: { decrement: det.cantidad } },
        });

        // 3. INSERT movimiento_stock de anulación
        await tx.movimiento_stock.create({
          data: {
            id_variante: det.id_variante,
            tipo: 'AJU',
            cantidad: det.cantidad,
            referencia: `ANU-${idAjuste}`,
            saldo_post: updatedVariante.var_saldo_final ?? 0,
            observacion: data.motivo_anulacion,
            id_empleado: idEmpleado,
          },
        });
      }

      // 4. Marcar ajuste como anulado
      await tx.ajuste_inventario.update({
        where: { id_ajuste: idAjuste },
        data: { estado: 'ANU' },
      });
    });

    // 5. Audit
    await registrarAudit({
      tabla: 'ajuste_inventario',
      id_registro: idAjuste,
      accion: 'UPDATE',
      payload_antes: { estado: 'PRO' },
      payload_despues: { estado: 'ANU', motivo_anulacion: data.motivo_anulacion },
      id_usuario_bo: idUsuario,
    });

    return findById(idAjuste);
  } catch (error: unknown) {
    if (error instanceof ConflictError || error instanceof NotFoundError) throw error;
    if (
      error instanceof Error &&
      (error.message.includes('chk_var_stock_no_neg') ||
        error.message.includes('violates check constraint'))
    ) {
      throw new ConflictError('La anulación dejaría stock negativo');
    }
    throw error;
  }
}
