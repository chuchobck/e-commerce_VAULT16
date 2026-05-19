import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useCarritoStore } from '@/features/carrito/stores/carritoStore'
import { useUpdateCantidad } from '@/features/carrito/hooks/useUpdateCantidad'
import { useRemoveItem } from '@/features/carrito/hooks/useRemoveItem'
import { CarritoItemRow } from '@/features/carrito/components/CarritoItemRow'
import { CarritoVacio } from '@/features/carrito/components/CarritoVacio'
import { Button } from '@/shared/components/ui/Button'

/**
 * Full-page cart view for /carrito route.
 * Two columns on desktop: items left, summary right.
 */
export function CarritoPage() {
  const items = useCarritoStore((s) => s.items)
  const getTotalItems = useCarritoStore((s) => s.getTotalItems)
  const getSubtotal = useCarritoStore((s) => s.getSubtotal)
  const getDescuentoTotal = useCarritoStore((s) => s.getDescuentoTotal)
  const getTotal = useCarritoStore((s) => s.getTotal)
  const clearOptimistic = useCarritoStore((s) => s.clearOptimistic)

  const { updateCantidad } = useUpdateCantidad()
  const { remove } = useRemoveItem()

  const totalItems = getTotalItems()
  const subtotal = getSubtotal()
  const descuento = getDescuentoTotal()
  const total = getTotal()

  const handleUpdateCantidad = useCallback(
    (varianteId: number, itemId: number, cantidad: number) => {
      updateCantidad(varianteId, itemId, cantidad)
    },
    [updateCantidad],
  )

  const handleRemove = useCallback(
    (varianteId: number, itemId: number) => {
      remove(varianteId, itemId)
    },
    [remove],
  )

  // noop for onClose in page context
  const noop = useCallback(() => {}, [])

  if (items.length === 0) {
    return (
      <div className="max-w-content mx-auto px-4 sm:px-6 py-12">
        <CarritoVacio onClose={noop} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-content mx-auto px-4 sm:px-6 py-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Seguir comprando
          </Link>
          <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary dark:text-text-primary-dark">
            Tu carrito{' '}
            <span className="text-text-muted dark:text-text-muted-dark text-lg font-normal">
              ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})
            </span>
          </h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearOptimistic}
          leftIcon={<Trash2 className="h-4 w-4" />}
          className="text-status-danger dark:text-status-danger-dark"
        >
          Vaciar
        </Button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Items column */}
        <div className="lg:col-span-2">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <CarritoItemRow
                key={item.varianteId}
                item={item}
                onUpdateCantidad={handleUpdateCantidad}
                onRemove={handleRemove}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Summary column — sticky on desktop */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-6 rounded-lg border border-border-base dark:border-border-base-dark bg-bg-card dark:bg-bg-card-dark">
            <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">
              Resumen del pedido
            </h2>

            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary dark:text-text-secondary-dark">Subtotal</span>
                <span className="text-text-primary dark:text-text-primary-dark tabular-nums font-medium">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              {descuento > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-status-success dark:text-status-success-dark">Descuentos</span>
                  <span className="text-status-success dark:text-status-success-dark tabular-nums font-medium">
                    -${descuento.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary dark:text-text-secondary-dark">Envío</span>
                <span className="text-text-secondary dark:text-text-secondary-dark text-xs">
                  Calculado al checkout
                </span>
              </div>

              <div className="border-t border-border-base dark:border-border-base-dark pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-text-primary dark:text-text-primary-dark">
                    Total
                  </span>
                  <span className="text-xl font-semibold text-accent tabular-nums">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <Link to="/checkout" className="block">
              <Button variant="primary" size="lg" fullWidth>
                Ir a pagar
              </Button>
            </Link>

            <p className="text-xs text-text-muted dark:text-text-muted-dark text-center mt-3">
              Envío gratis en pedidos mayores a $80
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
