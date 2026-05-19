import { prisma } from '../config/prisma';
import { FACTURA_PAGADA, PAGO_COMPLETADO } from '../shared/constants/estados';

export async function getKPIs() {
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

  const [
    totalClientes,
    clientesNuevosMes,
    facturasEsteMes,
    facturasUltimoMes,
    stockBajo,
    productosSinAI,
  ] = await Promise.all([
    prisma.cliente.count({ where: { activo: true } }),
    prisma.cliente.count({ where: { creadoEn: { gte: inicioMes } } }),
    prisma.factura.aggregate({
      where: { estado: FACTURA_PAGADA, creadoEn: { gte: inicioMes } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.factura.aggregate({
      where: { estado: FACTURA_PAGADA, creadoEn: { gte: inicioMesAnterior, lte: finMesAnterior } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.variante.count({ where: { stock: { lte: prisma.variante.fields.stockMinimo } } }),
    prisma.producto.count({ where: { activo: true, aiContent: null } }),
  ]);

  const ventasMes = Number(facturasEsteMes._sum.total ?? 0);
  const ventasUltimoMes = Number(facturasUltimoMes._sum.total ?? 0);
  const crecimientoVentas = ventasUltimoMes > 0
    ? ((ventasMes - ventasUltimoMes) / ventasUltimoMes) * 100
    : null;

  return {
    clientes: { total: totalClientes, nuevosEsteMes: clientesNuevosMes },
    ventas: {
      esteMes: ventasMes,
      pedidosEsteMes: facturasEsteMes._count,
      crecimientoVsPrevioMes: crecimientoVentas,
    },
    inventario: { variantesStockBajo: stockBajo },
    ia: { productosSinDescripcion: productosSinAI },
  };
}

export async function getVentasPorDia(dias = 30) {
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);

  const ventas = await prisma.$queryRaw<Array<{ fecha: Date; total: number; pedidos: number }>>`
    SELECT
      DATE(creado_en) AS fecha,
      SUM(total)::float AS total,
      COUNT(*)::int AS pedidos
    FROM facturas
    WHERE estado = ${FACTURA_PAGADA}
      AND creado_en >= ${desde}
    GROUP BY DATE(creado_en)
    ORDER BY fecha ASC
  `;

  return ventas;
}

export async function getTopProductos(limit = 10) {
  const top = await prisma.$queryRaw<Array<{ productoId: number; nombre: string; totalVendido: number; ingresos: number }>>`
    SELECT
      p.id AS "productoId",
      p.nombre,
      SUM(if.cantidad)::int AS "totalVendido",
      SUM(if.subtotal)::float AS ingresos
    FROM items_factura if
    JOIN variantes v ON v.id = if.variante_id
    JOIN productos p ON p.id = v.producto_id
    JOIN facturas f ON f.id = if.factura_id
    WHERE f.estado = ${FACTURA_PAGADA}
    GROUP BY p.id, p.nombre
    ORDER BY "totalVendido" DESC
    LIMIT ${limit}
  `;

  return top;
}
