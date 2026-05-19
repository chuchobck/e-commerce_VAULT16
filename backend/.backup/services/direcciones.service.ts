import { prisma } from '../config/prisma';
import { NotFoundError, ForbiddenError } from '../shared/utils/errors';
import { CreateDireccionDto, UpdateDireccionDto } from '../schemas/direcciones.schemas';

export async function getDireccionesCliente(clienteId: number) {
  return prisma.direccion.findMany({ where: { clienteId }, orderBy: [{ esPrincipal: 'desc' }, { id: 'asc' }] });
}

export async function createDireccion(clienteId: number, dto: CreateDireccionDto) {
  if (dto.esPrincipal) {
    await prisma.direccion.updateMany({ where: { clienteId }, data: { esPrincipal: false } });
  }
  return prisma.direccion.create({ data: { ...dto, clienteId } });
}

export async function updateDireccion(id: number, clienteId: number, dto: UpdateDireccionDto) {
  const dir = await prisma.direccion.findUnique({ where: { id } });
  if (!dir) throw new NotFoundError('Dirección no encontrada');
  if (dir.clienteId !== clienteId) throw new ForbiddenError();

  if (dto.esPrincipal) {
    await prisma.direccion.updateMany({ where: { clienteId }, data: { esPrincipal: false } });
  }
  return prisma.direccion.update({ where: { id }, data: dto });
}

export async function deleteDireccion(id: number, clienteId: number) {
  const dir = await prisma.direccion.findUnique({ where: { id } });
  if (!dir) throw new NotFoundError('Dirección no encontrada');
  if (dir.clienteId !== clienteId) throw new ForbiddenError();
  await prisma.direccion.delete({ where: { id } });
}
