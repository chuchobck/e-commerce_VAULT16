import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart } from 'lucide-react'
import { useUIStore } from '@/shared/stores/uiStore'
import { useCarritoStore } from '@/features/carrito/stores/carritoStore'
import { useUpdateCantidad } from '@/features/carrito/hooks/useUpdateCantidad'
import { useRemoveItem } from '@/features/carrito/hooks/useRemoveItem'
import { CarritoItemRow } from './CarritoItemRow'
import { CarritoSummary } from './CarritoSummary'
import { CarritoVacio } from './CarritoVacio'

// ─── Drawer ──────────────────────────────────────────────────────────────────

export function CarritoDrawer() {
  const isOpen = useUIStore((s) => s.cartDrawerOpen)
  const closeDrawer = useUIStore((s) => s.closeCartDrawer)

  const items = useCarritoStore((s) => s.items)
  const getTotalItems = useCarritoStore((s) => s.getTotalItems)
  const getSubtotal = useCarritoStore((s) => s.getSubtotal)
  const getDescuentoTotal = useCarritoStore((s) => s.getDescuentoTotal)
  const getTotal = useCarritoStore((s) => s.getTotal)

  const { updateCantidad } = useUpdateCantidad()
  const { remove } = useRemoveItem()

  const totalItems = getTotalItems()
  const subtotal = getSubtotal()
  const descuento = getDescuentoTotal()
  const total = getTotal()

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeDrawer()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKey)
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeDrawer])

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-drawer bg-black/60"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-drawer w-[90vw] max-w-drawer bg-bg-surface dark:bg-bg-surface-dark shadow-modal dark:shadow-modal-dark flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
          >
            {/* Header — sticky */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-base dark:border-border-base-dark flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
                  Tu carrito
                </h2>
                {totalItems > 0 && (
                  <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs font-semibold text-white bg-accent rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="p-2 rounded-md text-text-muted dark:text-text-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-bg-hover dark:hover:bg-bg-hover-dark transition-colors"
                aria-label="Cerrar carrito"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            {items.length === 0 ? (
              <CarritoVacio onClose={closeDrawer} />
            ) : (
              <>
                {/* Scrollable item list */}
                <div className="flex-1 overflow-y-auto px-6 scrollbar-hide">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <CarritoItemRow
                        key={item.varianteId}
                        item={item}
                        onUpdateCantidad={handleUpdateCantidad}
                        onRemove={handleRemove}
                        onCloseDrawer={closeDrawer}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Summary — sticky bottom */}
                <CarritoSummary
                  subtotal={subtotal}
                  descuento={descuento}
                  total={total}
                  isEmpty={items.length === 0}
                  onClose={closeDrawer}
                />
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
