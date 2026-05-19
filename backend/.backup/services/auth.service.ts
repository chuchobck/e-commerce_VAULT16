import { prisma } from '../config/prisma';
import { comparePassword, hashPassword } from '../shared/utils/password';
import { signToken } from '../shared/utils/jwt';
import { UnauthorizedError, ConflictError } from '../shared/utils/errors';
import { LoginDto, RegisterClienteDto } from '../schemas/auth.schemas';

export async function loginEmpleado(dto: LoginDto) {
  const empleado = await prisma.empleado.findUnique({
    where: { email: dto.email },
    include: { rol: true },
  });

  if (!empleado || !empleado.activo) throw new UnauthorizedError('Credenciales inválidas');

  const valid = await comparePassword(dto.password, empleado.passwordHash);
  if (!valid) throw new UnauthorizedError('Credenciales inválidas');

  const token = signToken({ id: empleado.id, email: empleado.email, rol: empleado.rol.nombre }, 'backoffice');

  return {
    token,
    empleado: { id: empleado.id, nombre: empleado.nombre, email: empleado.email, rol: empleado.rol.nombre },
  };
}

export async function loginCliente(dto: LoginDto) {
  const cliente = await prisma.cliente.findUnique({ where: { email: dto.email } });

  if (!cliente || !cliente.activo) throw new UnauthorizedError('Credenciales inválidas');

  const valid = await comparePassword(dto.password, cliente.passwordHash);
  if (!valid) throw new UnauthorizedError('Credenciales inválidas');

  const token = signToken({ id: cliente.id, email: cliente.email }, 'cliente');

  return {
    token,
    cliente: { id: cliente.id, nombre: cliente.nombre, email: cliente.email },
  };
}

export async function registerCliente(dto: RegisterClienteDto) {
  const exists = await prisma.cliente.findUnique({ where: { email: dto.email } });
  if (exists) throw new ConflictError('El email ya está registrado');

  const passwordHash = await hashPassword(dto.password);

  const cliente = await prisma.cliente.create({
    data: { nombre: dto.nombre, email: dto.email, passwordHash, telefono: dto.telefono },
  });

  const token = signToken({ id: cliente.id, email: cliente.email }, 'cliente');

  return {
    token,
    cliente: { id: cliente.id, nombre: cliente.nombre, email: cliente.email },
  };
}
