import { prisma } from '@/config/prisma';
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

  const rows = await client.$queryRaw<[{ max_num: string | null }]>`
    SELECT MAX(SUBSTRING(id_factura FROM 9)) AS max_num
    FROM vortex.factura
    WHERE id_factura LIKE '001-001-%'
    FOR UPDATE
  `;

  const maxStr = rows[0]?.max_num;
  const nextNum = maxStr ? parseInt(maxStr, 10) + 1 : 1;
  const seq = String(nextNum).padStart(9, '0');
  return `001-001-${seq}`;
}
