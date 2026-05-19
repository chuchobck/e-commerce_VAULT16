/**
 * VAULT 16 — Chequeo de contrato backend ↔ frontend
 *
 * Recorre los endpoints que consume el frontend hoy y valida con Zod que la
 * forma de cada respuesta coincida con lo que esperan los mappers de
 * `frontend/src/shared/lib/mappers.ts`.
 *
 * Uso:
 *   npm run check:contracts            (desde backend/, ver backend/package.json)
 *
 * Asume backend corriendo en http://localhost:3000 (o BASE_URL env).
 * Sale con código = cantidad de endpoints que fallaron.
 */

import { z, ZodError, ZodSchema } from 'zod';

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000/api/v1';
const TEST_EMAIL = 'test@vault16.ec';
const TEST_PASS = 'Vault16Test!';

// ─── Helpers HTTP ────────────────────────────────────────────────────────────

let token: string | null = null;

interface HttpResult {
  status: number;
  body: unknown;
  text: string;
}

async function http(
  method: string,
  path: string,
  body?: unknown,
): Promise<HttpResult> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed: unknown = text;
  try { parsed = JSON.parse(text); } catch { /* keep raw */ }
  return { status: res.status, body: parsed, text };
}

// ─── Reporting ───────────────────────────────────────────────────────────────

interface Check {
  label: string;
  status: 'OK' | 'FAIL' | 'SKIP';
  detail?: string;
}
const checks: Check[] = [];

function ok(label: string, detail?: string) {
  checks.push({ label, status: 'OK', detail });
  console.log(`[OK]   ${label}${detail ? ' — ' + detail : ''}`);
}
function fail(label: string, detail: string) {
  checks.push({ label, status: 'FAIL', detail });
  console.log(`[FAIL] ${label} — ${detail}`);
}
function skip(label: string, detail: string) {
  checks.push({ label, status: 'SKIP', detail });
  console.log(`[SKIP] ${label} — ${detail}`);
}

function formatZodError(err: ZodError): string {
  return err.errors
    .slice(0, 5)
    .map((e) => `${e.path.join('.') || '<root>'}: ${e.message}`)
    .join('; ');
}

/**
 * Ejecuta `req` y valida la respuesta con `schema`. Si `expectStatus` se
 * provee, además exige que el status HTTP coincida.
 */
async function check<T>(
  label: string,
  req: () => Promise<HttpResult>,
  schema: ZodSchema<T>,
  opts: { expectStatus?: number } = {},
): Promise<T | null> {
  let r: HttpResult;
  try {
    r = await req();
  } catch (e) {
    fail(label, `red/excepción: ${(e as Error).message}`);
    return null;
  }
  // 429 = rate limit (in-memory, ambiental) → SKIP, no FAIL. Reiniciar el
  // workflow "Backend API" resetea el contador.
  if (r.status === 429) {
    skip(label, 'rate limit (HTTP 429) — reiniciá Backend API y reintentá');
    return null;
  }
  // Por defecto aceptamos cualquier 2xx (igual que axios en el frontend).
  // Si `expectStatus` se especifica, exigimos ese código exacto.
  const statusOk =
    opts.expectStatus !== undefined
      ? r.status === opts.expectStatus
      : r.status >= 200 && r.status < 300;
  if (!statusOk) {
    const snippet =
      typeof r.body === 'object' && r.body !== null
        ? JSON.stringify(r.body).slice(0, 200)
        : r.text.slice(0, 200);
    const exp = opts.expectStatus !== undefined ? String(opts.expectStatus) : '2xx';
    fail(label, `HTTP ${r.status} (esperado ${exp}) — ${snippet}`);
    return null;
  }
  const parsed = schema.safeParse(r.body);
  if (!parsed.success) {
    fail(label, `shape inválido: ${formatZodError(parsed.error)}`);
    return null;
  }
  ok(label, `HTTP ${r.status}`);
  return parsed.data;
}

