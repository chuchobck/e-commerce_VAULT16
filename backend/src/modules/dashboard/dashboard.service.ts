import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

// ─── Cache en memoria (5 minutos TTL) ────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getFromCache<T>(key: string): T | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.data;
}

function setInCache<T>(key: string, data: T): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── KPIs ─────────────────────────────────────────────────────────────────────

interface KpisResult {
  ventas_hoy: { total_dinero: number; cantidad_facturas: number };
  ventas_mes: {
    total_dinero: number;
    cantidad_facturas: number;
    vs_mes_anterior_pct: number;
  };
  clientes_activos: number;
  clientes_nuevos_mes: number;
  productos_activos: number;
  variantes_sin_stock: number;
  pedidos_pendientes_envio: number;
  pedidos_en_camino: number;
}

export async function getKpis(): Promise<KpisResult> {
  const CACHE_KEY = 'kpis';
  const cached = getFromCache<KpisResult>(CACHE_KEY);
  if (cached) return cached;

  const now = new Date();
  const inicioHoy = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
  const inicioMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const finMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const [
    ventasHoy,
    ventasMes,
    ventasMesAnterior,
    clientesActivos,
    clientesNuevosMes,
    productosActivos,
    variantesSinStock,
    pedidosPAG,
    pedidosENV,
  ] = await Promise.all([
    // Ventas hoy (facturas en estado PAG, ENV, ENT)
    prisma.factura.aggregate({
      where: {
        fecha_emision: { gte: inicioHoy },
        estado: { in: ['PAG', 'ENV', 'ENT'] },
      },
      _sum: { total: true },
      _count: { id_factura: true },
    }),

    // Ventas mes actual
    prisma.factura.aggregate({
      where: {
        fecha_emision: { gte: inicioMes },
        estado: { in: ['PAG', 'ENV', 'ENT'] },
      },
      _sum: { total: true },
      _count: { id_factura: true },
    }),

    // Ventas mes anterior (para calcular variación)
    prisma.factura.aggregate({
      where: {
        fecha_emision: { gte: inicioMesAnterior, lte: finMesAnterior },
        estado: { in: ['PAG', 'ENV', 'ENT'] },
      },
      _sum: { total: true },
    }),

    // Clientes activos
    prisma.cliente.count({ where: { estado: 'ACT' } }),

    // Clientes nuevos este mes
    prisma.cliente.count({ where: { created_at: { gte: inicioMes } } }),

    // Productos activos
    prisma.producto.count({ where: { estado_prod: 'ACT' } }),

    // Variantes sin stock
    prisma.variante_producto.count({ where: { var_saldo_final: 0 } }),

    // Pedidos pendientes de envío (PAG)
    prisma.factura.count({ where: { estado: 'PAG' } }),

    // Pedidos en camino (ENV)
    prisma.factura.count({ where: { estado: 'ENV' } }),
  ]);

  const totalMes = Number(ventasMes._sum.total ?? 0);
  const totalMesAnterior = Number(ventasMesAnterior._sum.total ?? 0);
  const variacionPct =
    totalMesAnterior === 0
      ? 0
      : Math.round(((totalMes - totalMesAnterior) / totalMesAnterior) * 100 * 100) / 100;

  const result: KpisResult = {
    ventas_hoy: {
      total_dinero: Number(ventasHoy._sum.total ?? 0),
      cantidad_facturas: ventasHoy._count.id_factura,
    },
    ventas_mes: {
      total_dinero: totalMes,
      cantidad_facturas: ventasMes._count.id_factura,
      vs_mes_anterior_pct: variacionPct,
    },
    clientes_activos: clientesActivos,
    clientes_nuevos_mes: clientesNuevosMes,
    productos_activos: productosActivos,
    variantes_sin_stock: variantesSinStock,
    pedidos_pendientes_envio: pedidosPAG,
    pedidos_en_camino: pedidosENV,
  };

  setInCache(CACHE_KEY, result);
  return result;
}

