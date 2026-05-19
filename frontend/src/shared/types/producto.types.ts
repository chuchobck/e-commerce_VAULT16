// ─── Tipos de Producto (reflejan la respuesta del backend) ────────────────────

export interface Categoria {
  id: number
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
  productoId: number
  tallaId: number
  color: string
  codigoHex: string
  stock: number
  sku: string
  talla: Talla
}

export interface Producto {
  id: number
  categoriaId: number
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
    limit: number
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
