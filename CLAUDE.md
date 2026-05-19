# VORTEX — Reglas para el Agente IA

> Este archivo es **ley**. Cualquier código que generes en este repo debe respetar estas reglas sin excepción.

---

## 1. Stack y versiones

```
Node.js 20.18.0 LTS  |  TypeScript 5.7.3  |  Express 4.21.2  |  Prisma 5.22.0
Zod 3.24.1  |  bcryptjs 2.4.3  |  jsonwebtoken 9.0.2
@anthropic-ai/sdk 0.39.0  |  voyageai 0.0.3  |  @azure/storage-blob 12.26.0
DB: Supabase PostgreSQL 16 + pgvector
```

NO uses otras librerías sin pedir confirmación. NO downgrades, NO upgrades.

---

## 2. Arquitectura: módulos por feature, 3 capas

```
src/modules/<feature>/
  ├── <feature>.routes.ts       ← define URLs, aplica middleware, llama controller
  ├── <feature>.controller.ts   ← parsea req, valida con Zod, llama service, devuelve response
  ├── <feature>.service.ts      ← lógica de negocio pura, usa Prisma
  └── <feature>.schemas.ts      ← schemas Zod (Create, Update, Query, etc.)
```

**Reglas inviolables:**
- Controllers **NUNCA** tocan Prisma. Solo llaman al service.
- Services **NUNCA** tocan `req` ni `res`. Reciben argumentos, devuelven datos.
- Services tiran `throw new ApiError(...)` ante cualquier error. NO devuelven `{ error: ... }`.
- Validación **siempre** con Zod en `*.schemas.ts`, aplicada vía middleware `validateRequest`.

---

## 3. ELIMINACIÓN LÓGICA — REGLA SAGRADA

> **NUNCA, BAJO NINGUNA CIRCUNSTANCIA, hagas DELETE físico en ninguna tabla del schema `vortex`.**

Toda "eliminación" es un UPDATE que cambia el estado de `'ACT'` a `'INA'`.

| Tabla | Columna de estado | Valor activo | Valor "eliminado" |
|---|---|---|---|
| `rol` | (no aplica — no se eliminan roles) | — | — |
| `empleado` | `estado_emp` | `'ACT'` | `'INA'` |
| `usuarios_backoffice` | (vía `empleado.estado_emp`) | — | — |
| `cliente` | `estado` | `'ACT'` | `'INA'` o `'BLO'` |
| `direccion_cliente` | `activa` (BOOLEAN) | `TRUE` | `FALSE` |
| `categoria_producto` | `estado` | `'ACT'` | `'INA'` |
| `talla` | `estado` | `'ACT'` | `'INA'` |
| `producto` | `estado_prod` | `'ACT'` | `'INA'` |
| `promocion` | `estado` | `'ACT'` | `'INA'` |

**Tablas append-only — JAMÁS se eliminan registros (ni físico ni lógico):**
- `movimiento_stock` — ledger inmutable
- `chat_mensaje` — historial inmutable
- `detalle_factura` — snapshot inmutable
- `detalle_ajuste` — snapshot inmutable
- `pago` — para "anular" se crea otro pago tipo `'REE'` (reembolso)

**Patrón en el service:**

```ts
// ❌ MAL
async delete(id: number) {
  await prisma.cliente.delete({ where: { id_cliente: id } });
}

// ✅ BIEN
async delete(id: number) {
  return prisma.cliente.update({
    where: { id_cliente: id },
    data: { estado: 'INA' },
  });
}
```

**Patrón en los listings — siempre filtrar por estado activo por defecto:**

```ts
// El listado público NO devuelve eliminados
async findAll() {
  return prisma.cliente.findMany({ where: { estado: 'ACT' } });
}

// Solo el endpoint de "papelera" o admin avanzado devuelve INA
async findAllIncludingInactive() {
  return prisma.cliente.findMany();
}
```

---

## 4. Convenciones de código

**Naming:**
- Archivos: `kebab-case.ts` o `camelCase.ts` (kebab para módulos completos, camel para utils)
- Funciones y variables: `camelCase`
- Tipos e interfaces: `PascalCase`
- Constantes: `UPPER_SNAKE_CASE`
- Schemas Zod: `<Acción><Entidad>Schema` (ej: `CreateProductoSchema`, `UpdateClienteSchema`)
- Tipos derivados de Zod: `<Acción><Entidad>Input` (ej: `CreateProductoInput`)

**Imports:**
- Imports absolutos desde `@/` configurado en `tsconfig.json` paths
- Orden: builtins → externals → @/ internals → relative

**Async/await siempre.** No mezclar con `.then()`.

