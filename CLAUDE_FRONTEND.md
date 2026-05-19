# VORTEX Frontend E-commerce — Reglas para el Agente

## Stack y versiones (NO desviarse)

| Dependencia             | Versión   |
| ----------------------- | --------- |
| React                   | 18.3.1    |
| TypeScript              | 5.7.3     |
| Vite                    | 5.4.19    |
| Tailwind CSS            | 3.4.17    |
| Zustand                 | 5.0.1     |
| @tanstack/react-query   | 5.62.0    |
| react-router-dom        | 6.28.0    |
| react-hook-form         | 7.54.0    |
| @hookform/resolvers     | 3.9.1     |
| zod                     | 3.24.1    |
| axios                   | 1.7.9     |
| framer-motion           | 11.15.0   |
| lucide-react            | 0.468.0   |
| react-helmet-async      | 2.0.5     |
| react-hot-toast         | 2.4.1     |
| clsx                    | 2.1.1     |
| tailwind-merge          | 2.5.5     |

### Dev dependencies

| Dependencia              | Versión   |
| ------------------------ | --------- |
| tailwindcss              | 3.4.17    |
| autoprefixer             | 10.4.20   |
| postcss                  | 8.5.1     |
| tailwind-scrollbar-hide  | 2.0.0     |

---

## Paleta — Asphalt (definida en tailwind.config.js)

- **Fondos:** `bg-base`, `bg-surface`, `bg-card`, `bg-hover`
- **Texto:** `text-primary`, `text-secondary`, `text-muted`
- **Acento:** `accent` (azul eléctrico — **SOLO** en CTAs, precios, links activos)
- **Estados:** `status-success`, `status-warning`, `status-danger`
- **Dark mode:** class strategy, toggle vive en `uiStore.ts`

---

## Arquitectura: features por módulo

```
src/features/<nombre>/
├── components/
├── hooks/
├── api/
├── pages/
├── schemas/
└── stores/
```

---

## Reglas inviolables

1. **NO** HTML `<form>` con `onSubmit` nativo — usar `react-hook-form` siempre.
2. **NO** `localStorage` directo — usar Zustand persist middleware.
3. **NO** `any` salvo justificación en comentario.
4. Imports absolutos con alias `@/` → `src/`.
5. **NO** inventar endpoints — los endpoints válidos están listados al final.
6. Mobile-first: probar en 375 px antes de declarar done.
7. Loading states en **TODAS** las queries — nada de pantalla en blanco.
8. Error boundaries en cada page.
9. Accesibilidad: `aria-label` en iconos, `focus-visible` siempre.
10. Imágenes con `loading="lazy"` excepto las del above-the-fold (hero).
11. **APLICAR LAS 10 HEURÍSTICAS DE NIELSEN** — ver sección al final.

---

## Convenciones de naming

| Tipo         | Convención                | Ejemplo              |
| ------------ | ------------------------- | -------------------- |
| Componentes  | PascalCase                | `ProductCard.tsx`    |
| Hooks        | camelCase con prefijo use | `useProducto.ts`     |
| Stores       | camelCase con sufijo Store| `cartStore.ts`       |
| Constantes   | UPPER_SNAKE_CASE          | `MAX_CART_ITEMS`     |
| Tipos Zod    | `z.infer<typeof XSchema>` | `type X = z.infer<typeof XSchema>` |

---

## Endpoints del backend

**Base:** `import.meta.env.VITE_API_URL` (`http://localhost:3000`)

> [!IMPORTANT]
> Los endpoints válidos son los listados en el backend existente. **NO inventar endpoints.** Si necesitás uno que no existe, **preguntá antes.**

---

## PROMPT MAESTRO

Vamos a construir **VORTEX E-commerce** completo. Tienda streetwear urbana con asistente IA.
Backend en `http://localhost:3000` ya listo.

### LEE PRIMERO:
1. Este archivo (`CLAUDE_FRONTEND.md`) — reglas inviolables
2. `tailwind.config.js` — paleta Asphalt definitiva
3. La sección "NIELSEN 10 — APLICACIÓN OBLIGATORIA" al final

