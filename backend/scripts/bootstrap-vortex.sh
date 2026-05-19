#!/usr/bin/env bash
# Bootstrap reproducible de la base VORTEX v2 + seed definitivo v1.
# Uso:  DATABASE_URL=postgresql://... bash backend/scripts/bootstrap-vortex.sh
# Drop + recrea schema `vortex`, aplica DDL v2 y carga el seed; al final verifica
# los conteos esperados (24 productos / 142 variantes / 6 promos / 5 backoffice
# / 1 cliente test).
set -euo pipefail

SQL_DIR="$(cd "$(dirname "$0")/.." && pwd)/prisma/sql"
DDL="$SQL_DIR/01_vortex_ddl_v2.sql"
SEED="$SQL_DIR/02_vortex_seed_def_v1.sql"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "❌ DATABASE_URL no definida" >&2
  exit 1
fi

echo "▶ Drop + create schema vortex …"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "DROP SCHEMA IF EXISTS vortex CASCADE; CREATE SCHEMA vortex;"

echo "▶ Aplicando DDL VORTEX v2 ($DDL) …"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$DDL"

echo "▶ Cargando seed definitivo v1 ($SEED) …"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SEED"

echo "▶ Verificando conteos …"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -At <<'SQL'
SET search_path TO vortex, public;
SELECT 'roles               = ' || COUNT(*) FROM rol;
SELECT 'categoria_producto  = ' || COUNT(*) FROM categoria_producto;
SELECT 'tallas              = ' || COUNT(*) FROM talla;
SELECT 'empleados           = ' || COUNT(*) FROM empleado;
SELECT 'usuarios_backoffice = ' || COUNT(*) FROM usuarios_backoffice;
SELECT 'clientes            = ' || COUNT(*) FROM cliente;
SELECT 'productos           = ' || COUNT(*) FROM producto;
SELECT 'variantes           = ' || COUNT(*) FROM variante_producto;
SELECT 'promociones         = ' || COUNT(*) FROM promocion;
SQL

echo "✅ Bootstrap completo."
echo "   Esperado: 24 productos / 142 variantes / 6 promos / 5 backoffice / 1 cliente."
echo "   Credenciales: Backoffice → Vault16Admin!   Cliente test (test@vault16.ec) → Vault16Test!"