**Errores:** usar las clases de `@/shared/utils/errors.ts`:
- `ApiError(statusCode, message)` — error genérico
- `NotFoundError(resource)` — 404
- `ValidationError(message)` — 400
- `UnauthorizedError(message)` — 401
- `ForbiddenError(message)` — 403
- `ConflictError(message)` — 409 (ej: email duplicado)

---

## 5. Patrón de respuestas HTTP

Todos los endpoints devuelven el shape:

```ts
// Éxito
{
  success: true,
  data: <T>,
  meta?: { page, pageSize, total, totalPages }  // solo en listados paginados
}

// Error (lo arma errorHandler middleware)
{
  success: false,
  error: { code: 'NOT_FOUND', message: 'Cliente no encontrado' }
}
```

Tipos en `@/shared/types/api.types.ts`.

---

## 6. Validación con Zod

**Reglas:**
- Cada módulo expone schemas en `<feature>.schemas.ts`
- Los tipos TypeScript se DERIVAN del schema con `z.infer<typeof X>` — nunca declarar interfaces duplicadas
- El middleware `validateRequest({ body?, query?, params? })` aplica el schema antes del controller

**Ejemplo:**

```ts
// productos.schemas.ts
export const CreateProductoSchema = z.object({
  id_categoria: z.string().length(3),
  nombre: z.string().min(3).max(80),
  descripcion_corta: z.string().max(200).optional(),
  precio_venta: z.number().nonnegative(),
});

export type CreateProductoInput = z.infer<typeof CreateProductoSchema>;
```

```ts
// productos.routes.ts
router.post(
  '/',
  authBackoffice,
  requireRole('ADMIN', 'INVENTARIO'),
  validateRequest({ body: CreateProductoSchema }),
  productosController.create
);
```

---

## 7. Eliminación lógica + restricciones de FK

Aunque hagamos soft-delete, las FK siguen siendo válidas. Si una `categoria_producto` tiene productos activos, no debería poder pasar a `'INA'` mientras tenga hijos activos. Patrón en el service:

```ts
async deactivate(id: string) {
  // Verificar que no tiene hijos activos
  const productosActivos = await prisma.producto.count({
    where: { id_categoria: id, estado_prod: 'ACT' },
  });
  if (productosActivos > 0) {
    throw new ConflictError(
      `No se puede desactivar: hay ${productosActivos} productos activos en esta categoría`
    );
  }
  return prisma.categoria_producto.update({
    where: { id_categoria: id },
    data: { estado: 'INA' },
  });
}
```

---

## 8. Paginación

Todos los listados aceptan query params:
- `page` (default 1, mínimo 1)
- `pageSize` (default 20, máximo 100)
- `search` (opcional, busca en campo principal del recurso)
- `sortBy` (opcional, campo permitido por el endpoint)
- `sortOrder` (`'asc'` | `'desc'`, default `'desc'`)
- `includeInactive` (boolean, default `false` — solo admin lo puede usar)

Helper en `@/shared/utils/pagination.ts`:

```ts
parsePageParams(req.query) → { skip, take, orderBy, where }
```

---

## 9. Transacciones Prisma

Cualquier operación que modifique más de UNA tabla relacionada va en `prisma.$transaction()`:
- Crear factura → afecta factura + detalle_factura + variante_producto + movimiento_stock + pago + carrito_detalle
- Crear ajuste → afecta ajuste_inventario + detalle_ajuste + variante_producto + movimiento_stock
- Registrar usuario backoffice → afecta empleado + usuarios_backoffice

Nunca dejes una operación de varios pasos sin transacción.

---

## 10. Variables de entorno

Cargadas con `dotenv` y validadas con Zod en `@/config/env.ts`. Si falta una, la app **no arranca**.

```
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
ANTHROPIC_API_KEY=
VOYAGE_API_KEY=
AZURE_STORAGE_CONNECTION_STRING=
AZURE_BLOB_CONTAINER=vortex-productos
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

---

## 11. Lo que NO querés ver en el código

- `console.log` de debug que quedó pegado
- `any` salvo justificación explícita en comentario
- `// TODO:` sin issue asociado
- Strings mágicos para roles/estados — usar constantes de `@/shared/constants/`
- Métodos en services que devuelven `Response` o `Request` — eso es del controller
- Endpoints sin Zod
- Endpoints sin `errorHandler` global activo
- Eliminación física

---

## 12. Cuando estés en duda

1. Releé este archivo
2. Si la duda es de schema, mirá `prisma/schema.prisma`
3. Si la duda es de patrón, copiá el módulo `auth` o `roles` (los de referencia)
4. Si la duda es de negocio, **PREGUNTÁ** antes de inventar