---

## FASE 0 — BOOTSTRAP

```bash
# 1. Scaffold Vite + React + TypeScript
npm create vite@latest . -- --template react-ts && npm install

# 2. Dependencias EXACTAS
npm install react-router-dom@6.28.0 axios@1.7.9 \
  @tanstack/react-query@5.62.0 zustand@5.0.1 \
  react-hook-form@7.54.0 @hookform/resolvers@3.9.1 zod@3.24.1 \
  framer-motion@11.15.0 lucide-react@0.468.0 \
  clsx@2.1.1 tailwind-merge@2.5.5 \
  react-helmet-async@2.0.5 react-hot-toast@2.4.1

npm install -D tailwindcss@3.4.17 autoprefixer@10.4.20 postcss@8.5.1 \
  tailwind-scrollbar-hide@2.0.0

# 3. Inicializar Tailwind
npx tailwindcss init -p
```

4. Reemplazar `tailwind.config.js` con la paleta Asphalt adjunta.
5. `vite.config.ts` con alias `@/` → `src/`, `tsconfig` con `paths`.
6. `.env`: `VITE_API_URL=http://localhost:3000`

---

## FASE 1 — FOUNDATION

Foundation completa:
- `lib/axios` — instancia configurada con interceptors
- `queryClient` — configuración de React Query
- `utils` — helpers (`cn`, formateo, etc.)
- `types` — tipos globales
- `sizeChart` — tabla de tallas
- `sizeCalculator` — cálculo de talla recomendada

---

## FASE 2 — STORES (Zustand)

| Store       | Responsabilidad                                  |
| ----------- | ------------------------------------------------ |
| `uiStore`   | Dark mode toggle, sidebar, modals                |
| `authStore` | Token, usuario, login/logout                     |
| `cartStore` | Items del carrito, sincronización con backend    |
| `chatStore` | Historial de chat con asistente IA               |

---

## FASE 3 — UI BASE

UI base + Header + ProtectedRoute + ScrollToTop + **Footer completo** (ver sección abajo).

---

## HEADER — ESPECIFICACIÓN EXACTA

Una sola línea utility:

```
[VORTEX]    [🔍 Buscar...]              [☀️/🌙] [👤▾] [🛒 3]
```

- Sticky top, `h-16` desktop / `h-14` mobile, `z-sticky`
- Mi Cuenta solo via dropdown del icono 👤
- Mobile: hamburger izquierda → drawer con todas las links

---

## FOOTER — ESPECIFICACIÓN EXACTA

Layout: 4 columnas en desktop, stack en mobile.
`bg-asphalt-900` / `dark:bg-asphalt-950` (siempre fondo oscuro).
Padding generoso: `py-16 px-8`.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  COL 1 — MARCA              COL 2 — TIENDA         COL 3 — MI CUENTA   │
│                                                                         │
│  [VORTEX]                   Tienda                  Mi cuenta           │
│  logo grande blanco         ─────                   ─────               │
│                             Catálogo (/catalogo)    Iniciar sesión      │
│  "Streetwear urbano,        Hoodies (HOO)           Crear cuenta        │
│   hecho en Ecuador"         T-Shirts (TEE)          Mis pedidos         │
│                             Pants (PAN)             Mis direcciones     │
│  [IG] [X] [TT]             Jackets (JAC)           Mis medidas         │
│  iconos lucide,             Accesorios (ACC)        Mi perfil           │
│  hover:text-accent          Sets (SET)                                  │
│                             Promociones                                 │
│                             Drops                                       │
│                                                                         │
│                             COL 4 — SOPORTE                             │
│                                                                         │
│                             Soporte                                     │
│                             ─────                                       │
│                             Contacto                                    │
│                             Envíos                                      │
│                             Devoluciones                                │
│                             Guía de tallas                              │
│                             Preguntas frecuentes                        │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  © 2026 VORTEX · Términos · Privacidad · Hecho en Ecuador 🇪🇨          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Reglas del Footer

