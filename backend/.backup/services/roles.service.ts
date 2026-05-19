import { prisma } from '../config/prisma';
import { ConflictError, NotFoundError } from '../shared/utils/errors';
import { CreateRolDto } from '../schemas/roles.schemas';

export const getRoles = () => prisma.rol.findMany({ orderBy: { nombre: 'asc' } });

export async function createRol(dto: CreateRolDto) {
  const exists = await prisma.rol.findUnique({ where: { nombre: dto.nombre } });
  if (exists) throw new ConflictError('Rol ya existe');
  return prisma.rol.create({ data: dto });
}

export async function deleteRol(id: number) {
  const rol = await prisma.rol.findUnique({ where: { id } });
  if (!rol) throw new NotFoundError('Rol no encontrado');
  return prisma.rol.delete({ where: { id } });
}
