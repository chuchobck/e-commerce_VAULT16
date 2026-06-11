import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../config/prisma';
import { NotFoundError, ConflictError } from '../../shared/utils/errors';
import { registrarAudit, AuditParams } from '../../shared/utils/audit';
import {
  CreateProductoInput,
  UpdateProductoInput,
  ListProductoQueryInput,
} from './productos.schemas';

type AuditCtx = Pick<AuditParams, 'id_usuario_bo' | 'ip' | 'user_agent'>;

export async function findAll(query: ListProductoQueryInput) {
  const { page, pageSize, search, categoria, precioMin, precioMax } = query;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = { estado_prod: 'ACT' };

  if (categoria) where.id_categoria = categoria;

  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: 'insensitive' } },
      { descripcion_corta: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (precioMin !== undefined || precioMax !== undefined) {
    where.precio_venta = {};
    if (precioMin !== undefined) (where.precio_venta as Record<string, unknown>).gte = new Decimal(precioMin);
    if (precioMax !== undefined) (where.precio_venta as Record<string, unknown>).lte = new Decimal(precioMax);
  }

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { created_at: 'desc' },
      include: {
        producto_fotos: {
          where: { es_principal: true },
          take: 1,
          select: { url_foto: true, alt_text: true },
        },
        _count: {
          select: { variante_producto: true },
        },
      },
    }),
    prisma.producto.count({ where }),
  ]);

  return {
    data: productos,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function findById(id: string) {
  const producto = await prisma.producto.findUnique({
    where: { id_producto: id },
    include: {
      categoria_producto: {
        select: { id_categoria: true, nombre: true },
      },
      producto_fotos: {
        orderBy: [{ es_principal: 'desc' }, { orden: 'asc' }],
      },
      producto_ai: {
        select: {
          descripcion_larga: true,
          bullet_points: true,
          tags_estilo: true,
          fecha_generacion: true,
          version: true,
        },
      },
      variante_producto: {
        where: { var_saldo_final: { gt: 0 } },
        include: {
          talla: { select: { id_talla: true, descripcion: true } },
        },
        orderBy: { id_variante: 'asc' },
      },
    },
  });

  if (!producto) {
    throw new NotFoundError('Producto no encontrado');
  }

  return producto;
}

export async function create(data: CreateProductoInput, ctx?: AuditCtx) {
  // Validar categoría activa
  const categoria = await prisma.categoria_producto.findUnique({
    where: { id_categoria: data.id_categoria },
  });

  if (!categoria) throw new NotFoundError(`Categoría ${data.id_categoria} no existe`);
  if (categoria.estado !== 'ACT') throw new ConflictError(`Categoría ${data.id_categoria} no está activa`);

  // Validar nombre único
  const existing = await prisma.producto.findFirst({
    where: { nombre: data.nombre },
  });
  if (existing) throw new ConflictError(`Ya existe un producto con el nombre "${data.nombre}"`);

  const producto = await prisma.producto.create({
    data: {
      id_categoria: data.id_categoria,
      nombre: data.nombre,
      descripcion_corta: data.descripcion_corta || null,
      precio_venta: new Decimal(data.precio_venta),
      estado_prod: 'ACT',
    },
    include: {
      categoria_producto: {
        select: { id_categoria: true, nombre: true },
      },
    },
  });

  await registrarAudit({ tabla: 'producto', id_registro: producto.id_producto, accion: 'INSERT', payload_despues: producto, ...ctx });
  return producto;
}

export async function update(id: string, data: UpdateProductoInput, ctx?: AuditCtx) {
  const antes = await prisma.producto.findUnique({ where: { id_producto: id } });
  if (!antes) throw new NotFoundError('Producto no encontrado');

  // Validar categoría activa si cambia
  if (data.id_categoria) {
    const categoria = await prisma.categoria_producto.findUnique({
      where: { id_categoria: data.id_categoria },
    });
    if (!categoria) throw new NotFoundError(`Categoría ${data.id_categoria} no existe`);
    if (categoria.estado !== 'ACT') throw new ConflictError(`Categoría ${data.id_categoria} no está activa`);
  }

  // Validar nombre único si cambia
  if (data.nombre) {
    const existing = await prisma.producto.findFirst({
      where: { nombre: data.nombre, id_producto: { not: id } },
    });
    if (existing) throw new ConflictError(`Ya existe un producto con el nombre "${data.nombre}"`);
  }

  const producto = await prisma.producto.update({
    where: { id_producto: id },
    data: {
      ...data,
      precio_venta: data.precio_venta !== undefined ? new Decimal(data.precio_venta) : undefined,
    },
    include: {
      categoria_producto: { select: { id_categoria: true, nombre: true } },
    },
  });

  await registrarAudit({ tabla: 'producto', id_registro: id, accion: 'UPDATE', payload_antes: antes, payload_despues: producto, ...ctx });
  return producto;
}

export async function deactivate(id: string, ctx?: AuditCtx) {
  const producto = await prisma.producto.findUnique({ where: { id_producto: id } });
  if (!producto) throw new NotFoundError('Producto no encontrado');

  // Verificar si tiene variantes con stock
  const variantesConStock = await prisma.variante_producto.count({
    where: { id_producto: id, var_saldo_final: { gt: 0 } },
  });

  const result = await prisma.producto.update({
    where: { id_producto: id },
    data: { estado_prod: 'INA' },
  });

  await registrarAudit({ tabla: 'producto', id_registro: id, accion: 'UPDATE', payload_antes: { estado_prod: producto.estado_prod }, payload_despues: { estado_prod: 'INA' }, ...ctx });

  return { producto: result, warning: variantesConStock > 0
    ? `El producto fue desactivado, pero tiene ${variantesConStock} variante(s) con stock`
    : null,
  };
}