- **COL 2** (Tienda) consume `useCategorias()` para listar categorías dinámicamente. Cada link va a `/categoria/:idCategoria`, **NO** a `/catalogo?categoria=X` (mejor SEO).
- **COL 3** (Mi cuenta): si está logueado muestra "Cerrar sesión" en lugar de "Iniciar sesión / Crear cuenta".
- Texto secundario en `asphalt-300`, headers en `asphalt-100`, hover transition a `accent`.
- Newsletter CTA **NO** va en el footer — va como sección propia en home.
- Barra inferior con `border-t border-asphalt-700`, `py-6`.

---

## HOME PAGE — ESPECIFICACIÓN COMPLETA

El home es la primera y más crítica página. Se construye en **7 bloques** verticales, cada uno con animación fade-in al entrar al viewport (`framer-motion` + `whileInView` con `once: true`).

### BLOQUE 1 — HERO SPLIT (above-the-fold, sin scroll)

- **Altura:** `calc(100vh - 64px)` (viewport menos header)
- **Layout:** `grid grid-cols-1 lg:grid-cols-2` (apilado mobile, lado a lado desktop)
- Sin padding lateral — full-width edge-to-edge

**LADO IZQUIERDO (`lg:col-span-1`):**
- `bg-bg-base`, `flex flex-col justify-center`, `px-8 lg:px-16 py-12`
- Pre-titular en accent: `"DROP 001 · DISPONIBLE AHORA"`
- Título HUGE: `text-4xl lg:text-6xl font-semibold`
  - Línea 1: `"Streetwear que se siente."`
  - Línea 2: `"Vortex 2026."` (con `text-text-secondary`)
- Tagline: `text-lg text-text-secondary max-w-md`
  - `"Hecho en Ecuador. Diseñado para los que no encajan."`
- 2 CTAs side by side (`mt-8`):
  - Button primary: "Ver catálogo" → `/catalogo`
  - Button ghost: "Ver promociones" → `/promociones`
- Marquee horizontal (`mt-12`): 6 nombres/drops ficticios, scroll infinito sutil con framer-motion

**LADO DERECHO (`lg:col-span-1`):**
- Carrusel hero con 4-5 slides
- Aspect ratio: `aspect-square` mobile, `aspect-[5/6]` desktop
- Cada slide:
  - Imagen full-bleed (placeholders: gradientes asphalt + accent)
  - Overlay gradient bottom-to-top
  - Texto bottom-left: eyebrow accent + título + "Explorar →"
  - Dots indicadores en accent cuando activo
- Slides iniciales:
  1. "Hoodies pesados" → `/categoria/HOO`
  2. "Drop 001" → `/promociones`
  3. "Cargo Sombra" → `/producto/P000007`
  4. "Sets coordinados" → `/categoria/SET`
  5. "Asistente IA" → abre chat widget
- Comportamiento: auto-rotate 5s, pausa en hover, dots clickables, swipe mobile, crossfade 600ms

### BLOQUE 2 — TOP / DESTACADOS

- `py-20 max-w-content mx-auto`
- Eyebrow accent: `"MÁS VENDIDOS"`
- Título: `"Top de la temporada"`
- Tagline: `"Lo que la gente está llevando esta semana"`
- Grid: 2 cols mobile, 3 md, 4 lg — 8 productos
- Endpoint: `GET /api/productos?orden=top&limit=8`
- Reutilizar `ProductCard`
- Footer: `"Ver todo el catálogo →"` → `/catalogo`

### BLOQUE 3 — SHOP BY CATEGORY

- `bg-bg-surface py-20`
- Eyebrow: `"EXPLORÁ POR ESTILO"`
- Título: `"Encontrá lo tuyo"`
- Grid: 2×3 mobile, 3 md, 6 lg — 6 categorías (HOO, TEE, PAN, JAC, ACC, SET)
- Cada card: aspect-square, overlay oscuro, nombre centrado, hover scale 1.03
- Click → `/categoria/:idCategoria`

