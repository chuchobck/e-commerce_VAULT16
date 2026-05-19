# VORTEX — Prompts del Día 2 (Backend completo)

> Pre-requisito: Día 1 terminado y probado (auth, CRUDs maestros, productos, variantes).
> Mismo flujo: ejecutá un prompt, esperá que termine, probalo, pasá al siguiente.

---

## 🟢 PROMPT 5 — Audit log helper (transversal)

```
Antes de seguir con módulos de negocio, necesitamos el helper de auditoría.
TODOS los services que vienen lo van a usar.

UBICACIÓN: src/shared/utils/audit.ts

INTERFAZ:

export type AuditAccion = 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT'

export interface AuditParams {
  tabla: string
  id_registro: string | number
  accion: AuditAccion
  payload_antes?: object | null
  payload_despues?: object | null
  id_usuario_bo?: number | null
  id_cliente?: number | null
  ip?: string
  user_agent?: string
}

export async function registrarAudit(params: AuditParams): Promise<void>

REGLAS:
1. La función SIEMPRE acepta y nunca tira excepción al consumidor — si falla, loguea
   pero NO interrumpe el flujo de negocio. Auditar nunca puede romper la operación principal.
2. Convierte `id_registro` siempre a String() antes de insertar.
3. Si tanto id_usuario_bo como id_cliente son undefined, los guarda como NULL (acción del sistema).
4. payload_antes y payload_despues van a JSONB — pasalos directo, Prisma los serializa.

DESPUÉS — actualizá el módulo `auth` que ya tenés:
- En login-backoffice exitoso → registrarAudit({ accion: 'LOGIN', tabla: 'usuarios_backoffice', ... })
- En login-cliente exitoso → registrarAudit({ accion: 'LOGIN', tabla: 'cliente', ... })
- En login fallido → registrarAudit con id_registro = email intentado, payload_antes = { motivo: 'INVALID_CREDENTIALS' }

DESPUÉS — actualizá los CRUDs del Día 1 (roles, categorias, tallas, empleados, clientes, direcciones, productos, variantes):
- Cada CREATE → registrarAudit con accion='INSERT', payload_despues = registro creado
- Cada UPDATE → registrarAudit con payload_antes (lectura previa) y payload_despues
- Cada DELETE lógico → registrarAudit con accion='UPDATE' (porque es UPDATE de estado),
  payload_antes con estado anterior, payload_despues con estado nuevo

Ayuda: creá un middleware utility en src/shared/utils/auditContext.ts que extraiga
{ id_usuario_bo, id_cliente, ip, user_agent } desde el request, así no repetís código.

ENDPOINT NUEVO PARA EL BACKOFFICE:
GET /api/audit/:tabla/:id_registro     → admin only
   Devuelve el historial completo ordenado por fecha desc.
   Incluye nombre del usuario que hizo cada acción.

GET /api/audit                         → admin only
   Listado paginado, filtros: ?tabla, ?accion, ?usuario, ?desde, ?hasta
```

---

## 🟢 PROMPT 6 — Módulo INVENTARIO

```
Implementá el módulo `inventario` completo.
Patrón estándar de CLAUDE.md. Toda operación va en TRANSACCIÓN.

UBICACIÓN: src/modules/inventario/

ARCHIVOS:
- inventario.routes.ts
- inventario.controller.ts
- ajustes.service.ts        → cabecera de ajustes
- movimientos.service.ts    → consultas del ledger
- inventario.schemas.ts

ENDPOINTS:

A. AJUSTES DE INVENTARIO

POST /api/inventario/ajustes              → admin/bodega
  body: {
    motivo: string,                       // mínimo 5 chars
    detalles: [
      { id_variante, cantidad, tipo_movimiento: 'ING' | 'EGR' }
    ]
  }
  
  TRANSACCIÓN:
    1. INSERT ajuste_inventario (estado='PRO', id_empleado del JWT)
    2. Para cada detalle:
       a. INSERT detalle_ajuste
       b. UPDATE variante_producto:
          - si tipo='ING' → var_qty_ingresos += cantidad
          - si tipo='EGR' → var_qty_egresos += cantidad
       c. INSERT movimiento_stock:
          - tipo='AJU'
          - referencia=`AJU-${id_ajuste}`
          - saldo_post = nuevo var_saldo_final
          - cantidad, id_variante, id_empleado, observacion=motivo
    3. registrarAudit('ajuste_inventario', id_ajuste, 'INSERT')
  
  Si CUALQUIER paso falla (incluido el CHECK chk_var_stock_no_neg) → ROLLBACK total.

GET    /api/inventario/ajustes            → admin/bodega (paginado, ?desde, ?hasta, ?empleado)
GET    /api/inventario/ajustes/:id        → admin/bodega (cabecera + detalles + movimientos generados)

PUT    /api/inventario/ajustes/:id/anular → admin/bodega
  body: { motivo_anulacion: string }
  
  TRANSACCIÓN:
    1. Verifica que estado='PRO' (los anulados no se anulan dos veces)
    2. Para cada detalle del ajuste original:
       Genera el movimiento INVERSO en variante_producto
       (si era ING, ahora resta de ingresos; si era EGR, suma a ingresos)
    3. INSERT movimiento_stock con tipo='AJU' y referencia=`ANU-${id_ajuste}`
    4. UPDATE ajuste_inventario.estado='ANU'
    5. registrarAudit con motivo de anulación

B. CONSULTAS DEL LEDGER

GET /api/inventario/movimientos                       → admin/bodega
  Listado paginado del ledger. Filtros: ?id_variante, ?tipo, ?desde, ?hasta, ?id_empleado

GET /api/inventario/movimientos/variante/:id          → admin/bodega
  Historial completo de una variante específica.
  Incluye saldo_post para reconstruir la línea de tiempo.

GET /api/inventario/stock-actual                      → admin/bodega
  Reporte: lista todas las variantes con su saldo actual, agrupado por producto.
  Filtros: ?categoria, ?stock_minimo, ?stock_maximo
  Útil para el dashboard.

REGLAS:
- Las tablas movimiento_stock y detalle_ajuste son APPEND-ONLY — NUNCA UPDATE ni DELETE.
- ajuste_inventario solo cambia estado a 'ANU' — nunca DELETE.
- Si el ajuste dejaría var_saldo_final < 0, el CHECK de PG va a tirar error y la transacción rollbackea.
  Atrapalo y devolvé ConflictError con mensaje claro: "Stock insuficiente en variante X".
```

