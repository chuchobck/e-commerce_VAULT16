import { prisma } from '../config/prisma';
import { uploadBuffer, deleteBlob } from '../shared/utils/azureBlob';
import { NotFoundError, BadRequestError } from '../shared/utils/errors';

export async function uploadFoto(
  productoId: number,
  buffer: Buffer,
  mimeType: string,
  esPrincipal = false,
) {
  const producto = await prisma.producto.findUnique({ where: { id: productoId } });
  if (!producto) throw new NotFoundError('Producto no encontrado');

  const { url, blobName } = await uploadBuffer(buffer, mimeType, `productos/${productoId}`);

  const orden = await prisma.fotoProducto.count({ where: { productoId } });

  if (esPrincipal) {
    await prisma.fotoProducto.updateMany({ where: { productoId }, data: { esPrincipal: false } });
  }

  return prisma.fotoProducto.create({ data: { productoId, url, blobName, esPrincipal, orden } });
}

export async function setPrincipal(fotoId: number, productoId: number) {
  const foto = await prisma.fotoProducto.findUnique({ where: { id: fotoId } });
  if (!foto || foto.productoId !== productoId) throw new NotFoundError('Foto no encontrada');

  await prisma.fotoProducto.updateMany({ where: { productoId }, data: { esPrincipal: false } });
  return prisma.fotoProducto.update({ where: { id: fotoId }, data: { esPrincipal: true } });
}

export async function reorderFotos(productoId: number, ordenIds: number[]) {
  const fotos = await prisma.fotoProducto.findMany({ where: { productoId } });
  if (fotos.length !== ordenIds.length) throw new BadRequestError('Lista de IDs incompleta');

  await prisma.$transaction(
    ordenIds.map((id, orden) => prisma.fotoProducto.update({ where: { id }, data: { orden } })),
  );
}

export async function deleteFoto(fotoId: number, productoId: number) {
  const foto = await prisma.fotoProducto.findUnique({ where: { id: fotoId } });
  if (!foto || foto.productoId !== productoId) throw new NotFoundError('Foto no encontrada');

  await deleteBlob(foto.blobName);
  await prisma.fotoProducto.delete({ where: { id: fotoId } });
}