// ─── Ventas por día ───────────────────────────────────────────────────────────

interface VentasDiaRow {
  fecha: string;
  total_dinero: number;
  cantidad_facturas: bigint;
}

export async function getVentasPorDia(desde?: Date, hasta?: Date) {
  const desdeDate = desde ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const hastaDate = hasta ?? new Date();

  const rows = await prisma.$queryRaw<VentasDiaRow[]>`
    SELECT
      date_trunc('day', fecha_emision)::date::text AS fecha,
      COALESCE(SUM(total), 0)::float               AS total_dinero,
      COUNT(*)                                      AS cantidad_facturas
    FROM vortex.factura
    WHERE fecha_emision BETWEEN ${desdeDate} AND ${hastaDate}
      AND estado IN ('PAG', 'ENV', 'ENT')
    GROUP BY date_trunc('day', fecha_emision)
    ORDER BY fecha ASC;
  `;

  return rows.map((r) => ({
    fecha: r.fecha,
    total_dinero: r.total_dinero,
    cantidad_facturas: Number(r.cantidad_facturas),
  }));
}

// ─── Top productos ────────────────────────────────────────────────────────────

interface TopProductoRow {
  id_producto: string;
  nombre: string;
  categoria: string;
  foto_principal: string | null;
  cantidad_vendida: bigint;
  total_recaudado: number;
}

export async function getTopProductos(desde?: Date, hasta?: Date, limit = 10) {
  const desdeDate = desde ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const hastaDate = hasta ?? new Date();
  const limitInt = Math.min(Math.max(1, limit), 50);

  const rows = await prisma.$queryRaw<TopProductoRow[]>`
    SELECT
      p.id_producto,
      p.nombre,
      c.nombre                                          AS categoria,
      (SELECT url_foto FROM vortex.producto_fotos
       WHERE id_producto = p.id_producto AND es_principal = TRUE
       LIMIT 1)                                         AS foto_principal,
      SUM(df.cantidad)::bigint                          AS cantidad_vendida,
      SUM(df.subtotal_linea)::float                     AS total_recaudado
    FROM vortex.detalle_factura df
    JOIN vortex.factura f              ON f.id_factura = df.id_factura
    JOIN vortex.variante_producto v    ON v.id_variante = df.id_variante
    JOIN vortex.producto p             ON p.id_producto = v.id_producto
    JOIN vortex.categoria_producto c   ON c.id_categoria = p.id_categoria
    WHERE f.fecha_emision BETWEEN ${desdeDate} AND ${hastaDate}
      AND f.estado IN ('PAG', 'ENV', 'ENT')
    GROUP BY p.id_producto, p.nombre, c.nombre
    ORDER BY cantidad_vendida DESC
    LIMIT ${limitInt};
  `;

  return rows.map((r) => ({
    id_producto: r.id_producto,
    nombre: r.nombre,
    categoria: r.categoria,
    foto_principal: r.foto_principal ?? null,
    cantidad_vendida: Number(r.cantidad_vendida),
    total_recaudado: r.total_recaudado,
  }));
}

// ─── Stock bajo ───────────────────────────────────────────────────────────────

export async function getStockBajo() {
  const variantes = await prisma.variante_producto.findMany({
    where: {
      var_saldo_final: { gte: 1, lte: 5 },
      producto: { estado_prod: 'ACT' },
    },
    select: {
      id_variante: true,
      sku: true,
      color: true,
      var_saldo_final: true,
      talla: { select: { descripcion: true } },
      producto: {
        select: {
          id_producto: true,
          nombre: true,
          producto_fotos: {
            where: { es_principal: true },
            select: { url_foto: true },
            take: 1,
          },
        },
      },
    },
    orderBy: { var_saldo_final: 'asc' },
  });

  return variantes.map((v) => ({
    id_variante: v.id_variante,
    sku: v.sku,
    color: v.color,
    talla: v.talla.descripcion,
    saldo_actual: v.var_saldo_final ?? 0,
    producto: {
      id: v.producto.id_producto,
      nombre: v.producto.nombre,
      foto_principal: v.producto.producto_fotos[0]?.url_foto ?? null,
    },
  }));
}

