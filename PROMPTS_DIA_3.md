# VAULT 16 — Prompts del Día 3 (Frontend E-commerce)

> **Marca visible**: VAULT 16 (logo, copy, dominio).
> **Código interno**: sigue siendo `vortex` (DB schema, env vars del backend, repo backend).
> El cliente nunca ve "vortex" — solo VAULT 16.
>
> Pre-requisito: backend Día 1+2 funcionando en http://localhost:3000.
> Los datos del seed ya están cargados (12 productos, 71 variantes, 1 promo activa).

---

## 🟢 PROMPT 17 — Bootstrap del e-commerce

```
Vamos a inicializar el frontend del e-commerce de VAULT 16, una tienda streetwear urbana.

CONTEXTO CRÍTICO:
- Marca de cara al cliente: VAULT 16
- API base URL: http://localhost:3000/api (backend ya funcionando)
- Stack: React 18.3.1 + Vite 5.4.19 + TypeScript 5.7.3 + Tailwind 3.4.17
- Estado global: Zustand 5.0.1
- Server state: TanStack Query 5.62.0
- Forms: react-hook-form 7.54.0 + zod 3.24.1
- Animaciones: framer-motion 11.15.0
- Routing: react-router-dom 7.1.1
- Iconos: lucide-react 0.469.0
- Pagos: @stripe/stripe-js 5.4.0 + @stripe/react-stripe-js 3.1.0

TAREA — en este orden exacto:

1. `npm create vite@latest frontend-ecommerce -- --template react-ts`
   → cd frontend-ecommerce && npm install

2. Instalar dependencias de producción EXACTAS:
   npm i react-router-dom@7.1.1 zustand@5.0.1 @tanstack/react-query@5.62.0
   npm i react-hook-form@7.54.0 @hookform/resolvers@3.9.1 zod@3.24.1
   npm i framer-motion@11.15.0 lucide-react@0.469.0
   npm i @stripe/stripe-js@5.4.0 @stripe/react-stripe-js@3.1.0
   npm i axios@1.7.9 clsx@2.1.1 tailwind-merge@2.6.0
   npm i react-intersection-observer@9.14.0    # para infinite scroll

3. Instalar dependencias dev:
   npm i -D tailwindcss@3.4.17 postcss@8.5.1 autoprefixer@10.4.20
   npm i -D tailwind-scrollbar-hide@2.0.0
   npm i -D @types/node@22.10.5

4. Inicializar Tailwind:
   npx tailwindcss init -p
   → reemplazá tailwind.config.js con el contenido del archivo tailwind_config.js
     que el usuario ya proveyó (paleta Asphalt + Electric blue, dark mode por clase)

5. Crear estructura de carpetas según el documento de arquitectura:
   src/
   ├── app/                  (App.tsx, router.tsx, providers.tsx, main.tsx)
   ├── features/             (vacío por ahora — se llenan en prompts siguientes)
   │   ├── home/
   │   ├── catalogo/
   │   ├── producto/
   │   ├── carrito/
   │   ├── checkout/
   │   ├── auth/
   │   ├── cuenta/
   │   ├── pedidos/
   │   ├── promociones/
   │   ├── estaticas/
   │   └── assistant/
   ├── shared/
   │   ├── components/ui/
   │   ├── components/layout/
   │   ├── components/feedback/
   │   ├── hooks/
   │   ├── lib/
   │   ├── utils/
   │   ├── stores/
   │   ├── types/
   │   └── constants/
   └── styles/

6. Configurar tsconfig path alias:
   "paths": { "@/*": ["./src/*"] }
   Y en vite.config.ts agregá:
   resolve: { alias: { '@': path.resolve(__dirname, './src') } }

7. Crear .env.example y .env.local:
   VITE_API_URL=http://localhost:3000/api
   VITE_STRIPE_PUBLIC_KEY=pk_test_placeholder

8. src/styles/globals.css:
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   @layer base {
     html { scroll-behavior: smooth; }
     body { @apply bg-bg-base dark:bg-bg-base-dark text-text-primary dark:text-text-primary-dark font-sans; }
     /* Inter font import */
     @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
   }

9. src/shared/lib/api.ts:
   - Crear instancia de axios con baseURL desde env
   - Interceptor request: si hay token en localStorage, agregar Authorization Bearer
   - Interceptor response: si 401 → limpiar token, redirect a /login (con returnUrl)
   - Si 403 EMAIL_NOT_VERIFIED → redirect a /verify-email-pending

10. src/shared/lib/queryClient.ts:
    - Configurar QueryClient con defaults sensatos:
      staleTime: 60 * 1000 (1 min)
      gcTime: 5 * 60 * 1000 (5 min)
      retry: 1
      refetchOnWindowFocus: false

11. src/shared/utils/cn.ts:
    export function cn(...inputs: ClassValue[]) {
      return twMerge(clsx(inputs))
    }

12. src/shared/types/api.types.ts:
    - ApiResponse<T>, ApiError, PaginationMeta — espejá lo que devuelve el backend

13. src/shared/stores/uiStore.ts (Zustand):
    interface UIStore {
      isDark: boolean
      toggleDark: () => void
      cartDrawerOpen: boolean
      openCartDrawer: () => void
      closeCartDrawer: () => void
      sizeGuideOpen: boolean
      openSizeGuide: (categoria: 'top' | 'pant') => void
      closeSizeGuide: () => void
      activeProductCategory: 'top' | 'pant' | null
    }
    Persiste solo `isDark` en localStorage.

14. src/app/providers.tsx:
    - Envuelve children con QueryClientProvider y BrowserRouter
    - Aplica clase 'dark' al <html> según uiStore.isDark

15. src/app/router.tsx:
    - Por ahora un router minimal con rutas vacías:
      /, /catalogo, /producto/:id, /carrito, /checkout, /login, /register
    - Cada una renderiza <div>WIP</div> por ahora
    - Vamos a llenarlas en los prompts siguientes

16. src/app/App.tsx → renderiza el router
17. src/main.tsx → ReactDOM con Providers

VALIDACIÓN FINAL:
- npm run dev arranca en localhost:5173
- La paleta Asphalt está aplicada (fondo gris oscuro en dark, gris claro en light)
- El toggle dark/light funciona desde devtools cambiando isDark en el store
- Las rutas placeholder responden

NO crees todavía Header, Home, ni nada visual. Solo el bootstrap.
```

---

## 🟢 PROMPT 18 — Layout shell (Header + Footer + Theme)

