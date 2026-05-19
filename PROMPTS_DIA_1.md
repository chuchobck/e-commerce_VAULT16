# VORTEX — Prompts del Día 1 (Backend)

> Cada prompt se ejecuta en orden. Esperá que el agente termine y revisá antes de pasar al siguiente.
> Asumimos que `CLAUDE.md` ya está en la raíz del repo backend y que la DB Supabase ya tiene el DDL aplicado.

---

## 🟢 PROMPT 0 — Bootstrap del repo backend

```
Vamos a inicializar el backend de VORTEX, un e-commerce con asistente de compra IA.

CONTEXTO:
- Stack: Node 20 LTS + Express 4 + TypeScript 5 + Prisma 5
- DB: Supabase PostgreSQL 16 + pgvector (ya está creada y poblada con el DDL)
- Las reglas del proyecto están en CLAUDE.md — leelas antes de hacer NADA

TAREA — hacelo en este orden exacto:

1. Inicializar package.json con `npm init -y` y configurarlo con scripts:
   - `dev`: tsx watch src/server.ts
   - `build`: tsc
   - `start`: node dist/server.js
   - `prisma:pull`: prisma db pull
   - `prisma:generate`: prisma generate

2. Instalar dependencias EXACTAS (ver CLAUDE.md sección 1):
   prod: express@4.21.2 @prisma/client@5.22.0 zod@3.24.1 jsonwebtoken@9.0.2
         bcryptjs@2.4.3 cors@2.8.5 helmet@8.0.0 dotenv@16.4.7 multer@1.4.5-lts.1
         @azure/storage-blob@12.26.0 @anthropic-ai/sdk@0.39.0 voyageai@0.0.3 morgan@1.10.0
   
   dev: prisma@5.22.0 tsx@4.19.2 typescript@5.7.3
        @types/node@20.17.10 @types/express@4.17.21 @types/jsonwebtoken@9.0.7
        @types/bcryptjs@2.4.6 @types/cors@2.8.17 @types/multer@1.4.12 @types/morgan@1.9.9

3. Crear tsconfig.json con:
   - target: ES2022
   - module: NodeNext
   - moduleResolution: NodeNext
   - strict: true
   - esModuleInterop: true
   - paths: { "@/*": ["src/*"] }
   - outDir: dist
   - rootDir: src

4. Crear estructura de carpetas vacía siguiendo CLAUDE.md sección 2:
   src/{config,middleware,modules,shared/{types,utils,constants}}
   prisma/

5. Crear .env.example con TODAS las variables de CLAUDE.md sección 10
   y .env real (con placeholders) y agregarlo a .gitignore

6. Crear prisma/schema.prisma vacío con datasource y generator, después correr
   `npx prisma db pull` para que se llene desde Supabase

NO crees todavía ningún módulo, solo el bootstrap.
Cuando termines, mostrame la estructura final y confirmá que `npm run dev` no rompe.
```

---

## 🟢 PROMPT 1 — Foundation layer (config + middleware + utils)