---

## 🟢 PROMPT 7 — Módulo PROMOCIONES

```
Implementá el módulo `promociones` completo. Patrón estándar.

UBICACIÓN: src/modules/promociones/

ENDPOINTS:

GET    /api/promociones                    → público (solo vigentes y activas)
                                              fecha_inicio <= NOW() <= fecha_fin AND estado='ACT'
GET    /api/promociones/all                → admin (todas, incluyendo INA y vencidas)
GET    /api/promociones/:id                → detalle + productos asociados

POST   /api/promociones                    → admin/marketing
       body: { nombre, descripcion?, porcentaje_descuento, fecha_inicio, fecha_fin }
       Validar: fecha_fin > fecha_inicio, descuento entre 0 y 100

PUT    /api/promociones/:id                → admin/marketing (no permite cambiar fechas si ya empezó)

DELETE /api/promociones/:id                → admin/marketing → estado='INA' (ELIMINACIÓN LÓGICA)

POST   /api/promociones/:id/productos      → admin/marketing
       body: { id_productos: string[] }
       Asocia varios productos en una sola transacción
       UNIQUE constraint evita duplicados

DELETE /api/promociones/:id/productos/:id_producto  → admin/marketing
       Quita un producto de la promo (DELETE FÍSICO de promocion_detalle — es solo asociación)

HELPER COMPARTIDO QUE OTROS MÓDULOS VAN A USAR:
src/shared/utils/promocionesHelper.ts

export async function getDescuentoActivoProducto(id_producto: string): Promise<number>
  Devuelve el porcentaje de descuento vigente para ese producto, o 0 si no hay.
  Si hay múltiples promociones vigentes para el mismo producto, devuelve la MÁS ALTA.

Esto se va a usar en checkout y carrito.

REGLAS:
- Las promociones expiradas NO se eliminan automáticamente — quedan en INA o vencidas para histórico.
- La eliminación física de promocion_detalle es OK porque es solo una tabla de asociación,
  no un registro de negocio.
```

---

## 🟢 PROMPT 8 — Módulo CARRITO

```
Implementá el módulo `carrito`. Patrón estándar.

UBICACIÓN: src/modules/carrito/

CONTEXTO IMPORTANTE:
- Cada cliente tiene UN solo carrito (UNIQUE en id_cliente).
- El carrito se crea automáticamente al primer "agregar item" si no existe.
- Items apuntan a VARIANTE, no a producto.
- Al hacer checkout exitoso, el carrito se VACÍA (DELETE FÍSICO de carrito_detalle, el carrito persiste).

ENDPOINTS (todos requieren authCliente):

GET    /api/carrito                                 → carrito actual del cliente con items
       Response: {
         id_carrito,
         items: [{
           id_carrito_det, cantidad, fecha_agregado,
           variante: { id, color, talla, sku, stock_disponible },
           producto: { id, nombre, foto_principal, precio_venta },
           subtotal: cantidad * precio_venta,
           descuento_aplicado: cantidad * precio_venta * (porcentaje / 100),
           total_linea: subtotal - descuento_aplicado
         }],
         resumen: { subtotal, descuento_total, total, cantidad_items }
       }

POST   /api/carrito/items                           → agregar item
       body: { id_variante, cantidad }
       Lógica:
         1. Crear carrito si no existe (Prisma upsert)
         2. Validar stock disponible: cantidad <= var_saldo_final
         3. Si la variante ya está en el carrito → SUMA cantidad (no duplica)
            (UNIQUE en (id_carrito, id_variante) lo respalda)
         4. Re-validar que la nueva cantidad no excede stock

PUT    /api/carrito/items/:id                       → cambiar cantidad
       body: { cantidad }
       Si cantidad <= 0 → DELETE el item
       Si cantidad > stock disponible → ConflictError

DELETE /api/carrito/items/:id                       → quitar item (DELETE FÍSICO — son volátiles)

DELETE /api/carrito                                 → vaciar carrito completo
       (DELETE FÍSICO de todos los carrito_detalle del cliente, NO del carrito)

GET    /api/carrito/validar                         → pre-checkout
       Recorre todos los items y verifica:
         - variante todavía existe
         - producto en estado ACT
         - stock disponible >= cantidad
         - precio_venta no cambió (si cambió, devuelve warning con precio nuevo)
       Response: { valido: boolean, problemas: [{ id_item, motivo, detalle }] }

REGLAS:
- carrito y carrito_detalle son los únicos lugares donde se permite DELETE FÍSICO en datos del cliente.
- Si el cliente no tiene sesión, el carrito vive solo en memoria del frontend (Zustand).
  Cuando se loguee, el frontend manda los items y el backend los mergea.
- El stock NO se reserva al agregar al carrito. La reserva real ocurre en checkout.
```

---

## 🟢 PROMPT 9 — Módulo CHECKOUT (LA TRANSACCIÓN CRÍTICA)