// ─── Uso IA ───────────────────────────────────────────────────────────────────

interface UsoIaProductoRow {
  id_producto: string;
  nombre: string;
  veces_referenciado: bigint;
}

export async function getUsoIa() {
  const now = new Date();
  const inicioHoy = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

  const [sesionesHoy, sesionesMes, mensajesMes, tokensAggregate, topProductos] =
    await Promise.all([
      // Sesiones hoy
      prisma.chat_sesion.count({ where: { fecha_inicio: { gte: inicioHoy } } }),

      // Sesiones mes
      prisma.chat_sesion.count({ where: { fecha_inicio: { gte: inicioMes } } }),

      // Mensajes mes
      prisma.chat_mensaje.count({ where: { fecha: { gte: inicioMes } } }),

      // Tokens del mes
      prisma.chat_mensaje.aggregate({
        where: { fecha: { gte: inicioMes } },
        _sum: { tokens_input: true, tokens_output: true },
      }),

      // Productos más recomendados — unnest del JSON array en raw query
      prisma.$queryRaw<UsoIaProductoRow[]>`
        SELECT
          elem AS id_producto,
          p.nombre,
          COUNT(*) AS veces_referenciado
        FROM vortex.chat_mensaje cm
        CROSS JOIN LATERAL jsonb_array_elements_text(
          CASE
            WHEN cm.productos_referenciados IS NOT NULL
              AND jsonb_typeof(cm.productos_referenciados) = 'array'
            THEN cm.productos_referenciados
            ELSE '[]'::jsonb
          END
        ) AS elem
        JOIN vortex.producto p ON p.id_producto = elem
        WHERE cm.fecha >= ${inicioMes}
          AND cm.rol = 'assistant'
        GROUP BY elem, p.nombre
        ORDER BY veces_referenciado DESC
        LIMIT 5;
      `,
    ]);

  return {
    sesiones_hoy: sesionesHoy,
    sesiones_mes: sesionesMes,
    mensajes_mes: mensajesMes,
    tokens_input_mes: tokensAggregate._sum.tokens_input ?? 0,
    tokens_output_mes: tokensAggregate._sum.tokens_output ?? 0,
    productos_mas_recomendados: topProductos.map((r) => ({
      id: r.id_producto,
      nombre: r.nombre,
      veces_referenciado: Number(r.veces_referenciado),
    })),
  };
}

// ─── Ventas por categoría ─────────────────────────────────────────────────────

interface VentasCatRow {
  categoria: string;
  total_dinero: number;
  cantidad_unidades: bigint;
}

export async function getVentasPorCategoria(desde?: Date, hasta?: Date) {
  const desdeDate = desde ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const hastaDate = hasta ?? new Date();

  const rows = await prisma.$queryRaw<VentasCatRow[]>`
    SELECT
      c.nombre                      AS categoria,
      SUM(df.subtotal_linea)::float AS total_dinero,
      SUM(df.cantidad)::bigint      AS cantidad_unidades
    FROM vortex.detalle_factura df
    JOIN vortex.factura f            ON f.id_factura = df.id_factura
    JOIN vortex.variante_producto v  ON v.id_variante = df.id_variante
    JOIN vortex.producto p           ON p.id_producto = v.id_producto
    JOIN vortex.categoria_producto c ON c.id_categoria = p.id_categoria
    WHERE f.fecha_emision BETWEEN ${desdeDate} AND ${hastaDate}
      AND f.estado IN ('PAG', 'ENV', 'ENT')
    GROUP BY c.nombre
    ORDER BY total_dinero DESC;
  `;

  return rows.map((r) => ({
    categoria: r.categoria,
    total_dinero: r.total_dinero,
    cantidad_unidades: Number(r.cantidad_unidades),
  }));
}
