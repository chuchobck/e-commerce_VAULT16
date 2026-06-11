import { prisma } from '../../config/prisma';
import type { Prisma } from '@prisma/client';

type TxClient = Prisma.TransactionClient;

/**
 * Genera un id_factura secuencial con formato SRI: \d{3}-\d{3}-\d{9}
 * Ejemplo: 001-001-000000001 (17 chars)
 *
 * NOTA: el DDL define id_factura como VARCHAR(15) pero el CHECK constraint
 * chk_fac_formato_sri exige ^\d{3}-\d{3}-\d{9}$ que produce 17 chars.
 * Si la DB arroja "value too long", ejecutar:
 *   ALTER TABLE vortex.factura ALTER COLUMN id_factura TYPE VARCHAR(17);
 *
 * Esta función DEBE llamarse DENTRO de una $transaction serializable para
 * garantizar que el SELECT MAX ... FOR UPDATE bloquee la fila hasta el commit.
 */
export async function generarIdFactura(tx?: TxClient): Promise<string> {
  const client = tx ?? (prisma as unknown as TxClient);

  // FOR UPDATE con MAX() no está permitido en PostgreSQL.
  // Usamos ORDER BY + LIMIT 1 para obtener el último id y bloquearlo.
  const rows = await client.$queryRaw<[{ id_factura: string }]>`
    SELECT id_factura
    FROM vortex.factura
    WHERE id_factura LIKE '001-001-%'
    ORDER BY id_factura DESC
    LIMIT 1
    FOR UPDATE
  `;

  const lastId = rows[0]?.id_factura ?? null;
  const lastNum = lastId ? parseInt(lastId.substring(8), 10) : 0;
  const nextNum = lastNum + 1;
  const seq = String(nextNum).padStart(9, '0');
  return `001-001-${seq}`;
}
