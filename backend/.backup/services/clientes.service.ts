import { prisma } from '../config/prisma';
import { hashPassword } from '../shared/utils/password';
import { NotFoundError, ConflictError } from '../shared/utils/errors';
import { PageParams, buildPaginatedResponse } from '../shared/utils/pagination';
import { CreateClienteDto, UpdateClienteDto } from '../schemas/clientes.schemas';

export async function getClientes(params: PageParams & { search?: string }) {
  const where = params.search
    ? { OR: [{ nombre: { contains: params.search, mode: 'insensitive' as const } }, { email: { contains: params.search, mode: 'insensitive' as const } }] }
    : {};

  const [items, total] = await prisma.$transaction([
    prisma.cliente.findMany({ where, skip: params.skip, take: params.limit, orderBy: { creadoEn: 'desc' }, select: { id: true, nombre: true, email: true, telefono: true, activo: true, creadoEn: true } }),
    prisma.cliente.count({ where }),
  ]);

  return buildPaginatedResponse(items, total, params);
}

export async function getClienteById(id: number) {
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    select: { id: true, nombre: true, email: true, telefono: true, activo: true, creadoEn: true, direcciones: true },
  });
  if (!cliente) throw new NotFoundError('Cliente no encontrado');
  return cliente;
}

export async function createCliente(dto: CreateClienteDto) {
  const exists = await prisma.cliente.findUnique({ where: { email: dto.email } });
  if (exists) throw new ConflictError('El email ya está registrado');

  const passwordHash = await hashPassword(dto.password);
  return prisma.cliente.create({
    data: { ...dto, passwordHash, password: undefined },
    select: { id: true, nombre: true, email: true, telefono: true, activo: true, creadoEn: true },
  });
}

export async function updateCliente(id: number, dto: UpdateClienteDto) {
  await getClienteById(id);
  return prisma.cliente.update({ where: { id }, data: dto, select: { id: true, nombre: true, email: true, telefono: true, activo: true } });
}

export async function toggleActivo(id: number) {
  const cliente = await getClienteById(id);
  return prisma.cliente.update({ where: { id }, data: { activo: !cliente.activo }, select: { id: true, activo: true } });
}
