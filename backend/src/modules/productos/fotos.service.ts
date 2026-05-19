import { randomUUID } from 'crypto';
import path from 'path';
import { prisma } from '@/config/prisma';
import { NotFoundError, ConflictError } from '@/shared/utils/errors';
import { uploadFile, deleteFile, extractBlobName } from '@/shared/utils/azureBlob';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface SubirFotoInput {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  alt_text?: string;
}

export interface OrdenItem {
  id_foto: number;
  orden: number;
}

// ─── Helpers internos ────────────────────────────────────────────────────────

function buildBlobName(idProducto: string, originalname: string): string {
  const ext = path.extname(originalname).toLowerCase() || '.jpg';
  return `${idProducto}/${randomUUID()}${ext}`;
}

async function getProductoActivo(idProducto: string) {
  const producto = await prisma.producto.findUnique({
    where: { id_producto: idProducto },
    select: { id_producto: true, estado_prod: true },
  });
  if (!producto) throw new NotFoundError('Producto no encontrado');
  if (producto.estado_prod !== 'ACT') {
    throw new ConflictError('El producto no está activo');
  }
  return producto;
}

// ─── Subir foto ───────────────────────────────────────────────────────────────

export async function subirFoto(idProducto: string, input: SubirFotoInput) {
  await getProductoActivo(idProducto);

  const blobName = buildBlobName(idProducto, input.originalname);
  const url = await uploadFile(input.buffer, blobName, input.mimetype);

  // Determinar si es la primera foto (para marcar como principal)
  const countExistentes = await prisma.producto_fotos.count({
    where: { id_producto: idProducto },
  });
  const esPrimera = countExistentes === 0;

  let foto;
  try {
    foto = await prisma.producto_fotos.create({
      data: {
        id_producto: idProducto,
        url_foto: url,
        alt_text: input.alt_text ?? null,
        es_principal: esPrimera,
        orden: countExistentes + 1,
      },
    });
  } catch (dbErr) {
    // Cleanup: si falla la DB, borrar el blob recién subido
    await deleteFile(blobName).catch((blobErr) =>
      console.error('[Fotos] Cleanup de blob fallido tras error en DB:', blobErr),
    );
    throw dbErr;
  }

  return foto;
}

// ─── Cambiar foto principal ────────────────────────────────────────────────────

export async function setPrincipal(idProducto: string, idFoto: number) {
  // Verificar que la foto existe y pertenece al producto
  const foto = await prisma.producto_fotos.findUnique({ where: { id_foto: idFoto } });
  if (!foto || foto.id_producto !== idProducto) {
    throw new NotFoundError('Foto no encontrada en este producto');
  }

  await prisma.$transaction([
    // 1. Quitar principal a todas las fotos del producto
    prisma.producto_fotos.updateMany({
      where: { id_producto: idProducto },
      data: { es_principal: false },
    }),
    // 2. Marcar la foto solicitada como principal
    prisma.producto_fotos.update({
      where: { id_foto: idFoto },
      data: { es_principal: true },
    }),
  ]);

  return prisma.producto_fotos.findUnique({ where: { id_foto: idFoto } });
}

// ─── Reordenar fotos ──────────────────────────────────────────────────────────

export async function reordenar(idProducto: string, items: OrdenItem[]) {
  // Verificar que todas las fotos pertenecen al producto
  const ids = items.map((i) => i.id_foto);
  const fotos = await prisma.producto_fotos.findMany({
    where: { id_foto: { in: ids }, id_producto: idProducto },
    select: { id_foto: true },
  });

  const fotosEncontradas = new Set(fotos.map((f) => f.id_foto));
  const ajenasOInexistentes = ids.filter((id) => !fotosEncontradas.has(id));
  if (ajenasOInexistentes.length > 0) {
    throw new NotFoundError(
      `Las siguientes fotos no pertenecen al producto: ${ajenasOInexistentes.join(', ')}`,
    );
  }

  await prisma.$transaction(
    items.map((item) =>
      prisma.producto_fotos.update({
        where: { id_foto: item.id_foto },
        data: { orden: item.orden },
      }),
    ),
  );

  return prisma.producto_fotos.findMany({
    where: { id_producto: idProducto },
    orderBy: { orden: 'asc' },
  });
}

// ─── Eliminar foto ────────────────────────────────────────────────────────────

export async function eliminarFoto(idProducto: string, idFoto: number) {
  const foto = await prisma.producto_fotos.findUnique({ where: { id_foto: idFoto } });
  if (!foto || foto.id_producto !== idProducto) {
    throw new NotFoundError('Foto no encontrada en este producto');
  }

  const eraPrincipal = foto.es_principal;

  // PASO 1: Borrar de DB (si falla, el blob no queda huérfano)
  await prisma.producto_fotos.delete({ where: { id_foto: idFoto } });

  // Si era principal y quedan más fotos → marcar la siguiente como principal
  if (eraPrincipal) {
    const siguiente = await prisma.producto_fotos.findFirst({
      where: { id_producto: idProducto },
      orderBy: { orden: 'asc' },
    });
    if (siguiente) {
      await prisma.producto_fotos.update({
        where: { id_foto: siguiente.id_foto },
        data: { es_principal: true },
      });
    }
  }

  // PASO 2: Borrar el blob (si falla, queda como cleanup pendiente — no rollbackeamos la DB)
  const blobName = extractBlobName(foto.url_foto);
  await deleteFile(blobName).catch((err) =>
    console.error(
      `[Fotos] Blob cleanup pendiente: no se pudo borrar '${blobName}'. Error:`,
      err,
    ),
  );

  return { deleted: true, id_foto: idFoto };
}