### BLOQUE 4 — PROMOCIÓN ACTIVA (condicional)

- Solo si `GET /api/promociones` devuelve al menos una vigente
- Banner full-width ~400px, gradient `asphalt-900 → accent-950`
- Imagen editorial izquierda (50%) + texto derecha
- Eyebrow accent: `"OFERTA POR TIEMPO LIMITADO"`
- Título: nombre de la promo
- Porcentaje destacado: `"−15%"`
- CTA: `"Ver productos en oferta"` → `/promociones`
- Countdown si `fecha_fin < 7 días`

### BLOQUE 5 — NOVEDADES / NEW IN

- `py-20 max-w-content mx-auto`
- Eyebrow: `"ACABA DE LLEGAR"`
- Título: `"Novedades"`
- Grid igual al de top
- Endpoint: `GET /api/productos?orden=reciente&limit=8`

### BLOQUE 6 — EDITORIAL (sobre la marca)

- `bg-asphalt-900 text-white py-24`
- Grid: 1 col mobile, 2 desktop
- Izquierda: imagen editorial (placeholder gradient)
- Derecha: `p-12`
  - Eyebrow: `"VORTEX WAY"`
  - Título: `"No es ropa. Es identidad."`
  - Párrafo sobre la marca
  - Link: `"Conocenos más →"` → `/acerca`

### BLOQUE 7 — NEWSLETTER CTA

- `bg-bg-base py-16`, centrado `max-w-2xl mx-auto text-center`
- Título: `"No te pierdas el próximo drop"`
- Tagline: `"Suscribite y enterate primero. Sin spam."`
- Form inline: input email + button "Suscribirme" (stack mobile, side-by-side desktop)
- Validación con Zod (email format)
- Submit: toast `"Listo, te avisamos cuando salga el próximo drop."`
- Sin endpoint real — `console.log` + toast

### Notas generales del Home

- Cada bloque: fade-in al scrollear (`whileInView` con `once: true`)
- **NO** parallax pesado
- Bloque 1 imágenes: `loading="eager"` (above-the-fold)
- Resto de imágenes: `loading="lazy"`
- Mobile: menos altura, menos padding
- CTAs llevan a destinos reales o placeholder "Próximamente"

---

## CATÁLOGO PAGE — FILTROS

Filtros sidebar izquierda (280px desktop, drawer bottom mobile):

### CATEGORÍA
- Checkboxes con count por categoría (consume `useCategorias`)

### TALLA (chips multi-select)
- `[XS] [S] [M] [L] [XL] [XXL] [ÚNICA]`
- Click toggle, deshabilita las que no aplican

### COLOR (chips con preview)
- Circles con el color real + nombre
- Consume colores únicos de variantes

### PRECIO
- Slider doble: $0 → $200
- Inputs numéricos para precisión

### OTROS
- `[ ] Solo con stock`
- `[ ] En promoción`

### Footer del sidebar
- Botón "Limpiar filtros" (ghost)
- Contador "X productos encontrados"

> [!IMPORTANT]
> **Regla crítica:** Los filtros se sincronizan con la URL (search params). Cambiar filtros actualiza la URL → se puede compartir un link con filtros aplicados. `useFiltros()` lee y escribe en URL con `useSearchParams` de react-router.

---

## FASES 4–6

- **Fase 4:** Router completo con rutas protegidas
- **Fase 5:** Features (auth, producto, carrito, checkout, cuenta, assistant)
- **Fase 6:** Polish final

> Sin cambios respecto al v1 — ver especificación original en PROMPTS.

---

## NIELSEN 10 — APLICACIÓN OBLIGATORIA

> [!CAUTION]
> Cada feature **DEBE** cumplir las 10 heurísticas de Nielsen. No es opcional. Antes de declarar un feature como "done", validar cada punto.

---

### H1 — VISIBILIDAD DEL ESTADO DEL SISTEMA

> El usuario siempre sabe qué está pasando.

