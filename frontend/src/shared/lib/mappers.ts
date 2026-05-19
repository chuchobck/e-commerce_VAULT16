// ─── Mappers: raw Prisma (backend) → frontend types ──────────────────────────
// El backend devuelve filas crudas de Prisma (id_producto, precio_venta,
// producto_fotos, promocion_detalle, etc.). Estos mappers convierten cada
// forma cruda en el tipo plano que esperan los componentes.

import {
  CATEGORIAS_VISUAL,
  type Categoria,
  type Foto,
  type Producto,
  type Variante,
} from '@/shared/types/producto.types'

const CATEGORIA_NOMBRE: Record<string, string> = Object.fromEntries(
  CATEGORIAS_VISUAL.map((c) => [c.id, c.nombre]),
)

const CATEGORIA_SLUG: Record<string, string> = Object.fromEntries(
  CATEGORIAS_VISUAL.map((c) => [c.id, c.slug]),
)

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toNumber(v: unknown): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = parseFloat(v)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

// ─── Categoría ───────────────────────────────────────────────────────────────

export interface RawCategoria {
  id_categoria: string
  nombre: string
  descripcion?: string | null
  estado?: string
}

export function mapCategoria(raw: RawCategoria): Categoria {
  return {
    id: raw.id_categoria,
    nombre: raw.nombre,
    slug: CATEGORIA_SLUG[raw.id_categoria] ?? slugify(raw.nombre),
  }
}

// ─── Foto ────────────────────────────────────────────────────────────────────

export interface RawFoto {
  id_foto?: number
  url_foto: string
  alt_text?: string | null
  es_principal?: boolean
  orden?: number
}

export function mapFoto(raw: RawFoto, idx = 0): Foto {
  return {
    id: raw.id_foto ?? idx,
    url: raw.url_foto,
    orden: raw.orden ?? idx,
    esPrincipal: raw.es_principal ?? idx === 0,
  }
}

// ─── Variante ────────────────────────────────────────────────────────────────

export interface RawVariante {
  id_variante: number
  id_producto: string
  id_talla: number
  color: string
  sku: string
  var_saldo_final?: number
  talla?: { id_talla: number; descripcion: string }
}

const COLOR_HEX: Record<string, string> = {
  Negro: '#1a1a1a',
  Antracita: '#353C42',
  Carbón: '#2E353B',
  Carbon: '#2E353B',
  Pizarra: '#4A535A',
  Hueso: '#F5F0E8',
  Arena: '#C8B89A',
  Cemento: '#9AA3AB',
  Oliva: '#5C6B4F',
  'Verde Mil': '#4A5C3E',
  Beige: '#D4C4A8',
  Marrón: '#6B4E37',
  Marron: '#6B4E37',
  'Gris Mel': '#8C8C8C',
  Blanco: '#F8F8F8',
}

export function mapVariante(raw: RawVariante): Variante {
  return {
    id: raw.id_variante,
    productoId: raw.id_producto,
    tallaId: raw.id_talla,
    color: raw.color,
    codigoHex: COLOR_HEX[raw.color] ?? '#4A535A',
    stock: raw.var_saldo_final ?? 0,
    sku: raw.sku,
    talla: raw.talla
      ? { id: raw.talla.id_talla, nombre: raw.talla.descripcion }
      : { id: raw.id_talla, nombre: '' },
  }
}

// ─── Producto ────────────────────────────────────────────────────────────────

export interface RawProducto {
  id_producto: string
  id_categoria: string
  nombre: string
  descripcion_corta?: string | null
  precio_venta: string | number
  estado_prod: string
  created_at: string
  updated_at: string
  producto_fotos?: RawFoto[]
  categoria_producto?: RawCategoria
  variante_producto?: RawVariante[]
  _count?: { variante_producto?: number }
}

