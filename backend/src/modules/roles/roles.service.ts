import { prisma } from '../../config/prisma';
import { NotFoundError, ConflictError } from '../../shared/utils/errors';
import { registrarAudit, AuditParams } from '../../shared/utils/audit';
import { CreateRolInput, UpdateRolInput } from './roles.schemas';

type AuditCtx = Pick<AuditParams, 'id_usuario_bo' | 'ip' | 'user_agent'>;

export async function findAll() {
  return prisma.rol.findMany();
}

export async function findById(id: number) {
  const rol = await prisma.rol.findUnique({
    where: { id_rol: id },
  });

  if (!rol) {
    throw new NotFoundError(`Rol no encontrado`);
  }

  return rol;
}

export async function create(data: CreateRolInput, ctx?: AuditCtx) {
  // Validar que el nombre sea único
  const existing = await prisma.rol.findFirst({
    where: { nombre: data.nombre },
  });

  if (existing) {
    throw new ConflictError(`El rol "${data.nombre}" ya existe`);
  }

  const rol = await prisma.rol.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion || null,
    },
  });

  await registrarAudit({ tabla: 'rol', id_registro: rol.id_rol, accion: 'INSERT', payload_despues: rol, ...ctx });
  return rol;
}

export async function update(id: number, data: UpdateRolInput, ctx?: AuditCtx) {
  // Verificar que existe
  const antes = await findById(id);

  // Si cambia nombre, validar que sea único
  if (data.nombre) {
    const existing = await prisma.rol.findFirst({
      where: {
        nombre: data.nombre,
        id_rol: { not: id },
      },
    });

    if (existing) {
      throw new ConflictError(`El rol "${data.nombre}" ya existe`);
    }
  }

  const rol = await prisma.rol.update({
    where: { id_rol: id },
    data,
  });

  await registrarAudit({ tabla: 'rol', id_registro: id, accion: 'UPDATE', payload_antes: antes, payload_despues: rol, ...ctx });
  return rol;
}