- [ ] Skeleton loaders en **TODAS** las queries (no pantallas en blanco)
- [ ] Spinner en botones durante mutations (con texto "Procesando...")
- [ ] Badge en cart icon con cantidad actual (visible siempre)
- [ ] EstadoTimeline en pedido (EMI → PAG → ENV → ENT) con paso actual
- [ ] CheckoutSteps con indicador visual de paso actual
- [ ] Breadcrumbs en producto: Home > Hoodies > Hoodie Phantom
- [ ] Toast inmediato tras cada acción exitosa
- [ ] Indicador "Tu carrito (3)" en drawer header
- [ ] "Cargando más..." al final del infinite scroll
- [ ] Connection status si pierde conexión con backend

---

### H2 — MATCH CON EL MUNDO REAL

> Hablá como hablan los clientes.

- [ ] Lenguaje en español ecuatoriano natural — **NO** en inglés
  - ✗ "Cart" → ✓ "Carrito"
  - ✗ "Checkout" → ✓ "Finalizar compra" / "Pagar"
  - ✗ "Sign in" → ✓ "Iniciar sesión"
- [ ] Precios en USD con `$` adelante: `"$54.99"`
- [ ] Fechas relativas: "hace 2 días", "hoy", "ayer"
- [ ] Tallas como las dice la gente: XS, S, M, L
- [ ] Mensajes humanos, no técnicos
- [ ] Iconos universalmente reconocibles

---

### H3 — CONTROL Y LIBERTAD DEL USUARIO

> Salidas claras, undo disponible.

- [ ] Botón ✕ visible en cada modal y drawer
- [ ] Tecla ESC cierra modales y drawers
- [ ] Click en backdrop cierra modal (confirm si hay cambios sin guardar)
- [ ] Botón "← Volver" en cada step de checkout
- [ ] Toast con "Deshacer" tras eliminar item del carrito (5 segundos)
- [ ] "Cancelar" en cada form, vuelve sin guardar
- [ ] Breadcrumbs clickables para navegar atrás
- [ ] Browser back funciona correctamente en SPA
- [ ] Filtros: botón "Limpiar filtros" en cualquier momento

---

### H4 — CONSISTENCIA Y ESTÁNDARES

> Hacé las cosas igual en toda la app.

- [ ] Botones primary siempre `bg-accent`, secondary siempre `asphalt-700`
- [ ] Misma jerarquía tipográfica en toda la app
- [ ] Iconos **siempre** de `lucide-react` — nunca mezclar
- [ ] Mismo spacing (escala Tailwind: 4, 8, 12, 16, 24)
- [ ] Mismo radius (`rounded-md` inputs, `rounded-lg` cards)
- [ ] Mensajes de error siempre con el mismo tono y formato
- [ ] URLs consistentes: `/producto/:id`, `/categoria/:id`, `/pedido/:id`
- [ ] Productos siempre en aspect ratio **3:4**
- [ ] Reusar `ProductCard` idéntico en home, catálogo, relacionados, recomprar
- [ ] Patrón "Eyebrow + Título + Subtítulo" consistente en bloques de home

---

### H5 — PREVENCIÓN DE ERRORES

> Mejor que mostrar error es no dejar que ocurra.

- [ ] Botón "Agregar al carrito" deshabilitado hasta elegir talla **Y** color
- [ ] Botón "Continuar" en checkout deshabilitado hasta seleccionar dirección
- [ ] Validación inline en forms (Zod) antes de submit
- [ ] Confirm dialog antes de acciones destructivas
- [ ] Selector de talla deshabilita las sin stock
- [ ] Input de cantidad limita máximo al stock disponible
- [ ] Email duplicado se detecta en blur
- [ ] Password fortaleza mínima visualizada en tiempo real
- [ ] Email no verificado bloquea checkout con CTA claro

---

### H6 — RECONOCER MEJOR QUE RECORDAR

> No le hagas memorizar nada al usuario.

