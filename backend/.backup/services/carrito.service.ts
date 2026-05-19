import { prisma } from '../config/prisma';
import { NotFoundError, BadRequestError } from '../shared/utils/errors';
import { AddItemDto, UpdateItemDto } from '../schemas/carrito.schemas';

const INCLUDE_CARRITO = {
  items: {
    include: {
      variante: {
        include: {
          producto: { select: { id: true, nombre: true, precio: true, fotos: { where: { esPrincipal: true }, take: 1 } } },
          talla: true,
        },
      },
    },
  },
};

async function getOrCreateCarrito(clienteId: number) {
  let carrito = await prisma.carrito.findFirst({ where: { clienteId, activo: true }, include: INCLUDE_CARRITO });
  if (!carrito) {
    carrito = await prisma.carrito.create({ data: { clienteId }, include: INCLUDE_CARRITO });
  }
  return carrito;
}

export async function getCarrito(clienteId: number) {
  return getOrCreateCarrito(clienteId);
}

export async function addItem(clienteId: number, dto: AddItemDto) {
  const variante = await prisma.variante.findUnique({ where: { id: dto.varianteId } });
  if (!variante || !variante.activo) throw new NotFoundError('Variante no disponible');
  if (variante.stock < dto.cantidad) throw new BadRequestError(`Stock insuficiente. Disponible: ${variante.stock}`);

  const carrito = await getOrCreateCarrito(clienteId);

  const itemExistente = await prisma.itemCarrito.findUnique({
    where: { carritoId_varianteId: { carritoId: carrito.id, varianteId: dto.varianteId } },
  });

  if (itemExistente) {
    const nuevaCantidad = itemExistente.cantidad + dto.cantidad;
    if (variante.stock < nuevaCantidad) throw new BadRequestError(`Stock insuficiente. Disponible: ${variante.stock}`);
    await prisma.itemCarrito.update({ where: { id: itemExistente.id }, data: { cantidad: nuevaCantidad } });
  } else {
    await prisma.itemCarrito.create({ data: { carritoId: carrito.id, varianteId: dto.varianteId, cantidad: dto.cantidad } });
  }

  return getCarrito(clienteId);
}

export async function updateItem(clienteId: number, itemId: number, dto: UpdateItemDto) {
  const carrito = await getOrCreateCarrito(clienteId);
  const item = await prisma.itemCarrito.findFirst({ where: { id: itemId, carritoId: carrito.id } });
  if (!item) throw new NotFoundError('Item no encontrado');

  if (dto.cantidad === 0) {
    await prisma.itemCarrito.delete({ where: { id: itemId } });
  } else {
    const variante = await prisma.variante.findUnique({ where: { id: item.varianteId } });
    if (variante && variante.stock < dto.cantidad) throw new BadRequestError(`Stock insuficiente. Disponible: ${variante.stock}`);
    await prisma.itemCarrito.update({ where: { id: itemId }, data: { cantidad: dto.cantidad } });
  }

  return getCarrito(clienteId);
}

export async function removeItem(clienteId: number, itemId: number) {
  const carrito = await getOrCreateCarrito(clienteId);
  const item = await prisma.itemCarrito.findFirst({ where: { id: itemId, carritoId: carrito.id } });
  if (!item) throw new NotFoundError('Item no encontrado');
  await prisma.itemCarrito.delete({ where: { id: itemId } });
  return getCarrito(clienteId);
}

export async function vaciarCarrito(clienteId: number) {
  const carrito = await getOrCreateCarrito(clienteId);
  await prisma.itemCarrito.deleteMany({ where: { carritoId: carrito.id } });
}
