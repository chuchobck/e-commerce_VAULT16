import { Edit2 } from 'lucide-react'
import { useCarritoStore } from '@/features/carrito/stores/carritoStore'
import type { CheckoutStep } from '@/features/checkout/hooks/useCheckout'

interface ResumenOrdenProps {
  direccionLabel?: string
  metodoPago?: 'PAYPAL' | 'TARJETA' | 'TRANSFERENCIA' | null
  onEditStep: (step: CheckoutStep) => void
  currentStep: CheckoutStep
}

export function ResumenOrden({
  direccionLabel,
  metodoPago,
  onEditStep,
  currentStep,
}: ResumenOrdenProps) {
  const items = useCarritoStore((s) => s.items)
  const getSubtotal = useCarritoStore((s) => s.getSubtotal)
  const getDescuentoTotal = useCarritoStore((s) => s.getDescuentoTotal)
  const getTotal = useCarritoStore((s) => s.getTotal)

  const subtotal = getSubtotal()
  const descuento = getDescuentoTotal()
  const total = getTotal()

  return (
    <div className="sticky top-24 p-5 rounded-lg border border-border-base dark:border-border-base-dark bg-bg-card dark:bg-bg-card-dark">
      <h3 className="text-base font-semibold text-text-primary dark:text-text-primary-dark mb-4">
        Resumen del pedido
      </h3>

      {/* Items list */}
      <div className="space-y-2.5 mb-4 max-h-48 overflow-y-auto scrollbar-hide">
        {items.map((item) => (
          <div key={item.varianteId} className="flex items-center gap-2.5">
            <div className="w-10 h-12 rounded bg-bg-hover dark:bg-bg-hover-dark flex-shrink-0 overflow-hidden">
              {item.imagen ? (
                <img src={item.imagen} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[8px] text-text-muted">V16</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary dark:text-text-primary-dark truncate">
                {item.nombre}
              </p>
              <p className="text-[10px] text-text-muted dark:text-text-muted-dark">
                {item.color} · {item.talla} · x{item.cantidad}
              </p>
            </div>
            <span className="text-xs font-medium text-text-primary dark:text-text-primary-dark tabular-nums">
              ${(item.precio * item.cantidad).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-1.5 border-t border-border-base dark:border-border-base-dark pt-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary dark:text-text-secondary-dark">Subtotal</span>
          <span className="text-text-primary dark:text-text-primary-dark tabular-nums">${subtotal.toFixed(2)}</span>
        </div>
        {descuento > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-status-success dark:text-status-success-dark">Descuento</span>
            <span className="text-status-success dark:text-status-success-dark tabular-nums">-${descuento.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary dark:text-text-secondary-dark">Envío</span>
          <span className="text-xs text-text-muted dark:text-text-muted-dark">Gratis</span>
        </div>
        <div className="border-t border-border-base dark:border-border-base-dark pt-2 flex justify-between">
          <span className="font-semibold text-text-primary dark:text-text-primary-dark">Total</span>
          <span className="font-semibold text-accent tabular-nums text-lg">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Selected info */}
      {direccionLabel && currentStep !== 'direccion' && (
        <div className="flex items-center justify-between py-2 border-t border-border-base dark:border-border-base-dark">
          <div>
            <p className="text-xs text-text-muted dark:text-text-muted-dark">Envío a</p>
            <p className="text-sm text-text-primary dark:text-text-primary-dark">{direccionLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => onEditStep('direccion')}
            className="p-1 text-text-muted dark:text-text-muted-dark hover:text-accent transition-colors"
            aria-label="Editar dirección"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {metodoPago && currentStep === 'confirmacion' && (
        <div className="flex items-center justify-between py-2 border-t border-border-base dark:border-border-base-dark">
          <div>
            <p className="text-xs text-text-muted dark:text-text-muted-dark">Método de pago</p>
            <p className="text-sm text-text-primary dark:text-text-primary-dark">
              {metodoPago === 'TARJETA' ? 'Tarjeta de crédito/débito' : 'Transferencia bancaria'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEditStep('pago')}
            className="p-1 text-text-muted dark:text-text-muted-dark hover:text-accent transition-colors"
            aria-label="Editar método de pago"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