```
Implementá el layout principal del e-commerce. ESTE ES EL CHASIS DE TODO.

ESTRUCTURA VISUAL DEL HEADER (CRÍTICA — seguila al pie):

┌───────────────────────────────────────────────────────────────────────┐
│  [VAULT 16]      [🔍 Buscar productos...]      [☀️/🌙] [👤] [🛒 (3)] │  ← row 1
├───────────────────────────────────────────────────────────────────────┤
│            Home  ·  Catálogo  ·  Promociones  ·  Contacto             │  ← row 2 centrada
└───────────────────────────────────────────────────────────────────────┘

ROW 1 (h-16, sticky top-0, bg-surface):
  - Izquierda: logo VAULT 16 (ver más abajo)
  - Centro (flex-1, max-w-prose): SearchBar
  - Derecha (gap-3):
    - Toggle Dark/Light (botón con icono Sun/Moon de lucide)
    - Icono Usuario (👤) — al click:
      • Si NO logueado → dropdown con: "Iniciar sesión" / "Crear cuenta"
      • Si logueado    → dropdown con: "Mi perfil" / "Mis pedidos" / "Direcciones" / "Cerrar sesión"
    - Icono Carrito (🛒) con badge contador (cantidad total de items)
      • Click → abre CartDrawer (ya conectado a uiStore.openCartDrawer)

ROW 2 (h-12, bg-surface, border-t):
  - Nav centrada con NavLink de react-router-dom
  - 4 links: Home, Catálogo, Promociones, Contacto
  - El link activo lleva clase de underline + accent
  - "Quiénes somos" va en el footer, NO en el nav principal (decisión de simplificación)

ARCHIVOS A CREAR:

1. src/shared/components/layout/Logo.tsx
   - Wordmark "VAULT 16" en font-mono bold uppercase tracking-tight
   - Tamaño grande (text-2xl), color text-primary
   - Wrapped en <Link to="/"> para volver al home
   - El "16" en color accent (azul eléctrico) — diferencial visual
   
   Ejemplo de estructura JSX:
   <Link to="/" className="flex items-baseline gap-1 font-mono font-bold tracking-tight">
     <span className="text-2xl text-text-primary dark:text-text-primary-dark">VAULT</span>
     <span className="text-2xl text-accent">16</span>
   </Link>

2. src/shared/components/layout/SearchBar.tsx
   - Input con icono Search a la izquierda (lucide)
   - Placeholder: "Buscá hoodies, tees, pants..."
   - Border rounded-md, bg-bg-hover, focus ring accent
   - Al typear → debounce 300ms → setea query en URL (?q=...)
   - Al Enter → navigate a /catalogo?q=...

3. src/shared/components/layout/ThemeToggle.tsx
   - Botón con icono Sun (light) / Moon (dark) — lucide
   - Lee/setea uiStore.isDark
   - Aplica/quita clase 'dark' del <html>
   - Animación spring 200ms al cambiar

4. src/shared/components/layout/UserMenu.tsx
   - Botón con icono User
   - Dropdown con framer-motion (fade + slide)
   - Lee authStore (lo creamos en prompt 23, por ahora isAuthenticated = false stub)
   - Cuando NO logueado: 2 opciones
   - Cuando logueado: 4 opciones + email arriba como header del dropdown

5. src/shared/components/layout/CartIconButton.tsx
   - Botón con icono ShoppingCart
   - Badge en esquina sup-derecha con contador (visible solo si > 0)
   - Lee del carritoStore.items.length (lo creamos en prompt 22, por ahora 0)
   - Al click → uiStore.openCartDrawer()
   - ANIMACIÓN: cuando un item se agrega al carrito, el badge hace pulse + el icono "salta"
     usá framer-motion variants. Esto lo conectamos en el prompt 22.

6. src/shared/components/layout/MainNav.tsx
   - <nav> con flex justify-center gap-8
   - Links: Home (/), Catálogo (/catalogo), Promociones (/promociones), Contacto (/contacto)
   - NavLink con className condicional:
     ({ isActive }) => isActive ? 'text-accent border-b-2 border-accent' : 'text-text-secondary hover:text-text-primary'

7. src/shared/components/layout/Header.tsx
   - Compone Logo + SearchBar + ThemeToggle + UserMenu + CartIconButton
   - Sticky top-0, z-sticky, backdrop-blur, bg-bg-surface/90
   - Row 1: h-16, padding horizontal max-w-content mx-auto
   - Row 2: MainNav, h-12, border-t border-border-base

8. src/shared/components/layout/Footer.tsx
   - 4 columnas en desktop (1 columna en mobile):
     - Col 1: Logo + tagline "Streetwear urbano. Hecho en Quito."
     - Col 2: Links navegación (Catálogo, Promociones, Quiénes somos, Contacto)
     - Col 3: Legales (Términos, Privacidad)
     - Col 4: Newsletter signup (input email + botón "Suscribirme")
                (POR AHORA: solo UI, sin backend — toast "¡Pronto!" al submit)
   - Padding generoso, bg-bg-surface
   - Bottom bar: "© 2026 VAULT 16. Todos los derechos reservados."

9. src/shared/components/layout/EcommerceLayout.tsx
   - Wrapper con Header arriba, <Outlet /> en el medio, Footer abajo
   - Min-h-screen flex flex-col

10. src/shared/components/ui/Dropdown.tsx
    - Componente reutilizable con framer-motion
    - Props: trigger, children, align ('left' | 'right')
    - Cierra al click fuera (useClickOutside)
    - Cierra al apretar Escape

11. src/shared/components/ui/Button.tsx
    - Variants: 'primary' (bg-accent), 'secondary' (border accent), 'ghost', 'danger'
    - Sizes: 'sm', 'md', 'lg'
    - Props: loading (muestra spinner), disabled, fullWidth, leftIcon, rightIcon
    - Construido con cva (class-variance-authority) o cn() simple

12. src/shared/components/ui/Input.tsx
    - Wrapper de input con label, error, hint
    - Forward ref para react-hook-form
    - Estados: default, focus, error, disabled

13. src/shared/components/feedback/Toast.tsx
    - Sistema de toasts con framer-motion
    - 4 tipos: success, error, warning, info
    - Auto-dismiss en 4 segundos
    - Stack en esquina inferior derecha
    - Usado vía useToast() hook

14. src/shared/hooks/useClickOutside.ts
    - Hook utility para detectar clicks fuera de un ref

15. src/app/router.tsx — ACTUALIZAR:
    - Wrappear todas las rutas dentro de <Route element={<EcommerceLayout />}>
    - Las rutas auth (/login, /register) usan un layout distinto sin Header (lo veremos en prompt 23)

VALIDACIÓN:
- El header se ve EXACTAMENTE como el diagrama (logo izq, search center, controles der)
- El toggle dark/light funciona con animación
- Los dropdowns se cierran con Escape y al click fuera
- En mobile (375px) el layout no se rompe — el search puede colapsarse a icono y desplegar al click
- Todos los iconos son de lucide-react (consistencia visual)

DECISIONES DE UX QUE TOMAMOS:
- "Quiénes somos" NO va en el nav principal (4 links es el máximo recomendado por Nielsen)
- Va en el footer
- El acceso al área del cliente es 100% por el icono 👤 — confirmado por el usuario
- El nav row 2 NO tiene "Mi cuenta" ni "Pedidos" — esos están detrás del icono usuario
```

---

## 🟢 PROMPT 19 — Home Page (carrusel + destacados + categorías)

```
Implementá la home — primera impresión de VAULT 16. Tiene que pegar visualmente.

ORDEN DE SECCIONES (de arriba a abajo):

1. HERO CARROUSEL (full-width, h-[500px] desktop, h-[360px] mobile)
2. PRODUCTOS DESTACADOS (grid horizontal scroll en mobile, grid 4 cols desktop)
3. CATEGORÍAS — bloque visual llamativo con overlays
4. BANNER PROMOCIÓN (CTA hacia /promociones)
5. NEWSLETTER CTA

ARCHIVOS:

1. src/features/home/components/HeroBanner.tsx
   CARROUSEL con framer-motion + auto-play + dots + flechas
   
   Cada slide tiene:
   - Imagen de fondo (full-width, object-cover)
   - Overlay gradient negro de izq → transparente der (para que el texto se lea)
   - Texto a la izq (bottom-left): título grande + subtítulo + CTA
   - CTA: botón "Ver Drop" → /catalogo
   
   Por AHORA usá 3 slides con imágenes generadas vía SVG procedural inline:
   
   IMPORTANTE — para las imágenes del carrusel:
   Cada slide es un componente <SlideArt /> que renderiza un SVG full-size con:
     - Fondo: gradient duotono usando colors del tema (asphalt-900 → electric-700)
     - Formas geométricas abstractas (círculos, triángulos, líneas) con opacity baja
     - Tipografía gigante con el nombre del drop como decoración (ej "DROP/001")
     - Cada slide tiene un mood diferente:
       Slide 1: "DROP 001" — ángulos agudos, líneas diagonales
       Slide 2: "VAULT 16" — círculos concéntricos, vibe espacial
       Slide 3: "ESTÁTICA" — pattern de noise/dots
   
   Datos de los slides hardcodeados (luego se cargarán desde backend):
   const slides = [
     { id: 1, titulo: "DROP 001", subtitulo: "Primera entrega. Hoodies y tees con descuento.", cta: "Ver drop", href: "/promociones" },
     { id: 2, titulo: "STREETWEAR URBANO", subtitulo: "Diseñado para la calle. Hecho en Quito.", cta: "Explorar", href: "/catalogo" },
     { id: 3, titulo: "NUEVA TEMPORADA", subtitulo: "Pesos heavy, fits oversize, paleta sobria.", cta: "Ver catálogo", href: "/catalogo" }
   ]
   
   Auto-advance cada 6 segundos. Pausa al hover.
   Dots clickeables abajo center.
   Flechas en los costados (mostrarse solo en hover).

2. src/features/home/components/ProductosDestacados.tsx
   - Título: "DESTACADOS" (font-mono uppercase tracking-wider)
   - Subtítulo: "Lo más vendido del drop"
   - Carga 8 productos del backend: GET /api/productos?limit=8&sort=destacados
     (POR AHORA si el endpoint no soporta sort=destacados, usá los primeros 8)
   - Grid:
     • Mobile: scroll horizontal con snap-x (cards de 240px ancho)
     • Tablet: 2 cols
     • Desktop: 4 cols
   - Cada card usa <ProductCard /> (lo creamos en prompt 20 — por ahora un placeholder)
   - Botón "Ver todos" abajo center → /catalogo

3. src/features/home/components/CategoriasGrid.tsx
   ESTA SECCIÓN ES EL "WOW" VISUAL DEL HOME.
   
   Grid 2x3 (desktop) o 1 col (mobile) con 6 categorías:
   HOO, TEE, PAN, JAC, ACC, SET
   
   Cada celda es un Link a /categoria/:id, con altura h-64, position relative.
   Contenido de cada celda:
   - SVG art procedural de fondo (cada categoría con estética distinta):
     • HOO: silueta abstracta de hoodie con líneas
     • TEE: rectángulo con grafismo central
     • PAN: líneas verticales largas
     • JAC: forma de chaqueta con cierre central
     • ACC: cuadrícula de mini-iconos
     • SET: 2 siluetas combinadas
   - Overlay gradient negro abajo (degradé)
   - Nombre de categoría en bottom-left: gigante, font-mono, uppercase
   - Hover: scale(1.02) + el SVG art cambia ligeramente (rotate 2deg)
   - Color de fondo: cada categoría tiene un asphalt diferente para variedad visual
   
   IMPORTANTE: NO uses imágenes de stock. TODO procedural con SVG.
   Esto le da a VAULT 16 una identidad visual propia y carga rapidísimo.

4. src/features/home/components/BannerPromocion.tsx
   - Banner full-width h-48 con bg-accent (azul eléctrico)
   - Texto blanco grande: "DROP 001 — 15% OFF EN HOODIES"
   - Subtítulo: "Hasta el 31 de mayo. Sin código."
   - CTA: botón blanco "Ver promociones" → /promociones
   - Pattern decorativo de fondo: líneas diagonales sutiles con opacity baja

5. src/features/home/components/NewsletterCTA.tsx
   - Sección con bg-bg-surface, padding generoso
   - Título: "Enterate primero"
   - Subtítulo: "Drops nuevos, descuentos exclusivos. Cero spam."
   - Form: input email + botón "Suscribirme"
   - Por ahora: al submit muestra toast success "¡Estás dentro!" y limpia el input
   - Validación con zod: email válido obligatorio

6. src/features/home/pages/HomePage.tsx
   - Compone todas las secciones en orden
   - Wrap en <main> con max-w nada (las secciones manejan su propio width)
   - Lazy-load de las secciones below-the-fold con Suspense

7. src/features/home/api/homeApi.ts
   - getDestacados(): Promise<Producto[]>
   - getCategoriasConCount(): Promise<CategoriaConCount[]>     ← futuro

8. src/features/home/hooks/useDestacados.ts
   - useQuery con queryKey ['productos', 'destacados']

ROUTING:
- Asegurate que GET / renderiza HomePage en src/app/router.tsx

VALIDACIÓN:
- Hero carrusel funciona, auto-avanza, pausa al hover
- Categorías se ven distintivas (NO genéricas)
- Productos destacados muestran datos reales del backend
- Performance: Lighthouse > 90 en mobile (todo SVG y zero imágenes pesadas ayuda)
- Responsive: probá en 375px, 768px, 1280px, 1920px
```

