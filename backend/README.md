# VORTEX Backend

API REST del e-commerce VORTEX. Node.js 20 + TypeScript + Express + Prisma + PostgreSQL 16.

---

## Requisitos

- Node.js 20.18.0 LTS
- PostgreSQL 16 (Supabase recomendado)
- `npm` 10+

---

## Variables de entorno

Copiá `.env.example` a `.env` y completá los valores:

```bash
cp .env.example .env
```

### Requeridas

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string de PostgreSQL |
| `JWT_SECRET` | Secreto para firmar tokens JWT (cadena aleatoria segura) |
| `JWT_EXPIRES_IN` | Expiración del token (ej: `7d`) |
| `PORT` | Puerto del servidor (default: `3000`) |
| `NODE_ENV` | `development` \| `production` \| `test` |

### Opcionales (modo stub si están vacías)

| Variable | Servicio | Comportamiento sin key |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude AI | Descripciones y chat en modo stub (respuestas dummy) |
| `VOYAGE_API_KEY` | Voyage AI | Embeddings desactivados, búsqueda semántica retorna `[]` |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Blob | Fotos no se suben, endpoint retorna URL dummy |
| `AZURE_BLOB_CONTAINER` | Azure Blob | Default: `vortex-productos` |
| `STRIPE_SECRET_KEY` | Stripe | Pagos en modo stub (sin cobro real) |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Webhooks no verifican firma |
| `CORS_ORIGINS` | CORS | Default: `http://localhost:5173,http://localhost:5174` |

---

## Desarrollo

```bash
# Instalar dependencias
npm install

# Aplicar migraciones y generar cliente Prisma
npx prisma db push
npx prisma generate

# (Opcional) Sembrar datos iniciales
npx ts-node prisma/seed.ts

# Arrancar en modo desarrollo (hot reload)
npm run dev
```

El servidor arrancará en `http://localhost:3000`.

---

## Producción

```bash
# Compilar TypeScript
npm run build

# Arrancar
npm start
```

---

## Migraciones

```bash
# Aplicar schema al DB sin generar migration files (desarrollo)
npx prisma db push

# Crear y aplicar migration (producción / cambios tracked)
npx prisma migrate dev --name <nombre>

# Aplicar migrations en producción
npx prisma migrate deploy
```

---

## Health check

```
GET /health
```

Respuesta:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 42,
  "database": "ok",
  "servicios": {
    "anthropic": "configured",
    "voyage": "stub",
    "azureBlob": "stub",
    "stripe": "stub"
  }
}
```

- `status: "degraded"` → DB no responde, HTTP 503.
- `status: "ok"` → todo normal, HTTP 200.

---

## Smoke test

```bash
# Con el servidor corriendo en localhost:3000
./scripts/smoke-test.sh

# Contra otra URL
./scripts/smoke-test.sh https://api.vortex.ec
```

---

## Endpoints principales

### Auth
| Método | URL | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/login-backoffice` | — | Login empleados |
| POST | `/api/auth/login-cliente` | — | Login clientes |
| POST | `/api/auth/register-cliente` | — | Registro cliente |
| GET | `/api/auth/verify-email/:token` | — | Verificar email |
| POST | `/api/auth/forgot-password-cliente` | — | Solicitar reset |
| POST | `/api/auth/reset-password-cliente` | — | Resetear password |

### Catálogo (público)
| Método | URL | Auth | Descripción |
|---|---|---|---|
| GET | `/api/categorias` | — | Listar categorías |
| GET | `/api/productos` | — | Listar productos |
| GET | `/api/productos/:id` | — | Detalle producto |
| GET | `/api/tallas` | — | Listar tallas |

### Catálogo (backoffice)
| Método | URL | Rol | Descripción |
|---|---|---|---|
| POST | `/api/categorias` | ADMIN | Crear categoría |
| PUT | `/api/categorias/:id` | ADMIN | Editar categoría |
| DELETE | `/api/categorias/:id` | ADMIN | Desactivar categoría |
| POST | `/api/productos` | ADMIN, ALMACENISTA | Crear producto |
| PUT | `/api/productos/:id` | ADMIN, ALMACENISTA | Editar producto |
| DELETE | `/api/productos/:id` | ADMIN | Desactivar producto |
| POST | `/api/productos/:id/generate-ai` | ADMIN | Generar descripción con IA |
| POST | `/api/productos/:id/variantes` | ADMIN, ALMACENISTA | Crear variante |

### Inventario
| Método | URL | Rol | Descripción |
|---|---|---|---|
| GET | `/api/inventario/stock-actual` | ADMIN, ALMACENISTA | Stock actual |
| POST | `/api/inventario/ajustes` | ADMIN, ALMACENISTA | Crear ajuste |
| GET | `/api/inventario/ajustes` | ADMIN, ALMACENISTA | Historial ajustes |
| GET | `/api/inventario/movimientos` | ADMIN, ALMACENISTA | Ledger de movimientos |

