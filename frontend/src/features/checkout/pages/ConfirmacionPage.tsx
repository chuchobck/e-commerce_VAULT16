import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2, ShoppingBag, Package, Clock } from 'lucide-react'
import { getFactura, type ConfirmacionResponse } from '@/features/checkout/api/checkoutApi'
import { useCarritoStore } from '@/features/carrito/stores/carritoStore'
import { Button } from '@/shared/components/ui/Button'

export function ConfirmacionPage() {
  const { idFactura } = useParams<{ idFactura: string }>()
  const [factura, setFactura] = useState<ConfirmacionResponse | null>(null)
  const [polling, setPolling] = useState(true)
  const [timedOut, setTimedOut] = useState(false)
  const clearCart = useCarritoStore((s) => s.clearOptimistic)
  const polledRef = useRef(false)
  const startRef = useRef(Date.now())

  // Poll for payment confirmation
  useEffect(() => {
    if (!idFactura || polledRef.current) return
    polledRef.current = true

    const poll = async () => {
      const maxMs = 30_000
      const intervalMs = 2_000

      while (Date.now() - startRef.current < maxMs) {
        try {
          const data = await getFactura(idFactura)
          if (data.estado === 'PAG' || data.estado === 'EMI') {
            setFactura(data)
            setPolling(false)
            clearCart()
            return
          }
        } catch {
          // Keep polling
        }
        await new Promise((r) => setTimeout(r, intervalMs))
      }

      // Timeout — show anyway (could be transfer)
      try {
        const data = await getFactura(idFactura)
        setFactura(data)
      } catch {
        // noop
      }
      setPolling(false)
      setTimedOut(true)
    }

    poll()
  }, [idFactura, clearCart])

  // Polling state
  if (polling) {
    return (
      <div className="max-w-modal mx-auto px-4 py-20 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-6" />
        <h2 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-2">
          Procesando tu pago...
        </h2>
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
          Estamos confirmando tu pago. No cierres esta página.
        </p>
      </div>
    )
  }

  const isTransfer = factura?.estado === 'EMI'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto px-4 py-12 text-center"
    >
      {/* Animated check */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="mx-auto w-20 h-20 rounded-full bg-status-success-bg dark:bg-status-success-bg-dark flex items-center justify-center mb-6"
      >
        <CheckCircle className="h-10 w-10 text-status-success dark:text-status-success-dark" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-semibold text-text-primary dark:text-text-primary-dark mb-2">
          {isTransfer ? '¡Orden generada!' : '¡Listo!'}
        </h2>

        {factura && (
          <p className="text-base text-text-secondary dark:text-text-secondary-dark mb-2">
            Tu pedido es <span className="font-mono font-semibold text-accent">#{factura.idFactura}</span>
          </p>
        )}

        {isTransfer ? (
          <div className="my-6 p-4 rounded-lg border border-accent/30 bg-accent/5 text-left">
            <div className="flex items-start gap-3 mb-3">
              <Clock className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                  Transferencia pendiente
                </p>
                <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
                  Realizá la transferencia a los datos indicados. Te avisaremos cuando confirmemos tu pago.
                </p>
              </div>
            </div>
            <div className="p-3 rounded bg-bg-hover dark:bg-bg-hover-dark space-y-1 text-xs">
              <p className="text-text-primary dark:text-text-primary-dark"><span className="text-text-muted dark:text-text-muted-dark">Banco:</span> Banco Pichincha</p>
              <p className="text-text-primary dark:text-text-primary-dark"><span className="text-text-muted dark:text-text-muted-dark">Cuenta:</span> 2200XXXXXX</p>
              <p className="text-text-primary dark:text-text-primary-dark"><span className="text-text-muted dark:text-text-muted-dark">Titular:</span> VAULT 16 SAS</p>
              <p className="text-text-primary dark:text-text-primary-dark"><span className="text-text-muted dark:text-text-muted-dark">Monto:</span> <span className="font-semibold text-accent">${factura?.total.toFixed(2)}</span></p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-6">
            {timedOut
              ? 'Tu pago está siendo procesado. Recibirás una confirmación pronto.'
              : 'Tu pago fue confirmado. Te enviamos un email con los detalles.'
            }
          </p>
        )}

        {/* Order items summary */}
        {factura && factura.items.length > 0 && (
          <div className="my-6 border border-border-base dark:border-border-base-dark rounded-lg overflow-hidden text-left">
            <div className="px-4 py-2.5 bg-bg-hover dark:bg-bg-hover-dark border-b border-border-base dark:border-border-base-dark">
              <span className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark">
                {factura.items.length} {factura.items.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>
            {factura.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b last:border-b-0 border-border-base dark:border-border-base-dark">
                <div>
                  <p className="text-sm text-text-primary dark:text-text-primary-dark">{item.nombre}</p>
                  <p className="text-xs text-text-muted dark:text-text-muted-dark">
                    {item.color} · {item.talla} · x{item.cantidad}
                  </p>
                </div>
                <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark tabular-nums">
                  ${item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3 bg-bg-hover dark:bg-bg-hover-dark">
              <span className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">Total</span>
              <span className="text-sm font-semibold text-accent tabular-nums">${factura.total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {factura && (
            <Link to={`/mi-cuenta/pedidos/${factura.id}`}>
              <Button variant="primary" size="md" leftIcon={<Package className="h-4 w-4" />}>
                Ver pedido
              </Button>
            </Link>
          )}
          <Link to="/catalogo">
            <Button variant="secondary" size="md" leftIcon={<ShoppingBag className="h-4 w-4" />}>
              Seguir comprando
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