---

## 🟢 PROMPT 20 — Catálogo + Filtros + Infinite Scroll

```
Implementá el catálogo completo. Es el corazón del e-commerce.

LAYOUT:
┌────────────────────────────────────────────────────────────┐
│ [Filtros]                              [Sort] [Vista]      │  ← top bar
├──────────┬─────────────────────────────────────────────────┤
│ Sidebar  │ Grid de productos                                │
│ Filtros  │ ┌────┬────┬────┬────┐                           │
│          │ │card│card│card│card│                           │
│ - Cat    │ ├────┼────┼────┼────┤                           │
│ - Tallas │ │card│card│card│card│                           │
│ - Color  │ │    │    │    │    │                           │
│ - Precio │ ↓ Infinite scroll trigger ↓                      │
└──────────┴─────────────────────────────────────────────────┘

ARCHIVOS:

1. src/features/catalogo/components/FiltrosSidebar.tsx
   Sticky al hacer scroll (top-20). Width 280px en desktop.
   En mobile: drawer lateral (uiStore.filtersDrawerOpen).
   
   Secciones colapsables (cada una con toggle abrir/cerrar):
   
   a) CATEGORÍA (checkboxes múltiples)
      - HOO Hoodies, TEE T-Shirts, PAN Pants, JAC Jackets, ACC Accesorios, SET Sets
      - Carga desde GET /api/categorias
   
   b) TALLA (chips clickeables múltiples)
      - XS, S, M, L, XL, XXL, ÚNICA
      - Carga desde GET /api/tallas
   
   c) COLOR (chips con muestra de color)
      - Negro, Antracita, Carbón, Pizarra, Hueso, Arena, Cemento, Oliva,
        Verde Mil, Beige, Marrón, Gris Mel, Blanco
      - Hardcoded por ahora (los colores vienen de variantes pero no hay endpoint
        agregado todavía — TODO backend)
   
   d) PRECIO (slider de rango)
      - Min: $0, Max: $200
      - Dual handle (react-range o slider custom)
   
   e) Botón "Limpiar filtros" abajo del sidebar
   
   Cada cambio de filtro actualiza la URL como query params:
   ?categoria=HOO,TEE&talla=M,L&color=Negro&precioMin=20&precioMax=100&sort=newest
   
   Esto permite compartir/bookmark filtros y hace el state shareable.

2. src/features/catalogo/hooks/useFiltros.ts
   - Lee/escribe filtros desde URL search params
   - Devuelve { filtros, setFiltro, clearFiltros, hasActiveFilters }
   - Centraliza la lógica de query params

3. src/features/catalogo/components/SortDropdown.tsx
   - Dropdown con opciones:
     • Más recientes (default)
     • Precio: menor a mayor
     • Precio: mayor a menor
     • Más vendidos (TODO backend)
   - Al cambiar → setFiltro('sort', value)

4. src/features/catalogo/components/ProductCard.tsx ← CRÍTICO
   ESTÉTICA STREETWEAR — no genérico Material UI.
   
   Estructura:
   ┌─────────────────────┐
   │   [imagen 3:4]      │  ← aspect-product
   │                     │
   │   [HOVER: overlay   │
   │    "Ver detalles"]  │
   ├─────────────────────┤
   │ Hoodie Blackout     │  ← nombre, font-medium, line-clamp-1
   │ HOODIES             │  ← categoría, font-mono uppercase text-xs muted
   │ $59.99    [-15%]    │  ← precio + badge promo si aplica
   └─────────────────────┘
   
   Detalles:
   - Card sin border, sin shadow (estética minimalista)
   - Border solo en hover (border-accent)
   - Imagen: usá un componente <ProductImage /> que:
     • Si producto.fotos[0] existe → <img src={url} loading="lazy" />
     • Si NO hay foto → SVG procedural placeholder usando el id_producto como seed
       (genera patrón único por producto con asphalt + electric)
   - Hover: 
     • La imagen hace ligero zoom (scale 1.05)
     • Overlay oscuro 40% aparece con texto "Ver detalles" centrado
     • Cursor pointer
   - Click → navigate a /producto/:id
   - Si tiene promo activa → badge "-15%" en esquina sup-izq de la imagen
     (el dato viene del backend con porcentaje_descuento_activo)
   
   Variantes disponibles indicadas con dots de color abajo del nombre:
   ● ● ● (uno por cada color disponible, max 5)

5. src/features/catalogo/components/ProductGrid.tsx
   - Grid responsive:
     • Mobile (sm): 2 cols, gap-2
     • Tablet (md): 3 cols, gap-4
     • Desktop (lg): 4 cols, gap-6
   - Spacing entre productos generoso (los productos respiran)
   - Cada card es un ProductCard

6. src/features/catalogo/components/ProductSkeleton.tsx
   - Skeleton del card durante carga
   - Pulso suave con framer-motion
   - Mismas dimensiones que ProductCard real (no jump)

7. src/features/catalogo/hooks/useProductos.ts ← INFINITE SCROLL
   Usa useInfiniteQuery de TanStack Query:
   
   const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
     queryKey: ['productos', filtros],
     queryFn: ({ pageParam = 1 }) => fetchProductos({ page: pageParam, ...filtros }),
     getNextPageParam: (lastPage) => 
       lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
     initialPageParam: 1
   })
   
   - Backend devuelve { data: Producto[], meta: { page, pageSize, total, totalPages } }
   - pageSize fijo: 16 productos por página
   - Aplana las páginas: const productos = data?.pages.flatMap(p => p.data) ?? []

8. src/features/catalogo/components/InfiniteScrollTrigger.tsx
   - Componente con useInView de react-intersection-observer
   - Cuando el usuario llega a 200px antes del final → fetchNextPage()
   - Mientras carga: muestra 4 ProductSkeleton
   - Si !hasNextPage: muestra "Llegaste al final · 87 productos en total"

9. src/features/catalogo/pages/CatalogoPage.tsx
   - Layout 2 columnas:
     • Sidebar izq (sticky, hidden en mobile)
     • Main: top bar (count + sort) + grid + scroll trigger
   - En mobile: botón "Filtros (3 activos)" arriba que abre el drawer
   - Heading: "Catálogo" o título dinámico según filtros activos
   - Subtítulo: "{total} productos encontrados"

10. src/features/catalogo/pages/CategoriaPage.tsx
    - Misma estructura que CatalogoPage pero con categoria pre-filtrada en URL
    - Heading: nombre de la categoría grande + descripción
    - Hero pequeño arriba con SVG art de la categoría (mismo estilo que home)

11. src/features/catalogo/api/catalogoApi.ts
    - fetchProductos(params): GET /api/productos con todos los query params
    - Manejo de loading, error, empty state

EMPTY STATES:
- Sin productos en filtro: ilustración SVG + "No encontramos nada con esos filtros · Limpiar filtros"
- Error de carga: ilustración SVG + "Algo falló · Reintentar"

VALIDACIÓN:
- Filtros funcionan, se reflejan en URL, son shareable
- Infinite scroll carga páginas suaves
- ProductCard se ve EXACTAMENTE como el diseño descrito
- En mobile: drawer de filtros funciona
- Hover de card muestra overlay correctamente
```