```
Este es EL módulo más crítico del backend. Una sola operación tiene que:
1. Validar todo el carrito de nuevo
2. Crear factura
3. Crear detalle_factura
4. Descontar stock de todas las variantes
5. Insertar movimiento_stock por cada variante
6. Crear el registro de pago
7. Vaciar el carrito
8. Auditar todo

TODO en una sola Prisma $transaction. Si UN paso falla → ROLLBACK total.

UBICACIÓN: src/modules/checkout/

ENDPOINTS (requieren authCliente):

POST /api/checkout/preview
  body: { id_direccion_envio }
  Calcula el total final SIN crear nada.
  Para que el frontend muestre el resumen antes del paso de pago.
  Response: {
    items: [...],
    subtotal, descuento_total, total,
    direccion: {...}
  }
  Validaciones que ejecuta:
    - cliente.email_verificado === true
    - id_direccion_envio pertenece al cliente y está activa
    - el carrito tiene al menos 1 item
    - cada variante tiene stock suficiente
    - cada producto está en estado ACT

POST /api/checkout/iniciar-pago
  body: { id_direccion_envio, metodo_pago: 'STRIPE' | 'TRANSFERENCIA' }
  
  Si metodo_pago='STRIPE':
    1. Re-valida todo (igual que preview)
    2. Crea el PaymentIntent en Stripe (POR AHORA: stub que devuelve client_secret fake)
    3. Devuelve { client_secret, idempotency_key }
    
  Si metodo_pago='TRANSFERENCIA':
    1. Re-valida todo
    2. Genera id_factura (formato 001-001-XXXXXXXXX, ver helper más abajo)
    3. Llama directamente al service de confirmación con estado pago='PEN'
    4. Devuelve { id_factura, instrucciones_transferencia }

POST /api/checkout/confirmar
  Endpoint INTERNO — solo lo llama el webhook de Stripe O el flujo de transferencia.
  body: { id_cliente, id_direccion_envio, items, metodo_pago, referencia_externa? }
  
  TRANSACCIÓN COMPLETA:
    1. Generar id_factura único formato SRI
    2. Re-validar stock una última vez (con FOR UPDATE para lockear filas)
    3. Calcular subtotal, descuentos (usando promocionesHelper), total
    4. INSERT factura (estado='EMI')
    5. Para cada item:
       a. INSERT detalle_factura
       b. UPDATE variante_producto.var_qty_egresos += cantidad
       c. INSERT movimiento_stock (tipo='EGR', referencia=`FAC-${id_factura}`)
    6. INSERT pago (estado depende del método):
       - STRIPE → 'COM' si webhook llegó OK
       - TRANSFERENCIA → 'PEN' (admin lo confirma manualmente después)
    7. Si pago='COM' → UPDATE factura.estado='PAG'
    8. DELETE carrito_detalle WHERE id_carrito = (cliente.carrito)
    9. registrarAudit por cada cambio relevante
  
  Response: { id_factura, total, estado, fecha_emision }

HELPER PARA GENERAR id_factura:
src/shared/utils/facturaNumber.ts

export async function generarIdFactura(): Promise<string>
  - Formato: 001-001-XXXXXXXXX (CHK regex de la DB ya lo valida)
  - 001-001 = establecimiento + punto de emisión (hardcoded por ahora)
  - XXXXXXXXX = 9 dígitos secuenciales (000000001, 000000002, ...)
  - Implementación inicial: SELECT MAX(numero) FROM factura + 1 (con LOCK)
  - Más adelante: usar una sequence dedicada

REGLAS DE LA TRANSACCIÓN:
- Usá Prisma.$transaction con isolation level 'Serializable' o al menos 'RepeatableRead'.
- Si dos checkout simultáneos compiten por la última unidad de stock, UNO va a fallar
  con error de lock y devolvemos ConflictError con mensaje claro.
- NUNCA confíes en el carrito sin re-validar stock. El cliente puede tener un item
  hace 10 minutos en el carrito que ya se vendió.
- El campo precio_unitario en detalle_factura es SNAPSHOT — al momento de la compra.
  No vuelve a calcularse después aunque cambie el precio del producto.

STRIPE STUB:
src/modules/pagos/stripe.service.ts (lo armamos en el siguiente prompt)
Por ahora exportá:
  export async function createPaymentIntent(amount: number, metadata: object) {
    return { client_secret: 'pi_stub_' + Date.now(), id: 'stub_id' }
  }
```

---

## 🟢 PROMPT 10 — Módulo PAGOS + Stripe Webhook

