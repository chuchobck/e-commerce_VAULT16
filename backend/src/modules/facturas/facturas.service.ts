import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { NotFoundError, ConflictError, ForbiddenError } from '../../shared/utils/errors';
import { registrarAudit, AuditParams } from '../../shared/utils/audit';
import { ListFacturasQuery, ListFacturasMeQuery, CambiarEstadoInput } from './facturas.schemas';

type AuditCtx = Pick<AuditParams, 'id_usuario_bo' | 'id_cliente' | 'ip' | 'user_agent'>;

// ─── Include completo ─────────────────────────────────────────────────────────

const facturaIncludeFull = {
  cliente: {
    select: {
      id_cliente: true,
      email: true,
      nombre1: true,
      apellido1: true,
      ruc_cedula: true,
      telefono: true,
    },
  },
  direccion_cliente: true,
  empleado: {
    select: {
      id_empleado: true,
      nombre1: true,
      apellido1: true,
    },
  },
  detalle_factura: {
    include: {
      variante_producto: {
        select: {
          id_variante: true,
          sku: true,
          color: true,
          id_producto: true,
          talla: {
            select: { descripcion: true },
          },
          producto: {
            select: {
              nombre: true,
              precio_venta: true,
            },
          },
        },
      },
    },
  },
  pago: {
    orderBy: { fecha: 'desc' as const },
  },
} as const;

const facturaIncludeList = {
  cliente: {
    select: {
      id_cliente: true,
      email: true,
      nombre1: true,
      apellido1: true,
    },
  },
  pago: {
    select: {
      metodo: true,
      estado: true,
      monto: true,
      fecha: true,
    },
    orderBy: { fecha: 'desc' as const },
    take: 1,
  },
  _count: {
    select: { detalle_factura: true },
  },
} as const;

// ─── Lecturas admin ───────────────────────────────────────────────────────────

