#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# VORTEX Backend — Smoke Test
# Uso: ./scripts/smoke-test.sh [BASE_URL]
# Default BASE_URL: http://localhost:3000
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
PASS=0
FAIL=0
TOKEN=""
PRODUCTO_ID=""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()   { echo -e "${GREEN}[OK]${NC}   $1"; PASS=$((PASS + 1)); }
fail() { echo -e "${RED}[FAIL]${NC} $1"; FAIL=$((FAIL + 1)); }
info() { echo -e "${YELLOW}[INFO]${NC} $1"; }

http_status() {
  curl -s -o /dev/null -w "%{http_code}" "$@"
}

http_body() {
  curl -s "$@"
}

# ─── 1. Health check ────────────────────────────────────────────────────────
info "1/7 — Health check"
STATUS=$(http_status "${BASE_URL}/health")
if [[ "$STATUS" == "200" || "$STATUS" == "503" ]]; then
  BODY=$(http_body "${BASE_URL}/health")
  DB_STATUS=$(echo "$BODY" | grep -o '"database":"[^"]*"' | cut -d'"' -f4 || true)
  if [[ "$STATUS" == "200" ]]; then
    ok "Health: status=ok (db=${DB_STATUS})"
  else
    fail "Health: status=degraded (db=${DB_STATUS}) — verificar conexión a DB"
  fi
else
  fail "Health: HTTP $STATUS (esperaba 200 o 503)"
fi

# ─── 2. Login backoffice ────────────────────────────────────────────────────
info "2/7 — Login backoffice (admin@vortex.ec)"
RESPONSE=$(http_body -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vortex.ec","password":"Admin1234!"}' \
  "${BASE_URL}/api/auth/login-backoffice" 2>/dev/null)
TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 || true)
if [[ -n "$TOKEN" ]]; then
  ok "Login backoffice: token obtenido"
else
  fail "Login backoffice: no se obtuvo token — Response: $(echo "$RESPONSE" | head -c 200)"
fi

# ─── 3. Listar categorías ────────────────────────────────────────────────────
info "3/7 — Listar categorías (público)"
STATUS=$(http_status "${BASE_URL}/api/categorias")
if [[ "$STATUS" == "200" ]]; then
  ok "GET /api/categorias: HTTP $STATUS"
else
  fail "GET /api/categorias: HTTP $STATUS (esperaba 200)"
fi

# ─── 4. Listar productos (público) ─────────────────────────────────────────
info "4/7 — Listar productos (público)"
STATUS=$(http_status "${BASE_URL}/api/productos")
if [[ "$STATUS" == "200" ]]; then
  ok "GET /api/productos: HTTP $STATUS"
else
  fail "GET /api/productos: HTTP $STATUS (esperaba 200)"
fi

# ─── 5. Crear producto ──────────────────────────────────────────────────────
if [[ -n "$TOKEN" ]]; then
  info "5/7 — Crear producto"
  SMOKE_CAT_ID="SMK"
  # Crear categoría primero (puede fallar si ya existe, ignorar)
  curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"id_categoria\":\"$SMOKE_CAT_ID\",\"nombre\":\"Smoke Test Cat\",\"descripcion\":\"temporal\"}" \
    "${BASE_URL}/api/categorias" > /dev/null 2>&1 || true

  RESPONSE=$(http_body -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"id_producto\":\"SMK0001\",\"id_categoria\":\"$SMOKE_CAT_ID\",\"nombre\":\"Producto Smoke Test\",\"descripcion_corta\":\"test\",\"precio_venta\":10.00}" \
    "${BASE_URL}/api/productos")
  PRODUCTO_ID=$(echo "$RESPONSE" | grep -o '"id_producto":"[^"]*"' | head -1 | cut -d'"' -f4 || true)
  if [[ -n "$PRODUCTO_ID" ]]; then
    ok "POST /api/productos: producto creado ($PRODUCTO_ID)"
  else
    STATUS=$(http_status -X POST \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{\"id_producto\":\"SMK0001\",\"id_categoria\":\"$SMOKE_CAT_ID\",\"nombre\":\"Producto Smoke Test\",\"descripcion_corta\":\"test\",\"precio_venta\":10.00}" \
      "${BASE_URL}/api/productos" 2>/dev/null)
    if [[ "$STATUS" == "409" ]]; then
      PRODUCTO_ID="SMK0001"
      ok "POST /api/productos: producto ya existe (usando SMK0001)"
    else
      fail "POST /api/productos: HTTP $STATUS — $(echo "$RESPONSE" | head -c 200)"
    fi
  fi
else
  fail "5/7 — Crear producto: SKIP (no hay token)"
fi

# ─── 6. Editar producto ──────────────────────────────────────────────────────
if [[ -n "$TOKEN" && -n "$PRODUCTO_ID" ]]; then
  info "6/7 — Editar producto ($PRODUCTO_ID)"
  STATUS=$(http_status -X PUT \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"nombre":"Producto Smoke Editado","precio_venta":12.00}' \
    "${BASE_URL}/api/productos/${PRODUCTO_ID}")
  if [[ "$STATUS" == "200" ]]; then
    ok "PUT /api/productos/$PRODUCTO_ID: HTTP $STATUS"
  else
    fail "PUT /api/productos/$PRODUCTO_ID: HTTP $STATUS (esperaba 200)"
  fi
else
  fail "6/7 — Editar producto: SKIP (sin token o sin ID)"
fi

# ─── 7. Desactivar producto ──────────────────────────────────────────────────
if [[ -n "$TOKEN" && -n "$PRODUCTO_ID" ]]; then
  info "7/7 — Desactivar producto ($PRODUCTO_ID)"
  STATUS=$(http_status -X DELETE \
    -H "Authorization: Bearer $TOKEN" \
    "${BASE_URL}/api/productos/${PRODUCTO_ID}")
  if [[ "$STATUS" == "200" ]]; then
    ok "DELETE /api/productos/$PRODUCTO_ID: HTTP $STATUS (soft-delete)"
  else
    fail "DELETE /api/productos/$PRODUCTO_ID: HTTP $STATUS (esperaba 200)"
  fi
else
  fail "7/7 — Desactivar producto: SKIP (sin token o sin ID)"
fi

# ─── Resumen ────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${GREEN}OK${NC}: $PASS   ${RED}FAIL${NC}: $FAIL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ $FAIL -gt 0 ]]; then
  exit 1
fi