```
Ahora vamos con la foundation. Esto es lo que TODO el backend va a usar.
Seguí CLAUDE.md al pie de la letra.

CREÁ EN ESTE ORDEN:

1. src/config/env.ts
   - Carga dotenv
   - Valida con Zod TODAS las variables de entorno
   - Si falta alguna o es inválida, log con detalle y process.exit(1)
   - Exporta `env` tipado

2. src/config/prisma.ts
   - Singleton de PrismaClient
   - Log de queries solo si NODE_ENV !== 'production'

3. src/config/anthropic.ts, voyage.ts, azureBlob.ts
   - Singletons de cada cliente, lazy si querés
   - Solo configuración, no lógica de negocio

4. src/shared/utils/errors.ts
   Clases que extienden Error:
   - ApiError(statusCode, message, code?)
   - NotFoundError(resource)            → 404
   - ValidationError(message)           → 400
   - UnauthorizedError(message?)        → 401
   - ForbiddenError(message?)           → 403
   - ConflictError(message)             → 409

5. src/shared/utils/jwt.ts
   - signToken(payload) → string
   - verifyToken(token) → payload tipado o tira UnauthorizedError

6. src/shared/utils/password.ts
   - hashPassword(plain) → string (bcrypt 10 rounds)
   - comparePassword(plain, hash) → boolean

7. src/shared/utils/pagination.ts
   - parsePageParams(query) → { skip, take, page, pageSize }
   - buildPaginatedResponse(data, total, page, pageSize) → { data, meta }

8. src/shared/types/api.types.ts
   - ApiResponse<T> = { success: true, data: T, meta?: PaginationMeta }
   - ApiErrorResponse = { success: false, error: { code, message } }
   - PaginationMeta, PaginatedResponse<T>

9. src/shared/types/express.d.ts
   - Extender Express.Request con:
     - user?: { id_usuario, id_empleado, id_rol, email }    // backoffice
     - cliente?: { id_cliente, email }                       // ecommerce

10. src/shared/constants/roles.ts y estados.ts
    - Constantes para todos los códigos: ROL_ADMIN, FACTURA_EMI, PAGO_PEN, etc.

11. src/middleware/errorHandler.ts
    - Middleware global que captura ApiError y mapea a HTTP
    - ZodError → 400 con detalle de campos
    - Cualquier otro error → 500 genérico (sin filtrar info sensible)
    - Loggea con morgan/console según severity

12. src/middleware/notFound.ts
    - 404 fallback para rutas no matcheadas

13. src/middleware/validateRequest.ts
    - Recibe { body?, query?, params? } con schemas Zod
    - Aplica parse(), si falla tira ZodError (errorHandler lo agarra)
    - Si pasa, asigna req.body = parsed.data

14. src/middleware/authBackoffice.ts
    - Lee Authorization: Bearer <jwt>
    - Verifica con jwt.ts
    - Carga usuario desde DB con join a rol y empleado
    - Si empleado.estado_emp !== 'ACT' → 401
    - Inyecta req.user y next()

15. src/middleware/authCliente.ts
    - Mismo patrón pero para tabla cliente
    - Si cliente.estado !== 'ACT' → 401
    - Inyecta req.cliente

16. src/middleware/requireRole.ts
    - Factory: requireRole(...rolesPermitidos)
    - Lee req.user.rol_nombre
    - Si no matchea → ForbiddenError

17. src/app.ts
    - Crea Express app
    - Aplica middlewares globales: helmet, cors (con origins de env), morgan, express.json
    - Health check GET /health → { status: 'ok' }
    - Monta /api/* (todavía vacío, ya armaremos)
    - Aplica notFound y errorHandler al final

18. src/server.ts
    - Importa app, escucha en env.PORT
    - Maneja SIGTERM/SIGINT con graceful shutdown (cierra Prisma)

Al terminar, `npm run dev` tiene que levantar la app y GET /health debe responder 200.
NO hagas todavía ningún módulo de negocio.
```

---

## 🟢 PROMPT 2 — Módulo AUTH (referencia para todos los siguientes)