export async function findAll(query: ListFacturasQuery) {
  const { page, pageSize, cliente, estado, desde, hasta, metodo_pago } = query;
  const skip = (page - 1) * pageSize;

  const where: Prisma.facturaWhereInput = {
    ...(cliente ? { id_cliente: cliente } : {}),
    ...(estado ? { estado } : {}),
    ...(desde || hasta
      ? {
          fecha_emision: {
            ...(desde ? { gte: new Date(desde) } : {}),
            ...(hasta ? { lte: new Date(hasta) } : {}),
          },
        }
      : {}),
    ...(metodo_pago
      ? {
          pago: {
            some: { metodo: metodo_pago },
          },
        }
      : {}),
  };

  const [facturas, total] = await prisma.$transaction([
    prisma.factura.findMany({
      where,
      include: facturaIncludeList,
      orderBy: { fecha_emision: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.factura.count({ where }),
  ]);

  return {
    data: facturas,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function findById(id: string) {
  const factura = await prisma.factura.findUnique({
    where: { id_factura: id },
    include: facturaIncludeFull,
  });
  if (!factura) throw new NotFoundError('Factura no encontrada');
  return factura;
}

// ─── Lecturas cliente ─────────────────────────────────────────────────────────

export async function findAllMe(idCliente: number, query: ListFacturasMeQuery) {
  const { page, pageSize, estado } = query;
  const skip = (page - 1) * pageSize;

  const where: Prisma.facturaWhereInput = {
    id_cliente: idCliente,
    ...(estado ? { estado } : {}),
  };

  const [facturas, total] = await prisma.$transaction([
    prisma.factura.findMany({
      where,
      include: facturaIncludeList,
      orderBy: { fecha_emision: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.factura.count({ where }),
  ]);

  return {
    data: facturas,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function findByIdMe(idCliente: number, idFactura: string) {
  const factura = await prisma.factura.findUnique({
    where: { id_factura: idFactura },
    include: facturaIncludeFull,
  });

  // Si no existe O pertenece a otro cliente → NotFoundError (no Forbidden)
  if (!factura || factura.id_cliente !== idCliente) {
    throw new NotFoundError('Factura no encontrada');
  }

  return factura;
}

// ─── Cambio de estado ─────────────────────────────────────────────────────────

/**
 * Mapa de transiciones válidas:
 *   EMI → PAG (lo hace checkout/confirmarPago — no directo por este endpoint)
 *   EMI → ANU
 *   PAG → ENV
 *   PAG → ANU  (solo admin — chequeado en el controller)
 *   ENV → ENT
 *   ENV → ANU  (no permitido)
 *   ENT → ANU  (no permitido)
 */
const TRANSICIONES_VALIDAS: Record<string, string[]> = {
  EMI: ['ANU'],
  PAG: ['ENV', 'ANU'],
  ENV: ['ENT'],
  ENT: [],
  ANU: [],
};

export async function cambiarEstado(
  idFactura: string,
  input: CambiarEstadoInput,
  rol: string,
  ctx?: AuditCtx,
) {
  const factura = await prisma.factura.findUnique({
    where: { id_factura: idFactura },
    include: { detalle_factura: true, pago: true },
  });

  if (!factura) throw new NotFoundError('Factura no encontrada');

  const estadoActual = factura.estado;
  const { nuevo_estado, observacion } = input;

  // Verificar transición válida
  const permitidos = TRANSICIONES_VALIDAS[estadoActual] ?? [];
  if (!permitidos.includes(nuevo_estado)) {
    throw new ConflictError(
      `No se puede cambiar de '${estadoActual}' a '${nuevo_estado}'. ` +
        `Desde '${estadoActual}' solo se permite: ${permitidos.length ? permitidos.join(', ') : 'ninguna transición'}.`,
    );
  }

  // PAG → ANU: solo ADMIN
  if (estadoActual === 'PAG' && nuevo_estado === 'ANU' && rol !== 'ADMIN') {
    throw new ForbiddenError('Solo el ADMIN puede anular facturas ya pagadas.');
  }

  // ── Transición simple (ENV, ENT) ───────────────────────────────────────────
  if (nuevo_estado !== 'ANU') {
    const facturaActualizada = await prisma.factura.update({
      where: { id_factura: idFactura },
      data: { estado: nuevo_estado },
    });

    await registrarAudit({
      tabla: 'factura',
      id_registro: idFactura,
      accion: 'UPDATE',
      payload_antes: { estado: estadoActual },
      payload_despues: { estado: nuevo_estado, observacion },
      ...ctx,
    });

    return facturaActualizada;
  }

  // ── Anulación (transacción) ────────────────────────────────────────────────
  const resultado = await prisma.$transaction(async (tx) => {
    // 1. UPDATE factura → ANU
    const facturaAnulada = await tx.factura.update({
      where: { id_factura: idFactura },
      data: { estado: 'ANU' },
    });

    // 2. Revertir stock por cada detalle
    for (const det of factura.detalle_factura) {
      // Sumar a var_qty_ingresos para revertir el egreso
      const variante = await tx.variante_producto.update({
        where: { id_variante: det.id_variante },
        data: { var_qty_ingresos: { increment: det.cantidad } },
      });

      // Calcular saldo post
      const saldoPost =
        variante.var_qty_ingresos - variante.var_qty_egresos;

      // INSERT movimiento_stock DEV
      await tx.movimiento_stock.create({
        data: {
          id_variante: det.id_variante,
          tipo: 'DEV',
          cantidad: det.cantidad,
          referencia: `ANU-${idFactura}`.substring(0, 20),
          saldo_post: saldoPost,
          observacion: observacion ?? `Anulación factura ${idFactura}`,
        },
      });
    }

    // 3. Si estaba pagada → crear pago REE
    const pagoCOM = factura.pago.find((p) => p.estado === 'COM');
    if (pagoCOM) {
      await tx.pago.create({
        data: {
          id_factura: idFactura,
          metodo: pagoCOM.metodo,
          monto: -Math.abs(Number(pagoCOM.monto)),
          estado: 'REE',
          referencia_externa: `ANU-${idFactura}`.substring(0, 100),
        },
      });
    }

    return facturaAnulada;
  });

  // 4. Auditar fuera de la transacción
  await registrarAudit({
    tabla: 'factura',
    id_registro: idFactura,
    accion: 'UPDATE',
    payload_antes: { estado: estadoActual },
    payload_despues: {
      estado: 'ANU',
      observacion,
      revertidas_variantes: factura.detalle_factura.length,
      reembolso_creado: factura.pago.some((p) => p.estado === 'COM'),
    },
    ...ctx,
  });

  return resultado;
}

// ─── PDF stub ─────────────────────────────────────────────────────────────────

export async function getPdfData(idFactura: string, idClienteReq?: number) {
  const factura = await prisma.factura.findUnique({
    where: { id_factura: idFactura },
    include: facturaIncludeFull,
  });

  if (!factura) throw new NotFoundError('Factura no encontrada');

  // Si viene como cliente (idClienteReq definido) → verificar ownership
  if (idClienteReq !== undefined && factura.id_cliente !== idClienteReq) {
    throw new NotFoundError('Factura no encontrada');
  }

  return factura;
}