export function mapProducto(raw: RawProducto): Producto {
  const categoria: Categoria = raw.categoria_producto
    ? mapCategoria(raw.categoria_producto)
    : {
        id: raw.id_categoria,
        nombre: CATEGORIA_NOMBRE[raw.id_categoria] ?? raw.id_categoria,
        slug: CATEGORIA_SLUG[raw.id_categoria] ?? raw.id_categoria.toLowerCase(),
      }

  return {
    id: raw.id_producto,
    categoriaId: raw.id_categoria,
    nombre: raw.nombre,
    slug: slugify(raw.nombre),
    descripcion: raw.descripcion_corta ?? null,
    precio: toNumber(raw.precio_venta),
    destacado: false,
    activo: raw.estado_prod === 'ACT',
    creadoEn: raw.created_at,
    actualizadoEn: raw.updated_at,
    categoria,
    fotos: (raw.producto_fotos ?? []).map(mapFoto),
    variantes: (raw.variante_producto ?? []).map(mapVariante),
  }
}

// ─── Promoción ───────────────────────────────────────────────────────────────

export interface RawPromocion {
  id_promocion: number
  nombre: string
  descripcion: string | null
  porcentaje_descuento: string | number
  fecha_inicio: string
  fecha_fin: string
  estado: string
  promocion_detalle?: Array<{
    id_producto: string
    producto: {
      id_producto: string
      nombre: string
      precio_venta: string | number
      estado_prod: string
      producto_fotos?: RawFoto[]
    }
  }>
}

export interface PromocionMapped {
  id: number
  nombre: string
  descripcion: string
  porcentaje: number
  fechaInicio: string
  fechaFin: string
  activa: boolean
  productos: Array<{
    id: string
    nombre: string
    slug: string
    precio: number
    fotos: Foto[]
  }>
}

// ─── Cliente ─────────────────────────────────────────────────────────────────

export interface RawCliente {
  id_cliente: number
  email: string
  nombre1: string
  apellido1: string
  telefono?: string | null
  ruc_cedula?: string
  email_verificado?: boolean
  estado?: string
}

export interface ClienteMapped {
  id: number
  rucCedula: string
  nombre1: string
  apellido1: string
  email: string
  telefono: string | null
  emailVerificado: boolean
}

export function mapCliente(raw: RawCliente): ClienteMapped {
  return {
    id: raw.id_cliente,
    email: raw.email,
    nombre1: raw.nombre1,
    apellido1: raw.apellido1,
    telefono: raw.telefono ?? null,
    rucCedula: raw.ruc_cedula ?? '',
    emailVerificado: raw.email_verificado ?? true,
  }
}

// ─── Dirección ───────────────────────────────────────────────────────────────

export interface RawDireccion {
  id_direccion: number
  id_cliente: number
  alias: string
  nombre_destinatario: string
  telefono_contacto: string
  provincia: string
  ciudad: string
  direccion: string
  referencia?: string | null
  codigo_postal?: string | null
  es_principal: boolean
  activa?: boolean
}

export interface DireccionMapped {
  id: number
  clienteId: number
  alias: string
  nombreDestinatario: string
  telefonoContacto: string
  provincia: string
  ciudad: string
  direccion: string
  referencia: string | null
  codigoPostal: string | null
  esPrincipal: boolean
}

export function mapDireccion(raw: RawDireccion): DireccionMapped {
  return {
    id: raw.id_direccion,
    clienteId: raw.id_cliente,
    alias: raw.alias,
    nombreDestinatario: raw.nombre_destinatario,
    telefonoContacto: raw.telefono_contacto,
    provincia: raw.provincia,
    ciudad: raw.ciudad,
    direccion: raw.direccion,
    referencia: raw.referencia ?? null,
    codigoPostal: raw.codigo_postal ?? null,
    esPrincipal: raw.es_principal,
  }
}

// ─── Factura / Pedido ────────────────────────────────────────────────────────

export interface RawFacturaList {
  id_factura: string
  id_cliente: number
  fecha_emision: string
  estado: string
  subtotal: string | number
  descuento_total?: string | number
  impuestos?: string | number
  total: string | number
  cliente?: { id_cliente: number; email: string; nombre1: string; apellido1: string }
  pago?: Array<{ metodo: string; estado: string; monto: string | number; fecha: string }>
  detalle_factura?: RawDetalleFactura[]
  _count?: { detalle_factura?: number }
}

