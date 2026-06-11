import { prisma } from '../../config/prisma';
import { NotFoundError } from '../../shared/utils/errors';
import { registrarAudit, AuditParams } from '../../shared/utils/audit';
import { CreateDireccionInput, UpdateDireccionInput } from './direcciones.schemas';

type AuditCtx = Pick<AuditParams, 'id_usuario_bo' | 'id_cliente' | 'ip' | 'user_agent'>;

export async function findAllByCliente(idCliente: number) {
  return prisma.direccion_cliente.findMany({
    where: {
      id_cliente: idCliente,
      activa: true,
    },
    orderBy: [{ es_principal: 'desc' }, { created_at: 'asc' }],
  });
}

export async function findById(id: number, idCliente: number) {
  const direccion = await prisma.direccion_cliente.findFirst({
    where: {
      id_direccion: id,
      id_cliente: idCliente,
    },
  });

  if (!direccion) {
    throw new NotFoundError(`Dirección no encontrada`);
  }

  return direccion;
}

export async function create(idCliente: number, data: CreateDireccionInput, ctx?: AuditCtx) {
  if (data.es_principal) {
    await prisma.direccion_cliente.updateMany({
      where: { id_cliente: idCliente, es_principal: true },
      data: { es_principal: false },
    });
  }

  const direccion = await prisma.direccion_cliente.create({
    data: {
      id_cliente: idCliente,
      alias: data.alias,
      nombre_destinatario: data.nombre_destinatario,
      telefono_contacto: data.telefono_contacto,
      provincia: data.provincia,
      ciudad: data.ciudad,
      direccion: data.direccion,
      referencia: data.referencia || null,
      codigo_postal: data.codigo_postal || null,
      es_principal: data.es_principal,
      activa: true,
    },
  });

  await registrarAudit({ tabla: 'direccion_cliente', id_registro: direccion.id_direccion, accion: 'INSERT', payload_despues: direccion, ...ctx });
  return direccion;
}

export async function update(
  id: number,
  idCliente: number,
  data: UpdateDireccionInput,
  ctx?: AuditCtx
) {
  const antes = await findById(id, idCliente);

  const direccion = await prisma.direccion_cliente.update({
    where: { id_direccion: id },
    data,
  });

  await registrarAudit({ tabla: 'direccion_cliente', id_registro: id, accion: 'UPDATE', payload_antes: antes, payload_despues: direccion, ...ctx });
  return direccion;
}

export async function deactivate(id: number, idCliente: number, ctx?: AuditCtx) {
  await findById(id, idCliente);

  const direccion = await prisma.direccion_cliente.update({
    where: { id_direccion: id },
    data: { activa: false, es_principal: false },
  });

  await registrarAudit({ tabla: 'direccion_cliente', id_registro: id, accion: 'UPDATE', payload_antes: { activa: true }, payload_despues: { activa: false }, ...ctx });
  return direccion;
}

export async function setPrincipal(id: number, idCliente: number, ctx?: AuditCtx) {
  const direccion = await findById(id, idCliente);

  if (!direccion.activa) {
    throw new Error('No se puede marcar como principal una dirección inactiva');
  }

  await prisma.direccion_cliente.updateMany({
    where: { id_cliente: idCliente, es_principal: true },
    data: { es_principal: false },
  });

  const updated = await prisma.direccion_cliente.update({
    where: { id_direccion: id },
    data: { es_principal: true },
  });

  await registrarAudit({ tabla: 'direccion_cliente', id_registro: id, accion: 'UPDATE', payload_antes: { es_principal: false }, payload_despues: { es_principal: true }, ...ctx });
  return updated;
}