---

## 🟢 PROMPT 21 — Detalle de producto + Calculadora de tallas

```
Implementá la página de detalle de producto + la calculadora de tallas (modal).
Esto es donde el cliente decide comprar.

LAYOUT DEL DETALLE:
┌──────────────────────────────────────────────────┐
│ Breadcrumb: Inicio › Catálogo › Hoodies › ...   │
├─────────────────────┬────────────────────────────┤
│                     │ Hoodie Blackout            │
│   [Galería          │ HOODIES                    │
│    de fotos]        │ $59.99 ~~$70.58~~ -15%     │
│                     │                            │
│                     │ Color: ● ● ●               │
│                     │                            │
│                     │ Talla: [XS][S][M][L][XL]   │
│                     │ → Guía de tallas           │  ← link clickeable
│                     │                            │
│                     │ [Stock: 12 disponibles]    │
│                     │                            │
│                     │ Cantidad: [- 1 +]          │
│                     │                            │
│                     │ [AGREGAR AL CARRITO] btn   │
│                     │                            │
│                     │ Descripción: ...           │
│                     │ Bullets: ...               │
└─────────────────────┴────────────────────────────┘

│ PRODUCTOS RELACIONADOS                          │
│ [card][card][card][card]                        │

ARCHIVOS:

1. src/features/producto/components/ProductGallery.tsx
   Galería de fotos del producto.
   - Foto principal grande (aspect-product)
   - Thumbnails verticales a la izquierda en desktop, horizontales abajo en mobile
   - Click en thumbnail → cambia foto principal con fade transition
   - Click en foto principal → modal de zoom (lightbox)
   - Si producto NO tiene fotos → muestra ProductImage SVG procedural (el mismo de catálogo)
   - Datos: producto.fotos ordenadas por es_principal desc, orden asc

2. src/features/producto/components/ProductInfo.tsx
   Bloque a la derecha de la galería con:
   
   - <Breadcrumb /> arriba
   - Nombre del producto: text-3xl font-medium
   - Categoría: font-mono uppercase tracking-wider text-muted text-sm
   - Precio:
     • Si tiene promo: <span className="text-2xl font-semibold text-accent">$59.99</span>
                       <span className="line-through text-muted ml-2">$70.58</span>
                       <Badge>-15%</Badge>
     • Si no: precio normal
   - Selector de COLOR:
     • Lista de colores únicos de las variantes
     • Cada color = botón circular con el color visualizado
     • Click → setea selectedColor, actualiza variantes disponibles para tallas
   - Selector de TALLA:
     • Botones cuadrados 48x48 con la letra
     • Si no hay stock para esa combinación color+talla → tachado y disabled
     • Click → setea selectedTalla, calcula la variante final (id_variante)
   - Link "Guía de tallas" debajo del selector → abre SizeCalculatorModal
   - Stock badge: "12 disponibles" (verde) / "Solo quedan 2" (warning) / "Agotado" (danger)
   - Selector de cantidad: botones [-] [N] [+] (max = stock disponible)
   - Botón AGREGAR AL CARRITO:
     • full-width, h-12, bg-accent
     • disabled si !selectedTalla || !selectedColor || stock = 0
     • onClick → useAddToCarrito({ id_variante, cantidad })
     • Loading state con spinner
     • Después de OK: animación de confirmación (check verde 2 segundos) +
                       cart icon en header hace pulse + toast success +
                       OPCIONAL: abre el cart drawer
   
   - Sección descripción IA (si producto.ai existe):
     • Tab "Descripción" / "Detalles" / "Cuidado"
     • Descripción: producto.ai.descripcion_larga (markdown render)
     • Detalles: bullets de producto.ai.bullet_points
     • Cuidado: bullets hardcoded ("Lavar a mano", "No usar lavandina", etc)

3. src/features/producto/components/SizeCalculatorModal.tsx ← LA CALCULADORA
   
   ESTRUCTURA:
   Modal centrado, max-w-modal-lg, padding p-8.
   2 columnas en desktop, stacked en mobile.
   
   COL IZQUIERDA: Diagrama del cuerpo (SVG)
   - SVG inline de figura humana esquemática (estilo línea simple, asphalt-400)
   - Líneas resaltadas en accent indicando dónde medir:
     • Pecho: línea horizontal a nivel de pectorales con label "Pecho"
     • Cintura: línea horizontal a nivel del ombligo con label "Cintura"  
     • Cadera: línea horizontal a nivel de caderas con label "Cadera"
   - Las líneas activas (la que el usuario está rellenando) parpadean en accent
   - El SVG es genérico (no tiene género específico, neutro)
   - Si la categoría es 'top' → highlight pecho. Si es 'pant' → highlight cintura+cadera.
   
   GENERACIÓN DEL SVG:
   El agente debe escribir el SVG inline directamente en el componente.
   Especificaciones para que el agente lo genere:
   - viewBox 0 0 200 400
   - Figura humana simplificada: cabeza (círculo), torso (trapecio), piernas (rectángulos)
   - Stroke color: currentColor (responde al theme)
   - Líneas de medición: stroke-accent stroke-2 dashed
   - Labels: text-xs font-mono uppercase
   
   COL DERECHA: Calculadora
   
   PASO 1: ¿Qué vas a medir?
     - Auto-detectado por categoría del producto, pero usuario puede cambiar
     - Radio: [Top (hoodies, tees, jackets)] [Pants]
   
   PASO 2: Tus medidas
     - Inputs numéricos en cm:
       • Si Top: solo "Pecho"
       • Si Pant: "Cintura" + "Cadera"
     - Validación: 50-150 cm rango razonable
     - Hints: "Medí con cinta métrica sobre la prenda más ajustada que uses"
   
   PASO 3: ¿Cómo te gusta que te quede?
     - Radio: [Ajustado] [Regular] [Oversize]
     - Default: Regular
   
   RESULTADO (solo aparece cuando todos los inputs son válidos):
     - Card grande con la talla recomendada: "TU TALLA: M"
     - Indicador de confianza:
       • 🟢 ALTA — la medida cae limpia en el rango
       • 🟡 MEDIA — está en el borde entre dos tallas
       • 🔴 BAJA — la medida es atípica
     - Mensaje contextual:
       • "Esta talla te queda cómoda para fit oversize"
       • "Estás entre M y L. Si te gustan las prendas más holgadas, andá por L."
     - Tabla pequeña debajo con todas las tallas y sus rangos para referencia
     - Botón "Aplicar talla M y cerrar" → setea selectedTalla en el detalle del producto
   
   LÓGICA DE CÁLCULO:
   src/features/producto/utils/sizeCalculator.ts
   
   const SIZE_CHART = {
     top: {
       XS: { min: 86, max: 91 },
       S:  { min: 92, max: 97 },
       M:  { min: 98, max: 103 },
       L:  { min: 104, max: 109 },
       XL: { min: 110, max: 115 },
       XXL:{ min: 116, max: 121 }
     },
     pant: {
       XS: { cintura: { min: 71, max: 76 },  cadera: { min: 86, max: 91 } },
       S:  { cintura: { min: 77, max: 82 },  cadera: { min: 92, max: 97 } },
       M:  { cintura: { min: 83, max: 88 },  cadera: { min: 98, max: 103 } },
       L:  { cintura: { min: 89, max: 94 },  cadera: { min: 104, max: 109 } },
       XL: { cintura: { min: 95, max: 100 }, cadera: { min: 110, max: 115 } }
     }
   }
   
   export function calcularTallaTop(pecho: number, fit: 'ajustado'|'regular'|'oversize') {
     // Encontrar talla cuyo rango contenga pecho
     // Si fit = 'oversize' → talla + 1
     // Si fit = 'ajustado' → talla exacta
     // Si fit = 'regular' → talla exacta, salvo que esté en último 20% del rango → +1
     // Devolver { talla, confianza, mensaje }
   }
   
   export function calcularTallaPant(cintura: number, cadera: number, fit) {
     // Calcular talla para cintura y para cadera por separado
     // Si dan distintas → recomendar la MAYOR (es más fácil ajustar con cinto)
     // Aplicar modificador de fit
     // Devolver { talla, confianza, mensaje, alternativa? }
   }
   
   export function calcularConfianza(medida, talla, rango) {
     const center = (rango.min + rango.max) / 2
     const distance = Math.abs(medida - center)
     const halfRange = (rango.max - rango.min) / 2
     const ratio = distance / halfRange
     if (ratio < 0.5) return 'alta'
     if (ratio < 0.85) return 'media'
     return 'baja'
   }
   
   IMPORTANTE: TODA LA LÓGICA EN FRONTEND. Nada va al backend.
   Las medidas NO se guardan en ningún lado (ni localStorage). Son volátiles.
   Solo el resultado final (talla aplicada) se setea en el state del producto.

4. src/features/producto/components/ProductosRelacionados.tsx
   - Sección abajo del detalle
   - Título: "También te puede gustar"
   - 4 productos similares (por ahora: misma categoría, distintos al actual)
   - Endpoint: GET /api/productos/:id/relacionados (TODO backend) o filtrar por categoría
   - Reusa <ProductCard /> de catálogo

5. src/features/producto/hooks/useProducto.ts
   - useQuery con queryKey ['producto', id]
   - GET /api/productos/:id (incluye fotos, variantes, ai)
   - Stale time generoso (5 min) — el detalle no cambia tan seguido

6. src/features/producto/hooks/useAgregarVariante.ts
   - Wraps useAddToCarrito (lo definimos en prompt 22)
   - Maneja loading, error, success animations

7. src/features/producto/pages/ProductoDetailPage.tsx
   - Compone Breadcrumb + ProductGallery + ProductInfo + ProductosRelacionados
   - Loading state: skeleton del detalle completo
   - Error state: "Producto no encontrado · Volver al catálogo"
   - Si producto.estado_prod !== 'ACT' → renderiza error 404

VALIDACIÓN:
- La calculadora calcula correctamente las tallas para inputs de prueba
- El SVG del cuerpo se ve limpio y profesional
- Cambiar color filtra las tallas con stock disponible
- Agregar al carrito muestra animación correcta y abre el drawer (cuando esté listo)
- Mobile: galería funciona con swipe, info collapses correctamente
```