// ─── Schemas Zod ─────────────────────────────────────────────────────────────
// Solo replicamos los campos que el frontend realmente lee en los *Api.ts y
// los mappers de `frontend/src/shared/lib/mappers.ts`. Cualquier campo extra
// del backend se ignora (Zod no es strict por defecto).

const decimalLike = z.union([z.string(), z.number()]);

const ApiOk = <T extends ZodSchema>(data: T) =>
  z.object({ success: z.literal(true), data });

const RawCategoria = z.object({
  id_categoria: z.string(),
  nombre: z.string(),
  descripcion: z.string().nullable().optional(),
  estado: z.string().optional(),
});

const RawFoto = z.object({
  id_foto: z.number().optional(),
  url_foto: z.string(),
  es_principal: z.boolean().optional(),
  orden: z.number().optional(),
  alt_text: z.string().nullable().optional(),
});

const RawVariante = z.object({
  id_variante: z.number(),
  id_producto: z.string(),
  id_talla: z.number(),
  color: z.string(),
  sku: z.string(),
  var_saldo_final: z.number().optional(),
  talla: z.object({ id_talla: z.number(), descripcion: z.string() }).optional(),
});

const RawProducto = z.object({
  id_producto: z.string(),
  id_categoria: z.string(),
  nombre: z.string(),
  descripcion_corta: z.string().nullable().optional(),
  precio_venta: decimalLike,
  estado_prod: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  producto_fotos: z.array(RawFoto).optional(),
  variante_producto: z.array(RawVariante).optional(),
  categoria_producto: RawCategoria.optional(),
});

