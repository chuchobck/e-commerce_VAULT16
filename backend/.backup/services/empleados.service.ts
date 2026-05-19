import { prisma } from '../config/prisma';
import { hashPassword } from '../shared/utils/password';
import { NotFoundError, ConflictError } from '../shared/utils/errors';
import { PageParams, buildPaginatedResponse } from '../shared/utils/pagination';
import { CreateEmpleadoDto, UpdateEmpleadoDto, ChangePasswordDto } from '../schemas/empleados.schemas';

const SELECT = { id: true, nombre: true, email: true, activo: true, creadoEn: true, rol: { select: { id: true, nombre: true } } };

export async function getEmpleados(params: PageParams) {
  const [items, total] = await prisma.$transaction([
    prisma.empleado.findMany({ skip: params.skip, take: params.limit, orderBy: { nombre: 'asc' }, select: SELECT }),
    prisma.empleado.count(),
  ]);
  return buildPaginatedResponse(items, total, params);
}

export async function getEmpleadoById(id: number) {
  const emp = await prisma.empleado.findUnique({ where: { id }, select: SELECT });
  if (!emp) throw new NotFoundError('Empleado no encontrado');
  return emp;
}

export async function createEmpleado(dto: CreateEmpleadoDto) {
  const exists = await prisma.empleado.findUnique({ where: { email: dto.email } });
  if (exists) throw new ConflictError('El email ya está en uso');
  const passwordHash = await hashPassword(dto.password);
  return prisma.empleado.create({ data: { nombre: dto.nombre, email: dto.email, passwordHash, rolId: dto.rolId }, select: SELECT });
}

export async function updateEmpleado(id: number, dto: UpdateEmpleadoDto) {
  await getEmpleadoById(id);
  return prisma.empleado.update({ where: { id }, data: dto, select: SELECT });
}

export async function changePassword(id: number, dto: ChangePasswordDto) {
  await getEmpleadoById(id);
  const passwordHash = await hashPassword(dto.password);
  await prisma.empleado.update({ where: { id }, data: { passwordHash } });
}

export async function toggleActivo(id: number) {
  const emp = await getEmpleadoById(id);
  return prisma.empleado.update({ where: { id }, data: { activo: !emp.activo }, select: { id: true, activo: true } });
}
