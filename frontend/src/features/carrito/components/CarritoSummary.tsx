import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'

interface CarritoSummaryProps {
  subtotal: number
  descuento: number
  total: number
  isEmpty: boolean
  onClose: () => void
}

/**
 * Cart summary — sticky bottom section with subtotal, discounts, total, and CTAs.
 */
export function CarritoSummary({
  subtotal,
  descuento,
  total,
  isEmpty,
  onClose,
}: CarritoSummaryProps) {
  return (
    <div className="border-t border-border-base dark:border-border-base-dark px-6 py-5 bg-bg-surface dark:bg-bg-surface-dark">
      {/* Totals */}
      <div className="space-y-2 mb-5">
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

        <div className="border-t border-border-base dark:border-border-base-dark pt-2">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-text-primary dark:text-text-primary-dark">
              Total
            </span>
            <span className="text-lg font-semibold text-accent tabular-nums">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-2">
        <Link to="/checkout" onClick={onClose} className="block">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={isEmpty}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Ir a pagar
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="md"
          fullWidth
          onClick={onClose}
          leftIcon={<ShoppingBag className="h-4 w-4" />}
        >
          Seguir comprando
        </Button>
      </div>
    </div>
  )
}