```
Implementá el módulo `auth` completo. Este es el módulo de REFERENCIA — los siguientes módulos
van a copiar este patrón.

UBICACIÓN: src/modules/auth/

ENDPOINTS:

POST /api/auth/login-backoffice
  body: { email, password }
  → busca en usuarios_backoffice por email
  → valida que empleado.estado_emp = 'ACT'
  → comparePassword
  → si OK: actualiza ultimo_login, firma JWT con { id_usuario, id_empleado, id_rol, email, rol_nombre }
  → response: { user: {...}, token }

POST /api/auth/login-cliente
  body: { email, password }
  → busca en cliente por email
  → valida que cliente.estado = 'ACT' Y email_verificado = TRUE
  → si email_verificado = FALSE → ApiError 403 'EMAIL_NOT_VERIFIED'
  → comparePassword
  → si OK: actualiza ultimo_login, firma JWT con { id_cliente, email }
  → response: { cliente: {...}, token }

POST /api/auth/register-cliente
  body: { email, password, ruc_cedula, nombre1, apellido1, telefono? }
  → valida email único
  → valida ruc_cedula único y largo 10 o 13
  → hashPassword
  → INSERT cliente con email_verificado=FALSE, estado='ACT'
  → genera token UUID en token_recuperacion (tipo='EMAIL_VERIFY', expira en 24h)
  → (TODO: enviar email — por ahora solo loguea el link a consola)
  → response: { cliente: {...}, message: 'Verificá tu email' }

GET /api/auth/verify-email/:token
  → busca token_recuperacion, valida tipo='EMAIL_VERIFY', no usado, no expirado
  → UPDATE cliente.email_verificado=TRUE
  → UPDATE token_recuperacion.usado=TRUE
  → response: { message: 'Email verificado' }

POST /api/auth/forgot-password-cliente
  body: { email }
  → si existe el cliente, genera token PASSWORD_RESET (expira en 1h)
  → SIEMPRE responde 200 con mensaje genérico (no filtrar si email existe o no)

POST /api/auth/reset-password-cliente
  body: { token, newPassword }
  → valida token PASSWORD_RESET no usado, no expirado
  → hashPassword nueva, UPDATE cliente.password_hash
  → marca token usado
  → response: 200

ARCHIVOS A CREAR:
- auth.schemas.ts → todos los schemas Zod (LoginSchema, RegisterClienteSchema, etc.)
- auth.service.ts → toda la lógica (sin tocar req/res)
- auth.controller.ts → parsea, llama service, formatea response
- auth.routes.ts → define rutas, aplica validateRequest

Después montalo en src/app.ts → app.use('/api/auth', authRoutes)

REGLAS CRÍTICAS:
- NUNCA loguear passwords ni hashes
- Mensajes de error genéricos en login ("credenciales inválidas") — no decir si fue email o pass
- Tokens expirados o usados → tratarlos igual que tokens inválidos
- Probá los 6 endpoints con curl o Thunder Client antes de declarar done
```

---

## 🟢 PROMPT 3 — CRUDs maestros (lote completo)