```
Implementá el módulo `pagos` con integración Stripe (stub por ahora, real cuando tengas la key).

UBICACIÓN: src/modules/pagos/

ARCHIVOS:
- pagos.routes.ts
- pagos.controller.ts
- pagos.service.ts
- webhooks.controller.ts    → maneja el webhook de Stripe (PÚBLICO, sin auth)
- stripe.service.ts          → wrapper de la SDK de Stripe (con stub si no hay key)

PRIMERO — INSTALÁ:
npm install stripe@17.5.0
npm install --save-dev @types/stripe (no hace falta, stripe trae sus tipos)

src/config/stripe.ts:
  - Si env.STRIPE_SECRET_KEY existe → cliente real
  - Si no → null, y stripe.service.ts opera en modo stub

ENDPOINTS:

GET    /api/pagos                          → admin (paginado, ?id_factura, ?estado, ?metodo)
GET    /api/pagos/:id                      → admin (detalle)

PUT    /api/pagos/:id/confirmar            → admin/vendedor
       Para pagos en TRANSFERENCIA que el admin valida manualmente.
       Cambia estado de 'PEN' a 'COM' y actualiza factura.estado='PAG'.

PUT    /api/pagos/:id/reembolsar           → admin
       Crea un NUEVO registro de pago con estado='REE' y monto negativo,
       NO modifica el original.
       Si el pago era Stripe → llama a stripe.refunds.create()
       Si era transferencia → solo registra (la devolución la hace el admin manualmente)

WEBHOOK DE STRIPE (CRÍTICO):
POST /api/webhooks/stripe                  → PÚBLICO, sin auth, sin CORS
  Headers: stripe-signature
  Body: raw (no JSON parsed)
  
  IMPORTANTE en src/app.ts:
  app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }))
  Esto va ANTES del express.json() global.
  
  Lógica:
    1. Verificar la firma con stripe.webhooks.constructEvent
       Si falla → 400 (no procesar nada)
    2. Manejar evento:
       - payment_intent.succeeded → llamar checkoutService.confirmar()
       - payment_intent.payment_failed → registrar pago con estado='FAL'
       - charge.refunded → ya manejado por el endpoint de reembolso, ignorar
    3. SIEMPRE responder 200 (Stripe reintenta si no recibe 200)

stripe.service.ts:
  export const stripe = config.stripeKey ? new Stripe(config.stripeKey) : null
  
  export async function createPaymentIntent(amount: number, metadata: object) {
    if (!stripe) {
      console.warn('[STRIPE STUB] PaymentIntent fake creado')
      return { client_secret: 'pi_stub_' + Date.now(), id: 'stub_' + Date.now() }
    }
    return stripe.paymentIntents.create({
      amount: Math.round(amount * 100),    // Stripe usa centavos
      currency: 'usd',
      metadata,
      automatic_payment_methods: { enabled: true }
    })
  }
  
  export async function refund(paymentIntentId: string, amount?: number) {
    if (!stripe) {
      console.warn('[STRIPE STUB] Refund fake')
      return { id: 'rf_stub_' + Date.now(), status: 'succeeded' }
    }
    return stripe.refunds.create({ payment_intent: paymentIntentId, amount })
  }

REGLAS:
- pago es APPEND-ONLY excepto el campo `estado` (PEN → COM o FAL).
- Nunca DELETE ningún registro de pago.
- Los reembolsos son PAGOS NUEVOS con monto negativo y estado='REE'.
- El webhook NUNCA debe tirar error 500 — siempre responde 200 incluso si el evento es desconocido.
```

---

## 🟢 PROMPT 11 — Módulo FACTURAS

```
Implementá el módulo `facturas` (mayormente lectura — la creación ya la hace checkout).

UBICACIÓN: src/modules/facturas/

ENDPOINTS:

GET    /api/facturas                       → admin/vendedor
       Paginado. Filtros: ?cliente, ?estado, ?desde, ?hasta, ?metodo_pago

GET    /api/facturas/:id                   → admin/vendedor
       Detalle completo: cabecera + cliente + dirección + detalles + pagos

GET    /api/facturas/me                    → cliente logueado
       Solo SUS facturas. Paginado.

GET    /api/facturas/me/:id                → cliente logueado
       Detalle de SU factura. Si id pertenece a otro cliente → NotFoundError (no Forbidden).

PUT    /api/facturas/:id/estado            → admin/vendedor
       body: { nuevo_estado: 'ENV' | 'ENT' | 'ANU', observacion? }
       
       Transiciones permitidas:
         EMI → PAG → ENV → ENT
         EMI → ANU
         PAG → ANU (solo admin, requiere reembolso previo)
         ENV → ENT
       
       Si transición no es válida → ConflictError con mensaje del estado actual.
       
       Si nuevo_estado='ANU':
         TRANSACCIÓN:
           1. UPDATE factura.estado='ANU'
           2. Para cada detalle:
              - UPDATE variante_producto.var_qty_ingresos += cantidad
                (revertimos el egreso)
              - INSERT movimiento_stock (tipo='DEV', referencia=`ANU-${id_factura}`)
           3. Si la factura ya estaba pagada → crear registro de pago tipo='REE'
           4. registrarAudit

GET    /api/facturas/:id/pdf               → admin/vendedor o cliente dueño
       (POR AHORA: stub que devuelve JSON con todos los datos)
       (DESPUÉS: generar PDF real con pdfmake o similar — fuera de alcance hoy)

REGLAS:
- factura nunca se elimina, ni físico ni lógico. Solo cambia estado.
- detalle_factura es APPEND-ONLY desde el momento de creación.
- Las facturas anuladas siguen existiendo y siguen contando para reportes.
```

---

## 🟢 PROMPT 12 — Galería con Azure Blob

```
Implementá la sub-funcionalidad `fotos` dentro del módulo `productos`.

UBICACIÓN: src/modules/productos/fotos.service.ts y agregá al controller existente.

PRIMERO — Helper de Azure Blob:
src/shared/utils/azureBlob.ts

export async function uploadFile(buffer: Buffer, filename: string, contentType: string): Promise<string>
  - Sube al container env.AZURE_BLOB_CONTAINER
  - Devuelve la URL pública del blob
  - Si AZURE_STORAGE_CONNECTION_STRING no está configurada → modo stub
    devuelve `https://stub.local/${filename}` y loguea warning
  
export async function deleteFile(blobName: string): Promise<void>
  - Borra el blob por nombre
  - Si stub → solo loguea

export function extractBlobName(url: string): string
  - Recibe la URL completa, devuelve solo el nombre del blob

CONFIGURACIÓN MULTER:
src/middleware/upload.ts

export const uploadFoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },     // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.mimetype)) {
      return cb(new ValidationError('Formato no permitido. Use JPG, PNG o WebP.'))
    }
    cb(null, true)
  }
})

ENDPOINTS:

POST   /api/productos/:id/fotos            → admin/marketing
       multipart/form-data
       campo `foto` (archivo) + `alt_text?` (texto)
       
       Lógica:
         1. Validar que el producto existe y está ACT
         2. Generar nombre del blob: `${id_producto}/${uuid}.${ext}`
         3. uploadFile() → URL pública
         4. INSERT producto_fotos
         5. Si es la primera foto del producto → es_principal=TRUE automático
         6. Si falla la inserción en DB → deleteFile() del blob recién subido (cleanup)

