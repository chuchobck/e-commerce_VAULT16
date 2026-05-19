import { Prisma } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { NotFoundError, ConflictError } from '@/shared/utils/errors';
import { registrarAudit, AuditParams } from '@/shared/utils/audit';
import { refund } from './stripe.service';
import { ListPagosQuery } from './pagos.schemas';

type AuditCtx = Pick<AuditParams, 'id_usuario_bo' | 'ip' | 'user_agent'>;

const pagoInclude = {
  factura: {
    select: {
      id_factura: true,
      id_cliente: true,
      estado: true,
      total: true,
      fecha_emision: true,
    },
  },
} as const;

// ─── Lecturas ─────────────────────────────────────────────────────────────────

export async function findAll(query: ListPagosQuery) {
  const { page, pageSize, id_factura, estado, metodo } = query;
  const skip = (page - 1) * pageSize;

  const where: Prisma.pagoWhereInput = {
    ...(id_factura ? { id_factura } : {}),
    ...(estado ? { estado } : {}),
    ...(metodo ? { metodo } : {}),
  };

  const [pagos, total] = await prisma.$transaction([
    prisma.pago.findMany({
      where,
      include: pagoInclude,
      orderBy: { fecha: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.pago.count({ where }),
  ]);

  return {
    data: pagos,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function findById(id: number) {
  const pago = await prisma.pago.findUnique({
    where: { id_pago: id },
    include: pagoInclude,
  });
  if (!pago) throw new NotFoundError('Pago no encontrado');
  return pago;
}

// ─── Confirmar (admin: TRANSFERENCIA PEN → COM) ────────────────────────────────

export async function confirmarPago(id: number, ctx?: AuditCtx) {
  const pago = await findById(id);

  if (pago.estado !== 'PEN') {
    throw new ConflictError(`El pago ya está en estado '${pago.estado}' — solo se pueden confirmar pagos en estado PEN`);
  }

  const resultado = await prisma.$transaction(async (tx) => {
    const pagoActualizado = await tx.pago.update({
      where: { id_pago: id },
      data: { estado: 'COM' },
    });

    await tx.factura.update({
      where: { id_factura: pago.id_factura },
      data: { estado: 'PAG' },
    });

    return pagoActualizado;
  });

  await registrarAudit({
    tabla: 'pago',
    id_registro: id,
    accion: 'UPDATE',
    payload_antes: { estado: 'PEN' },
    payload_despues: { estado: 'COM', id_factura: pago.id_factura },
    ...ctx,
  });

  return resultado;
}

// ─── Reembolsar ───────────────────────────────────────────────────────────────

export async function reembolsar(id: number, ctx?: AuditCtx) {
  const pago = await findById(id);

  if (pago.estado === 'REE') {
    throw new ConflictError('Este pago ya fue reembolsado');
  }
  if (pago.estado !== 'COM') {
    throw new ConflictError('Solo se pueden reembolsar pagos confirmados (estado COM)');
  }

  // Si es Stripe → crear refund real (o stub)
  let reembolsoExterno: { id: string; status: string } | null = null;
  if (pago.metodo === 'STRIPE' && pago.referencia_externa) {
    const montoOriginalCentavos = Math.round(Number(pago.monto) * 100);
    const refundResult = await refund(pago.referencia_externa, montoOriginalCentavos);
    reembolsoExterno = { id: refundResult.id, status: refundResult.status ?? 'succeeded' };
  }

  // Crear NUEVO registro de pago con monto negativo — APPEND-ONLY
  const pagoReembolso = await prisma.pago.create({
    data: {
      id_factura: pago.id_factura,
      metodo: pago.metodo,
      monto: new Prisma.Decimal((-Number(pago.monto)).toFixed(3)),
      estado: 'REE',
      referencia_externa: reembolsoExterno?.id ?? null,
    },
  });

  await registrarAudit({
    tabla: 'pago',
    id_registro: pagoReembolso.id_pago,
    accion: 'INSERT',
    payload_despues: {
      motivo: 'reembolso',
      pago_original: id,
      monto: pagoReembolso.monto,
      referencia_externa: pagoReembolso.referencia_externa,
    },
    ...ctx,
  });

  return pagoReembolso;
}