---

## 🟢 PROMPT 22 — Carrito Drawer + Animación al agregar

```
Implementá el carrito completo. Es un DRAWER lateral, no una página.
(Hay también una página /carrito como fallback, pero el drawer es lo principal.)

ARCHIVOS:

1. src/features/carrito/stores/carritoStore.ts (Zustand)
   
   interface CarritoStore {
     items: CarritoItem[]                    // sincronizado con backend
     isLoading: boolean
     setItems: (items: CarritoItem[]) => void
     addItemOptimistic: (item) => void       // para UI optimista
     updateCantidadOptimistic: (id, cantidad) => void
     removeItemOptimistic: (id) => void
     getTotalItems: () => number              // para el badge
     getSubtotal: () => number
     getDescuentoTotal: () => number
     getTotal: () => number
   }
   
   El store es para UI optimista. La fuente de verdad es el backend (TanStack Query).
   Cuando el query refetchea, sincroniza con setItems.

2. src/features/carrito/api/carritoApi.ts
   - getCarrito() → GET /api/carrito
   - addItem({ id_variante, cantidad }) → POST /api/carrito/items
   - updateCantidad(id_carrito_det, cantidad) → PUT /api/carrito/items/:id
   - removeItem(id_carrito_det) → DELETE /api/carrito/items/:id
   - clearCarrito() → DELETE /api/carrito
   - validar() → GET /api/carrito/validar (pre-checkout)

3. src/features/carrito/hooks/useCarrito.ts
   useQuery({
     queryKey: ['carrito'],
     queryFn: getCarrito,
     enabled: isAuthenticated,    // si no logueado, usa solo el store local
     onSuccess: (data) => carritoStore.setItems(data.items)
   })

4. src/features/carrito/hooks/useAddToCarrito.ts
   useMutation con optimistic update:
   
   onMutate: (newItem) => {
     // Cancelar queries en flight
     queryClient.cancelQueries(['carrito'])
     // Backup
     const prev = queryClient.getQueryData(['carrito'])
     // Optimistic update en el store + queryClient
     carritoStore.addItemOptimistic(newItem)
     return { prev }
   },
   onError: (err, newItem, context) => {
     queryClient.setQueryData(['carrito'], context.prev)
     toast.error("No pudimos agregar el producto")
   },
   onSuccess: () => {
     // Trigger animación del icono carrito
     // Abrir el drawer automáticamente (decisión UX confirmada por usuario)
     uiStore.openCartDrawer()
     toast.success("¡Agregado al carrito!")
   },
   onSettled: () => {
     queryClient.invalidateQueries(['carrito'])
   }

5. src/features/carrito/hooks/useUpdateCantidad.ts
   Mutation con debounce 400ms (para que +/- rápido no spammee la API).

6. src/features/carrito/hooks/useRemoveItem.ts
   Mutation simple. Optimistic: quita del store inmediatamente.

7. src/features/carrito/components/CarritoDrawer.tsx ← EL CORE
   
   ESTRUCTURA DEL DRAWER (slide desde la derecha):
   ┌──────────────────────────────────────┐
   │  TU CARRITO (3)              [✕]     │  ← header
   ├──────────────────────────────────────┤
   │                                      │
   │  [item 1]                            │  ← lista scrolleable
   │  [item 2]                            │
   │  [item 3]                            │
   │                                      │
   ├──────────────────────────────────────┤
   │  Subtotal:        $169.97            │  ← summary sticky bottom
   │  Descuentos:     -$25.50             │
   │  ─────────────────────                │
   │  Total:           $144.47            │
   │                                      │
   │  [   IR A PAGAR   ]                  │  ← CTA primario
   │  [Seguir comprando]                  │  ← CTA secundario (cierra drawer)
   └──────────────────────────────────────┘
   
   - Width: max-w-drawer (420px), full-height
   - Slide right-to-left con framer-motion (250ms smooth)
   - Backdrop oscuro 60% opacity, click cierra
   - z-drawer (30)
   - Header sticky, summary sticky (lista entre ellos scrolea)

8. src/features/carrito/components/CarritoItemRow.tsx
   - Layout horizontal: [thumbnail 64x80] [info] [controles]
   - Info: nombre producto, color · talla, precio unitario
   - Controles:
     • Selector cantidad inline [- N +] (max = stock disponible)
     • Botón "Eliminar" (icono trash, sin texto)
   - Subtotal de la línea a la derecha (precio × cantidad)
   - Si tiene descuento aplicado: mostrá precio tachado + nuevo precio
   - Animación al eliminar: slide-out + fade

9. src/features/carrito/components/CarritoSummary.tsx
   - Subtotal, descuento, total
   - El descuento es la suma de descuentos de cada línea
   - Botones IR A PAGAR (primary) y Seguir comprando (secondary)
   - "IR A PAGAR" → cierra drawer + navigate a /checkout
   - Disabled si carrito vacío

10. src/features/carrito/components/CarritoVacio.tsx
    - Ilustración SVG (carrito vacío estilizado)
    - Texto: "Tu carrito está vacío"
    - Sub: "Empezá a explorar el catálogo"
    - Botón "Ver catálogo" → /catalogo + cierra drawer

11. src/features/carrito/components/CarritoIconBadge.tsx
    Conecta con uiStore + carritoStore.
    - Lee el contador
    - Animación pulse cuando getTotalItems() incrementa (usar prevValue ref)
    - Conecta esta animación con la del header del prompt 18

12. src/features/carrito/pages/CarritoPage.tsx
    - Versión full-page del drawer (mismo contenido pero en layout amplio)
    - Para cuando alguien escribe /carrito en la URL
    - 2 columnas: items izq, summary der

ANIMACIÓN "AGREGAR AL CARRITO" (la magia):
Cuando se agrega un producto:
1. El botón "Agregar al carrito" muestra ✓ por 1s
2. El icono del carrito en el header hace bounce + scale
3. El badge incrementa con pulse de color accent
4. Toast aparece bottom-right
5. (OPCIONAL configurable) El drawer se abre automáticamente

CARRITO PARA USUARIO NO LOGUEADO:
- Items viven en localStorage (carritoStore con persist middleware)
- Al login → merge con el carrito del backend:
  • Para cada item local: POST /api/carrito/items
  • Limpiar localStorage
- Esto está en authStore.afterLogin() (lo veremos en prompt 23)

VALIDACIÓN:
- Agregar producto → drawer se abre, item aparece, badge incrementa
- Cambiar cantidad → debounce funciona, no spammea
- Eliminar item → animación slide-out
- Vaciar carrito → empty state se muestra
- Ir a pagar deshabilitado si vacío
- Mobile: drawer ocupa 90% del width
```

---

## 🟢 PROMPT 23 — Auth + Cuenta del cliente

