import { prisma } from '@/config/prisma';
import { NotFoundError, ConflictError, UnauthorizedError } from '@/shared/utils/errors';
import { registrarAudit, AuditParams } from '@/shared/utils/audit';
import { comparePassword, hashPassword } from '@/shared/utils/password';
import {
  UpdateClienteInput,
  UpdatePasswordClienteInput,
  UpdateEstadoInput,
} from './clientes.schemas';

type AuditCtx = Pick<AuditParams, 'id_usuario_bo' | 'id_cliente' | 'ip' | 'user_agent'>;

export async function findAll(search?: string, page: number = 1, pageSize: number = 20) {
  const skip = (page - 1) * pageSize;

  const where = search
    ? {
        OR: [
          { nombre1: { contains: search, mode: 'insensitive' as const } },
          { apellido1: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { ruc_cedula: { contains: search } },
        ],
      }
    : {};

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      where,
      skip,
      take: pageSize,
      select: {
        id_cliente: true,
        email: true,
        nombre1: true,
        apellido1: true,
        ruc_cedula: true,
        estado: true,
        email_verificado: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    }),
    prisma.cliente.count({ where }),
  ]);

  return {
    data: clientes,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function findById(id: number) {
  const cliente = await prisma.cliente.findUnique({
    where: { id_cliente: id },
    select: {
      id_cliente: true,
      email: true,
      nombre1: true,
      apellido1: true,
      telefono: true,
      ruc_cedula: true,
      estado: true,
      email_verificado: true,
      created_at: true,
    },
  });

  if (!cliente) {
    throw new NotFoundError(`Cliente no encontrado`);
  }

  return cliente;
}

export async function findByIdWithPassword(id: number) {
  return prisma.cliente.findUnique({
    where: { id_cliente: id },
  });
}

export async function updateEstado(id: number, data: UpdateEstadoInput, ctx?: AuditCtx) {
  const antes = await findById(id);

  const cliente = await prisma.cliente.update({
    where: { id_cliente: id },
    data: { estado: data.estado },
    select: {
      id_cliente: true,
      email: true,
      nombre1: true,
      apellido1: true,
      estado: true,
    },
  });

  await registrarAudit({ tabla: 'cliente', id_registro: id, accion: 'UPDATE', payload_antes: { estado: antes.estado }, payload_despues: { estado: data.estado }, ...ctx });
  return cliente;
}

export async function updatePerfil(id: number, data: UpdateClienteInput, ctx?: AuditCtx) {
  const antes = await findById(id);

  const cliente = await prisma.cliente.update({
    where: { id_cliente: id },
    data,
    select: {
      id_cliente: true,
      email: true,
      nombre1: true,
      apellido1: true,
      telefono: true,
      ruc_cedula: true,
    },
  });

  await registrarAudit({ tabla: 'cliente', id_registro: id, accion: 'UPDATE', payload_antes: antes, payload_despues: cliente, ...ctx });
  return cliente;
}

export async function updatePassword(
  id: number,
  data: UpdatePasswordClienteInput
) {
  const cliente = await findByIdWithPassword(id);

  if (!cliente) {
    throw new NotFoundError(`Cliente no encontrado`);
  }

  // Verificar contraseña actual
  const isValid = await comparePassword(data.oldPassword, cliente.password_hash);
  if (!isValid) {
    throw new UnauthorizedError('Contraseña actual incorrecta');
  }

  // Hash nueva password
  const newHash = await hashPassword(data.newPassword);

  return prisma.cliente.update({
    where: { id_cliente: id },
    data: { password_hash: newHash },
    select: {
      id_cliente: true,
      email: true,
      nombre1: true,
    },
  });
}
