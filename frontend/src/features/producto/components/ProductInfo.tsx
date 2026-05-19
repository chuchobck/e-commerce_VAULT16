import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Minus, Plus, Check, Ruler } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { SizeCalculatorModal } from './SizeCalculatorModal'
import { useAgregarAlCarrito } from '@/features/producto/hooks/useAgregarAlCarrito'
import { cn } from '@/shared/utils/cn'
import type { Producto, Variante } from '@/shared/types/producto.types'

// ─── Breadcrumb ──────────────────────────────────────────────────────────────

function Breadcrumb({ producto }: { producto: Producto }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-text-muted dark:text-text-muted-dark mb-4 flex-wrap" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-accent transition-colors">Inicio</Link>
      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      <Link to="/catalogo" className="hover:text-accent transition-colors">Catálogo</Link>
      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      <Link
        to={`/categoria/${producto.categoria.slug}`}
        className="hover:text-accent transition-colors"
      >
        {producto.categoria.nombre}
      </Link>
      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="text-text-primary dark:text-text-primary-dark font-medium truncate max-w-[200px]">
        {producto.nombre}
      </span>
    </nav>
  )
}

// ─── Stock Badge ─────────────────────────────────────────────────────────────

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="text-sm font-medium text-status-danger dark:text-status-danger-dark">
        Agotado
      </span>
    )
  }
  if (stock <= 3) {
    return (
      <span className="text-sm font-medium text-status-warning dark:text-status-warning-dark">
        Solo quedan {stock}
      </span>
    )
  }
  return (
    <span className="text-sm text-text-secondary dark:text-text-secondary-dark">
      {stock} disponibles
    </span>
  )
}

// ─── Description Tabs ────────────────────────────────────────────────────────

