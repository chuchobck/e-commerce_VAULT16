import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { useCarritoStore } from '@/features/carrito/stores/carritoStore'
import { useUIStore } from '@/shared/stores/uiStore'

/**
 * CartIconButton con badge contador.
 * - Badge visible solo si totalItems > 0
 * - Al click → uiStore.openCartDrawer()
 * - Animación bounce + pulse cuando totalItems incrementa
 */
export function CartIconButton() {
  const totalItems = useCarritoStore((s) => s.getTotalItems())
  const openCartDrawer = useUIStore((s) => s.openCartDrawer)
  const prevCountRef = useRef(totalItems)
  const justIncremented = totalItems > prevCountRef.current

  useEffect(() => {
    prevCountRef.current = totalItems
  }, [totalItems])

  return (
    <button
      type="button"
      onClick={openCartDrawer}
      className="relative p-2 rounded-md text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-bg-hover dark:hover:bg-bg-hover-dark transition-colors duration-fast"
      aria-label={`Carrito${totalItems > 0 ? ` (${totalItems} productos)` : ''}`}
    >
      <motion.div
        key={totalItems}
        initial={justIncremented ? { scale: 1.3, rotate: -10 } : { scale: 1 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <ShoppingCart className="h-5 w-5" aria-hidden="true" />
      </motion.div>

      <AnimatePresence>
        {totalItems > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0 }}
            animate={
              justIncremented
                ? { scale: [0, 1.4, 1], backgroundColor: ['#3B82F6', '#60A5FA', '#3B82F6'] }
                : { scale: 1 }
            }
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-5 min-w-[20px] px-1 text-xs font-semibold text-white bg-accent rounded-full"
          >
            {totalItems > 99 ? '99+' : totalItems}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

