// ─── Tipos de Producto (normalizados desde la respuesta del backend) ──────────
// El backend devuelve formas crudas de Prisma (id_producto, precio_venta,
// producto_fotos, etc.). El frontend usa estas formas normalizadas y los
// mappers en `@/shared/lib/mappers.ts` transforman raw → frontend.

export interface Categoria {
  id: string
  nombre: string
  slug: string
}

export interface Talla {
  id: number
  nombre: string
}

export interface Foto {
  id: number
  url: string
  orden: number
  esPrincipal: boolean
}

export interface Variante {
  id: number
  productoId: string
  tallaId: number
  color: string
  codigoHex: string
  stock: number
  sku: string
  talla: Talla
}

export interface Producto {
  id: string
  categoriaId: string
  nombre: string
  slug: string
  descripcion: string | null
  precio: number
  destacado: boolean
  activo: boolean
  creadoEn: string
  actualizadoEn: string
  categoria: Categoria
  fotos: Foto[]
  variantes: Variante[]
  // Calculados por el frontend:
  porcentajeDescuentoActivo?: number
}

export interface ProductosPaginados {
  items: Producto[]
  meta: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// ─── Categorías para la home ──────────────────────────────────────────────────

export interface CategoriaHome {
  id: string
  nombre: string
  slug: string
}

export const CATEGORIAS_VISUAL: CategoriaHome[] = [
  { id: 'HOO', nombre: 'Hoodies', slug: 'hoodies' },
  { id: 'TEE', nombre: 'T-Shirts', slug: 't-shirts' },
  { id: 'PAN', nombre: 'Pants', slug: 'pants' },
  { id: 'JAC', nombre: 'Jackets', slug: 'jackets' },
  { id: 'ACC', nombre: 'Accesorios', slug: 'accesorios' },
  { id: 'SET', nombre: 'Sets', slug: 'sets' },
]
