import { prisma } from '@/config/prisma';
import { NotFoundError, ConflictError } from '@/shared/utils/errors';
import { registrarAudit, AuditParams } from '@/shared/utils/audit';
import { hashPassword } from '@/shared/utils/password';
import { CreateEmpleadoInput, UpdateEmpleadoInput, UpdatePasswordInput } from './empleados.schemas';

type AuditCtx = Pick<AuditParams, 'id_usuario_bo' | 'ip' | 'user_agent'>;

export async function findAll() {
  return prisma.empleado.findMany({
    where: { estado_emp: 'ACT' },
    include: {
      usuarios_backoffice: {
        select: { id_usuario: true, email: true },
      },
    },
    orderBy: { nombre1: 'asc' },
  });
}

export async function findById(id: number) {
  const empleado = await prisma.empleado.findUnique({
    where: { id_empleado: id },
    include: {
      usuarios_backoffice: {
        select: { id_usuario: true, email: true },
      },
    },
  });

  if (!empleado) {
    throw new NotFoundError(`Empleado no encontrado`);
  }

  return empleado;
}

export async function create(data: CreateEmpleadoInput, ctx?: AuditCtx) {
  // Validar rol existe
  const rol = await prisma.rol.findUnique({
    where: { id_rol: data.id_rol },
  });

  if (!rol) {
    throw new NotFoundError(`Rol ${data.id_rol} no existe`);
  }

  // Validar cédula única
  const existingCedula = await prisma.empleado.findFirst({
    where: { cedula: data.cedula },
  });

  if (existingCedula) {
    throw new ConflictError(`Ya existe un empleado con cédula ${data.cedula}`);
  }

  // Validar email único
  const existingEmail = await prisma.usuarios_backoffice.findFirst({
    where: { email: data.email },
  });

  if (existingEmail) {
    throw new ConflictError(`El email ${data.email} ya está registrado`);
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // TRANSACCIÓN: crear empleado y usuario
  const empleado = await prisma.$transaction(async (tx) => {
    const emp = await tx.empleado.create({
      data: {
        cedula: data.cedula,
        nombre1: data.nombre1,
        apellido1: data.apellido1,
        telefono: data.telefono || null,
        estado_emp: 'ACT',
      },
    });

    await tx.usuarios_backoffice.create({
      data: {
        id_empleado: emp.id_empleado,
        id_rol: data.id_rol,
        email: data.email,
        password_hash: passwordHash,
        ultimo_login: null,
      },
    });

    return emp;
  });

  const result = await findById(empleado.id_empleado);
  await registrarAudit({ tabla: 'empleado', id_registro: empleado.id_empleado, accion: 'INSERT', payload_despues: result, ...ctx });
  return result;
}

export async function update(id: number, data: UpdateEmpleadoInput, ctx?: AuditCtx) {
  const antes = await findById(id);

  // Validar cédula única si cambia
  if (data.cedula) {
    const existing = await prisma.empleado.findFirst({
      where: {
        cedula: data.cedula,
        id_empleado: { not: id },
      },
    });

    if (existing) {
      throw new ConflictError(`Ya existe un empleado con cédula ${data.cedula}`);
    }
  }

  const empleado = await prisma.empleado.update({
    where: { id_empleado: id },
    data,
  });

  await registrarAudit({ tabla: 'empleado', id_registro: id, accion: 'UPDATE', payload_antes: antes, payload_despues: empleado, ...ctx });
  return empleado;
}

export async function updatePassword(id: number, data: UpdatePasswordInput) {
  await findById(id);

  const passwordHash = await hashPassword(data.password);

  // Actualizar en usuarios_backoffice
  await prisma.usuarios_backoffice.updateMany({
    where: { id_empleado: id },
    data: { password_hash: passwordHash },
  });

  return findById(id);
}

export async function deactivate(id: number, ctx?: AuditCtx) {
  const antes = await findById(id);

  // Validar que no es el único admin activo
  const user = await prisma.usuarios_backoffice.findFirst({
    where: { id_empleado: id },
  });

  if (user?.id_rol) {
    const adminsActivos = await prisma.usuarios_backoffice.count({
      where: {
        id_rol: user.id_rol,
        empleado: { estado_emp: 'ACT' },
      },
    });

    // Si hay solo 1 admin activo y es este, no permitir
    if (adminsActivos === 1) {
      const rolName = await prisma.rol.findUnique({
        where: { id_rol: user.id_rol },
        select: { nombre: true },
      });

      throw new ConflictError(`No se puede desactivar: es el único ${rolName?.nombre} activo`);
    }
  }

  const empleado = await prisma.empleado.update({
    where: { id_empleado: id },
    data: { estado_emp: 'INA' },
  });

  await registrarAudit({ tabla: 'empleado', id_registro: id, accion: 'UPDATE', payload_antes: { estado_emp: antes.estado_emp }, payload_despues: { estado_emp: 'INA' }, ...ctx });
  return empleado;
}