PUT    /api/productos/:id/fotos/:idFoto/principal  → admin/marketing
       TRANSACCIÓN:
         1. UPDATE producto_fotos SET es_principal=FALSE WHERE id_producto=:id
         2. UPDATE producto_fotos SET es_principal=TRUE WHERE id_foto=:idFoto

PUT    /api/productos/:id/fotos/orden      → admin/marketing
       body: [{ id_foto, orden }, ...]
       UPDATE en transacción de todos los órdenes

DELETE /api/productos/:id/fotos/:idFoto    → admin/marketing
       PASO 1: Borrar de DB
       PASO 2: deleteFile() del blob
       (En este orden para que si falla la DB, el blob no quede huérfano.
        Si falla el delete del blob después de la DB, queda como cleanup pendiente
        — loguealo pero no rollbackees la DB.)
       
       VALIDACIÓN: si era la única foto principal y hay más fotos,
       marcar la siguiente (por orden) como principal.

REGLAS:
- producto_fotos es la ÚNICA tabla del schema con DELETE FÍSICO permitido (junto con carrito_detalle).
- Las fotos no son ledger ni snapshot — son datos volátiles.
- alt_text es opcional pero recomendado para SEO.
```

---

## 🟢 PROMPT 13 — Módulo AI-CONTENT (con stubs)

```
Implementá el módulo `ai-content`. Como aún no tenés API keys de Anthropic ni Voyage,
todo va con STUBS funcionales que devuelven datos plausibles. El día que tengas las keys,
los reemplazás directamente.

UBICACIÓN: src/modules/ai-content/

ARCHIVOS:
- ai-content.routes.ts
- ai-content.controller.ts
- ai-content.service.ts
- prompts.ts                  → prompts versionados en código

PRIMERO — Configuración de clientes IA (stub-aware):
src/config/anthropic.ts (ACTUALIZAR el del Día 1):

import Anthropic from '@anthropic-ai/sdk'
import { env } from './env'

export const anthropic = env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  : null

export const ANTHROPIC_STUB_MODE = !anthropic

src/config/voyage.ts (ACTUALIZAR):
import { VoyageAIClient } from 'voyageai'
import { env } from './env'

export const voyage = env.VOYAGE_API_KEY
  ? new VoyageAIClient({ apiKey: env.VOYAGE_API_KEY })
  : null

export const VOYAGE_STUB_MODE = !voyage

PROMPTS (src/modules/ai-content/prompts.ts):

export const PROMPT_DESCRIPCION_PRODUCTO_V1 = {
  version: 'v1',
  modelo: 'claude-sonnet-4-5',
  system: `Eres copywriter de VORTEX, una tienda streetwear urbana ecuatoriana.
Tono: cercano, directo, urbano. Español ecuatoriano neutro.
Devuelves SOLO JSON válido sin markdown:
{
  "descripcion": string (200-300 palabras),
  "bullets": string[5],
  "tags": string[3-5]
}`,
  buildUserMessage: (producto: ProductoContext) => `
Producto: ${producto.nombre}
Categoría: ${producto.categoria}
Colores: ${producto.colores.join(', ')}
Tallas: ${producto.tallas.join(', ')}
Precio: $${producto.precio}

Generá el JSON.
`.trim()
}

ai-content.service.ts:

export async function generarDescripcion(idProducto: string, idEmpleadoActor: number) {
  // 1. Lee el producto completo con variantes y categoría
  const producto = await loadProductoContext(idProducto)
  
  // 2. Llama a Claude (o stub)
  const { descripcion, bullets, tags } = await callClaude(producto)
  
  // 3. Genera el embedding (o stub)
  const textoCompleto = `${producto.nombre}. ${descripcion} Tags: ${tags.join(', ')}.`
  const embedding = await callVoyage(textoCompleto)
  
  // 4. UPSERT en producto_ai (incrementa version si ya existía)
  await prisma.$executeRaw`
    INSERT INTO vortex.producto_ai (
      id_producto, descripcion_larga, bullet_points, tags_estilo,
      embedding, modelo_generacion, modelo_embedding
    ) VALUES (
      ${idProducto}, ${descripcion}, ${JSON.stringify(bullets)}::jsonb,
      ${JSON.stringify(tags)}::jsonb, ${embedding}::vector,
      'claude-sonnet-4-5', 'voyage-3'
    )
    ON CONFLICT (id_producto) DO UPDATE SET
      descripcion_larga = EXCLUDED.descripcion_larga,
      bullet_points     = EXCLUDED.bullet_points,
      tags_estilo       = EXCLUDED.tags_estilo,
      embedding         = EXCLUDED.embedding,
      version           = vortex.producto_ai.version + 1,
      fecha_generacion  = CURRENT_TIMESTAMP
  `
  
  // 5. Auditar
  await registrarAudit({
    tabla: 'producto_ai', id_registro: idProducto, accion: 'INSERT',
    payload_despues: { descripcion, bullets, tags }, id_usuario_bo: idEmpleadoActor
  })
  
  return { descripcion, bullets, tags }
}

async function callClaude(producto: ProductoContext) {
  if (ANTHROPIC_STUB_MODE) {
    console.warn('[ANTHROPIC STUB] Generando descripción fake')
    return {
      descripcion: `Descripción placeholder para ${producto.nombre}. ` +
                   'Cuando configures ANTHROPIC_API_KEY se va a generar contenido real.'.repeat(3),
      bullets: [
        '100% algodón premium',
        'Corte oversize moderno',
        'Estampado serigrafiado',
        'Cuidado: lavar con agua fría',
        'Hecho en Ecuador'
      ],
      tags: ['streetwear', 'urbano', 'oversize']
    }
  }
  
  const msg = await anthropic!.messages.create({
    model: PROMPT_DESCRIPCION_PRODUCTO_V1.modelo,
    max_tokens: 1024,
    system: PROMPT_DESCRIPCION_PRODUCTO_V1.system,
    messages: [{ role: 'user', content: PROMPT_DESCRIPCION_PRODUCTO_V1.buildUserMessage(producto) }]
  })
  
  const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  return JSON.parse(text)
}

