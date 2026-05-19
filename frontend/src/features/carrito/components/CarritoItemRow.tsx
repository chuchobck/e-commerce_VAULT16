import { memo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import type { CarritoItem } from '@/features/carrito/stores/carritoStore'

// ─── Procedural SVG placeholder (matches catalog) ────────────────────────────

function PlaceholderThumb({ seed: rawSeed }: { seed: string | number }) {
  const seed =
    typeof rawSeed === 'number'
      ? rawSeed
      : (() => {
          let h = 0
          for (let i = 0; i < rawSeed.length; i++) h = (h * 31 + rawSeed.charCodeAt(i)) >>> 0
          return h
        })()
  const hue = (seed * 137) % 360
  return (
    <svg viewBox="0 0 64 80" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="64" height="80" fill="#1E2428" />
      <circle cx="32" cy="40" r="16" fill={`hsla(${hue}, 50%, 50%, 0.12)`} stroke={`hsla(${hue}, 50%, 50%, 0.2)`} strokeWidth="0.5" />
      <text x="32" y="72" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="#4A535A">V16</text>
    </svg>
  )
}

// ─── CarritoItemRow ──────────────────────────────────────────────────────────

interface CarritoItemRowProps {
  item: CarritoItem
  onUpdateCantidad: (varianteId: number, itemId: number, cantidad: number) => void
  onRemove: (varianteId: number, itemId: number) => void
  onCloseDrawer?: () => void
}

export const CarritoItemRow = memo(function CarritoItemRow({
  item,
  onUpdateCantidad,
  onRemove,
  onCloseDrawer,
}: CarritoItemRowProps) {
  const hasDiscount = item.descuento > 0
  const lineTotal = item.precio * item.cantidad

  const handleDecrement = useCallback(() => {
    if (item.cantidad > 1) {
      onUpdateCantidad(item.varianteId, item.id, item.cantidad - 1)
    }
  }, [item.varianteId, item.id, item.cantidad, onUpdateCantidad])

  const handleIncrement = useCallback(() => {
    if (item.cantidad < item.stock) {
      onUpdateCantidad(item.varianteId, item.id, item.cantidad + 1)
    }
  }, [item.varianteId, item.id, item.cantidad, item.stock, onUpdateCantidad])

  const handleRemove = useCallback(() => {
    onRemove(item.varianteId, item.id)
  }, [item.varianteId, item.id, onRemove])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
      className="flex gap-3 py-4 border-b border-border-base dark:border-border-base-dark last:border-b-0"
    >
      {/* Thumbnail */}
      <Link
        to={`/producto/${item.productoId}`}
        onClick={onCloseDrawer}
        className="flex-shrink-0 w-16 h-20 rounded-md overflow-hidden bg-bg-hover dark:bg-bg-hover-dark"
      >
        {item.imagen ? (
          <img
            src={item.imagen}
            alt={item.nombre}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <PlaceholderThumb seed={item.productoId} />
        )}
      </Link>

      {/* Info + controls */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <Link
            to={`/producto/${item.productoId}`}
            onClick={onCloseDrawer}
            className="text-sm font-medium text-text-primary dark:text-text-primary-dark hover:text-accent transition-colors line-clamp-1"
          >
            {item.nombre}
          </Link>
          <p className="text-xs text-text-muted dark:text-text-muted-dark mt-0.5 flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full border border-border-base dark:border-border-base-dark"
              style={{ backgroundColor: item.codigoHex }}
              aria-hidden="true"
            />
            {item.color} · {item.talla}
          </p>
        </div>

        {/* Quantity + price row */}
        <div className="flex items-center justify-between mt-2">
          {/* Quantity selector */}
          <div className="flex items-center border border-border-base dark:border-border-base-dark rounded-sm">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={item.cantidad <= 1}
              className="p-1.5 text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark disabled:opacity-30 transition-colors"
              aria-label="Disminuir cantidad"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-7 text-center text-xs font-medium text-text-primary dark:text-text-primary-dark tabular-nums">
              {item.cantidad}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={item.cantidad >= item.stock}
              className="p-1.5 text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark disabled:opacity-30 transition-colors"
              aria-label="Aumentar cantidad"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark tabular-nums">
              ${lineTotal.toFixed(2)}
            </p>
            {hasDiscount && (
              <p className="text-xs text-text-muted dark:text-text-muted-dark line-through tabular-nums">
                ${(item.precioOriginal * item.cantidad).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={handleRemove}
        className={cn(
          'self-start flex-shrink-0 p-1.5 rounded-sm mt-0.5',
          'text-text-muted dark:text-text-muted-dark hover:text-status-danger dark:hover:text-status-danger-dark',
          'hover:bg-status-danger-bg dark:hover:bg-status-danger-bg-dark',
          'transition-colors',
        )}
        aria-label={`Eliminar ${item.nombre}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  )
})