```
Implementá el flujo de auth completo + área de cuenta logueada.

ARCHIVOS DE AUTH:

1. src/features/auth/stores/authStore.ts (Zustand persist)
   interface AuthStore {
     cliente: Cliente | null
     token: string | null
     isAuthenticated: boolean
     login: (cliente, token) => void
     logout: () => void
     updateProfile: (cambios) => void
   }
   Persiste cliente + token en localStorage.
   Al login → llama a carritoStore.mergeLocalWithBackend()

2. src/features/auth/api/authApi.ts
   - loginCliente, registerCliente, verifyEmail, forgotPassword, resetPassword
   - Endpoints del backend del Día 1

3. src/features/auth/schemas/auth.schemas.ts
   Zod schemas:
   - LoginSchema: email + password
   - RegisterSchema: email + password (min 8 + 1 may + 1 num) + ruc_cedula (10 o 13 digitos) + nombre1 + apellido1 + telefono?
   - ForgotPasswordSchema: email
   - ResetPasswordSchema: password + confirmPassword (refine: deben coincidir)

4. src/features/auth/hooks/
   - useLogin, useRegister, useVerifyEmail, useForgotPassword, useResetPassword
   - Cada uno useMutation + manejo de errores específicos

5. src/features/auth/components/LoginForm.tsx
   - react-hook-form + zod
   - Email + password con show/hide
   - "¿Olvidaste tu contraseña?" → /forgot-password
   - "¿No tenés cuenta? Registrate" → /register
   - Manejo de error EMAIL_NOT_VERIFIED → muestra "Verificá tu email · Reenviar"

6. src/features/auth/components/RegisterForm.tsx
   - Form con todos los campos
   - Validaciones inline (mostrar reglas de password al typear)
   - Acepta términos checkbox
   - Después de submit exitoso → muestra "Te enviamos un email · Verificalo para activar tu cuenta"
   - El backend en dev loggea el link de verificación a consola

7. src/features/auth/components/ForgotPasswordForm.tsx
   - Solo email
   - Después de submit: mensaje genérico "Si el email existe, te llegó un link"

8. src/features/auth/components/ResetPasswordForm.tsx
   - Lee :token de URL
   - Password + confirmPassword
   - Después de OK: redirect a /login con flash "Contraseña actualizada"

9. src/features/auth/pages/
   - LoginPage, RegisterPage, VerifyEmailPage (consume :token), 
     ForgotPasswordPage, ResetPasswordPage
   - Layout especial sin Header (AuthLayout):
     • Centered card max-w-modal
     • Logo VAULT 16 arriba
     • Form en el centro
     • Background con SVG art sutil

10. src/shared/components/layout/AuthLayout.tsx
    Layout sin Header/Footer normal, usado solo para rutas de auth.

11. src/shared/components/layout/ProtectedRoute.tsx
    HOC que verifica isAuthenticated:
    - Si no auth → redirect a /login con returnUrl=current
    - Si auth pero email_verificado = false → redirect a /verify-email-pending

ARCHIVOS DE CUENTA:

12. src/features/cuenta/components/CuentaSidebar.tsx
    Sidebar persistente del área de cuenta. Items:
    - 👤 Perfil          → /mi-cuenta
    - 📍 Direcciones     → /mi-cuenta/direcciones
    - 🔒 Seguridad       → /mi-cuenta/seguridad
    - 📦 Mis pedidos     → /mi-cuenta/pedidos
    
    NavLink active state. En mobile: collapsa a botones tabs arriba.

13. src/features/cuenta/components/PerfilForm.tsx
    Edita: nombre1, apellido1, telefono.
    NO permite cambiar email (eso es flujo separado, no MVP).
    Mostrar email + ruc_cedula como read-only.

14. src/features/cuenta/components/DireccionesList.tsx
    - Lista de direcciones del cliente
    - Cada card: alias, dirección completa, badge "Principal" si aplica
    - Botones: Editar / Eliminar / Marcar como principal
    - Botón grande "+ Agregar dirección"

15. src/features/cuenta/components/DireccionForm.tsx
    Modal o página separada con form:
    - alias (ej. "Casa", "Oficina")
    - calle_principal, numeracion, calle_secundaria?
    - referencia?
    - barrio?, ciudad, provincia, pais (default Ecuador), codigo_postal?
    - es_principal checkbox

16. src/features/cuenta/components/CambiarPasswordForm.tsx
    - oldPassword + newPassword + confirmPassword
    - Validación: newPassword !== oldPassword

17. src/features/cuenta/pages/PerfilPage, DireccionesPage, SeguridadPage

18. src/features/pedidos/components/
    - PedidoCard: id_factura, fecha, total, estado badge
    - PedidoDetalle: cabecera + items + tracking timeline
    - EstadoTimeline: visualización EMI → PAG → ENV → ENT con dots

19. src/features/pedidos/pages/PedidosPage, PedidoDetailPage

20. src/shared/components/layout/CuentaLayout.tsx
    EcommerceLayout + sidebar adicional.
    Path: /mi-cuenta/* protegido.

UPDATES:
- src/app/router.tsx: agregar todas las rutas
- UserMenu del Header: ahora conecta con authStore (los stubs del prompt 18 se reemplazan)

VALIDACIÓN:
- Login funciona, redirige a returnUrl si vino de protected
- Register → email pendiente → verify (botón "ya verifiqué" recarga el cliente)
- ResetPassword cierra el flow correctamente
- Cuenta se ve bien en mobile (sidebar collapsa)
- ProtectedRoute funciona en /mi-cuenta/* y /checkout
```

---

## 🟢 PROMPT 24 — Checkout flow (Stripe)

```
Implementá el flujo de checkout completo con Stripe Elements.

ESTRUCTURA EN 3 STEPS:
1. Dirección de envío
2. Pago (Stripe)
3. Confirmación

ARCHIVOS:

1. src/features/checkout/components/CheckoutSteps.tsx
   - Stepper visual arriba: ●─●─○ con labels
   - Estado actual destacado en accent
   - Steps anteriores clickeables, siguientes no

2. src/features/checkout/components/DireccionStep.tsx
   - Lista de direcciones del cliente (DireccionesList read-only)
   - Selector radio: cuál usar como envío
   - Botón "+ Agregar dirección nueva" → abre DireccionForm modal
   - Si no hay direcciones: empty state + "Agregar dirección" obligatorio
   - Botón "Continuar al pago" disabled hasta seleccionar una

3. src/features/checkout/components/ResumenOrden.tsx
   Sticky a la derecha durante todo el checkout:
   - Items del carrito (lista compacta)
   - Subtotal, descuentos, total
   - Datos de envío (cuando ya seleccionó)
   - Método de pago (cuando ya seleccionó)
   - Edit pencil para volver a steps anteriores

4. src/features/checkout/components/PagoStep.tsx
   Selector de método:
   - Tarjeta (Stripe) — recommended badge
   - Transferencia bancaria — instrucciones manual

   Si Tarjeta:
   - Inicializa Stripe con la pk del env
   - Componente <StripePaymentForm /> con CardElement
   - POST /api/checkout/iniciar-pago → recibe client_secret
   - stripe.confirmCardPayment(client_secret, ...)
   - Si OK → backend recibe webhook → backend confirma orden
     Mientras tanto: mostrar "Procesando..." con spinner
   - Si error: mostrar mensaje, permitir reintentar

   Si Transferencia:
   - Mostrar datos bancarios (cuenta de VAULT 16)
   - POST /api/checkout/iniciar-pago con metodo_pago='TRANSFERENCIA'
   - Recibe id_factura, instrucciones
   - Mostrar instrucciones + botón "Marcar como transferida"
   - Al click: redirect a /checkout/confirmacion/:idFactura
     (el admin después debe confirmar el pago manualmente)

5. src/features/checkout/components/StripePaymentForm.tsx
   - Wrap en <Elements stripe={stripePromise}>
   - <PaymentElement /> de Stripe
   - Botón "Pagar $XXX.XX"
   - Loading state, error handling
   - Si Stripe key es 'pk_test_placeholder' → mostrar warning visible:
     "MODO STUB · Stripe no está configurado. La transacción será simulada."
     Y simular el pago llamando directo al endpoint /api/checkout/confirmar
     (Esto es para que el flujo funcione end-to-end mientras no haya key real.)

6. src/features/checkout/hooks/useCheckout.ts
   - Estado del checkout (currentStep, direccion, metodo)
   - Funciones nextStep, prevStep, completeCheckout

7. src/features/checkout/hooks/useCreatePaymentIntent.ts
   - useMutation que llama al backend
   - Cachea el client_secret (no crear múltiples PaymentIntents en re-renders)

8. src/features/checkout/api/checkoutApi.ts
   - preview, iniciarPago, confirmar (interno por webhook)

9. src/features/checkout/pages/CheckoutPage.tsx
   - Layout: stepper arriba, step actual + ResumenOrden a la derecha
   - Protegido (requiere auth + email verificado + carrito no vacío)
   - Pre-validación al montar: GET /api/carrito/validar
     Si hay problemas (stock cambió, precio cambió) → mostrar warnings antes de continuar

10. src/features/checkout/pages/ConfirmacionPage.tsx
    - Recibe :idFactura
    - Loading: poll cada 2s GET /api/facturas/me/:id hasta estado='PAG' (max 30s)
    - Cuando confirmado:
      • Animación check verde grande con framer-motion
      • "¡Listo! Tu pedido es #001-001-000000123"
      • Resumen del pedido
      • Botones: "Ver pedido" (→ /mi-cuenta/pedidos/:id) / "Seguir comprando"
      • Si transferencia: instrucciones de pago + "Te avisaremos cuando confirmemos"

VALIDACIÓN:
- Flujo completo: carrito → checkout → dirección → pago → confirmación
- Con Stripe stub: el flujo termina sin errores
- Si stock se acabó entre carrito y checkout: error claro + opción de quitar item
- Edge case: usuario hace back, no se duplica orden
- Email de confirmación (TODO backend, por ahora solo console)
```

