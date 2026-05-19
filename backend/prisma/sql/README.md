# VORTEX — Bootstrap reproducible

Esta carpeta contiene el DDL canónico y el seed definitivo para la base
`vortex` de VAULT 16. Estos archivos son la fuente única de verdad — el
antiguo `prisma/seed.ts` fue eliminado para evitar confusión.

## Archivos

| Archivo                          | Origen attached_assets               |
| -------------------------------- | ------------------------------------ |
| `01_vortex_ddl_v2.sql`           | `VORTEX_DDL_PG16_v2_*.sql` (parcheado: `pago.metodo` CHECK acepta `PAYPAL,TARJETA,STRIPE,TRANSFERENCIA,EFECTIVO,OTRO`) |
| `02_vortex_seed_def_v1.sql`      | `VAULT16_SEED_DEF_v1_*.sql` (hashes bcrypt aplicados a `Vault16Admin!` y `Vault16Test!`) |

## Aplicar desde cero

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db bash backend/scripts/bootstrap-vortex.sh
```

El script:
1. `DROP SCHEMA IF EXISTS vortex CASCADE; CREATE SCHEMA vortex;`
2. Aplica `01_vortex_ddl_v2.sql`
3. Carga `02_vortex_seed_def_v1.sql`
4. Verifica conteos esperados.

## Conteos esperados al finalizar

| Tabla                          | Filas |
| ------------------------------ | ----: |
| `vortex.rol`                   |   5   |
| `vortex.categoria`             |   6   |
| `vortex.talla`                 |   7   |
| `vortex.empleado`              |   5   |
| `vortex.ubicacion`             |   5   |
| `vortex.usuarios_backoffice`   |   5   |
| `vortex.cliente`               |   1   |
| `vortex.producto`              |  24   |
| `vortex.variante_producto`     | 142   |
| `vortex.promocion`             |   6   |

## Credenciales sembradas

- **Backoffice** (5 usuarios): contraseña `Vault16Admin!`
- **Cliente test**: `cliente@vault16.ec` / `Vault16Test!`

## Sincronizar Prisma Client tras aplicar

```bash
cd backend && npx prisma db pull && npx prisma generate
```

El `schema.prisma` ya está configurado con `previewFeatures = ["multiSchema", "postgresqlExtensions"]`,
`extensions = [vector, pgcrypto]` y `schemas = ["vortex"]`.