### Clientes & Direcciones
| Método | URL | Auth | Descripción |
|---|---|---|---|
| GET | `/api/clientes/me` | Cliente | Perfil propio |
| PUT | `/api/clientes/me` | Cliente | Actualizar perfil |
| GET | `/api/clientes/me/direcciones` | Cliente | Listar direcciones |
| POST | `/api/clientes/me/direcciones` | Cliente | Agregar dirección |
| GET | `/api/clientes` | ADMIN | Listar clientes |

### Carrito & Checkout
| Método | URL | Auth | Descripción |
|---|---|---|---|
| GET | `/api/carrito` | Cliente | Ver carrito |
| POST | `/api/carrito/items` | Cliente | Agregar item |
| PUT | `/api/carrito/items/:id` | Cliente | Actualizar cantidad |
| DELETE | `/api/carrito/items/:id` | Cliente | Quitar item |
| POST | `/api/checkout` | Cliente | Procesar checkout |

### Pagos & Facturas
| Método | URL | Auth | Descripción |
|---|---|---|---|
| GET | `/api/facturas` | ADMIN, VENDEDOR | Listar facturas |
| GET | `/api/facturas/me` | Cliente | Mis facturas |
| GET | `/api/facturas/:id` | ADMIN, VENDEDOR | Detalle factura |
| PUT | `/api/facturas/:id/estado` | ADMIN, VENDEDOR | Cambiar estado |
| POST | `/api/webhooks/stripe` | Stripe | Webhook Stripe |

### Asistente IA
| Método | URL | Auth | Descripción |
|---|---|---|---|
| POST | `/api/assistant/chat` | Opcional | Chat con IA (SSE streaming) |
| GET | `/api/assistant/sesiones` | Cliente | Mis sesiones |
| GET | `/api/assistant/sesiones/:id` | Cliente | Detalle sesión |
| GET | `/api/admin/assistant/sesiones` | ADMIN | Todas las sesiones |

### Dashboard
| Método | URL | Rol | Descripción |
|---|---|---|---|
| GET | `/api/dashboard/kpis` | ADMIN, VENDEDOR | KPIs principales |
| GET | `/api/dashboard/ventas-por-dia` | ADMIN, VENDEDOR | Ventas diarias |
| GET | `/api/dashboard/top-productos` | ADMIN, VENDEDOR | Productos más vendidos |
| GET | `/api/dashboard/stock-bajo` | ADMIN, VENDEDOR | Stock crítico |
| GET | `/api/dashboard/uso-ia` | ADMIN | Uso del asistente IA |
| GET | `/api/dashboard/ventas-por-categoria` | ADMIN, VENDEDOR | Ventas por categoría |

---

## Cómo activar servicios en modo stub

### Anthropic (Claude AI)
```bash
ANTHROPIC_API_KEY=sk-ant-...
```
Activa: generación de descripciones de productos y asistente de chat con IA real.

### Voyage AI (embeddings)
```bash
VOYAGE_API_KEY=pa-...
```
Activa: búsqueda semántica de productos en el chat del asistente.

### Azure Blob Storage
```bash
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
AZURE_BLOB_CONTAINER=vortex-productos
```
Activa: subida y eliminación de fotos de productos.

### Stripe
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
Activa: cobro real con Stripe, verificación de firma de webhooks.

---

## Arquitectura

```
src/
  modules/<feature>/
    <feature>.routes.ts      ← URLs + middleware
    <feature>.controller.ts  ← req/res → service
    <feature>.service.ts     ← lógica de negocio + Prisma
    <feature>.schemas.ts     ← Zod schemas
  middleware/
    authBackoffice.ts        ← JWT backoffice
    authCliente.ts           ← JWT cliente
    requireRole.ts           ← RBAC
    validateRequest.ts       ← Zod validation
    rateLimit.ts             ← express-rate-limit
    errorHandler.ts          ← global error handler
  shared/
    utils/                   ← jwt, password, errors, audit, etc.
    types/                   ← tipos compartidos
  config/
    env.ts                   ← variables de entorno validadas con Zod
    prisma.ts                ← Prisma client singleton
```

---

## Stack

- **Runtime**: Node.js 20.18.0 LTS
- **Framework**: Express 4.21.2
- **Lenguaje**: TypeScript 5.7.3
- **ORM**: Prisma 5.22.0
- **DB**: PostgreSQL 16 + pgvector (Supabase)
- **Auth**: jsonwebtoken 9.0.2 + bcryptjs 2.4.3
- **Validación**: Zod 3.24.1
- **IA**: @anthropic-ai/sdk 0.39.0 + voyageai 0.0.3
- **Storage**: @azure/storage-blob 12.26.0
- **Pagos**: stripe 17.5.0
