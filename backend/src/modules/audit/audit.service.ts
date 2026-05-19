import { prisma } from '@/config/prisma';
import { ListAuditQueryInput } from './audit.schemas';

export async function findAll(query: ListAuditQueryInput) {
  const { page, pageSize, tabla, accion, usuario, desde, hasta } = query;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (tabla) where.tabla = tabla;
  if (accion) where.accion = accion;
  if (usuario) where.id_usuario_bo = usuario;

  if (desde || hasta) {
    where.fecha = {};
    if (desde) (where.fecha as Record<string, unknown>).gte = desde;
    if (hasta) (where.fecha as Record<string, unknown>).lte = hasta;
  }

  const [registros, total] = await Promise.all([
    prisma.audit_log.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { fecha: 'desc' },
      include: {
        usuarios_backoffice: {
          select: {
            email: true,
            empleado: {
              select: { nombre1: true, apellido1: true },
            },
          },
        },
      },
    }),
    prisma.audit_log.count({ where }),
  ]);

  return {
    data: registros,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function findByRegistro(tabla: string, idRegistro: string) {
  return prisma.audit_log.findMany({
    where: {
      tabla,
      id_registro: idRegistro,
    },
    orderBy: { fecha: 'desc' },
    include: {
      usuarios_backoffice: {
        select: {
          email: true,
          empleado: {
            select: { nombre1: true, apellido1: true },
          },
        },
      },
    },
  });
}