function DescriptionTabs({ producto }: { producto: Producto }) {
  const [tab, setTab] = useState<'descripcion' | 'detalles' | 'cuidado'>('descripcion')

  const tabs = [
    { id: 'descripcion' as const, label: 'Descripción' },
    { id: 'detalles' as const, label: 'Detalles' },
    { id: 'cuidado' as const, label: 'Cuidado' },
  ]

  const cuidadoBullets = [
    'Lavar a máquina en agua fría',
    'No usar lavandina',
    'Secar a la sombra',
    'Planchar a temperatura baja',
    'No lavar en seco',
  ]

  return (
    <div className="mt-8 border-t border-border-base dark:border-border-base-dark pt-6">
      {/* Tab headers */}
      <div className="flex gap-6 border-b border-border-base dark:border-border-base-dark">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'pb-3 text-sm font-medium transition-colors border-b-2',
              tab === t.id
                ? 'text-accent border-accent'
                : 'text-text-secondary dark:text-text-secondary-dark border-transparent hover:text-text-primary dark:hover:text-text-primary-dark',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pt-4 text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
        {tab === 'descripcion' && (
          <p>{producto.descripcion || 'Sin descripción disponible.'}</p>
        )}
        {tab === 'detalles' && (
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
              Categoría: {producto.categoria.nombre}
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
              {producto.variantes.length} variantes disponibles
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
              Envío gratis en pedidos mayores a $80
            </li>
          </ul>
        )}
        {tab === 'cuidado' && (
          <ul className="space-y-2">
            {cuidadoBullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ─── ProductInfo ─────────────────────────────────────────────────────────────

interface ProductInfoProps {
  producto: Producto
}

export function ProductInfo({ producto }: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedTalla, setSelectedTalla] = useState<string | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [sizeModalOpen, setSizeModalOpen] = useState(false)
  const { agregar, isAdding, showSuccess } = useAgregarAlCarrito()

  // ── Unique colors ──────────────────────────────────────────────────────

  const uniqueColors = useMemo(() => {
    const seen = new Map<string, { color: string; hex: string }>()
    for (const v of producto.variantes) {
      if (!seen.has(v.color)) {
        seen.set(v.color, { color: v.color, hex: v.codigoHex || '#4A535A' })
      }
    }
    return Array.from(seen.values())
  }, [producto.variantes])

  // Auto-select first color
  useMemo(() => {
    if (!selectedColor && uniqueColors.length > 0) {
      setSelectedColor(uniqueColors[0].color)
    }
  }, [uniqueColors, selectedColor])

  // ── Available tallas for selected color ────────────────────────────────

  const tallasForColor = useMemo(() => {
    if (!selectedColor) return []
    return producto.variantes
      .filter((v) => v.color === selectedColor)
      .map((v) => ({
        nombre: v.talla.nombre,
        stock: v.stock,
        variante: v,
      }))
  }, [producto.variantes, selectedColor])

  // ── Selected variante ──────────────────────────────────────────────────

  const selectedVariante: Variante | null = useMemo(() => {
    if (!selectedColor || !selectedTalla) return null
    return (
      producto.variantes.find(
        (v) => v.color === selectedColor && v.talla.nombre === selectedTalla,
      ) || null
    )
  }, [producto.variantes, selectedColor, selectedTalla])

  const currentStock = selectedVariante?.stock ?? 0

  // ── Handlers ───────────────────────────────────────────────────────────

  const handleColorChange = useCallback(
    (color: string) => {
      setSelectedColor(color)
      setSelectedTalla(null)
      setCantidad(1)
    },
    [],
  )

  const handleTallaChange = useCallback(
    (talla: string) => {
      setSelectedTalla(talla)
      setCantidad(1)
    },
    [],
  )

  const handleApplySizeTalla = useCallback(
    (talla: string) => {
      // Check if this talla exists in the current color variants
      const exists = tallasForColor.some(
        (t) => t.nombre === talla && t.stock > 0,
      )
      if (exists) {
        setSelectedTalla(talla)
      }
    },
    [tallasForColor],
  )

  const handleAddToCart = useCallback(() => {
    if (!selectedVariante) return
    agregar(producto, selectedVariante, cantidad)
  }, [producto, selectedVariante, cantidad, agregar])

  const canAdd = selectedVariante && currentStock > 0 && !isAdding
  const descuento = producto.porcentajeDescuentoActivo
  const precioOriginal = descuento ? (producto.precio / (1 - descuento / 100)) : null

  return (
    <div>
      <Breadcrumb producto={producto} />

      {/* Product name */}
      <h1 className="text-2xl sm:text-3xl font-medium text-text-primary dark:text-text-primary-dark">
        {producto.nombre}
      </h1>

      {/* Category */}
      <p className="text-sm font-mono uppercase tracking-wider text-text-muted dark:text-text-muted-dark mt-1">
        {producto.categoria.nombre}
      </p>

      {/* Price */}
      <div className="flex items-center gap-3 mt-4">
        <span className="text-2xl font-semibold text-accent">
          ${producto.precio.toFixed(2)}
        </span>
        {descuento && precioOriginal && (
          <>
            <span className="text-lg text-text-muted dark:text-text-muted-dark line-through">
              ${precioOriginal.toFixed(2)}
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold bg-accent text-white rounded-sm">
              -{descuento}%
            </span>
          </>
        )}
      </div>

      {/* Color selector */}
      {uniqueColors.length > 0 && (
        <div className="mt-6">
          <label className="text-sm font-medium text-text-primary dark:text-text-primary-dark block mb-2">
            Color: <span className="text-text-secondary dark:text-text-secondary-dark font-normal">{selectedColor}</span>
          </label>
          <div className="flex items-center gap-2">
            {uniqueColors.map(({ color, hex }) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorChange(color)}
                className={cn(
                  'w-9 h-9 rounded-full border-2 transition-all',
                  selectedColor === color
                    ? 'border-accent scale-110 ring-2 ring-accent/30'
                    : 'border-border-base dark:border-border-base-dark hover:border-accent/50',
                )}
                style={{ backgroundColor: hex }}
                title={color}
                aria-label={`Color ${color}`}
                aria-pressed={selectedColor === color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Talla selector */}
      {tallasForColor.length > 0 && (
        <div className="mt-5">
          <label className="text-sm font-medium text-text-primary dark:text-text-primary-dark block mb-2">
            Talla
          </label>
          <div className="flex flex-wrap gap-2">
            {tallasForColor.map(({ nombre, stock }) => {
              const disabled = stock === 0
              const active = selectedTalla === nombre
              return (
                <button
                  key={nombre}
                  type="button"
                  onClick={() => !disabled && handleTallaChange(nombre)}
                  disabled={disabled}
                  className={cn(
                    'w-12 h-12 rounded-md text-sm font-medium border transition-all flex items-center justify-center',
                    active
                      ? 'bg-accent text-white border-accent'
                      : disabled
                        ? 'border-border-base dark:border-border-base-dark text-text-muted dark:text-text-muted-dark opacity-40 cursor-not-allowed line-through'
                        : 'border-border-base dark:border-border-base-dark text-text-primary dark:text-text-primary-dark hover:border-accent',
                  )}
                  aria-label={`Talla ${nombre}${disabled ? ' — agotada' : ''}`}
                  aria-pressed={active}
                >
                  {nombre}
                </button>
              )
            })}
          </div>

          {/* Size guide link */}
          <button
            type="button"
            onClick={() => setSizeModalOpen(true)}
            className="flex items-center gap-1.5 text-sm text-accent hover:underline mt-2 transition-colors"
          >
            <Ruler className="h-4 w-4" aria-hidden="true" />
            Guía de tallas
          </button>
        </div>
      )}

      {/* Stock */}
      {selectedVariante && (
        <div className="mt-4">
          <StockBadge stock={currentStock} />
        </div>
      )}

      {/* Quantity */}
      {selectedVariante && currentStock > 0 && (
        <div className="mt-5">
          <label className="text-sm font-medium text-text-primary dark:text-text-primary-dark block mb-2">
            Cantidad
          </label>
          <div className="flex items-center border border-border-base dark:border-border-base-dark rounded-md w-fit">
            <button
              type="button"
              onClick={() => setCantidad((q) => Math.max(1, q - 1))}
              disabled={cantidad <= 1}
              className="p-2.5 text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark disabled:opacity-30 transition-colors"
              aria-label="Disminuir cantidad"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-sm font-medium text-text-primary dark:text-text-primary-dark tabular-nums">
              {cantidad}
            </span>
            <button
              type="button"
              onClick={() => setCantidad((q) => Math.min(currentStock, q + 1))}
              disabled={cantidad >= currentStock}
              className="p-2.5 text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark disabled:opacity-30 transition-colors"
              aria-label="Aumentar cantidad"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add to cart button */}
      <div className="mt-6">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canAdd}
          loading={isAdding}
          onClick={handleAddToCart}
          className="h-12"
        >
          {showSuccess ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2"
            >
              <Check className="h-5 w-5" />
              Agregado
            </motion.span>
          ) : currentStock === 0 && selectedTalla ? (
            'Agotado'
          ) : !selectedColor || !selectedTalla ? (
            'Seleccioná color y talla'
          ) : (
            'Agregar al carrito'
          )}
        </Button>
      </div>

      {/* Description tabs */}
      <DescriptionTabs producto={producto} />

      {/* Size calculator modal */}
      <SizeCalculatorModal
        open={sizeModalOpen}
        onClose={() => setSizeModalOpen(false)}
        categoriaSlug={producto.categoria.slug}
        onApplyTalla={handleApplySizeTalla}
      />
    </div>
  )
}
