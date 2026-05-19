import { prisma } from '@/config/prisma';

export interface ProductoContextResult {
  id_producto: string;
  nombre: string;
  precio_venta: number;
  categoria: string;
  descripcion_larga: string;
  tallas_disponibles: string;
  colores: string;
}

export async function buscarProductosRelevantes(
  queryEmbedding: number[],
  limit = 5,
): Promise<ProductoContextResult[]> {
  // Si no hay productos con embedding todavía (modo stub o sin datos AI),
  // devuelve lista vacía en lugar de fallar
  try {
    return await prisma.$queryRaw<ProductoContextResult[]>`
      SELECT
        p.id_producto,
        p.nombre,
        p.precio_venta::float,
        c.nombre AS categoria,
        pai.descripcion_larga,
        STRING_AGG(DISTINCT t.descripcion, ', ' ORDER BY t.descripcion) AS tallas_disponibles,
        STRING_AGG(DISTINCT v.color, ', ') AS colores
      FROM vortex.producto p
      JOIN vortex.categoria_producto c   ON c.id_categoria = p.id_categoria
      JOIN vortex.producto_ai pai        ON pai.id_producto = p.id_producto
      JOIN vortex.variante_producto v    ON v.id_producto = p.id_producto
      JOIN vortex.talla t                ON t.id_talla = v.id_talla
      WHERE p.estado_prod = 'ACT'
        AND v.var_saldo_final > 0
      GROUP BY p.id_producto, p.nombre, p.precio_venta, c.nombre, pai.descripcion_larga
      ORDER BY pai.embedding <=> ${`[${queryEmbedding.join(',')}]`}::vector
      LIMIT ${limit};
    `;
  } catch (err) {
    console.error('[SEARCH] Error en búsqueda vectorial:', err);
    return [];
  }
}
