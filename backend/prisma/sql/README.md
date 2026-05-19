# VORTEX — Bootstrap reproducible

Esta carpeta contiene el DDL canónico y el seed definitivo para la base
`vortex` de VAULT 16. Estos archivos son la fuente única de verdad — el
antiguo `prisma/seed.ts` fue eliminado para evitar confusión.

## Archivos

| Archivo                          | Origen / notas                       |
| -------------------------------- | ------------------------------------ |
| `01_vortex_ddl_v2.sql`           | `attached_assets/VORTEX_DDL_PG16_v2_*.sql` con el CHECK de `pago.metodo` ampliado a `PAYPAL,TARJETA,STRIPE,TRANSFERENCIA,EFECTIVO,OTRO`. |
| `02_vortex_seed_def_v1.sql`      | `attached_assets/VAULT16_SEED_DEF_v1_*.sql` con hashes bcrypt reales para las contraseñas `Vault16Admin!` y `Vault16Test!` (cost=10). |

## Aplicar desde cero

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db bash backend/scripts/bootstrap-vortex.sh
```

El script:
1. `DROP SCHEMA IF EXISTS vortex CASCADE; CREATE SCHEMA vortex;`
2. Aplica `01_vortex_ddl_v2.sql`
3. Carga `02_vortex_seed_def_v1.sql`
4. Verifica conteos con `SET search_path TO vortex, public;`.

## Conteos esperados al finalizar

| Tabla                          | Filas |
| ------------------------------ | ----: |
| `vortex.rol`                   |   5   |
| `vortex.categoria_producto`    |   6   |
| `vortex.talla`                 |   7   |
| `vortex.empleado`              |   5   |
| `vortex.usuarios_backoffice`   |   5   |
| `vortex.cliente`               |   1   |
| `vortex.producto`              |  24   |
| `vortex.variante_producto`     | 142   |
| `vortex.promocion`             |   6   |

## Credenciales sembradas (verificadas con `bcrypt.compareSync`)

- **Backoffice** (5 usuarios) — contraseña `Vault16Admin!`:
  - `admin@vault16.ec` → rol `ADMIN`
  - `marketing@vault16.ec` → rol `MARKETING`
  - `vendedor1@vault16.ec` → rol `VENDEDOR`
  - `bodega@vault16.ec` → rol `BODEGA`
  - `reportes@vault16.ec` → rol `REPORTES`
- **Cliente test** — `test@vault16.ec` / `Vault16Test!`

## Sincronizar Prisma Client tras aplicar

```bash
cd backend && npx prisma db pull && npx prisma generate
```

El `schema.prisma` ya está configurado con
`previewFeatures = ["multiSchema", "postgresqlExtensions"]`,
`extensions = [vector, pgcrypto]` y `schemas = ["vortex"]`.