- [ ] Carrito persistente entre sesiones (sincronizado con backend)
- [ ] "Tu talla recomendada: M" pre-calculada si tiene medidas
- [ ] Búsquedas recientes en search bar (últimas 5)
- [ ] Productos vistos recientemente ("Volvé a ver")
- [ ] Direcciones guardadas precargadas en checkout
- [ ] Método de pago anterior precargado
- [ ] Categorías visibles en footer + nav
- [ ] Filtros activos visibles como chips sobre el catálogo
- [ ] Autocomplete en search bar

---

### H7 — FLEXIBILIDAD Y EFICIENCIA

> Atajos para avanzados, simplicidad para nuevos.

- [ ] Atajos de teclado:
  - `/` enfoca search bar
  - `ESC` cierra cualquier modal/drawer
  - `Enter` envía form
  - `Shift+Enter` en chat: nueva línea
- [ ] Filtros en URL → links compartibles
- [ ] Botón "Recomprar" en pedidos anteriores
- [ ] Búsqueda semántica con IA
- [ ] Search bar global desde cualquier página
- [ ] Quick add to cart desde catálogo (hover)

---

### H8 — DISEÑO ESTÉTICO Y MINIMALISTA

> Cada elemento que agregás compite con los críticos.

- [ ] Paleta Asphalt — solo accent en CTAs y precios
- [ ] Sin emojis decorativos en UI core
- [ ] Espaciado generoso (`py-16`, `py-20` entre bloques)
- [ ] Font scale moderada — máximo `4xl` en hero
- [ ] Sin sombras gratuitas (solo cards `sm`, modales `xl`)
- [ ] Sin gradientes salvo hero promocional
- [ ] Bordes sutiles
- [ ] Información progresiva (acordeones de descripción)
- [ ] Solo badges necesarios: Stock bajo, Promo, Nuevo

---

### H9 — AYUDAR A RECUPERARSE DE ERRORES

> Cuando falla, dale una salida.

- [ ] Mensaje de error **específico**, NO genérico
- [ ] `ErrorState` component con CTA "Reintentar" + "Volver al inicio"
- [ ] `NotFoundPage` con sugerencias
- [ ] Error de stock al checkout: lista items sin stock con opción de quitar
- [ ] Error de pago: explicación + "Probar otro método"
- [ ] Error de red: "Sin conexión" con botón retry
- [ ] Form errors al lado de cada input afectado
- [ ] Productos inactivos en carrito: permite quitarlos en un click

---

### H10 — AYUDA Y DOCUMENTACIÓN

> Disponible cuando se necesita, no in-your-face.

- [ ] Modal "¿Cuál es mi talla?" con calculadora + tabla + cómo medir
- [ ] FAQ en footer
- [ ] Asistente IA siempre accesible (botón flotante)
- [ ] Tooltips en iconos no obvios
- [ ] Helper text en inputs complejos
- [ ] Link "¿Necesitás ayuda?" en checkout abre chat IA
- [ ] Páginas `/envios`, `/devoluciones`, `/preguntas-frecuentes` accesibles desde footer
- [ ] Política de envío visible en cada producto
- [ ] Indicación visual al hover sobre acciones destructivas

---

## TEST FINAL — Flujo end-to-end + Nielsen check

Los 18 pasos del flujo end-to-end del v1 se mantienen sin cambios.

**Adicional — Nielsen check:**
Recorrer cada feature y confirmar las 10 heurísticas con el checklist de arriba.
**NO declarar done el e-commerce hasta que las 10 estén marcadas en cada feature.**

---

## NOTAS PARA EL AGENTE

> [!WARNING]
> - Si te trabás: **PREGUNTÁ** antes de inventar.
> - Si necesitás un endpoint que no está listado: **PREGUNTÁ**.
> - Si una decisión de UX no está clara: usá el patrón más común en streetwear moderno (Hellstar, Stüssy, Carhartt, Nike, ASOS).

- Cada feature termina con commit semántico:
  - `feat(home): hero split + 7 bloques completos`
  - `feat(footer): 4 columnas con categorías dinámicas`
- **NO** `console.log` en código final.
- **NO** `TODO` sin justificar.
- Antes de declarar feature done: **Nielsen 10 check obligatorio**.