async function callVoyage(texto: string): Promise<number[]> {
  if (VOYAGE_STUB_MODE) {
    console.warn('[VOYAGE STUB] Generando embedding fake')
    // Vector 1024 random pero determinístico (basado en hash del texto)
    return Array.from({ length: 1024 }, (_, i) => Math.sin(i + texto.length) * 0.5)
  }
  
  const res = await voyage!.embed({ input: [texto], model: 'voyage-3' })
  return res.data![0].embedding!
}

ENDPOINTS:

POST   /api/productos/:id/generate-ai      → admin/marketing
       Dispara el pipeline completo. Devuelve la descripción generada.

GET    /api/productos/:id/ai               → público
       SELECT descripcion_larga, bullet_points, tags_estilo, version, fecha_generacion
       FROM producto_ai WHERE id_producto = :id
       NO devuelve embedding (es metadata interna).

DELETE /api/productos/:id/ai               → admin/marketing
       DELETE FÍSICO del registro de producto_ai
       (es contenido regenerable, no es ledger)

REGLAS:
- El campo embedding es vector(1024) — Prisma NO lo soporta nativo. Usá $executeRaw para INSERT/UPDATE.
- Loguear tokens consumidos por cada call (msg.usage.input_tokens, msg.usage.output_tokens).
- Si el modelo IA falla → ApiError 502 con código 'AI_SERVICE_UNAVAILABLE'.
```

---

## 🟢 PROMPT 14 — Módulo ASSISTANT (chat IA con streaming)

```
Implementá el módulo `assistant` — el chat de compra del e-commerce.
Stub-aware igual que ai-content.

UBICACIÓN: src/modules/assistant/

ARCHIVOS:
- assistant.routes.ts
- assistant.controller.ts     → maneja Server-Sent Events (SSE)
- assistant.service.ts        → orquesta RAG: embed → search → claude → persist
- search.service.ts           → query pgvector con $queryRaw
- assistant.schemas.ts

ENDPOINTS:

POST /api/assistant/chat                   → opcional auth (cliente puede ser anónimo)
  body: { mensaje: string, id_sesion?: UUID }
  
  Response: SSE stream
  Cada chunk: data: {"type":"text","content":"..."}\n\n
  Final: data: {"type":"done","id_sesion":"...","productos_referenciados":[...]}\n\n
  
  Lógica del controller:
    1. Setear headers SSE: Content-Type: text/event-stream, Cache-Control: no-cache
    2. Crear/recuperar sesión
    3. Persistir mensaje del usuario
    4. Embeddear mensaje + buscar productos (search.service)
    5. Recuperar últimos 20 mensajes del historial
    6. Stream de Claude:
       Por cada chunk de texto, escribir res.write(...)
       Acumular el texto completo para persistirlo al final
    7. Persistir respuesta del assistant con productos_referenciados
    8. Cerrar el stream

POST /api/assistant/chat-sync              → fallback sin streaming
  Mismo body, response JSON normal { id_sesion, respuesta, productos_referenciados }
  Para clientes que no soportan SSE.

GET  /api/assistant/sesiones               → cliente logueado
  Lista de sus propias sesiones. Útil para "Mis conversaciones".

GET  /api/assistant/sesiones/:id           → cliente o admin
  Detalle de una sesión con todos los mensajes.

GET  /api/admin/sesiones                   → admin
  Todas las sesiones del sistema, paginado.
  Filtros: ?id_cliente, ?desde, ?hasta

search.service.ts:

export async function buscarProductosRelevantes(queryEmbedding: number[], limit = 5) {
  return prisma.$queryRaw<ProductoContextResult[]>`
    SELECT
      p.id_producto, p.nombre, p.precio_venta::float,
      c.nombre AS categoria,
      pai.descripcion_larga,
      STRING_AGG(DISTINCT t.descripcion, ', ' ORDER BY t.descripcion) AS tallas_disponibles,
      STRING_AGG(DISTINCT v.color, ', ') AS colores
    FROM vortex.producto p
    JOIN vortex.categoria_producto c   ON c.id_categoria = p.id_categoria
    JOIN vortex.producto_ai pai        ON pai.id_producto = p.id_producto
    JOIN vortex.variante_producto v    ON v.id_producto = p.id_producto
    JOIN vortex.talla t                ON t.id_talla = v.id_talla
    WHERE p.estado_prod = 'ACT'
      AND v.var_saldo_final > 0
    GROUP BY p.id_producto, p.nombre, p.precio_venta, c.nombre, pai.descripcion_larga
    ORDER BY pai.embedding <=> ${queryEmbedding}::vector
    LIMIT ${limit};
  `
}

assistant.service.ts (resumen):