```
Ahora vamos con los CRUDs maestros. Son simples y muy parecidos entre sí.
COPIÁ EL PATRÓN del módulo auth y de CLAUDE.md.

MÓDULOS A CREAR (en este orden, uno por uno, esperá mi OK entre cada uno):

A. roles
   GET    /api/roles                   → lista (admin only)
   GET    /api/roles/:id               → detalle
   POST   /api/roles                   → crear (admin only)
   PUT    /api/roles/:id               → editar (admin only)
   (NO hay delete: los roles no se eliminan)

B. categorias  (categoria_producto)
   GET    /api/categorias              → público (solo ACT)
   GET    /api/categorias/all          → admin (incluye INA)
   GET    /api/categorias/:id
   POST   /api/categorias              → admin (id_categoria CHAR(3) en mayúsculas)
   PUT    /api/categorias/:id          → admin
   DELETE /api/categorias/:id          → admin → ELIMINACIÓN LÓGICA: estado='INA'
                                         Validar que no tiene productos activos antes

C. tallas
   Mismo patrón que categorias.

D. empleados
   GET    /api/empleados               → admin (lista activos por defecto)
   GET    /api/empleados/:id
   POST   /api/empleados               → admin
                                         CREA empleado Y usuarios_backoffice en TRANSACCIÓN
                                         body incluye: cedula, nombre1, apellido1, telefono?,
                                                       email, password, id_rol
   PUT    /api/empleados/:id           → admin (no permite cambiar password aquí)
   PUT    /api/empleados/:id/password  → admin (cambia solo password_hash)
   DELETE /api/empleados/:id           → admin → ELIMINACIÓN LÓGICA: estado_emp='INA'
                                         Validar que no es el único admin activo

E. clientes
   GET    /api/clientes                → admin (lista con paginación y search)
   GET    /api/clientes/:id            → admin
   PUT    /api/clientes/:id/estado     → admin (cambia entre ACT/INA/BLO)
   GET    /api/clientes/me             → cliente logueado (perfil propio)
   PUT    /api/clientes/me             → cliente logueado (edita su propio perfil)
   PUT    /api/clientes/me/password    → cliente logueado (requiere old + new)
   (NO hay delete físico)

F. direcciones (de cliente)
   GET    /api/clientes/me/direcciones                → cliente logueado
   POST   /api/clientes/me/direcciones                → cliente logueado
   PUT    /api/clientes/me/direcciones/:id            → cliente logueado
   DELETE /api/clientes/me/direcciones/:id            → ELIMINACIÓN LÓGICA: activa=FALSE
   PUT    /api/clientes/me/direcciones/:id/principal  → marca como principal
                                                        (las otras del mismo cliente pasan a FALSE)

REGLAS QUE NO PUEDEN FALTAR:
- TODOS los listados con paginación (parsePageParams)
- TODOS los listados públicos filtran por estado activo por defecto
- TODOS los DELETE son lógicos (UPDATE estado)
- Validaciones de negocio antes del soft-delete:
  • categoria con productos activos → ConflictError
  • talla con variantes activas → ConflictError
  • único admin activo → ConflictError
- Antes de cada módulo: leé CLAUDE.md sección 3 (eliminación lógica) de nuevo
```

---

## 🟢 PROMPT 4 — Productos + Variantes

```
Implementá los módulos `productos` y `variantes`.
Patrón estándar de CLAUDE.md.

A. productos
   GET    /api/productos                          → público
                                                    paginado, filtros: ?categoria, ?search, ?precioMin, ?precioMax
                                                    incluye foto principal y rango de precios de variantes
                                                    SOLO productos con estado_prod='ACT'
   GET    /api/productos/:id                      → público (detalle completo)
                                                    incluye variantes con stock, fotos ordenadas, descripción IA si existe
   POST   /api/productos                          → admin
                                                    body: id_categoria, nombre, descripcion_corta?, precio_venta
                                                    el id_producto lo genera la sequence (no lo manda el cliente)
   PUT    /api/productos/:id                      → admin
   DELETE /api/productos/:id                      → admin → estado_prod='INA' (ELIMINACIÓN LÓGICA)
                                                    Si tiene variantes con stock > 0: warning pero permite

B. variantes
   GET    /api/productos/:id/variantes            → lista las variantes de un producto
   POST   /api/productos/:id/variantes            → admin
                                                    body: id_talla, color, sku, var_saldo_inicial
                                                    sku debe ser único globalmente
                                                    (id_producto, id_talla, color) único combinado
   PUT    /api/variantes/:id                      → admin (solo edita color, sku — no contadores)
   DELETE /api/variantes/:id                      → admin → ATENCIÓN: NO podemos cambiar estado
                                                    porque la tabla no tiene columna estado.
                                                    OPCIÓN A: agregar columna `activa BOOLEAN`
                                                    OPCIÓN B: bloquear eliminación si tiene movimientos
                                                    
                                                    DECISIÓN: por ahora, si tiene var_saldo_final = 0
                                                    Y no tiene movimientos, permite delete físico.
                                                    Si tiene movimientos o stock, ConflictError.
                                                    (Mañana revisamos esto con el usuario.)

   GET    /api/variantes/sin-stock                → admin (lista de variantes con saldo 0)
   GET    /api/variantes/stock-bajo               → admin (saldo entre 1 y 5)

REGLAS:
- NO permitas escribir directamente var_qty_ingresos/egresos/ajustes desde estos endpoints.
  Esos campos solo se modifican vía el módulo `inventario` (mañana) o `checkout`.
- var_saldo_final es GENERATED — Prisma lo va a marcar como readonly en el cliente.
- Validá en POST que id_categoria existe y está ACT, y que id_talla existe y está ACT.
```