---

## 🟢 PROMPT 25 — Promociones + Páginas estáticas + Búsqueda

```
Implementá las páginas restantes que faltan para completar el sitio.

ARCHIVOS:

1. src/features/promociones/components/PromocionBanner.tsx
   - Banner full-width destacado por promo
   - Imagen procedural SVG con el nombre del drop
   - Fechas vigentes
   - CTA "Ver productos"

2. src/features/promociones/components/PromocionCard.tsx
   - Card con info de la promo
   - Lista mini de productos incluidos (3 thumbnails + "+N más")

3. src/features/promociones/pages/PromocionesPage.tsx
   - Lista de promociones activas
   - GET /api/promociones (solo vigentes)
   - Cada promo expandible: muestra todos los productos al click

4. src/features/estaticas/pages/AcercaPage.tsx
   "QUIÉNES SOMOS" — la historia de VAULT 16
   - Hero con SVG art
   - Bloques de texto:
     • Origen: "VAULT 16 nace en Quito en 2026..."
     • Filosofía: streetwear urbano, sin pretensiones
     • Sustentabilidad: tela peruana de calidad, producción local
   - CTA: "Ver catálogo"
   
   IMPORTANTE: El copy debe sonar AUTÉNTICO, no marketing fake.
   Tono: directo, urbano, ecuatoriano sin caer en exceso de modismos.

5. src/features/estaticas/pages/ContactoPage.tsx
   - Form: nombre, email, asunto, mensaje
   - Por ahora: al submit → toast success (sin backend)
   - Datos de contacto laterales: email, redes sociales (placeholders)

6. src/features/estaticas/pages/TerminosPage.tsx
   - Términos y condiciones MVP (3-4 secciones placeholder)
   - Última actualización: fecha

7. src/features/estaticas/pages/PrivacidadPage.tsx
   - Política de privacidad MVP

8. BUSCADOR — refactor del SearchBar:
   src/features/catalogo/hooks/useSemanticSearch.ts
   - Cuando el usuario tipea en SearchBar → debounce 400ms
   - Si la query tiene < 3 chars → no hacer nada
   - Llama a GET /api/productos?search=... (búsqueda léxica por ahora)
   - Muestra dropdown con top 5 sugerencias debajo del search
   - Cada sugerencia: thumbnail + nombre + categoría + precio
   - Click en sugerencia → /producto/:id
   - Botón abajo "Ver todos los resultados (N)" → /catalogo?q=...
   
   FUTURO (con keys): cuando ANTHROPIC_API_KEY esté configurada,
   agregar GET /api/productos/search-semantic que use embeddings.
   El frontend lo detecta vía /health y switcha automáticamente.

9. src/features/catalogo/components/SearchResultsDropdown.tsx
   - Dropdown debajo del SearchBar
   - Muestra resultados en tiempo real
   - Click fuera cierra
   - Loading state con skeleton

10. UPDATES en router.tsx con todas las rutas finales

VALIDACIÓN:
- Promociones page muestra el "Drop 001 — Lanzamiento" del seed
- Acerca/Contacto/Términos/Privacidad accesibles desde footer
- SearchBar dropdown funciona y filtra correctamente
```

---

## 🟢 PROMPT 26 — Asistente IA Widget (★ EL DIFERENCIAL ★)

```
Implementá el widget del asistente de compra IA. ES EL DIFERENCIADOR DE VAULT 16.

UBICACIÓN: src/features/assistant/

CONTEXTO:
- El backend tiene POST /api/assistant/chat con streaming SSE
- Si ANTHROPIC_API_KEY no está configurada → backend responde con stubs
- El widget debe funcionar igual con stubs (UX completa)

DISEÑO:

ESTADO CERRADO:
Botón circular flotante bottom-right (fixed):
- 56x56, rounded-full, bg-accent, shadow-lg
- Icono: MessageCircle de lucide
- Pulse sutil cada 8 segundos para llamar atención (no agresivo)
- Badge con notificación "1" si hay mensaje sin leer (placeholder)

ESTADO ABIERTO:
Drawer/panel desde abajo-derecha:
- Width: 380px, height: 600px (en desktop)
- Mobile: full screen
- Estructura:

┌─────────────────────────────────┐
│ ⚡ Asistente VAULT 16     [✕]  │  ← header con avatar + botón cerrar
├─────────────────────────────────┤
│ Sugerencias (al inicio):        │
│ [Buscame algo negro]            │
│ [Tengo $50, qué me recomendás]  │
│ [Necesito hoodie oversize]      │
├─────────────────────────────────┤
│                                 │
│ 💬 Hola! Soy el asistente...    │  ← mensajes
│                                 │
│              Mensaje del user > │
│                                 │
│ 💬 Te recomiendo el Hoodie...   │
│   [card mini producto]          │  ← productos referenciados
│                                 │
├─────────────────────────────────┤
│ [Escribí tu mensaje...] [➤]     │  ← input
└─────────────────────────────────┘

ARCHIVOS:

1. src/features/assistant/stores/chatStore.ts
   interface ChatStore {
     isOpen: boolean
     idSesion: string | null              // UUID generado al primer mensaje
     mensajes: Message[]
     isStreaming: boolean
     toggleOpen: () => void
     close: () => void
     enviarMensaje: (texto: string) => Promise<void>
   }
   
   El idSesion se genera en frontend (crypto.randomUUID()).
   Persiste idSesion en localStorage para retomar conversación.

2. src/features/assistant/api/assistantApi.ts
   - getSesion(idSesion): si existe en backend, recupera mensajes
   - chatStream(idSesion, mensaje): retorna ReadableStream del SSE
   - chatSync(idSesion, mensaje): fallback no-streaming

3. src/features/assistant/hooks/useChatStream.ts
   Maneja el streaming SSE:
   
   const enviarMensaje = async (texto) => {
     // 1. Agregar mensaje del user al store inmediatamente
     chatStore.appendMessage({ rol: 'user', contenido: texto })
     
     // 2. Agregar mensaje vacío del assistant (para fill in stream)
     chatStore.appendMessage({ rol: 'assistant', contenido: '', streaming: true })
     
     // 3. Llamar al endpoint con fetch + getReader
     const response = await fetch('/api/assistant/chat', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ mensaje: texto, id_sesion: chatStore.idSesion })
     })
     
     const reader = response.body!.getReader()
     const decoder = new TextDecoder()
     let buffer = ''
     
     while (true) {
       const { done, value } = await reader.read()
       if (done) break
       buffer += decoder.decode(value, { stream: true })
       
       // Parse SSE: cada línea data: {...}\n\n
       const lines = buffer.split('\n\n')
       buffer = lines.pop() || ''
       
       for (const line of lines) {
         if (!line.startsWith('data: ')) continue
         const data = JSON.parse(line.slice(6))
         
         if (data.type === 'text') {
           chatStore.appendToLastMessage(data.content)
         } else if (data.type === 'done') {
           chatStore.finalizeLastMessage(data.productos_referenciados)
         }
       }
     }
   }

4. src/features/assistant/components/ChatWidget.tsx
   El componente principal. Maneja open/close.
   - Renderiza FAB cuando cerrado
   - Renderiza Drawer cuando abierto
   - framer-motion AnimatePresence para transiciones

5. src/features/assistant/components/ChatHeader.tsx
   - Avatar (icono Zap de lucide en círculo bg-accent)
   - Nombre "Asistente VAULT 16"
   - Status: "● En línea" en verde
   - Botón cerrar [✕]
   - Botón menú con: "Limpiar conversación" / "Reportar problema"

6. src/features/assistant/components/MessageList.tsx
   - Scroll auto-bottom cuando llega mensaje nuevo (usar ref + useEffect)
   - Cada mensaje es <MessageBubble />
   - Si mensaje.streaming: muestra <TypingIndicator /> al final

7. src/features/assistant/components/MessageBubble.tsx
   USER (right-aligned):
   - bg-accent, text white, rounded-2xl, max-w-80%
   - Padding p-3
   
   ASSISTANT (left-aligned):
   - bg-bg-card, rounded-2xl, max-w-80%
   - Avatar pequeño Zap a la izquierda
   - Soporta markdown render (usar react-markdown):
     • Bold, italic, lists
     • Links: cualquier link con /producto/:id se trasforma a <ProductoCardInline />
   - Si productos_referenciados.length > 0:
     • Mostrar cards inline después del texto
     • <ProductoCardInline /> compacta

8. src/features/assistant/components/ProductoCardInline.tsx
   Card compacto: thumbnail + nombre + precio + "Ver" link.
   Click → /producto/:id (cierra el chat? no — lo deja abierto).

9. src/features/assistant/components/ChatInput.tsx
   - Textarea autogrow (max 4 lines)
   - Botón send (icono Send de lucide)
   - Enter → enviar (Shift+Enter → nueva línea)
   - Disabled mientras isStreaming
   - Counter "X/500 chars"

10. src/features/assistant/components/TypingIndicator.tsx
    3 dots animados (bounce sequential) — clásico chat indicator.

11. src/features/assistant/components/SugerenciasIniciales.tsx
    Mostrado solo si mensajes.length === 0:
    - 4-5 chips clickeables con sugerencias
    - Click → enviarMensaje(texto del chip)
    - Sugerencias:
      • "Mostrame los más vendidos"
      • "Tengo $50, qué me recomendás"
      • "Buscame un hoodie oversize"
      • "Qué hay nuevo en VAULT 16"

12. INTEGRACIÓN GLOBAL:
    En src/app/App.tsx después del router:
    <ChatWidget />     // siempre visible en todas las páginas

DECISIÓN UX:
- El widget NO se abre auto. Solo cuando user clickea.
- En mobile, abrir el widget oculta el resto de la página (full-screen drawer).
- El widget persiste idSesion así el usuario puede cerrar la pestaña y al volver continuar.

VALIDACIÓN:
- Streaming funciona suavemente (los caracteres aparecen progresivamente)
- Productos referenciados aparecen como cards
- El widget funciona en mobile (full-screen) y desktop (drawer)
- Si backend está en stub, igual funciona (el stub también stream-simulea)
```

