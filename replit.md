# VAULT 16 — E-commerce streetwear (Ecuador)

Monorepo informal con `backend/` (Express + Prisma + Postgres) y `frontend/` (Vite + React). Idioma: español. Moneda: USD. IVA 15% incluido en `precio_venta`.

## Workflows

- **Backend API** → `cd backend && npm run dev` (puerto `3000`, base `/api/v1`).
- **Start application** → `cd frontend && npm run dev` (puerto `5000`, proxy `/api` → backend).

## Contract check (backend ↔ frontend)

Smoke test de contrato HTTP+JSON entre lo que devuelve el backend y lo que esperan los mappers del frontend (`frontend/src/shared/lib/mappers.ts`). Detecta drift de campos, snake/camel case, tipos numéricos vs string, IDs string vs number, etc.

```bash
cd backend && npm run check:contracts
```

- Asume el workflow **Backend API** corriendo y el cliente seed `test@vault16.ec` / `Vault16Test!` presente.
- Logea OK/FAIL/SKIP por endpoint y sale con código = cantidad de FAILs (0 = todo verde).
- Cubre: catálogo (lista + detalle), categorías, promociones, auth (login/register/forgot), `clientes/me`, direcciones (get + post), carrito (clear/get/add/update/validar), checkout (preview + iniciar-pago tarjeta + tarjeta/confirmar) y facturas (`me` + `me/:id`).
- Override de URL: `BASE_URL=http://otra:3000/api/v1 npm run check:contracts`.

**Cuándo correrlo**: después de tocar cualquier endpoint del backend o cualquier `*Api.ts`/`mappers.ts` del frontend. Es un check de contrato, no de UI.

**Gotchas**:
- Los endpoints `/auth/*` tienen rate limit en memoria. Si ves 429 (se reporta como SKIP), reiniciá el workflow **Backend API** y corré de nuevo.
- Bugs conocidos que el script reporta como FAIL hasta que se arreglen: `GET /clientes/me` devuelve 403 (orden de rutas, follow-up #12) y `POST /checkout/tarjeta/confirmar` devuelve 500 (`MAX() + FOR UPDATE` en `backend/src/shared/utils/facturaNumber.ts`, follow-up #11). Esto es **señal**, no ruido: el script está cumpliendo su función.

Archivos: `tools/contract-check/run.ts` (un solo archivo, Zod + `fetch` nativo, sin dependencias nuevas).

## User preferences

(vacío — agregar acá convenciones que el usuario pida recordar)