---

## 🔴 STOP — Punto de control del día

Antes de pasar al siguiente prompt, tenés que tener funcionando:
- Bootstrap, foundation, auth → ✅
- CRUDs: roles, categorias, tallas, empleados, clientes, direcciones → ✅
- Productos y variantes → ✅

Probalo todo con curl o Thunder Client. Si algo no anda, corregí ANTES de seguir.

---

## 🟡 PROMPT 5 (BONUS — solo si vas adelantado) — Galería con Azure Blob

```
Implementá el sub-módulo `fotos` dentro de `productos`.

ENDPOINTS:
POST   /api/productos/:id/fotos              → admin
       multipart/form-data con campo 'foto' + 'alt_text'?
       Multer guarda temporal, sube a Azure Blob, registra URL en producto_fotos
       
PUT    /api/productos/:id/fotos/:idFoto/principal → admin
       marca como principal (las otras del producto pasan a FALSE)
       
PUT    /api/productos/:id/fotos/orden        → admin
       body: [{ idFoto, orden }, ...] reordena toda la galería en transacción
       
DELETE /api/productos/:id/fotos/:idFoto      → admin
       BORRA el blob de Azure Y el registro de DB
       (las fotos sí pueden eliminarse físicamente — no son ledger)

DETALLES:
- El container de Azure ('vortex-productos') debe ser PUBLIC para que las URLs funcionen sin token
- Nombre del blob: <id_producto>/<uuid>.<ext> (mantiene orden visual en Azure Explorer)
- Validar tipos: jpg, jpeg, png, webp. Tamaño máximo: 5MB.
- Limpieza: si falla la inserción en DB, borrá el blob recién subido
```

---

## 🟡 PROMPT 6 (BONUS) — AI content generation

```
Implementá el módulo `ai-content` para generar descripciones IA + embeddings.

ENDPOINTS:
POST /api/productos/:id/generate-ai      → admin
     1. Lee producto + variantes + categoría
     2. Llama Claude (claude-sonnet-4-5) con prompt de copywriter streetwear,
        pidiendo JSON con { descripcion, bullets[], tags[] }
     3. Concatena nombre + descripción + tags y manda a Voyage (voyage-3)
     4. Recibe vector(1024)
     5. UPSERT en producto_ai (incrementa version si ya existía)
     6. Response: la descripción generada para preview en el backoffice

GET  /api/productos/:id/ai                → público
     Devuelve descripcion_larga, bullet_points, tags_estilo de producto_ai
     NO devuelve embedding (es metadata interna)

REGLAS:
- prompts.ts en el módulo: el prompt versionado, NO inline en el service
- Manejá los errores de Anthropic/Voyage como ApiError con status 502 ('AI_SERVICE_UNAVAILABLE')
- IMPORTANTE: el campo embedding es vector(1024) — Prisma NO lo soporta nativo.
  Usá prisma.$executeRaw con `${embedding}::vector` para INSERT/UPDATE.
- Loguear cuántos tokens consumió cada call (input + output) para auditoría futura.
```

---

## Notas finales para el agente

- Después de cada prompt, **probá los endpoints** con curl/Thunder Client antes de declarar done
- Si el agente intenta hacer DELETE físico en algo que no sea `producto_fotos` → corregilo y recordale CLAUDE.md sección 3
- Si el agente pone lógica en el controller → corregilo: la lógica vive en el service
- Si el agente declara `interface` en lugar de derivar de Zod → corregilo: se deriva con `z.infer`
- Si el agente cambia versiones → corregilo: las versiones son las de CLAUDE.md