---

## 🟢 PROMPT 27 — Cierre, hardening y deployment-ready

```
Último prompt del frontend. Tareas finales:

1. RESPONSIVE FINAL CHECK
   Probá EXHAUSTIVAMENTE en estos breakpoints y arreglá lo roto:
   - 375px (iPhone SE)
   - 768px (iPad)
   - 1024px (laptop chico)
   - 1440px (laptop)
   - 1920px (desktop)
   
   Especialmente revisá:
   - Header: nav row 2 collapsa a hamburger menu en < 768px
   - Catálogo: filtros se mueven a drawer en < 1024px
   - Detalle producto: galería + info se stackean en < 1024px
   - Carrito drawer: full-width en < 640px
   - Chat widget: full-screen en < 768px
   - Footer: 1 columna en < 768px

2. PERFORMANCE
   - Lazy load de rutas con React.lazy:
     const HomePage = lazy(() => import('@/features/home/pages/HomePage'))
   - Wrap en <Suspense fallback={<PageSkeleton />}>
   - Verificá Lighthouse:
     • Performance > 90 mobile
     • Accessibility > 95
     • Best Practices > 90
     • SEO > 90

3. ACCESSIBILITY
   - Todos los botones con aria-label si no tienen texto
   - Todos los inputs con label asociado
   - Focus states visibles (no remover outline)
   - Contraste mínimo AA (verifica con devtools)
   - Skip-to-content link en el Header
   - Modal/Drawer atrapan el focus correctamente
   - Escape cierra modales

4. SEO BÁSICO
   - <Helmet> en cada página principal con title + meta description
   - npm install react-helmet-async
   - Title format: "{Page} · VAULT 16"
   - Meta description única por página
   - Open Graph tags básicos en index.html
   - sitemap.xml básico (estático por ahora)

5. ERROR BOUNDARIES
   - <ErrorBoundary /> wrappea las rutas principales
   - Fallback: "Algo falló · Recargar página"
   - Loggea a console.error (en prod podés enviar a Sentry)

6. ESTADO DE CARGA GLOBAL
   - <PageSkeleton /> para suspense fallbacks
   - <CardSkeleton /> reusado en varios lugares
   - Spinners consistentes en mutations

7. CONFIGURACIÓN DE PRODUCCIÓN
   - vite.config.ts: build.outDir = 'dist'
   - .env.production con la URL real del backend (placeholder por ahora)
   - npm run build verifica que no hay errores TS
   - Genera dist/ < 500KB gzipped (sin imágenes — todo SVG ayuda)

8. README.md DEL FRONTEND
   Generá README con:
   - Cómo correr en dev
   - Variables de entorno
   - Cómo conectar al backend
   - Lista de features
   - Stack tecnológico
   - Estructura de carpetas resumida

9. DEPLOYMENT — Azure Static Web Apps
   - staticwebapp.config.json en raíz:
     {
       "navigationFallback": {
         "rewrite": "/index.html",
         "exclude": ["/static/*", "*.{css,js,svg,jpg,png}"]
       }
     }
   - Asegurá que VITE_API_URL apunta al backend desplegado
   - Workflow GitHub Actions de Azure SWA (auto-generado)

10. CHECKLIST FINAL DE FUNCIONALIDADES
    Probá end-to-end estos flujos:
    
    A) Flujo de compra (sin login):
       1. Browser /
       2. Click producto destacado
       3. Seleccionar talla, agregar al carrito
       4. Drawer se abre
       5. "Ir a pagar" → redirect a /login
       6. Register nuevo cliente
       7. Verificar email (link de consola del backend)
       8. Login
       9. Carrito se mantiene (mergeado del local)
       10. Continuar checkout
       11. Agregar dirección
       12. Pagar con Stripe stub o transferencia
       13. Ver confirmación
       14. Ver pedido en /mi-cuenta/pedidos
    
    B) Flujo de catálogo:
       1. /catalogo
       2. Filtrar por categoría hoodies
       3. Filtrar por talla M
       4. Filtrar por color negro
       5. Slider precio 30-60
       6. URL refleja filtros
       7. Compartir URL → otro browser ve mismos filtros
       8. Limpiar filtros
       9. Infinite scroll funciona
    
    C) Calculadora de tallas:
       1. Abrir detalle de hoodie
       2. Click "Guía de tallas"
       3. Ingresar pecho 96
       4. Fit "regular"
       5. Resultado: "Tu talla: S, confianza alta"
       6. Aplicar → talla S queda seleccionada en el detalle
    
    D) Asistente IA:
       1. Click FAB
       2. Click sugerencia "buscame algo negro"
       3. Asistente responde con productos
       4. Click en card de producto → /producto/:id
       5. Volver al chat → conversación persiste
    
    E) Dark mode:
       1. Toggle en header
       2. Persiste tras reload
       3. Todos los componentes responden bien (sin contrastes raros)

VALIDACIÓN FINAL:
- Build pasa sin errores TS
- Dev server arranca sin warnings
- Lighthouse > 90 en todas las métricas
- Los 5 flujos end-to-end pasan sin errores
- En mobile la experiencia es fluida
- Con backend en modo stub: el sitio sigue funcionando 100%
```

---

## 🔴 STOP DEL DÍA 3 — VAULT 16 está listo

Tenés:
- ✅ Bootstrap completo del e-commerce
- ✅ Layout con header dual-row, footer, theme toggle
- ✅ Home con carrusel + destacados + categorías llamativas
- ✅ Catálogo con filtros + infinite scroll
- ✅ Detalle de producto con galería + selección variante
- ✅ Calculadora de tallas (frontend puro, SVG procedural)
- ✅ Carrito drawer con animaciones
- ✅ Auth completo + email verification
- ✅ Cuenta del cliente (perfil, direcciones, pedidos)
- ✅ Checkout 3-step con Stripe (stub-aware)
- ✅ Promociones y páginas estáticas
- ✅ Asistente IA con streaming
- ✅ Responsive mobile-first
- ✅ Performance optimizada
- ✅ Deployment-ready para Azure SWA

## PRÓXIMO PASO: Backoffice

Una vez VAULT 16 esté desplegado y funcional, el día 4 arrancamos con el backoffice
(panel admin). Ese es más simple porque es internal-facing, no necesita estética
"wow". Es CRUDs + dashboards + tablas con TanStack Table.

## NOTAS SOBRE IMÁGENES

Como aún no tenés fotos reales de productos, durante todo el día 3 usaste:
- SVGs procedurales generados por el agente (productos, hero, categorías)
- Patrones únicos por producto usando el id como seed (consistencia visual)

Cuando tengas fotos reales:
1. Subilas vía POST /api/productos/:id/fotos (Azure Blob)
2. El frontend automáticamente las muestra (el componente <ProductImage /> ya
   tiene fallback al SVG procedural si no hay fotos)
3. El SVG queda solo como fallback elegante

## CUANDO TENGAS API KEYS

Stripe:
- VITE_STRIPE_PUBLIC_KEY=pk_test_xxx en .env.local
- El warning de "MODO STUB" desaparece automáticamente
- Probás con tarjeta 4242 4242 4242 4242

Anthropic + Voyage:
- Solo afecta al backend (frontend ya está conectado al endpoint)
- Las respuestas del asistente pasan de stub a reales
- La búsqueda semántica del SearchBar empieza a funcionar