const ProductosListResponse = z.object({
  success: z.literal(true),
  data: z.array(RawProducto),
  meta: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

const RawPromocion = z.object({
  id_promocion: z.number(),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  porcentaje_descuento: decimalLike,
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  estado: z.string(),
  promocion_detalle: z
    .array(
      z.object({
        id_producto: z.string(),
        producto: z.object({
          id_producto: z.string(),
          nombre: z.string(),
          precio_venta: decimalLike,
          estado_prod: z.string(),
          producto_fotos: z.array(RawFoto).optional(),
        }),
      }),
    )
    .optional(),
});

const RawCliente = z.object({
  id_cliente: z.number(),
  email: z.string(),
  nombre1: z.string(),
  apellido1: z.string(),
  telefono: z.string().nullable().optional(),
  ruc_cedula: z.string().optional(),
  email_verificado: z.boolean().optional(),
  estado: z.string().optional(),
});

const RawDireccion = z.object({
  id_direccion: z.number(),
  id_cliente: z.number(),
  alias: z.string(),
  nombre_destinatario: z.string(),
  telefono_contacto: z.string(),
  provincia: z.string(),
  ciudad: z.string(),
  direccion: z.string(),
  referencia: z.string().nullable().optional(),
  codigo_postal: z.string().nullable().optional(),
  es_principal: z.boolean(),
  activa: z.boolean().optional(),
});

const RawCarritoItem = z.object({
  id_carrito_det: z.number(),
  cantidad: z.number(),
  fecha_agregado: z.string().optional(),
  variante: z.object({
    id: z.number(),
    color: z.string(),
    talla: z.string(),
    sku: z.string(),
    stock_disponible: z.number(),
  }),
  producto: z.object({
    id: z.string(),
    nombre: z.string(),
    foto_principal: z.string().nullable(),
    precio_venta: decimalLike,
  }),
  descuento_pct: z.number(),
  subtotal: decimalLike,
  descuento_aplicado: decimalLike,
  total_linea: decimalLike,
});

const RawCarrito = z.object({
  id_carrito: z.number().nullable(),
  id_cliente: z.number(),
  items: z.array(RawCarritoItem),
  resumen: z.object({
    subtotal: decimalLike,
    descuento_total: decimalLike,
    total: decimalLike,
    cantidad_items: z.number(),
  }),
});

const RawValidacionCarrito = z.object({
  valido: z.boolean(),
  problemas: z.array(
    z.object({
      id_item: z.number().nullable(),
      motivo: z.string(),
      detalle: z.string(),
    }),
  ),
});

const CheckoutPreviewResponse = ApiOk(
  z.object({
    items: z.array(
      z.object({
        id_variante: z.number(),
        cantidad: z.number(),
        precio_unitario: z.number(),
        subtotal_linea: z.number(),
        producto: z.object({ nombre: z.string() }),
        variante: z.object({ color: z.string(), talla: z.string(), sku: z.string() }),
      }),
    ),
    subtotal: z.number(),
    descuento_total: z.number(),
    total: z.number(),
  }),
);

const IniciarPagoTarjetaResponse = ApiOk(
  z.object({
    metodo: z.literal('TARJETA'),
    total: z.number(),
  }),
);

const ConfirmarTarjetaResponse = ApiOk(
  z.object({
    id_factura: z.string(),
    total: z.number(),
    estado: z.string(),
  }),
);

const RawDetalleFactura = z.object({
  id_detalle: z.number().optional(),
  cantidad: z.number(),
  precio_unitario: decimalLike,
  subtotal: decimalLike,
  variante_producto: z
    .object({
      id_variante: z.number(),
      sku: z.string(),
      color: z.string(),
      id_producto: z.string(),
      talla: z.object({ descripcion: z.string() }).optional(),
      producto: z
        .object({
          nombre: z.string(),
          precio_venta: decimalLike,
          producto_fotos: z.array(RawFoto).optional(),
        })
        .optional(),
    })
    .optional(),
});

const RawFacturaList = z.object({
  id_factura: z.string(),
  id_cliente: z.number(),
  fecha_emision: z.string(),
  estado: z.string(),
  subtotal: decimalLike,
  total: decimalLike,
  descuento_total: decimalLike.optional(),
  impuestos: decimalLike.optional(),
  detalle_factura: z.array(RawDetalleFactura).optional(),
  _count: z.object({ detalle_factura: z.number().optional() }).optional(),
});

const FacturasListResponse = z.object({
  success: z.literal(true),
  data: z.array(RawFacturaList),
  meta: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

const RawFacturaFull = RawFacturaList.extend({
  direccion_cliente: RawDireccion.nullable().optional(),
  detalle_factura: z.array(RawDetalleFactura).optional(),
});

// ─── Runner ──────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔎 Contract check — ${BASE_URL}\n`);

  // 1) LOGIN ──────────────────────────────────────────────────────────────────
  const LoginResponse = ApiOk(
    z.object({ token: z.string(), cliente: RawCliente }),
  );
  const login = await check(
    'POST /auth/login-cliente',
    () => http('POST', '/auth/login-cliente', { email: TEST_EMAIL, password: TEST_PASS }),
    LoginResponse,
  );
  if (!login) {
    // Sin token no tiene sentido seguir; saltamos los endpoints autenticados
    // pero llegamos al resumen para mantener exit code = #FAIL.
    console.log('\n⚠️  Login no devolvió token — saltando endpoints autenticados.');
  } else {
    token = login.data.token;
  }

  // 2) CATÁLOGO ──────────────────────────────────────────────────────────────
  const productos = await check(
    'GET /productos',
    () => http('GET', '/productos?page=1&pageSize=20'),
    ProductosListResponse,
  );

  // Buscamos un producto cuyo detalle traiga una variante con stock; lo
  // reutilizamos para el detalle Y para el flujo de carrito/checkout. Así
  // garantizamos que los endpoints conocidos como bug (tarjeta/confirmar)
  // sí se ejerciten y aparezcan como FAIL.
  let detailPid: string | null = null;
  let idVariante: number | null = null;
  if (productos && productos.data.length > 0) {
    for (const p of productos.data) {
      const r = await http('GET', `/productos/${p.id_producto}`);
      const data = (r.body as { data?: { variante_producto?: { id_variante: number; var_saldo_final?: number }[] } }).data;
      const variantes = data?.variante_producto ?? [];
      const conStock = variantes.find((v) => (v.var_saldo_final ?? 0) > 0);
      if (conStock) {
        detailPid = p.id_producto;
        idVariante = conStock.id_variante;
        break;
      }
    }
    // Si no encontramos ninguna variante con stock, igual validamos shape
    // del detalle del primer producto.
    if (detailPid === null) detailPid = productos.data[0].id_producto;
    await check(
      `GET /productos/${detailPid}`,
      () => http('GET', `/productos/${detailPid}`),
      ApiOk(RawProducto),
    );
  } else {
    skip('GET /productos/:id', 'lista de productos vacía');
  }

  await check(
    'GET /categorias',
    () => http('GET', '/categorias'),
    ApiOk(z.array(RawCategoria)),
  );

  await check(
    'GET /promociones',
    () => http('GET', '/promociones'),
    ApiOk(z.array(RawPromocion)),
  );

  // 3) AUTH extras ───────────────────────────────────────────────────────────
  // Register: email único por corrida — el frontend usa este endpoint.
  const uniqueEmail = `contract+${Date.now()}@vault16.ec`;
  await check(
    'POST /auth/register-cliente',
    () => http('POST', '/auth/register-cliente', {
      email: uniqueEmail,
      password: 'Contract123!',
      ruc_cedula: String(Date.now()).slice(-10),
      nombre1: 'Contract',
      apellido1: 'Check',
    }),
    ApiOk(z.object({ cliente: RawCliente, message: z.string() })),
    { expectStatus: 201 },
  );

  await check(
    'POST /auth/forgot-password-cliente',
    () => http('POST', '/auth/forgot-password-cliente', { email: TEST_EMAIL }),
    ApiOk(z.object({ message: z.string() })),
  );

  // 4) CLIENTES/ME ───────────────────────────────────────────────────────────
  // Bug conocido (follow-up #12): orden de rutas hace que /me caiga en /:id
  // → admin guard → 403. El check DEBE fallar ruidosamente hasta que se
  // arregle.
  await check(
    'GET /clientes/me',
    () => http('GET', '/clientes/me'),
    ApiOk(RawCliente),
  );

  // 5) DIRECCIONES ───────────────────────────────────────────────────────────
  const direcciones = await check(
    'GET /clientes/me/direcciones',
    () => http('GET', '/clientes/me/direcciones'),
    ApiOk(z.array(RawDireccion)),
  );

  let idDireccion: number | null = direcciones?.data[0]?.id_direccion ?? null;
  if (idDireccion === null) {
    // No hay direcciones → crear una para poder probar checkout.
    const created = await check(
      'POST /clientes/me/direcciones',
      () => http('POST', '/clientes/me/direcciones', {
        alias: 'Contract Check',
        nombre_destinatario: 'Tester Contrato',
        telefono_contacto: '0999999999',
        provincia: 'Pichincha',
        ciudad: 'Quito',
        direccion: 'Av. Test 123 y Endpoints',
        es_principal: true,
      }),
      ApiOk(RawDireccion),
      { expectStatus: 201 },
    );
    idDireccion = created?.data.id_direccion ?? null;
  } else {
    // Igual ejercitamos POST + flag de no-principal para no tocar el default
    const created = await check(
      'POST /clientes/me/direcciones',
      () => http('POST', '/clientes/me/direcciones', {
        alias: `tmp-${Date.now()}`.slice(0, 30),
        nombre_destinatario: 'Tester Contrato',
        telefono_contacto: '0999999999',
        provincia: 'Pichincha',
        ciudad: 'Quito',
        direccion: 'Av. Test 123',
        es_principal: false,
      }),
      ApiOk(RawDireccion),
      { expectStatus: 201 },
    );
    // No hay endpoint DELETE — queda como ruido aceptable (alias tmp-*).
    void created;
  }

  // 6) CARRITO ───────────────────────────────────────────────────────────────
  // Estado limpio antes de probar mutaciones.
  await check(
    'DELETE /carrito  (cleanup pre)',
    () => http('DELETE', '/carrito'),
    ApiOk(RawCarrito),
  );

  await check(
    'GET /carrito  (vacío)',
    () => http('GET', '/carrito'),
    ApiOk(RawCarrito),
  );

  // `idVariante` ya se buscó arriba (sección catálogo) — reutilizamos.
  let idCarritoDet: number | null = null;
  if (idVariante === null) {
    skip('POST /carrito/items', 'no se encontró variante con stock');
  } else {
    const added = await check(
      'POST /carrito/items',
      () => http('POST', '/carrito/items', { id_variante: idVariante, cantidad: 1 }),
      ApiOk(RawCarrito),
      { expectStatus: 201 },
    );
    idCarritoDet = added?.data.items[0]?.id_carrito_det ?? null;
  }

  if (idCarritoDet !== null) {
    await check(
      `PUT /carrito/items/${idCarritoDet}`,
      () => http('PUT', `/carrito/items/${idCarritoDet}`, { cantidad: 2 }),
      ApiOk(RawCarrito),
    );
  } else {
    skip('PUT /carrito/items/:id', 'sin item en carrito');
  }

  await check(
    'GET /carrito/validar',
    () => http('GET', '/carrito/validar'),
    ApiOk(RawValidacionCarrito),
  );

  // 7) CHECKOUT ──────────────────────────────────────────────────────────────
  if (idDireccion === null) {
    skip('POST /checkout/preview', 'sin dirección de envío');
    skip('POST /checkout/iniciar-pago (TARJETA)', 'sin dirección de envío');
    skip('POST /checkout/tarjeta/confirmar', 'sin dirección de envío');
  } else if (idCarritoDet === null) {
    skip('POST /checkout/preview', 'sin items en carrito');
    skip('POST /checkout/iniciar-pago (TARJETA)', 'sin items en carrito');
    skip('POST /checkout/tarjeta/confirmar', 'sin items en carrito');
  } else {
    await check(
      'POST /checkout/preview',
      () => http('POST', '/checkout/preview', { id_direccion_envio: idDireccion }),
      CheckoutPreviewResponse,
    );

    await check(
      'POST /checkout/iniciar-pago (TARJETA)',
      () => http('POST', '/checkout/iniciar-pago', {
        id_direccion_envio: idDireccion,
        metodo_pago: 'TARJETA',
      }),
      IniciarPagoTarjetaResponse,
    );

    // Bug conocido (follow-up #11): MAX() + FOR UPDATE en facturaNumber.ts
    // tumba la transacción con 500. El check debe fallar ruidosamente.
    await check(
      'POST /checkout/tarjeta/confirmar',
      () => http('POST', '/checkout/tarjeta/confirmar', { id_direccion_envio: idDireccion }),
      ConfirmarTarjetaResponse,
      { expectStatus: 201 },
    );
  }

  // Limpieza del carrito (no rompe el resultado si falla).
  await http('DELETE', '/carrito');

  // 8) FACTURAS ──────────────────────────────────────────────────────────────
  const facturas = await check(
    'GET /facturas/me',
    () => http('GET', '/facturas/me'),
    FacturasListResponse,
  );

  if (facturas && facturas.data.length > 0) {
    const id = facturas.data[0].id_factura;
    await check(
      `GET /facturas/me/${id}`,
      () => http('GET', `/facturas/me/${id}`),
      ApiOk(RawFacturaFull),
    );
  } else {
    skip('GET /facturas/me/:id', 'cliente no tiene facturas');
  }

  // ─── Resumen ─────────────────────────────────────────────────────────────
  const okCount = checks.filter((c) => c.status === 'OK').length;
  const failCount = checks.filter((c) => c.status === 'FAIL').length;
  const skipCount = checks.filter((c) => c.status === 'SKIP').length;

  console.log(`\n──────────────────────────────────────────`);
  console.log(`OK: ${okCount}   FAIL: ${failCount}   SKIP: ${skipCount}`);
  console.log(`──────────────────────────────────────────`);

  if (failCount > 0) {
    console.log('\nFallaron:');
    for (const c of checks.filter((x) => x.status === 'FAIL')) {
      console.log(`  • ${c.label}: ${c.detail}`);
    }
  }

  process.exit(failCount);
}

main().catch((e) => {
  console.error('💥 Error fatal en contract-check:', e);
  process.exit(99);
});