export interface RawDetalleFactura {
  id_detalle?: number
  cantidad: number
  precio_unitario: string | number
  subtotal: string | number
  variante_producto?: {
    id_variante: number
    sku: string
    color: string
    id_producto: string
    talla?: { descripcion: string }
    producto?: { nombre: string; precio_venta: string | number; producto_fotos?: RawFoto[] }
  }
}

export interface RawFacturaFull extends RawFacturaList {
  direccion_cliente?: RawDireccion | null
  detalle_factura?: RawDetalleFactura[]
}

export type EstadoPedido = 'EMI' | 'PAG' | 'ENV' | 'ENT' | 'CAN' | 'ANU'

export interface PedidoResumenMapped {
  id: number
  idFactura: string
  fecha: string
  estado: EstadoPedido
  total: number
  totalItems: number
}

export interface PedidoItemMapped {
  id: number
  productoNombre: string
  talla: string
  color: string
  cantidad: number
  precioUnitario: number
  subtotal: number
  imagen: string
}

export interface PedidoMapped {
  id: number
  idFactura: string
  fecha: string
  estado: EstadoPedido
  subtotal: number
  descuento: number
  impuestos: number
  total: number
  items: PedidoItemMapped[]
  direccionEnvio: {
    callePrincipal: string
    numeracion: string
    ciudad: string
    provincia: string
  } | null
}

function hashStringToInt(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function mapPedidoResumen(raw: RawFacturaList): PedidoResumenMapped {
  return {
    id: hashStringToInt(raw.id_factura),
    idFactura: raw.id_factura,
    fecha: raw.fecha_emision,
    estado: raw.estado as EstadoPedido,
    total: toNumber(raw.total),
    totalItems: raw._count?.detalle_factura ?? raw.detalle_factura?.length ?? 0,
  }
}

export function mapPedido(raw: RawFacturaFull): PedidoMapped {
  return {
    id: hashStringToInt(raw.id_factura),
    idFactura: raw.id_factura,
    fecha: raw.fecha_emision,
    estado: raw.estado as EstadoPedido,
    subtotal: toNumber(raw.subtotal),
    descuento: toNumber(raw.descuento_total ?? 0),
    impuestos: toNumber(raw.impuestos ?? 0),
    total: toNumber(raw.total),
    items: (raw.detalle_factura ?? []).map((d, i) => ({
      id: d.id_detalle ?? i,
      productoNombre: d.variante_producto?.producto?.nombre ?? 'Producto',
      talla: d.variante_producto?.talla?.descripcion ?? '',
      color: d.variante_producto?.color ?? '',
      cantidad: d.cantidad,
      precioUnitario: toNumber(d.precio_unitario),
      subtotal: toNumber(d.subtotal),
      imagen: d.variante_producto?.producto?.producto_fotos?.[0]?.url_foto ?? '',
    })),
    direccionEnvio: raw.direccion_cliente
      ? {
          callePrincipal: raw.direccion_cliente.direccion,
          numeracion: '',
          ciudad: raw.direccion_cliente.ciudad,
          provincia: raw.direccion_cliente.provincia,
        }
      : null,
  }
}

export function mapPromocion(raw: RawPromocion): PromocionMapped {
  return {
    id: raw.id_promocion,
    nombre: raw.nombre,
    descripcion: raw.descripcion ?? '',
    porcentaje: toNumber(raw.porcentaje_descuento),
    fechaInicio: raw.fecha_inicio,
    fechaFin: raw.fecha_fin,
    activa: raw.estado === 'ACT',
    productos: (raw.promocion_detalle ?? []).map((d) => ({
      id: d.producto.id_producto,
      nombre: d.producto.nombre,
      slug: slugify(d.producto.nombre),
      precio: toNumber(d.producto.precio_venta),
      fotos: (d.producto.producto_fotos ?? []).map(mapFoto),
    })),
  }
}