export async function responderAsistente(
  idSesion: string,
  mensaje: string,
  res: Response                                   // para streaming
) {
  // 1. Persistir user message
  await prisma.chat_mensaje.create({
    data: { id_sesion: idSesion, rol: 'user', contenido: mensaje }
  })
  
  // 2. Embed + search
  const queryEmb = await generarEmbedding(mensaje)         // de ai-content
  const productos = await buscarProductosRelevantes(queryEmb, 5)
  
  // 3. Historial
  const historial = await prisma.chat_mensaje.findMany({
    where: { id_sesion: idSesion },
    orderBy: { fecha: 'asc' },
    take: 20
  })
  
  // 4. Contexto para Claude
  const contextoProductos = productos.map(p => /* ... formatear ... */).join('\n\n')
  
  // 5. Stream desde Claude
  let respuestaCompleta = ''
  
  if (ANTHROPIC_STUB_MODE) {
    // STUB: responde con texto fake en chunks simulados
    const fake = `Hola! Te recomiendo el ${productos[0]?.nombre || 'Hoodie Phantom'}, ` +
                 `está disponible y se ve genial. (Esto es una respuesta stub — configurá ANTHROPIC_API_KEY para respuestas reales.)`
    for (const chunk of fake.match(/.{1,20}/g) || []) {
      res.write(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`)
      await new Promise(r => setTimeout(r, 50))
      respuestaCompleta += chunk
    }
  } else {
    const stream = await anthropic!.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT_ASSISTANT(contextoProductos),
      messages: historial.map(m => ({
        role: m.rol as 'user' | 'assistant',
        content: m.contenido
      }))
    })
    
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const text = event.delta.text
        respuestaCompleta += text
        res.write(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`)
      }
    }
  }
  
  // 6. Persistir respuesta + IDs de productos referenciados
  await prisma.chat_mensaje.create({
    data: {
      id_sesion: idSesion,
      rol: 'assistant',
      contenido: respuestaCompleta,
      productos_referenciados: productos.map(p => p.id_producto)
    }
  })
  
  // 7. Update fecha_ultimo_mensaje en chat_sesion
  await prisma.chat_sesion.update({
    where: { id_sesion: idSesion },
    data: { fecha_ultimo_mensaje: new Date() }
  })
  
  // 8. Cerrar stream
  res.write(`data: ${JSON.stringify({
    type: 'done',
    id_sesion: idSesion,
    productos_referenciados: productos.map(p => p.id_producto)
  })}\n\n`)
  res.end()
}

REGLAS:
- chat_mensaje y chat_sesion son APPEND-ONLY (excepto fecha_ultimo_mensaje en sesión).
- NUNCA borrar ni editar mensajes.
- Validar tamaño del mensaje del usuario: max 500 chars en el schema Zod.
- Rate limit: aplicá rate-limit por IP en este endpoint (10 mensajes / minuto).
  Usá express-rate-limit.

INSTALÁ: npm install express-rate-limit@7.5.0

src/middleware/rateLimit.ts:
import rateLimit from 'express-rate-limit'

export const chatRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Demasiados mensajes. Esperá un momento.' } }
})
```

---

## 🟢 PROMPT 15 — Módulo DASHBOARD hasta aca esta 

```
Implementá el módulo `dashboard` — métricas para el backoffice.
Es solo lectura, queries pesados.

UBICACIÓN: src/modules/dashboard/

ENDPOINTS (todos requieren admin o reportes):

GET /api/dashboard/kpis                   → tarjetas grandes del top
  Response: {
    ventas_hoy: { total_dinero, cantidad_facturas },
    ventas_mes: { total_dinero, cantidad_facturas, vs_mes_anterior_pct },
    clientes_activos: number,
    clientes_nuevos_mes: number,
    productos_activos: number,
    variantes_sin_stock: number,
    pedidos_pendientes_envio: number,         // factura.estado='PAG'
    pedidos_en_camino: number                  // factura.estado='ENV'
  }

GET /api/dashboard/ventas-por-dia         → ?desde, ?hasta (default últimos 30 días)
  Response: [{ fecha, total_dinero, cantidad_facturas }]
  Para gráfico de líneas con Recharts.

GET /api/dashboard/top-productos          → ?desde, ?hasta, ?limit (default 10)
  Response: [{
    id_producto, nombre,
    categoria, foto_principal,
    cantidad_vendida, total_recaudado
  }]
  Top productos por cantidad vendida en el rango.

GET /api/dashboard/stock-bajo             → variantes con saldo entre 1 y 5
  Response: [{
    id_variante, sku, color, talla,
    producto: { id, nombre, foto_principal },
    saldo_actual
  }]

GET /api/dashboard/uso-ia                 → métricas del asistente
  Response: {
    sesiones_hoy: number,
    sesiones_mes: number,
    mensajes_mes: number,
    tokens_input_mes: number,                  // sum de chat_mensaje.tokens_input
    tokens_output_mes: number,
    productos_mas_recomendados: [{ id, nombre, veces_referenciado }]
  }

GET /api/dashboard/ventas-por-categoria   → ?desde, ?hasta
  Response: [{ categoria, total_dinero, cantidad_unidades }]

OPTIMIZACIÓN:
- Usá raw queries con prisma.$queryRaw donde sea más eficiente que el ORM.
- Cacheá los KPIs por 5 minutos en memoria si los queries son lentos
  (usá un Map simple o lru-cache si querés ser pulcro).
- Los queries con date_trunc son tu amigo para agrupar por día.

REGLAS:
- Solo lectura. Cero efectos secundarios.
- NUNCA mostrar info personal del cliente en stats agregadas (solo IDs y totales).
```

---

## 🟢 PROMPT 16 — Cierre del backend: integración final + hardening

```
Último prompt del backend. Tareas de cierre:

1. RUTAS UNIFICADAS
   src/routes.ts:
   Agrupa todas las rutas de los módulos en un solo router que se monta en /api.
   Orden importa: rutas más específicas primero.
   
   Verificá que app.ts monte así:
     app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }), webhookRoutes)
     app.use(express.json())
     app.use('/api', mainRouter)

