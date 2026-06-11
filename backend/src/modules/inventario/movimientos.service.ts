import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { NotFoundError } from '../../shared/utils/errors';
import {
  ListMovimientosQueryInput,
  StockActualQueryInput,
} from './inventario.schemas';

export async function findAll(query: ListMovimientosQueryInput) {
  const { page, pageSize, id_variante, tipo, desde, hasta, id_empleado } = query;
  const skip = (page - 1) * pageSize;

  const where: Prisma.movimiento_stockWhereInput = {};
  if (id_variante) where.id_variante = id_variante;
  if (tipo) where.tipo = tipo;
  if (id_empleado) where.id_empleado = id_empleado;
  if (desde || hasta) {
    where.fecha = {};
    if (desde) where.fecha.gte = desde;
    if (hasta) where.fecha.lte = hasta;
  }

  const [movimientos, total] = await Promise.all([
    prisma.movimiento_stock.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { fecha: 'desc' },
      include: {
        variante_producto: {
          select: {
            sku: true,
            color: true,
            talla: { select: { descripcion: true } },
            producto: { select: { id_producto: true, nombre: true } },
          },
        },
        empleado: { select: { nombre1: true, apellido1: true } },
      },
    }),
    prisma.movimiento_stock.count({ where }),
  ]);

  return { data: movimientos, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

export async function findByVariante(idVariante: number) {
  const variante = await prisma.variante_producto.findUnique({
    where: { id_variante: idVariante },
    select: { id_variante: true, sku: true, color: true, var_saldo_final: true },
  });

  if (!variante) throw new NotFoundError('Variante no encontrada');

  const movimientos = await prisma.movimiento_stock.findMany({
    where: { id_variante: idVariante },
    orderBy: { fecha: 'desc' },
    include: {
      empleado: { select: { nombre1: true, apellido1: true } },
    },
  });

  return { variante, movimientos };
}

export async function findStockActual(query: StockActualQueryInput) {
  const { categoria, stock_minimo, stock_maximo } = query;

  const whereVariante: Prisma.variante_productoWhereInput = {};
  if (stock_minimo !== undefined || stock_maximo !== undefined) {
    const saldoFilter: Prisma.IntNullableFilter = {};
    if (stock_minimo !== undefined) saldoFilter.gte = stock_minimo;
    if (stock_maximo !== undefined) saldoFilter.lte = stock_maximo;
    whereVariante.var_saldo_final = saldoFilter;
  }

  return prisma.producto.findMany({
    where: {
      estado_prod: 'ACT',
      ...(categoria ? { id_categoria: categoria } : {}),
    },
    select: {
      id_producto: true,
      nombre: true,
      id_categoria: true,
      categoria_producto: { select: { nombre: true } },
      producto_fotos: {
        where: { es_principal: true },
        take: 1,
        select: { url_foto: true },
      },
      variante_producto: {
        where: whereVariante,
        select: {
          id_variante: true,
          sku: true,
          color: true,
          var_saldo_final: true,
          talla: { select: { descripcion: true } },
        },
        orderBy: { id_variante: 'asc' },
      },
    },
    orderBy: { nombre: 'asc' },
  });
}