2. CORS FINAL
   src/app.ts:
   - El CORS para /api/* debe permitir solo orígenes de env.CORS_ORIGINS
   - El CORS para /api/webhooks/stripe debe ser SIN cors (Stripe no manda Origin)
   - Configurá cors con: { origin, credentials: true }

3. VARIABLES DE ENTORNO FINALES
   Actualizá .env.example con TODAS las variables que se acumularon:
     DATABASE_URL=
     JWT_SECRET=                       # cambiar en prod
     JWT_EXPIRES_IN=7d
     ANTHROPIC_API_KEY=                # opcional, modo stub si vacía
     VOYAGE_API_KEY=                   # opcional, modo stub si vacía
     AZURE_STORAGE_CONNECTION_STRING=  # opcional, modo stub si vacía
     AZURE_BLOB_CONTAINER=vortex-productos
     STRIPE_SECRET_KEY=                # opcional, modo stub si vacía
     STRIPE_WEBHOOK_SECRET=            # solo si Stripe activo
     PORT=3000
     NODE_ENV=development
     CORS_ORIGINS=http://localhost:5173,http://localhost:5174
   
   En env.ts, hacé que las API keys de servicios externos sean OPCIONALES en el schema Zod
   pero loguee un WARN al arrancar si están vacías:
   
   if (!env.ANTHROPIC_API_KEY) console.warn('[WARN] ANTHROPIC_API_KEY no configurada — ai-content y assistant en modo stub')
   if (!env.VOYAGE_API_KEY) console.warn('[WARN] VOYAGE_API_KEY no configurada — embeddings en modo stub')
   if (!env.AZURE_STORAGE_CONNECTION_STRING) console.warn('[WARN] Azure Blob no configurada — fotos en modo stub')
   if (!env.STRIPE_SECRET_KEY) console.warn('[WARN] Stripe no configurada — pagos en modo stub')

4. HARDENING DE SEGURIDAD
   - helmet con default config
   - Rate limit global: 100 req/min por IP en /api/*
   - Rate limit estricto en /api/auth/login-*: 5 intentos/15 min por IP+email
   - express.json con límite de 10kb (excepto webhooks)
   - Trust proxy si está detrás de Azure App Service: app.set('trust proxy', 1)

5. README.md DEL BACKEND
   Generá un README.md con:
   - Cómo correr en desarrollo
   - Cómo correr en producción
   - Variables de entorno requeridas vs opcionales
   - Cómo correr migraciones
   - Lista de endpoints principales por módulo
   - Cómo activar los servicios stub (qué hace falta para que no sean stub)

6. SCRIPT DE HEALTH CHECK COMPLETO
   GET /health (ya existe, expandilo):
   Response: {
     status: 'ok' | 'degraded',
     version: '1.0.0',
     uptime: seconds,
     database: 'ok' | 'fail',
     servicios: {
       anthropic: 'configured' | 'stub',
       voyage: 'configured' | 'stub',
       azureBlob: 'configured' | 'stub',
       stripe: 'configured' | 'stub'
     }
   }

7. SMOKE TESTS BÁSICOS (sin framework de test, solo curl)
   Generá un script bash en scripts/smoke-test.sh que:
   - Verifica /health
   - Hace login backoffice con admin@vortex.ec
   - Lista productos públicos
   - Lista categorías
   - Crea un producto, lo edita, lo desactiva
   
   Cada paso loguea OK / FAIL con colores.

VERIFICACIÓN FINAL:
- npm run dev tiene que arrancar sin warnings críticos
- /health debe responder 200 con servicios marcados según las keys configuradas
- Si el backend arranca con TODOS los servicios en modo stub, debe seguir siendo 100% funcional
  para todo lo que NO depende de IA o pagos reales (es decir: catálogo, carrito, ajustes manuales)
```

---

## 🔴 STOP DEL DÍA 2 — Punto de control

Tenés que tener funcionando, end-to-end:
- ✅ Auditoría transversal en todos los módulos
- ✅ Inventario completo (ajustes + ledger)
- ✅ Promociones + helper de descuento
- ✅ Carrito persistente
- ✅ Checkout transaccional con todos los pasos
- ✅ Pagos + webhook Stripe (stub)
- ✅ Facturas con cambio de estado
- ✅ Galería de fotos en Azure Blob (stub si no hay key)
- ✅ AI content generation (stub)
- ✅ Asistente de chat con streaming (stub)
- ✅ Dashboard con KPIs
- ✅ Hardening: rate limits, CORS, helmet
- ✅ Modo stub para todos los servicios externos

Probá el flujo completo de compra:
1. Login cliente
2. Agregar al carrito
3. Crear dirección
4. Preview de checkout
5. Iniciar pago en TRANSFERENCIA (porque Stripe está en stub)
6. Confirmar manualmente como admin
7. Cambiar estado a ENV → ENT
8. Ver en /api/facturas/me/:id

Si todo ese flujo anda → el backend está LISTO.
Día 3: arrancamos backoffice.

---

## NOTAS PARA CUANDO TENGAS LAS API KEYS

### Anthropic
1. Conseguí la key en console.anthropic.com
2. Agregala a .env: ANTHROPIC_API_KEY=sk-ant-...
3. Reiniciá el backend
4. El modo stub se desactiva automáticamente
5. Probá con: POST /api/productos/P000001/generate-ai

### Voyage AI
1. Conseguí la key en dash.voyageai.com
2. Agregala a .env: VOYAGE_API_KEY=pa-...
3. Reiniciá el backend
4. Probá con: POST /api/productos/P000001/generate-ai (incluye embedding real)

### Stripe
1. Conseguí las keys en dashboard.stripe.com
2. .env: STRIPE_SECRET_KEY=sk_test_... (modo test primero)
3. Para el webhook local: instalá stripe CLI, corré `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. La CLI te da el STRIPE_WEBHOOK_SECRET para el .env

### Azure Blob
1. Creá una storage account en portal.azure.com
2. Creá un container llamado 'vortex-productos' con acceso público de lectura
3. Copiá la connection string a .env: AZURE_STORAGE_CONNECTION_STRING=...
4. Reiniciá el backend
5. Probá subiendo una foto: POST /api/productos/P000001/fotos
